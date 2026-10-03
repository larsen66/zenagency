"use client";

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const Scene = dynamic(() => import("./scene"), { ssr: false });
const VIDEO_FREEZE_PROGRESS = 0.08;

// Keep the server-rendered poster if WebGL or a video cannot initialize.
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export function ZenMark3D({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [enhance, setEnhance] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const hero = el.closest<HTMLElement>(".zen-hero");
    const track = el.closest<HTMLElement>(".hero-scroll-track");
    let intersecting = false;
    const updatePlayback = () => {
      // Let the opening shutters begin before freezing the current video frame.
      const progress = hero && track
        ? -track.getBoundingClientRect().top / Math.max(1, hero.offsetHeight)
        : 0;
      setVisible(intersecting && progress < VIDEO_FREEZE_PROGRESS && !document.hidden && !motion.matches);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        updatePlayback();
        if (entry.isIntersecting && !motion.matches && !connection?.saveData) setEnhance(true);
      },
      { rootMargin: "80px 0px", threshold: 0.05 },
    );
    io.observe(el);
    window.addEventListener("scroll", updatePlayback, { passive: true });
    window.addEventListener("resize", updatePlayback);
    document.addEventListener("visibilitychange", updatePlayback);
    motion.addEventListener("change", updatePlayback);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", updatePlayback);
      window.removeEventListener("resize", updatePlayback);
      document.removeEventListener("visibilitychange", updatePlayback);
      motion.removeEventListener("change", updatePlayback);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full overflow-hidden", "aspect-[3.12]", className)}
      data-ready={ready}
      aria-hidden="true"
    >
      <Image
        src="/images/zen/hero-poster.webp"
        alt=""
        fill
        preload
        sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 1100px) 90vw, (max-width: 1690px) 74vw, 1250px"
        className={cn("object-contain transition-opacity duration-200 motion-reduce:transition-none", ready ? "opacity-0" : "opacity-100")}
      />
      {enhance && (
        <div className={cn("absolute inset-0 transition-opacity duration-200", ready ? "opacity-100" : "opacity-0")}>
          <SceneBoundary><Scene active={visible} onReady={onReady} /></SceneBoundary>
        </div>
      )}
    </div>
  );
}
