import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const raw = neon(process.env.DATABASE_URL!);

// With scale-to-zero + a fixed-size compute, Neon can restart or suspend the
// endpoint while a query is in flight — surfacing as 57P01 ("terminating
// connection due to administrator command"), connection codes, proxy HTTP 5xx
// ("the database system is shutting down", server_login_retry), or plain
// fetch failures. A restart takes a few seconds, so back off exponentially
// (~15s total). Every query this client runs is a read-only SELECT, so
// retrying liberally is safe. Real query errors (bad SQL, constraint issues)
// are never FATAL/5xx and still throw immediately.
// 53200 = out of memory: transient under concurrent load on a small compute;
// by the retry the burst has passed. Safe because all queries are reads.
const RETRYABLE_CODES = new Set([
  "57P01",
  "57P02",
  "08006",
  "08P01",
  "08001",
  "53200",
]);
const MAX_ATTEMPTS = 7; // backoff totals ~63s — outlasts a slow wake or proxy error-cache window

function isRetryable(err: unknown): boolean {
  const e = err as {
    code?: string;
    severity?: string;
    message?: string;
    "neon:retryable"?: boolean;
  };
  if (e?.["neon:retryable"] === true) return true;
  if (e?.code && RETRYABLE_CODES.has(e.code)) return true;
  if (e?.severity === "FATAL") return true;
  const message = e?.message ?? "";
  return (
    message.includes("terminating connection") ||
    message.includes("shutting down") ||
    message.includes("server_login_retry") ||
    message.includes("Server error (HTTP status 5") ||
    message.includes("fetch failed")
  );
}

async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run();
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS || !isRetryable(err)) throw err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
    }
  }
}

type QueryFn = (...args: Parameters<typeof raw.query>) => Promise<unknown>;

// Drizzle's neon-http session uses `client.query ?? client`, so wrapping the
// callable and its .query covers every query path.
const client = ((...args: Parameters<typeof raw>) =>
  withRetry(() => raw(...args))) as unknown as typeof raw;
client.query = ((...args) =>
  withRetry(() => raw.query(...args))) as QueryFn as typeof raw.query;
client.transaction = raw.transaction.bind(raw);

export const db = drizzle(client, { schema });
