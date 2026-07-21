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
  return getBrowseMetadata("styles", slug, 1);
}

export default async function StyleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BrowseDetailContent kind="styles" slug={slug} page={1} />;
}
