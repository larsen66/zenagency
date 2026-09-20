import { HeroScroll } from "@/components/hero-scroll";
import { ArrowUpRight } from "lucide-react";
import { ScrambleText } from "@/components/ui/motion-scramble-text";
import { Reveal } from "@/components/reveal";
import { ZenMark3D } from "@/components/zen-mark-3d";

export function Hero() {
  return (
    <HeroScroll>
      <div className="hero-side hero-side-left" aria-hidden="true">
        <span>Strategy<br />Design<br />Marketing</span>
      </div>
      <div className="hero-main">
        <ZenMark3D className="hero-mark" />
        <div className="hero-copy">
        <Reveal delay={0.15}><h1 id="hero-title"><span>Ideas</span> built to move<span>.</span></h1></Reveal>
        <Reveal delay={0.23}><p className="hero-caption">From strategy to content, we build modern brands<br className="hidden sm:block" /> with clarity, speed and impact.</p></Reveal>
        <Reveal delay={0.31}><div className="hero-actions">
          <a href="#contact" className="hero-button hero-button-primary"><ScrambleText text="Start your growth" trigger="hover" /> <ArrowUpRight aria-hidden="true" /></a>
          <a href="#work" className="hero-button hero-button-secondary"><ScrambleText text="See cases" trigger="hover" /> <ArrowUpRight aria-hidden="true" /></a>
        </div></Reveal>
        </div>
      </div>
    </HeroScroll>
  );
}
