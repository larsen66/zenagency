import { LiquidGlassCarousel, type LiquidGlassCarouselItem } from "@/components/ui/liquid-glass-carousel";
import { Reveal } from "@/components/reveal";

// Pinterest design references. Source details are recorded in work-image-sources.json.
const work: LiquidGlassCarouselItem[] = [
  { title: "Interior e-commerce", src: "/images/work/interior-store.jpg", aspect: 3 / 4 },
  { title: "Digital agency website", src: "/images/work/agency-website.jpg", aspect: 3 / 4 },
  { title: "Fashion e-commerce", src: "/images/work/fashion-store.jpg", aspect: 3 / 4 },
  { title: "Travel website", src: "/images/work/travel-website.jpg", aspect: 3 / 4 },
  { title: "Architecture website", src: "/images/work/architecture-website.jpg", aspect: 3 / 4 },
  { title: "Website presentation", src: "/images/work/website-mockup.jpg", aspect: 3 / 4 },
];

export function OurWork() {
  return (
    <section id="our-work" aria-labelledby="our-work-title" className="section-spacing relative overflow-hidden bg-white">
      <div className="section-container">
        <Reveal>
          <h2 id="our-work-title" className="section-title">Our work</h2>
          <p className="section-description">A curated look at websites, digital experiences, and visual design.</p>
        </Reveal>
      </div>
      <div className="section-container mt-4 sm:mt-6">
        <div className="h-[clamp(562.5px,75svh,843.75px)]">
          <LiquidGlassCarousel items={work} entry={false} gap={18} panelHeight={703.125} />
        </div>
      </div>
    </section>
  );
}
