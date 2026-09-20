"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn("glitch-reveal", className)}
      style={{ animationDelay: `${delay}s` }}
      onViewportEnter={(entry) => entry?.target.setAttribute("data-revealed", "")}
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
