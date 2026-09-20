import Image from "next/image";
import { Cloud, Globe, Lock, ShoppingCart, Wifi } from "lucide-react";
import { ai } from "@/lib/content";
import { GridBackdrop } from "@/components/grid-backdrop";
import { Reveal } from "@/components/reveal";

export function AiChatbots() {
  return (
    <section className="relative overflow-hidden bg-background pt-28 md:pt-32">
      <GridBackdrop />
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <p className="text-5xl font-extrabold tracking-tight text-lime md:text-7xl">
            {ai.kicker}
          </p>
          <h2 className="mt-2 max-w-xl text-4xl font-extrabold tracking-tight md:text-6xl">
            {ai.title}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
          {ai.cards.map((card, i) => (
            <Reveal key={`${card}-${i}`} delay={i * 0.04}>
              <div className="rounded-2xl border-2 border-lime px-5 py-6 text-lg font-extrabold leading-snug md:text-xl">
                {card}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="relative mt-4 h-[22rem] sm:h-[28rem] md:h-[34rem]">
          <HudLeft />
          <HudRight />
          <Image
            src="/images/ai-robot.png"
            alt="Humanoid robot reaching toward an interface"
            width={900}
            height={1100}
            className="absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/2 object-contain"
          />
          <p className="absolute right-0 bottom-3 hidden items-center gap-2 text-sm font-semibold tracking-wide md:flex">
            <span aria-hidden className="text-xl">
              ↓
            </span>
            ZENAGENCY GEORGIA
          </p>
        </div>
        <p className="pb-6 text-right text-sm font-semibold tracking-wide md:hidden">
          ↓ ZENAGENCY GEORGIA
        </p>
      </div>
    </section>
  );
}

function HudLeft() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-[42%] left-[2%] hidden w-44 text-foreground/45 md:block lg:left-[8%]"
    >
      <div className="relative mx-auto size-36 rounded-full border border-current">
        <Cloud className="absolute -top-3 left-1/2 size-6 -translate-x-1/2" />
        <Globe className="absolute top-1/2 -left-3 size-6 -translate-y-1/2" />
        <Wifi className="absolute top-6 left-6 size-5" />
        <Lock className="absolute top-1/2 left-1/2 size-7 -translate-x-1/2 -translate-y-1/2" />
        <ShoppingCart className="absolute top-1/2 -right-3 size-6 -translate-y-1/2" />
      </div>
    </div>
  );
}

function HudRight() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-[4%] bottom-[44%] hidden w-44 md:block lg:right-[10%]"
    >
      <div className="flex h-14 items-end gap-1">
        {[40, 70, 55, 95, 60, 80, 45].map((h, i) => (
          <span
            key={i}
            className="w-3 rounded-sm bg-red-500/80"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-2 h-px w-full bg-red-500/70" />
    </div>
  );
}
