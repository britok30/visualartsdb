import { ArtistsContent, artistsMetadata } from "@/components/artists-index";

export const revalidate = 2592000;
export const metadata = artistsMetadata();

export default function ArtistsPage() {
  return <ArtistsContent />;
}
