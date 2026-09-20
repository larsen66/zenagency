"use client";

import { useEffect, useRef, useState } from "react";
import "./motion-scramble-text-utils/index.css";

const CHARS = "!@#$%&*+-=<>░▒▓■□▪▫◇";

function scrambleWord(target: string, progress: number) {
  const reveal = Math.floor(progress * target.length);
  return target.split("").map((char, index) =>
    /\s/.test(char) || index < reveal
      ? char
      : CHARS[Math.floor(Math.random() * CHARS.length)],
  ).join("");
}

type ScrambleTextProps = {
  text?: string;
  trigger?: "loop" | "hover";
  className?: string;
};

export function ScrambleText({
  text = "Animate",
  trigger = "loop",
  className = "",
}: ScrambleTextProps) {
  const root = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const target = element.closest("a, button") ?? element;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;

    const stop = () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      setDisplay(text);
    };
    const start = () => {
      stop();
      if (motion.matches || document.hidden || !element.getClientRects().length) return;
      const started = performance.now();
      const duration = trigger === "hover" ? 240 : 600;
      let lastTick = -Infinity;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / duration);
        if (now - lastTick >= 32 || progress === 1) {
          setDisplay(progress === 1 ? text : scrambleWord(text, progress));
          lastTick = now;
        }
        if (progress < 1) frame = requestAnimationFrame(tick);
        else if (trigger === "loop" && visible) timer = setTimeout(start, 4000);
      };
      frame = requestAnimationFrame(tick);
    };
    const enter = () => { if (pointer.matches) start(); };
    const sync = () => {
      stop();
      if (trigger === "loop" && visible && !motion.matches && !document.hidden) start();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    if (trigger === "loop") observer.observe(element);
    else {
      target.addEventListener("pointerenter", enter);
      target.addEventListener("pointerleave", stop);
      target.addEventListener("pointercancel", stop);
    }
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer.disconnect();
      target.removeEventListener("pointerenter", enter);
      target.removeEventListener("pointerleave", stop);
      target.removeEventListener("pointercancel", stop);
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [text, trigger]);

  return (
    <span ref={root} className={`scramble-text ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split("").map((char, index) => char === "\n" ? <br key={index} /> : (
          <span className="scramble-text-char" key={index}>
            <span className="scramble-text-size">{char}</span>
            <span className="scramble-text-glyph">{display[index] ?? char}</span>
          </span>
        ))}
      </span>
    </span>
  );
}

export default ScrambleText;
