import { ServicesScroll } from "@/components/services-scroll";
import { GridBackdrop } from "@/components/grid-backdrop";
import { Reveal } from "@/components/reveal";
import { services } from "@/lib/content";

import { ServicesWithAnimatedHoverModal } from "@/components/ui/services-with-animated-hover-modal";

const previews = [
  { image: "/images/services/social.jpg", color: "#171c11" },
  { image: "/images/services/ads.jpg", color: "#c8df8b" },
  { image: "/images/services/search.jpg", color: "#e1e3dc" },
  { image: "/images/services/growth.jpg", color: "#344529" },
];

export function Services() {
  return (
    <ServicesScroll>
      <GridBackdrop className="services-grid" />

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            {services.title}
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {services.subtitle}
          </p>
        </Reveal>

        <ServicesWithAnimatedHoverModal
          items={services.items.map((item, index) => ({ ...item, ...previews[index] }))}
        />
      </div>
    </ServicesScroll>
  );
}
