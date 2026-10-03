import Image from "next/image";
import { cta } from "@/lib/content";
import { GridBackdrop, LimeGlow } from "@/components/grid-backdrop";
import { Reveal } from "@/components/reveal";
import styles from "@/components/footer-surfaces.module.css";

export function CtaBand() {
  return (
    <section aria-labelledby="growth-title" className="relative overflow-hidden bg-background pt-8 sm:pt-12 lg:pt-16">
      <GridBackdrop className={styles.grid} />
      <LimeGlow className="right-[-8%] bottom-[-18%] opacity-55" />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] bottom-[-35%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--lime)_55%,transparent),transparent_68%)]"
      />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-6 px-5 sm:px-8 md:grid-cols-[1fr_1.15fr] md:gap-8 lg:gap-12 lg:px-14">
        <Reveal className="relative z-10 pb-4 md:order-2 md:pb-12">
          <h2 id="growth-title" className="max-w-2xl text-[clamp(1.875rem,3.4vw,3rem)] font-extrabold leading-[1.08] tracking-tight">
            {cta.title}
          </h2>
          <p className="mt-6 inline-block max-w-full bg-lime px-4 py-3 text-base font-extrabold text-ink sm:-rotate-2 lg:mt-9 lg:px-5 lg:text-xl">
            {cta.highlight}
          </p>
        </Reveal>
        <div className="relative h-64 sm:h-80 md:order-1 lg:h-[25rem]">
          <Image
            src="/images/cta-chair.png"
            alt="Person working from a chair with a laptop"
            fill
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1399px) 42vw, 550px"
            className="object-contain object-bottom md:object-left-bottom"
          />
        </div>
      </div>
    </section>
  );
}
