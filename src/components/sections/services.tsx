import { ServicesScroll } from "@/components/services-scroll";
import { GridBackdrop } from "@/components/grid-backdrop";
import { Reveal } from "@/components/reveal";
import { services } from "@/lib/content";

import { ServicesWithAnimatedHoverModal } from "@/components/ui/services-with-animated-hover-modal";

const previews = [
  { image: "/images/services/social-preview.webp", illustration: "/images/services/social-illustration.webp" },
  { image: "/images/services/ads-preview.webp", illustration: "/images/services/ads-illustration.webp" },
  { image: "/images/services/search-preview.webp", illustration: "/images/services/search-illustration.webp" },
  { image: "/images/services/growth-preview.webp", illustration: "/images/services/growth-illustration.webp" },
];

export function Services() {
  return (
    <ServicesScroll>
      <GridBackdrop className="services-grid" />

      <div className="section-container relative">
        <Reveal>
          <h2 className="section-title">
            {services.title}
          </h2>
          <p className="section-description">
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
