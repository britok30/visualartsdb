import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  BrowseDetailContent,
  getBrowseMetadata,
  parsePage,
} from "@/components/browse-detail";

export const revalidate = 2592000; // 30-day safety valve — sync invalidates changed paths on demand via /api/revalidate

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}): Promise<Metadata> {
  const { slug, page } = await params;
  const n = parsePage(page);
  if (n === null) notFound();
  return getBrowseMetadata("genres", slug, n);
}

export default async function GenrePaginatedPage({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}) {
  const { slug, page } = await params;
  const n = parsePage(page);
  if (n === null) notFound();
  if (n === 1) permanentRedirect(`/browse/genres/${slug}`);

  return <BrowseDetailContent kind="genres" slug={slug} page={n} />;
}
