"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TextOpacityEnum = "none" | "soft" | "medium";
type ViewTypeEnum = "word" | "letter";
type TextGradientScrollType = {
  text: string;
  type?: ViewTypeEnum;
  className?: string;
  textOpacity?: TextOpacityEnum;
};

export function TextGradientScroll({ text, className, type = "letter", textOpacity = "soft" }: TextGradientScrollType) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const segments = Array.from(element.querySelectorAll<HTMLElement>(".text-gradient-foreground"), foreground => ({
      foreground, start: Number(foreground.dataset.start), end: Number(foreground.dataset.end), opacity: -1,
    }));
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let top = 0;
    let height = 1;
    let viewportHeight = innerHeight;
    let visible = false;
    const render = () => {
      frame = 0;
      if (preference.matches) return;
      const progress = Math.max(0, Math.min(1, (scrollY + viewportHeight / 2 - top) / height));
      for (const segment of segments) {
        const opacity = Math.max(0, Math.min(1, (progress - segment.start) / (segment.end - segment.start)));
        if (opacity === segment.opacity) continue;
        segment.foreground.style.opacity = String(opacity);
        segment.opacity = opacity;
      }
    };
    const schedule = () => { if (visible && !preference.matches && !frame) frame = requestAnimationFrame(render); };
    const measure = () => {
      top = element.getBoundingClientRect().top + scrollY;
      const about = element.closest<HTMLElement>("#about");
      const track = about?.parentElement;
      if (about && track?.classList.contains("about-scroll-track")) {
        // Keep reveal progress tied to the section's original document position.
        top -= Math.max(0, about.getBoundingClientRect().top - track.getBoundingClientRect().top);
      }
      height = Math.max(element.offsetHeight, 1);
      viewportHeight = innerHeight;
      schedule();
    };
    const sizes = new ResizeObserver(measure);
    sizes.observe(element);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { measure(); schedule(); }
      else { cancelAnimationFrame(frame); frame = 0; }
    }, { rootMargin: "100% 0px" });
    observer.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    preference.addEventListener("change", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizes.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      preference.removeEventListener("change", measure);
    };
  }, [text, type]);

  const words = text.trim().split(/\s+/);
  return <p ref={ref} className={cn("text-gradient-scroll relative m-0", className)}>
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">
      {words.map((word, index) => {
        const range: [number, number] = [index / words.length, (index + 1) / words.length];
        return <span key={index}>
          <span className="inline-block">
            {type === "word" ? <Segment range={range} textOpacity={textOpacity}>{word}</Segment> :
              Array.from(word).map((char, i, chars) => <Segment key={i} textOpacity={textOpacity}
                range={[range[0] + i / chars.length / words.length, range[0] + (i + 1) / chars.length / words.length]}>{char}</Segment>)}
          </span>{index < words.length - 1 ? " " : ""}
        </span>;
      })}
    </span>
    <noscript><style>{`.text-gradient-foreground { opacity: 1 !important; }`}</style></noscript>
  </p>;
}

function Segment({ children, range, textOpacity }: { children: ReactNode; range: [number, number]; textOpacity: TextOpacityEnum }) {
  return <span className="relative inline-grid">
    <span className={cn("[grid-area:1/1]", { "opacity-0": textOpacity === "none", "opacity-10": textOpacity === "soft", "opacity-30": textOpacity === "medium" })}>{children}</span>
    <span className="text-gradient-foreground [grid-area:1/1]" data-start={range[0]} data-end={range[1]} style={{ opacity: 0 }}>{children}</span>
  </span>;
}
