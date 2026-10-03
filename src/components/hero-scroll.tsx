"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { HeroBackground } from "./hero-background";
import { TransitionVignette } from "./transition-vignette";

import { MAX_SHUTTER_BANDS as MAX_BANDS, SHUTTER_SCRUB_MS, clampProgress as clamp, shutterCoverage } from "./scroll-shutters";

export function HeroScroll({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const hero = root.querySelector<HTMLElement>(".zen-hero")!;
    const mark = root.querySelector<HTMLElement>(".hero-mark")!;
    const copy = root.querySelectorAll<HTMLElement>(".hero-main > :not(.hero-mark), .hero-side");
    const vignette = root.querySelector<HTMLElement>("[data-transition-vignette]")!;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let markCenter = 0;
    let trackTop = 0;
    let heroHeight = 1;
    let count = 10;
    let progress: number | null = null;
    let previousTime = 0;
    const measure = () => {
      // offsetTop is unaffected by the animated transform.
      markCenter = root.querySelector<HTMLElement>(".hero-main")!.offsetTop + mark.offsetTop + mark.offsetHeight / 2;
      trackTop = root.getBoundingClientRect().top + window.scrollY;
      heroHeight = Math.max(hero.offsetHeight, 1);
      count = window.innerWidth <= 600 ? MAX_BANDS : 10;
    };
    const targetProgress = () => preference.matches ? 0 : clamp((window.scrollY - trackTop) / heroHeight);
    const smooth = (value: number, from: number, to: number) => {
      const p = clamp((value - from) / (to - from));
      return p * p * (3 - 2 * p);
    };
    const render = (time = performance.now()) => {
      frame = 0;
      const target = targetProgress();
      const elapsed = Math.min(64, Math.max(0, time - previousTime));
      previousTime = time;
      // Short, frame-rate-independent scrub softens wheel steps without changing the sequence.
      progress = progress === null || preference.matches
        ? target
        : progress + (target - progress) * (1 - Math.exp(-elapsed / SHUTTER_SCRUB_MS));
      if (Math.abs(target - progress) < .0005) progress = target;
      const currentProgress = progress;
      const heroOpacity = 1 - clamp((progress - .68) / .12);
      hero.style.opacity = String(heroOpacity);
      // Blur the shrinking mark rather than another full-screen WebGL/video surface.
      const blur = (count === MAX_BANDS ? 3 : 6) * smooth(progress, .03, .5);
      mark.style.filter = blur === 0 || progress >= .8 ? "" : `blur(${blur}px)`;
      const shrink = clamp(progress / .4);
      mark.style.transform = `translate3d(0,${(72 - markCenter) * shrink}px,0) scale(${1 - shrink * .84})`;
      const opacity = 1 - clamp(progress / .3);
      for (const element of copy) {
        element.style.opacity = String(opacity);
        element.style.visibility = opacity === 0 ? "hidden" : "";
      }
      const timeline = clamp(progress / .8) * (.5 + (count - 1) * .04);
      const points: string[] = [];
      for (let index = 0; index < count; index++) {
        const coverage = shutterCoverage(timeline - (count - index - 1) * .04);
        if (coverage === 1) continue;
        const top = (index / count - currentProgress) * 100;
        const bottom = top + (1 - coverage) / count * 100 + .01;
        points.push(`0 ${top}%`, `100% ${top}%`, `100% ${bottom}%`, `0 ${bottom}%`);
      }
      // One CSS clip avoids relaying out 15 SVG rectangles on each frame.
      hero.style.clipPath = progress === 0 ? "" : `polygon(${points.length ? points.join(",") : "0 0,0 0,0 0"})`;
      vignette.style.opacity = String(preference.matches ? 0 : smooth(progress, 0, .2) * (1 - smooth(progress, .55, .85)));
      hero.inert = progress >= .95;
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
    observer.observe(hero);
    observer.observe(mark);
    measure(); render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    preference.addEventListener("change", resize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      preference.removeEventListener("change", resize);
    };
  }, []);

  return <div id="top" ref={track} className="hero-scroll-track">
    <TransitionVignette />
    <section className="zen-hero" data-hero-intro="pending" aria-labelledby="hero-title">
      <noscript><style>{`.zen-hero[data-hero-intro="pending"] .hero-letter, .zen-hero[data-hero-intro="pending"] .hero-title-word, .zen-hero[data-hero-intro="pending"] .hero-caption, .zen-hero[data-hero-intro="pending"] .hero-actions { opacity: 1 !important; }`}</style></noscript>
      <HeroBackground />
      {children}
    </section>
  </div>;
}
