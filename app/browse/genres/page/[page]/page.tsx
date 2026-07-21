import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  BrowseIndexContent,
  getBrowseIndexMetadata,
} from "@/components/browse-index";
import { parsePage } from "@/components/browse-detail";

export const revalidate = 2592000; // 30-day safety valve — sync invalidates changed paths on demand via /api/revalidate

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const n = parsePage(page);
  if (n === null) notFound();
  return getBrowseIndexMetadata("genres", n);
}

export default async function GenresPaginatedPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const n = parsePage(page);
  if (n === null) notFound();
  if (n === 1) permanentRedirect("/browse/genres");

  return <BrowseIndexContent kind="genres" page={n} />;
}
