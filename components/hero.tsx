"use client";

import { motion } from "framer-motion";
import { KBarTrigger } from "./kbar-trigger";

interface HeroProps {
  artworks: number;
  artists: number;
  styles: number;
}

export function Hero({ artworks, artists, styles }: HeroProps) {
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 pt-32 pb-28 text-center">
        <motion.h1
          className="text-[8rem] font-light leading-none tracking-tighter sm:text-[12rem] select-none"
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
          {artworks.toLocaleString()} artworks across{" "}
          {artists.toLocaleString()} artists and{" "}
          {styles.toLocaleString()} styles
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
