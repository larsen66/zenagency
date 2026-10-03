import { ServicesScroll } from "@/components/services-scroll";
import { GridBackdrop } from "@/components/grid-backdrop";
import { Reveal } from "@/components/reveal";
import { services } from "@/lib/content";

import { ServicesWithAnimatedHoverModal } from "@/components/ui/services-with-animated-hover-modal";

const previews = [
  { image: "/images/services/social.jpg" },
  { image: "/images/services/ads.jpg" },
  { image: "/images/services/search.jpg" },
  { image: "/images/services/growth.jpg" },
];

export function Services() {
  return (
    <ServicesScroll>
      <GridBackdrop className="services-grid" />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <Reveal>
          <h2 className="text-[clamp(2rem,4.2vw,3.75rem)] font-extrabold leading-[1.08] tracking-tight text-lime">
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
