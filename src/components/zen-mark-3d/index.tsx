"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const Scene = dynamic(() => import("./scene"), { ssr: false });

export function ZenMark3D({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "80px 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative w-full overflow-hidden",
        "aspect-[3.12]",
        className,
      )}
      aria-hidden="true"
    >
      <Scene active={visible} />
    </div>
  );
}
