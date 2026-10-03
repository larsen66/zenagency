import { HeroScroll } from "@/components/hero-scroll";
import { ArrowUpRight } from "lucide-react";
import { HeroMark } from "@/components/hero-mark";

export function Hero() {
  return (
    <HeroScroll>
      <div className="hero-side hero-side-left" aria-hidden="true">
        <span>Strategy<br />Design<br />Marketing</span>
      </div>
      <div className="hero-main">
        <HeroMark />
        <div className="hero-copy">
          <h1 id="hero-title" aria-label="Ideas built to move."><span className="hero-title-word hero-title-accent">Ideas</span>{" "}<span className="hero-title-word">built</span>{" "}<span className="hero-title-word">to</span>{" "}<span className="hero-title-word">move<em className="hero-title-dot">.</em></span></h1>
          <p className="hero-caption">From strategy to content, we build modern brands<br className="hidden sm:block" /> with clarity, speed and impact.</p>
          <div className="hero-actions">
            <a href="#contact" className="hero-button hero-button-primary">Start your growth <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </HeroScroll>
  );
}
