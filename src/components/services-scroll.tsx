"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { clampProgress, MAX_SHUTTER_BANDS, SHUTTER_SCRUB_MS, shutterCoverage } from "./scroll-shutters";

export function ServicesScroll({ children }: { children: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const stripes = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = section.current;
    const layer = stripes.current;
    if (!element || !layer) return;
    const bands = layer.querySelectorAll<HTMLElement>(".services-shutter-band");
    const about = element.parentElement?.querySelector<HTMLElement>("#about");
    const aboutTrack = about?.parentElement;
    const outgoing = about?.querySelectorAll<HTMLElement>("[data-about-content], #capabilities");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let progress: number | null = null;
    let previousTime = 0;
    let sectionTop = 0;
    let height = 1;
    let count = 10;
    const measure = () => {
      if (about && aboutTrack) {
        aboutTrack.style.setProperty("--about-height", `${about.offsetHeight}px`);
      }
      sectionTop = element.getBoundingClientRect().top + scrollY;
      height = innerHeight;
      count = innerWidth <= 600 ? MAX_SHUTTER_BANDS : 10;
      layer.style.top = `${element.offsetTop - height}px`;
      layer.style.height = `${height}px`;
      bands.forEach((band, index) => {
        band.style.top = `${index / count * 100}%`;
        band.style.height = `calc(${100 / count}% + .1px)`;
        band.style.display = index < count ? "" : "none";
      });
    };
    const targetProgress = () => motion.matches || element.contains(document.activeElement)
      ? 1 : clampProgress((scrollY + height - sectionTop) / (height * .95));
    const render = (time = performance.now()) => {
      frame = 0;
      const target = targetProgress();
      const elapsed = Math.min(64, Math.max(0, time - previousTime));
      previousTime = time;
      progress = progress === null || motion.matches ? target
        : progress + (target - progress) * (1 - Math.exp(-elapsed / SHUTTER_SCRUB_MS));
      if (Math.abs(target - progress) < .0005) progress = target;
      const currentProgress = progress;
      const blurProgress = clampProgress((progress - .03) / .47);
      const blur = motion.matches ? 0 : (count === MAX_SHUTTER_BANDS ? 3 : 6)
        * blurProgress * blurProgress * (3 - 2 * blurProgress);
      outgoing?.forEach((content) => {
        content.style.filter = blur === 0 ? "" : `blur(${blur}px)`;
      });
      const timeline = progress * (.5 + (count - 1) * .04);
      // A separate white layer leads the rising panel; its content stays intact.
      layer.style.visibility = progress <= 0 || progress >= 1 || motion.matches ? "hidden" : "visible";
      bands.forEach((band, index) => {
        if (index >= count) return;
        const coverage = shutterCoverage(timeline - (count - index - 1) * .04);
        // Match hero's upward shutter travel, with white rather than black bands.
        band.style.transform = `translate3d(0,${(1 - currentProgress) * height}px,0) scaleY(${coverage})`;
      });
      if (progress !== target) frame = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (!frame && progress !== targetProgress()) {
        previousTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    const resize = () => { cancelAnimationFrame(frame); measure(); render(); };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    if (about) observer.observe(about);
    if (element.parentElement) observer.observe(element.parentElement);
    resize();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    element.addEventListener("focusin", schedule);
    motion.addEventListener("change", resize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      element.removeEventListener("focusin", schedule);
      motion.removeEventListener("change", resize);
      aboutTrack?.style.removeProperty("--about-height");
      outgoing?.forEach((content) => content.style.removeProperty("filter"));
    };
  }, []);

  return <>
    <div ref={stripes} aria-hidden="true"
      className="pointer-events-none invisible absolute left-0 z-[2] w-full overflow-hidden motion-reduce:hidden">
      {Array.from({ length: MAX_SHUTTER_BANDS }, (_, index) =>
        <div key={index} className="services-shutter-band absolute left-0 w-full origin-top bg-white" />)}
    </div>
    <section ref={section} id="services" className="relative z-[1] overflow-hidden bg-white py-16 sm:py-20 lg:py-28">
      {children}
    </section>
  </>;
}
