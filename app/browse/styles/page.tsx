import type { Metadata } from "next";
import {
  BrowseIndexContent,
  getBrowseIndexMetadata,
} from "@/components/browse-index";

export const revalidate = 2592000; // 30-day safety valve — sync invalidates changed paths on demand via /api/revalidate

export const metadata: Metadata = getBrowseIndexMetadata("styles", 1);

export default async function StylesPage() {
  return <BrowseIndexContent kind="styles" page={1} />;
}
