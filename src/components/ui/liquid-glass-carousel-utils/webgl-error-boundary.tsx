"use client";

import { Component, type ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { LiquidGlassCarouselItem } from "../liquid-glass-carousel";

export class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function WebGLFallback({ className, message, items = [] }: {
  className?: string;
  message?: string;
  items?: LiquidGlassCarouselItem[];
}) {
  return (
    <div className={cn("flex flex-col justify-center gap-6 px-5", className)}>
      {items.length > 0 && <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {items.map((item, index) => <li key={`${item.src}-${index}`} className="w-56 shrink-0 snap-center">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image src={item.src} alt={item.title} fill unoptimized sizes="224px" className="object-cover" />
          </div>
          <p className="mt-3 text-sm font-medium">{item.title}</p>
        </li>)}
      </ul>}
      {message && <p className="text-center text-sm text-black/60">{message}</p>}
      {items.length === 0 && <p className="text-center text-sm text-black/60">No projects to display.</p>}
    </div>
  );
}
