"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  imageUrl: string;
  filename: string;
}

export function DownloadButton({ imageUrl, filename }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleDownload}
      disabled={loading}
      className="text-neutral-300 hover:text-neutral-900"
      aria-label="Download image"
    >
      <Download size={18} strokeWidth={1.5} className={loading ? "animate-pulse" : ""} />
    </Button>
  );
}
