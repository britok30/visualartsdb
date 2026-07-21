import type { Metadata } from "next";
import {
  BrowseDetailContent,
  getBrowseMetadata,
} from "@/components/browse-detail";

export const revalidate = 2592000; // 30-day safety valve — sync invalidates changed paths on demand via /api/revalidate

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getBrowseMetadata("genres", slug, 1);
}

export default async function GenreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BrowseDetailContent kind="genres" slug={slug} page={1} />;
}
