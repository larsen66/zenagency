import Image from "next/image";
import { cta } from "@/lib/content";
import { GridBackdrop, LimeGlow } from "@/components/grid-backdrop";
import { Reveal } from "@/components/reveal";
import { Logo } from "@/components/logo";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-background pt-28 md:pt-32">
      <GridBackdrop />
      <LimeGlow className="right-[-8%] bottom-[-18%] opacity-55" />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] bottom-[-35%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--lime)_55%,transparent),transparent_68%)]"
      />

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <Logo />
          <h2 className="mt-8 max-w-3xl text-3xl font-extrabold tracking-tight md:text-5xl">
            {cta.title}
          </h2>
        </Reveal>
      </div>

      <div className="relative mx-auto mt-6 min-h-[20rem] max-w-[1400px] md:min-h-[28rem]">
        <Image
          src="/images/cta-chair.png"
          alt="Person working from a chair with a laptop"
          width={720}
          height={760}
          className="absolute bottom-0 left-0 h-[88%] w-auto max-w-[min(92vw,34rem)] object-contain object-left-bottom"
        />
        <p className="absolute bottom-[24%] left-[30%] max-w-[16rem] -rotate-2 bg-lime px-5 py-3 text-base font-extrabold text-ink sm:left-[38%] sm:max-w-md sm:text-lg md:bottom-[28%] md:left-[40%] md:text-2xl">
          {cta.highlight}
        </p>
      </div>
    </section>
  );
}
