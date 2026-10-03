import { ArrowUpRight, Check } from "lucide-react";
import { ai } from "@/lib/content";
import { SplineScene } from "@/components/ui/splite";

export function AiChatbots() {
  return (
    <section id="ai-chatbots" aria-labelledby="ai-heading" className="overflow-hidden bg-background px-5 pt-16 sm:px-8 sm:pt-20 lg:px-14 lg:pt-24">
      <div className="mx-auto max-w-[1288px]">
        <div className="relative z-10">
          <h2 id="ai-heading" className="max-w-[19ch] text-[clamp(2.25rem,6.4vw,6.75rem)] leading-[1.04] font-semibold tracking-[-0.055em]">
            <span className="text-lime">{ai.kicker}</span>{" "}{ai.title}
          </h2>
          <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
            Better conversations. Less busywork. Connect your business with customers, around the clock.
          </p>
        </div>

        <div className="grid items-center gap-x-6 md:grid-cols-[1fr_1.1fr] lg:gap-x-10">
          <div className="relative z-10 pt-8 pb-4 md:py-10 lg:py-16">
            <ul className="space-y-5">
              {[...new Set(ai.cards)].map((card) => (
                <li key={card} className="flex items-start gap-3 text-base leading-relaxed lg:text-xl">
                  <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-lime" />
                  {card}
                </li>
              ))}
            </ul>
            <a href="#contact" className="mt-9 inline-flex min-h-12 items-center gap-10 rounded-full bg-lime px-7 text-sm font-semibold text-ink transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
              Let’s talk AI <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </div>
          <div className="relative h-[clamp(20rem,85vw,26rem)] min-w-0 md:h-[26rem] lg:h-[34rem]" role="group" aria-label="Interactive 3D robot">
            <SplineScene robotPalette scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="h-full w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
