import Image from "next/image";
import { Check } from "lucide-react";
import { GridBackdrop } from "@/components/grid-backdrop";
import { Reveal } from "@/components/reveal";
import { whyUs } from "@/lib/content";
import { cn } from "@/lib/utils";

export function WhyUs() {
  return (
    <section
      id="why-us"
      className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-28"
    >
      <div
        aria-hidden
        className="zen-grid-edges pointer-events-none absolute inset-0 overflow-hidden"
      >
        <GridBackdrop />
        <div className="zen-grid zen-grid-edges-soft" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-extrabold leading-[1.08] tracking-tight">
              {whyUs.title}
            </h2>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              {whyUs.subtitle}
            </p>
          </div>
        </Reveal>

        <div className="relative mt-8 lg:mt-12">
          <Reveal>
            <div className="relative mx-auto max-w-4xl">
              <Image
                src="/images/why-laptop.png"
                alt="Custom website design on a laptop"
                width={1100}
                height={760}
                sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 64px), 768px"
                className="mx-auto h-auto w-full max-w-3xl"
              />

              <FeatureCard
                className="absolute top-[8%] right-[2%] hidden max-w-[11.5rem] lg:block"
                tone="lime"
                text={whyUs.features[2]}
              />
              <FeatureCard
                className="absolute top-[22%] right-[18%] hidden max-w-[12rem] lg:block"
                tone="ink"
                text={whyUs.features[1]}
              />
              <FeatureCard
                className="absolute top-[42%] left-0 hidden max-w-[12rem] lg:block"
                tone="lime"
                text={whyUs.features[0]}
              />
              <FeatureCard
                className="absolute bottom-[22%] left-[6%] hidden max-w-[13rem] lg:block"
                tone="ink"
                text={whyUs.features[3]}
              />
            </div>
          </Reveal>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:hidden">
            {whyUs.features.map((feature, i) => (
              <FeatureCard
                key={feature}
                text={feature}
                tone={i % 2 === 0 ? "lime" : "ink"}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function FeatureCard({
  text,
  tone,
  className,
}: {
  text: string;
  tone: "lime" | "ink";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-4 pr-12 shadow-[0_12px_40px_rgba(20,20,20,0.12)]",
        tone === "lime" ? "bg-lime text-ink" : "bg-ink text-white",
        className
      )}
    >
      <p className="text-sm font-extrabold leading-snug">{text}</p>
      <span
        className={cn(
          "absolute right-3 bottom-3 flex size-7 items-center justify-center rounded-md",
          tone === "lime" ? "bg-ink text-white" : "bg-white text-ink"
        )}
      >
        <Check className="size-4" strokeWidth={3} />
      </span>
    </div>
  );
}
