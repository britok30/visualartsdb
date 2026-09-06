import { notFound, permanentRedirect } from "next/navigation";
import { ArtistsContent, artistsHref, artistsMetadata } from "@/components/artists-index";

export const dynamic = "force-static";
export const revalidate = 2592000;
type Props = { params: Promise<{ letter: string }> };

async function parse(params: Props["params"]) {
  const raw = await params;
  const letter = raw.letter.toUpperCase();
  if (!/^[A-Z]$/.test(letter)) notFound();
  const page = 1;
  if (raw.letter !== letter) permanentRedirect(artistsHref(page, letter));
  return { page, letter };
}

export async function generateMetadata({ params }: Props) {
  const { page, letter } = await parse(params);
  return artistsMetadata(page, letter);
}

export default async function Page({ params }: Props) {
  return <ArtistsContent {...await parse(params)} />;
}
