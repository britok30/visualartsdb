import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  ArtistContent,
  getArtistMetadata,
} from "../../artist-content";

export const revalidate = 2592000; // 30-day safety valve — sync invalidates changed paths on demand via /api/revalidate

function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

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
  if (n === 1) redirect(`/artist/${slug}`);

  return <ArtistContent slug={slug} page={n} />;
}
