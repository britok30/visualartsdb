import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const raw = neon(process.env.DATABASE_URL!);

// With scale-to-zero + a fixed-size compute, Neon can restart or suspend the
// endpoint while a query is in flight (57P01 "terminating connection due to
// administrator command", 57P02, 08006). The compute wakes in a few hundred
// ms, so a short retry absorbs the race. All runtime queries here are reads,
// so retrying is safe.
const RETRYABLE_CODES = new Set(["57P01", "57P02", "08006"]);
const MAX_ATTEMPTS = 3;

function isRetryable(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  if (code && RETRYABLE_CODES.has(code)) return true;
  const message = (err as Error)?.message ?? "";
  return message.includes("terminating connection");
}

async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run();
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS || !isRetryable(err)) throw err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
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
