"use client";

import { useState } from "react";
import { Quote, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CiteButtonProps {
  artist: string;
  title: string;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  museum: string | null;
}

type Format = "mla" | "apa" | "chicago";

function generateCitation(
  format: Format,
  { artist, title, year, medium, museum }: CiteButtonProps
): string {
  const yr = year ? String(year) : "n.d.";

  switch (format) {
    case "mla":
      return [
        `${artist}.`,
        `*${title}*.`,
        year ? `${yr}.` : null,
        medium ? `${medium}.` : null,
        museum ? `${museum}.` : null,
      ]
        .filter(Boolean)
        .join(" ");

    case "apa":
      return [
        `${artist}`,
        `(${yr}).`,
        `*${title}*`,
        medium ? `[${medium}].` : ".",
        museum ? `${museum}.` : null,
      ]
        .filter(Boolean)
        .join(" ");

    case "chicago":
      return [
        `${artist},`,
        `*${title}*,`,
        year ? `${yr},` : null,
        medium ? `${medium.toLowerCase()},` : null,
        museum ? `${museum}.` : null,
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/,\.$/, ".");

    default:
      return "";
  }
}

export function CiteButton(props: CiteButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<Format | null>(null);

  async function copy(format: Format) {
    const text = generateCitation(format, props);
    await navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(!open)}
        aria-label="Cite this artwork"
        className="text-neutral-300 hover:text-neutral-900"
      >
        <Quote size={18} strokeWidth={1.5} />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-10 w-[calc(100vw-3rem)] sm:w-80 border border-neutral-100 bg-white p-4 shadow-lg"
          >
            <h4 className="text-xs uppercase tracking-widest text-neutral-300">
              Cite this artwork
            </h4>

            {(["mla", "apa", "chicago"] as Format[]).map((format) => (
              <div key={format} className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase text-neutral-500">
                    {format === "chicago" ? "Chicago" : format.toUpperCase()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copy(format)}
                    className="text-neutral-300 hover:text-neutral-900"
                  >
                    {copied === format ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                  {generateCitation(format, props)}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
