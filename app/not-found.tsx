import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist on VisualArtsDB.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl tracking-tight">404</h1>
      <p className="mt-4 text-neutral-400">
        This page doesn&apos;t exist.
      </p>
      <Button variant="outline" size="sm" asChild className="mt-8">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
