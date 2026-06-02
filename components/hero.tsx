"use client";

import { motion } from "framer-motion";
import { KBarTrigger } from "./kbar-trigger";

interface HeroProps {
  artworks: string;
  artists: string;
  styles: string;
}

export function Hero({ artworks, artists, styles }: HeroProps) {
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 pt-32 pb-28 text-center">
        <motion.h1
          className="text-5xl font-light leading-none tracking-tighter sm:text-[8rem] lg:text-[12rem] select-none"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          VisualArtsDB
        </motion.h1>
        <motion.p
          className="mt-8 text-base tracking-wide text-neutral-400 select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {artworks} artworks across {artists} artists and {styles} styles
        </motion.p>
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <KBarTrigger />
        </motion.div>
      </section>
    </>
  );
}
