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
  return getBrowseMetadata("museums", slug, n);
}

export default async function MuseumPaginatedPage({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}) {
  const { slug, page } = await params;
  const n = parsePage(page);
  if (n === null) notFound();
  if (n === 1) permanentRedirect(`/browse/museums/${slug}`);

  return <BrowseDetailContent kind="museums" slug={slug} page={n} />;
}
