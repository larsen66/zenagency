"use client";

import gsap from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

type SlideDirection = { axis: "X" | "Y"; sign: number };

export type ServicePreview = {
  title: string;
  image: string;
  illustration: string;
  href?: string;
};

export function ServicesWithAnimatedHoverModal({ items, className }: {
  items: readonly ServicePreview[];
  className?: string;
}) {
  const [modal, setModal] = useState({ active: false, index: 0, entry: 0, direction: { axis: "X", sign: 1 } as SlideDirection });
  const lastEntry = useRef<{ x: number; y: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = root.current;
    if (!element || !preview.current || !badge.current) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const context = gsap.context(() => {});
    let move: (event: PointerEvent) => void = () => {};
    context.add(() => {
      const px = gsap.quickTo(preview.current, "x", { duration: .16, ease: "power3.out" });
      const py = gsap.quickTo(preview.current, "y", { duration: .16, ease: "power3.out" });
      const bx = gsap.quickTo(badge.current, "x", { duration: .12, ease: "power3.out" });
      const by = gsap.quickTo(badge.current, "y", { duration: .12, ease: "power3.out" });
      move = (event) => {
        if (!canHover.matches || reduced || event.pointerType === "touch") return;
        const x = Math.max(180, Math.min(window.innerWidth - 180, event.clientX));
        const y = Math.max(170, Math.min(window.innerHeight - 170, event.clientY));
        if (event.type === "pointerenter") {
          gsap.set(preview.current, { x, y });
          gsap.set(badge.current, { x: event.clientX, y: event.clientY });
        }
        px(x); py(y); bx(event.clientX); by(event.clientY);
      };
    });
    const hide = () => setModal((current) => current.active ? { ...current, active: false } : current);
    element.addEventListener("pointerenter", move);
    element.addEventListener("pointermove", move);
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("blur", hide);
    canHover.addEventListener("change", hide);
    return () => {
      element.removeEventListener("pointerenter", move);
      element.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("blur", hide);
      canHover.removeEventListener("change", hide);
      context.revert();
    };
  }, [reduced]);

  const showPreview = (event: ReactPointerEvent<HTMLAnchorElement>, index: number) => {
            if (event.pointerType !== "touch" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
              const point = { x: event.clientX, y: event.clientY };
              const dx = point.x - (lastEntry.current?.x ?? point.x);
              const dy = point.y - (lastEntry.current?.y ?? point.y);
              const vertical = Math.abs(dy) > Math.abs(dx);
              const direction: SlideDirection = {
                axis: vertical ? "Y" : "X",
                sign: (vertical ? dy : dx) < 0 ? -1 : 1,
              };
              lastEntry.current = point;
              setModal((current) => ({ active: true, index, direction, entry: current.entry + 1 }));
            }
  };

  const active = modal.active && !reduced;
  return (
    <div ref={root} className={cn("section-content-gap grid gap-3 sm:grid-cols-2 md:gap-4", className)}
      onPointerLeave={() => setModal((current) => ({ ...current, active: false }))}>
      {items.map((item, index) => {
        return <a key={item.title} href={item.href ?? "#contact"}
          onPointerEnter={(event) => showPreview(event, index)}
          onPointerMove={(event) => {
            if (!modal.active) showPreview(event, index);
          }}
          onPointerLeave={() => setModal((current) => ({ ...current, active: false }))}
          onFocus={() => setModal((current) => ({ ...current, active: false }))}
          className="group grid min-h-28 min-w-0 grid-cols-[1fr_auto_auto] items-center gap-2 rounded-2xl bg-lime p-4 text-ink transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:min-h-40 sm:p-5 lg:min-h-48 lg:gap-3 lg:px-7 lg:py-5">
          <span className="section-item-title min-w-0">{item.title}</span>
          <span aria-hidden="true" className="relative h-20 w-20 shrink-0 sm:h-28 sm:w-24 lg:h-36 lg:w-40 xl:w-44">
            <Image src={item.illustration} alt="" fill sizes="(min-width: 1280px) 176px, (min-width: 1024px) 160px, (min-width: 640px) 96px, 80px" className="object-contain" />
          </span>
          <ArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
        </a>;
      })}
      <div ref={preview} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-50 hidden [@media(hover:hover)_and_(pointer:fine)]:block">
        <motion.div initial={false} animate={{ opacity: active ? 1 : 0, transform: `translate(-50%, -50%) scale(${active ? 1 : .94})` }}
          transition={{ duration: .22, ease: [.23, 1, .32, 1] }}
          className="h-[300px] w-[340px] overflow-hidden">
          <AnimatePresence initial={false} custom={modal.direction}>
            <motion.div key={`${modal.index}-${modal.entry}`} custom={modal.direction}
              variants={{
                enter: ({ axis, sign }: SlideDirection) => ({ transform: `translate${axis}(${-sign * 100}%)` }),
                visible: ({ axis }: SlideDirection) => ({ transform: `translate${axis}(0%)` }),
                exit: ({ axis, sign }: SlideDirection) => ({ transform: `translate${axis}(${sign * 100}%)` }),
              }}
              initial="enter" animate="visible" exit="exit"
              transition={{ duration: .24, ease: [.23, 1, .32, 1] }}
              className="absolute inset-0 flex items-center justify-center">
              <Image src={items[modal.index].image} alt="" width={600} height={480} sizes="340px" className="h-full w-full object-cover" />
              {[0, 1, 2].map((band) => (
                <motion.div key={band}
                  initial={{ transform: "scaleY(1)", opacity: .22 }}
                  animate={{ transform: "scaleY(0)", opacity: 0 }}
                  transition={{ duration: .24, delay: (2 - band) * .03, ease: [.23, 1, .32, 1] }}
                  className="absolute inset-x-0 h-[12%] origin-bottom bg-black"
                  style={{ top: `${20 + band * 26}%` }} />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <div ref={badge} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[51] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
        <motion.div initial={false} animate={{ opacity: active ? 1 : 0, transform: `translate(-50%, -50%) scale(${active ? 1 : .94})` }}
          transition={{ duration: .18 }} className="flex size-20 items-center justify-center rounded-full bg-lime text-xs font-semibold text-ink">
          Let’s talk <ArrowUpRight className="ml-1 size-4" />
        </motion.div>
      </div>
    </div>
  );
}
