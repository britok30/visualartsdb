"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl tracking-tight">Something went wrong</h1>
      <p className="mt-4 text-sm text-neutral-400">
        An unexpected error occurred.
      </p>
      <Button variant="outline" size="sm" onClick={reset} className="mt-8">
        Try again
      </Button>
    </div>
  );
}
