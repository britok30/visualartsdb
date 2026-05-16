import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  ArtistContent,
  artistPageHref,
  getArtistMetadata,
} from "./artist-content";

export const revalidate = 86400;

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;

  if (pageStr !== undefined) {
    const legacyPage = Math.max(1, Number(pageStr) || 1);
    redirect(artistPageHref(slug, legacyPage));
  }

  return <ArtistContent slug={slug} page={1} />;
}
