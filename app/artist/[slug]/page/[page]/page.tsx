import { parsePage } from "@/lib/pagination";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  ArtistContent,
  getArtistMetadata,
} from "../../artist-content";

export const dynamic = "force-static";

export const revalidate = 2592000; // 30-day safety valve — sync invalidates changed paths on demand via /api/revalidate


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}): Promise<Metadata> {
  const { slug, page } = await params;
  const n = parsePage(page);
  if (n === null) notFound();
  return getArtistMetadata(slug, n);
}

export default async function ArtistPaginatedPage({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}) {
  const { slug, page } = await params;
  const n = parsePage(page);
  if (n === null) notFound();
  if (n === 1) permanentRedirect(`/artist/${slug}`);

  return <ArtistContent slug={slug} page={n} />;
}
