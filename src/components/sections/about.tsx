import type { ReactNode } from "react";
import { about } from "@/lib/content";
import { TextGradientScroll } from "@/components/ui/text-gradient-scroll";

export function About({ children }: { children?: ReactNode }) {
  return (
    <section id="about" aria-labelledby="about-title" className="section-spacing section-inverse relative isolate bg-black">
      <div data-about-panel className="relative">
        <div data-about-content className="section-container">
          <h2 id="about-title" className="section-title">{about.title}</h2>
          <div className="section-content-gap">
            <TextGradientScroll
              text={`${about.highlight} ${about.body}`}
              type="letter"
              textOpacity="medium"
              className="section-statement"
            />
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}
