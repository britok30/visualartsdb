import { notFound, permanentRedirect } from "next/navigation";
import { ArtistsContent, artistsHref, artistsMetadata } from "@/components/artists-index";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-static";
export const revalidate = 2592000;
type Props = { params: Promise<{ page: string }> };

async function parse(params: Props["params"]) {
  const raw = await params;
  const letter = undefined;
  const page = parsePage(raw.page);
  if (page === null) notFound();
  if (page === 1) permanentRedirect(artistsHref(page, letter));
  return { page, letter };
}

export async function generateMetadata({ params }: Props) {
  const { page, letter } = await parse(params);
  return artistsMetadata(page, letter);
}

export default async function Page({ params }: Props) {
  return <ArtistsContent {...await parse(params)} />;
}
