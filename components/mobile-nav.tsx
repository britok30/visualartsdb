"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useKBar } from "kbar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const links = [
  { label: "Search", href: null },
  { label: "Styles", href: "/browse/styles" },
  { label: "Genres", href: "/browse/genres" },
  { label: "Museums", href: "/browse/museums" },
  { label: "Artists", href: "/browse/artists" },
  { label: "Favorites", href: "/favorites" },
  { label: "Support", href: "https://buy.stripe.com/6oU3cwfe41DU0io0IA7ok00" },
];

export function MobileNav() {
  const { query } = useKBar();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <motion.button
        onClick={() => setOpen(!open)}
        className="text-neutral-400 transition-colors hover:text-neutral-900"
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "menu"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
            className="block"
          >
            {open ? (
              <X size={20} strokeWidth={1.5} />
            ) : (
              <Menu size={20} strokeWidth={1.5} />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute left-0 right-0 top-14 overflow-hidden border-b border-neutral-100 bg-white/90 backdrop-blur-xl"
          >
            <nav className="flex flex-col gap-1 px-6 py-5">
              {links.map((item, i) =>
                item.href ? (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className="block py-2 text-sm text-neutral-400 transition-colors hover:text-neutral-900"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <button
                      onClick={() => {
                        setOpen(false);
                        query.toggle();
                      }}
                      className="block w-full py-2 text-left text-sm text-neutral-400 transition-colors hover:text-neutral-900"
                    >
                      {item.label}
                    </button>
                  </motion.div>
                )
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
