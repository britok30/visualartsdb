import type { Metadata } from "next";
import { ArtistContent, getArtistMetadata } from "./artist-content";

export const revalidate = 2592000; // 30-day safety valve — sync invalidates changed paths on demand via /api/revalidate

// Legacy ?page=N URLs are redirected in next.config.ts — reading searchParams
// here would opt this page into dynamic rendering on every request.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getArtistMetadata(slug, 1);
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArtistContent slug={slug} page={1} />;
}
