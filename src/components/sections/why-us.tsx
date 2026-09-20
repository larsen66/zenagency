import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GridBackdrop } from "@/components/grid-backdrop";
import { Reveal } from "@/components/reveal";
import { whyUs } from "@/lib/content";
import { cn } from "@/lib/utils";

export function WhyUs() {
  return (
    <section
      id="why-us"
      className="relative overflow-hidden bg-background pt-28 pb-20 md:pt-32 md:pb-28"
    >
      <GridBackdrop />

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              {whyUs.title}
            </h2>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              {whyUs.subtitle}
            </p>
          </div>
        </Reveal>

        <div className="relative mt-12">
          <Reveal>
            <div className="relative mx-auto max-w-4xl">
              <Image
                src="/images/why-laptop.png"
                alt="Custom website design on a laptop"
                width={1100}
                height={760}
                className="mx-auto h-auto w-full max-w-3xl"
              />

              <FeatureCard
                className="absolute top-[8%] right-[2%] hidden max-w-[11.5rem] sm:block"
                tone="lime"
                text={whyUs.features[2]}
              />
              <FeatureCard
                className="absolute top-[22%] right-[18%] hidden max-w-[12rem] md:block"
                tone="ink"
                text={whyUs.features[1]}
              />
              <FeatureCard
                className="absolute top-[42%] left-0 hidden max-w-[12rem] md:block"
                tone="lime"
                text={whyUs.features[0]}
              />
              <FeatureCard
                className="absolute bottom-[22%] left-[6%] hidden max-w-[13rem] md:block"
                tone="ink"
                text={whyUs.features[3]}
              />
            </div>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:hidden">
            {whyUs.features.map((feature, i) => (
              <FeatureCard
                key={feature}
                text={feature}
                tone={i % 2 === 0 ? "lime" : "ink"}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          {whyUs.pills.map((pill) => (
            <span
              key={pill}
              className="rounded-full border-2 border-lime bg-lime/20 px-4 py-2 text-sm font-semibold text-foreground"
            >
              {pill}
            </span>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <Button
            asChild
            className="rounded-full bg-transparent px-0 text-lg font-extrabold text-foreground shadow-none hover:bg-transparent hover:underline"
          >
            <Link href="#contact">{whyUs.cta}</Link>
          </Button>
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
