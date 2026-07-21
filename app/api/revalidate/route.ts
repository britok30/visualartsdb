import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// On-demand cache invalidation for specific paths after a data sync, replacing
// the old redeploy-to-bust flow (a redeploy wiped ALL rendered pages, and the
// crawl of 1M+ URLs re-warming against Neon kept its compute awake for days).
// revalidatePath from a route handler only MARKS paths stale — each page
// re-renders on its next visit, so there is no re-render storm.
//
// POST { paths: string[] } with Authorization: Bearer <REVALIDATE_SECRET>.

const MAX_PATHS_PER_REQUEST = 1000;

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET not configured" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const paths = (body as { paths?: unknown })?.paths;
  if (
    !Array.isArray(paths) ||
    paths.length === 0 ||
    !paths.every((p) => typeof p === "string" && p.startsWith("/"))
  ) {
    return NextResponse.json(
      { error: "Body must be { paths: string[] } of absolute paths" },
      { status: 400 },
    );
  }
  if (paths.length > MAX_PATHS_PER_REQUEST) {
    return NextResponse.json(
      { error: `Max ${MAX_PATHS_PER_REQUEST} paths per request` },
      { status: 400 },
    );
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: paths.length });
}
