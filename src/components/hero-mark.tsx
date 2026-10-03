"use client";

import { useEffect, useRef } from "react";

const letters = [
  { letter: "z", image: "woman-poster.webp", video: "woman-web.mp4", viewBox: "0 0 273 262" },
  { letter: "e", image: "building-poster.webp", video: "building-web.mp4", viewBox: "0 0 273 261" },
  { letter: "n", image: "light-trails-poster.webp", video: "light-trails-web.mp4", viewBox: "0 0 276 261" },
] as const;

export function HeroMark() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const videos = Array.from(root.querySelectorAll("video"));
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const track = root.closest<HTMLElement>(".hero-scroll-track");
    const hero = root.closest<HTMLElement>(".zen-hero");
    let visible = false;
    let playing = false;
    let trackTop = 0;
    let heroHeight = 1;
    const measure = () => {
      trackTop = track ? track.getBoundingClientRect().top + scrollY : 0;
      heroHeight = Math.max(hero?.offsetHeight ?? 1, 1);
    };

    const update = () => {
      const progress = (scrollY - trackTop) / heroHeight;
      const play = visible && progress < 0.08 && !document.hidden && !preference.matches && !connection?.saveData;
      if (play === playing) return;
      playing = play;
      for (const video of videos) {
        if (play) {
          if (!video.getAttribute("src")) video.src = video.dataset.src!;
          video.playbackRate = 0.7;
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    };

    measure();
    const sizes = new ResizeObserver(measure);
    if (hero) sizes.observe(hero);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.05 });
    observer.observe(root);
    window.addEventListener("scroll", update, { passive: true });
    document.addEventListener("visibilitychange", update);
    preference.addEventListener("change", update);
    return () => {
      observer.disconnect();
      sizes.disconnect();
      window.removeEventListener("scroll", update);
      document.removeEventListener("visibilitychange", update);
      preference.removeEventListener("change", update);
      videos.forEach((video) => video.pause());
    };
  }, []);

  return (
    <div ref={ref} className="hero-mark" aria-hidden="true">
      {letters.map(({ letter, image, video, viewBox }) => (
        <div key={letter} className={`hero-letter hero-letter-${letter}`}>
          <video
            poster={`/images/zen/${image}`}
            data-src={`/images/zen/${video}`}
            preload="none"
            muted
            loop
            playsInline
            disablePictureInPicture
            tabIndex={-1}
          />
          <svg className="hero-letter-outline" viewBox={viewBox} preserveAspectRatio="none">
            <use href={`/brand/hero-${letter}.svg#shape`} />
          </svg>
        </div>
      ))}
    </div>
  );
}
