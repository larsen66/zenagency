"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { contentKit } from "@/lib/content";
import { GridBackdrop, LimeGlow } from "@/components/grid-backdrop";

const AUTO_SPEED = 4;

export function ContentKit() {
  const wheel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; angle: number; time: number } | null>(null);
  const velocity = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const visible = useInView(wheel);
  const rotation = useMotionValue(0);
  const orbitTransform = useTransform(rotation, (angle) => `rotate(${angle}deg)`);
  const itemTransform = useTransform(rotation, (angle) => `translate(-50%, -50%) rotate(${-angle}deg)`);

  useAnimationFrame((_, delta) => {
    if (!visible || drag.current || document.hidden || reducedMotion) return;
    const seconds = Math.min(delta, 32) / 1000;
    velocity.current *= Math.exp(-3 * seconds);
    const speed = (paused ? 0 : AUTO_SPEED) + velocity.current;
    rotation.set(rotation.get() + speed * seconds);
  });

  function pointerAngle(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    // Avoid unstable angles when a gesture crosses the center.
    if (Math.hypot(x, y) < rect.width * 0.12) return null;
    return Math.atan2(y, x) * 180 / Math.PI;
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || drag.current) return;
    const angle = pointerAngle(event);
    if (angle === null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, angle, time: event.timeStamp };
    velocity.current = 0;
    setDragging(true);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const previous = drag.current;
    if (!previous || previous.id !== event.pointerId) return;
    const angle = pointerAngle(event);
    if (angle === null) {
      previous.time = 0;
      velocity.current = 0;
      return;
    }
    if (previous.time !== 0) {
      const change = ((angle - previous.angle + 540) % 360) - 180;
      const elapsed = Math.max(event.timeStamp - previous.time, 8);
      rotation.set(rotation.get() + change);
      velocity.current = Math.max(-180, Math.min(180, change / elapsed * 1000));
    }
    drag.current = { id: event.pointerId, angle, time: event.timeStamp };
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return;
    if (event.type !== "pointerup" || event.timeStamp - drag.current.time > 80) {
      velocity.current = 0;
    }
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function step(direction: number) {
    velocity.current = 0;
    rotation.set(rotation.get() + direction * 45);
  }

  return (
    <section aria-labelledby="content-kit-title" className="relative overflow-hidden bg-background pt-28 pb-20 md:pt-32 md:pb-28">
      <GridBackdrop />
      <LimeGlow className="-right-16 top-10 opacity-40" />
      <LimeGlow className="-bottom-20 -left-10 opacity-25" />

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <div
          ref={wheel}
          role="group"
          aria-roledescription="carousel"
          aria-label="Content creator equipment"
          tabIndex={0}
          className={`relative mx-auto aspect-square max-w-4xl touch-pan-y select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-lime ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              step(event.key === "ArrowRight" ? 1 : -1);
            } else if (event.key === " ") {
              event.preventDefault();
              velocity.current = 0;
              setPaused((value) => !value);
            }
          }}
        >
          <motion.div className="absolute inset-0" style={{ transform: orbitTransform }}>
            {contentKit.items.map((item, index) => {
              const angle = (-135 + index * 45) * Math.PI / 180;
              return (
                <motion.figure
                  key={item.n}
                  className={`absolute flex h-[26%] flex-col items-center ${item.className.split(" ").filter((name) => name.startsWith("w-")).join(" ")}`}
                  style={{
                    left: `${50 + Math.cos(angle) * 36}%`,
                    top: `${50 + Math.sin(angle) * 36}%`,
                    transform: itemTransform,
                  }}
                >
                  <span className="mb-1 self-start text-[10px] font-bold text-foreground/70 md:text-xs">{item.n}</span>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={360}
                    height={360}
                    draggable={false}
                    sizes="(max-width: 768px) 24vw, 215px"
                    className="pointer-events-none min-h-0 w-full flex-1 object-contain drop-shadow-md"
                  />
                </motion.figure>
              );
            })}
          </motion.div>
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex size-[36%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-lime p-3 text-center md:p-5">
            <h2 id="content-kit-title" className="text-lg font-extrabold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
              {contentKit.title}
            </h2>
          </div>
        </div>

      </div>
    </section>
  );
}
