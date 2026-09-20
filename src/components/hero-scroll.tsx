"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { HeroCrtFilter } from "./hero-crt-filter";
import { TransitionVignette } from "./transition-vignette";

import { MAX_SHUTTER_BANDS as MAX_BANDS, clampProgress as clamp, shutterCoverage } from "./scroll-shutters";

export function HeroScroll({ children }: { children: ReactNode }) {
  const clipId = useId().replace(/:/g, "");
  const crtId = `${clipId}-crt`;
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const hero = root.querySelector<HTMLElement>(".zen-hero")!;
    const mark = root.querySelector<HTMLElement>(".hero-mark")!;
    const copy = root.querySelectorAll<HTMLElement>(".hero-main > :not(.hero-mark), .hero-side");
    const bands = root.querySelectorAll<SVGRectElement>(".hero-transition-clip .hero-clip-band");
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let markCenter = 0;
    let progress: number | null = null;
    let previousTime = 0;
    const measure = () => {
      // offsetTop is unaffected by the animated transform.
      markCenter = root.querySelector<HTMLElement>(".hero-main")!.offsetTop + mark.offsetTop + mark.offsetHeight / 2;
    };
    const render = (time = performance.now()) => {
      frame = 0;
      const target = preference.matches ? 0 : clamp(-root.getBoundingClientRect().top / hero.offsetHeight);
      const elapsed = Math.min(64, Math.max(0, time - previousTime));
      previousTime = time;
      // Short, frame-rate-independent scrub softens wheel steps without changing the sequence.
      progress = progress === null || preference.matches
        ? target
        : progress + (target - progress) * (1 - Math.exp(-elapsed / 90));
      if (Math.abs(target - progress) < .0001) progress = target;
      const currentProgress = progress;
      const heroOpacity = 1 - clamp((progress - .68) / .12);
      hero.style.opacity = String(heroOpacity);
      const blurProgress = clamp((progress - .03) / .47);
      const blur = 10 * blurProgress * blurProgress * (3 - 2 * blurProgress);
      hero.style.filter = `url(#${crtId})${blur === 0 || progress >= .8 ? "" : ` blur(${blur}px)`}`;
      const shrink = clamp(progress / .4);
      mark.style.transform = `translate3d(0,${(72 - markCenter) * shrink}px,0) scale(${1 - shrink * .84})`;
      const opacity = 1 - clamp(progress / .3);
      for (const element of copy) {
        element.style.opacity = String(opacity);
        element.style.visibility = opacity === 0 ? "hidden" : "";
      }
      const count = window.innerWidth <= 600 ? 15 : 10;
      const timeline = clamp(progress / .8) * (.5 + (count - 1) * .04);
      bands.forEach((band, index) => {
        if (index >= count) { band.setAttribute("height", "0"); return; }
        const coverage = shutterCoverage(timeline - (count - index - 1) * .04);
        // The shutter layer scrolls up with the page, unlike the pinned logo.
        band.setAttribute("y", String(index / count - currentProgress));
        band.setAttribute("height", String((1 - coverage) / count + (coverage < 1 ? .0001 : 0)));
      });
      hero.inert = progress >= .95;
      if (progress !== target) frame = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (!frame) {
        previousTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    const resize = () => { measure(); schedule(); };
    const observer = new ResizeObserver(resize);
    observer.observe(hero);
    observer.observe(mark);
    measure(); render();
    window.addEventListener("scroll", schedule, { passive: true });
    preference.addEventListener("change", resize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      preference.removeEventListener("change", resize);
    };
  }, [crtId]);

  return <div id="top" ref={track} className="hero-scroll-track">
    <TransitionVignette />
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs><HeroCrtFilter id={crtId} /><clipPath id={clipId} clipPathUnits="objectBoundingBox" className="hero-transition-clip">
        {Array.from({ length: MAX_BANDS }, (_, index) => <rect className="hero-clip-band" key={index} x="0" y={index / MAX_BANDS} width="1" height={1 / MAX_BANDS + .0001} />)}
      </clipPath></defs>
    </svg>
    <section className="zen-hero" aria-labelledby="hero-title" style={{ clipPath: `url(#${clipId})`, filter: `url(#${crtId})` }}>
      <div className="hero-transition-backdrop" aria-hidden="true">
        <div className="hero-rays" />
      </div>
      {children}
      <div className="hero-crt-screen" aria-hidden="true" />
    </section>
  </div>;
}
