import type { Metadata } from "next";
import {
  BrowseIndexContent,
  getBrowseIndexMetadata,
} from "@/components/browse-index";

export const revalidate = 2592000; // 30-day safety valve — sync invalidates changed paths on demand via /api/revalidate

export const metadata: Metadata = getBrowseIndexMetadata("museums", 1);

export default async function MuseumsPage() {
  return <BrowseIndexContent kind="museums" page={1} />;
}
