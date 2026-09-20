"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { clampProgress, MAX_SHUTTER_BANDS, shutterCoverage } from "./scroll-shutters";

export function ServicesScroll({ children }: { children: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const stripes = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const element = section.current;
    const layer = stripes.current;
    if (!element || !layer) return;
    const bands = layer.querySelectorAll("rect");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let progress: number | null = null;
    let previousTime = 0;
    const render = (time = performance.now()) => {
      frame = 0;
      const target = motion.matches || element.contains(document.activeElement)
        ? 1
        : clampProgress((innerHeight - element.getBoundingClientRect().top) / (innerHeight * .95));
      const elapsed = Math.min(64, Math.max(0, time - previousTime));
      previousTime = time;
      progress = progress === null || motion.matches ? target
        : progress + (target - progress) * (1 - Math.exp(-elapsed / 90));
      if (Math.abs(target - progress) < .0001) progress = target;
      const currentProgress = progress;
      const count = innerWidth <= 600 ? 15 : 10;
      const height = innerHeight;
      const timeline = progress * (.5 + (count - 1) * .04);
      // A separate white layer leads the rising panel; its content stays intact.
      layer.style.top = `${element.offsetTop - height}px`;
      layer.style.height = `${height}px`;
      layer.style.visibility = progress <= 0 || progress >= 1 || motion.matches ? "hidden" : "visible";
      bands.forEach((band, index) => {
        const coverage = shutterCoverage(timeline - (count - index - 1) * .04);
        // Match hero's upward shutter travel, with white rather than black bands.
        band.setAttribute("y", String(index / count + 1 - currentProgress));
        band.setAttribute("height", index >= count ? "0" : String(coverage / count + (coverage > 0 ? .0001 : 0)));
      });
      if (progress !== target) frame = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (!frame) {
        previousTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    if (element.parentElement) observer.observe(element.parentElement);
    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    element.addEventListener("focusin", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      element.removeEventListener("focusin", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return <>
    <svg ref={stripes} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"
      className="pointer-events-none invisible absolute left-0 z-[2] w-full overflow-hidden fill-white motion-reduce:hidden">
      {Array.from({ length: MAX_SHUTTER_BANDS }, (_, index) =>
        <rect key={index} x="0" y="1" width="1" height="0" />)}
    </svg>
    <section ref={section} id="services" className="relative overflow-hidden bg-white pt-28 pb-20 md:pt-32 md:pb-28">
      {children}
    </section>
  </>;
}
