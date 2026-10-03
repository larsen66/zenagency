import type { ReactNode } from "react";
import { about } from "@/lib/content";
import { TextGradientScroll } from "@/components/ui/text-gradient-scroll";

export function About({ children }: { children?: ReactNode }) {
  return (
    <section id="about" aria-labelledby="about-title" className="relative isolate bg-black text-[#e1e3dc]">
      <div data-about-panel className="relative flex items-center px-5 pt-20 pb-12 sm:px-8 sm:pt-24 sm:pb-16 lg:min-h-[80svh] lg:px-14 lg:py-24">
        <div data-about-content className="mx-auto w-full max-w-[1280px]">
          <h2 id="about-title" className="mb-8 text-xs font-medium uppercase tracking-[.24em] text-lime sm:mb-10 lg:mb-14">{about.title}</h2>
          <TextGradientScroll
            text={`${about.highlight} ${about.body}`}
            type="letter"
            textOpacity="medium"
            className="max-w-[26ch] text-[clamp(1.75rem,4.8vw,5rem)] font-medium leading-[1.16] tracking-[-.035em]"
          />
        </div>
      </div>
      {children}
    </section>
  );
}
