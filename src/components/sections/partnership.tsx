import Image from "next/image";
import { partnership, site } from "@/lib/content";
import { Reveal } from "@/components/reveal";

export function Partnership() {
  return (
    <section
      id="work"
      className="relative isolate min-h-[80dvh] overflow-hidden bg-ink pt-28 pb-24 text-white md:pt-32"
    >
      <Image
        src="/images/bg/palace-dome.jpg"
        alt=""
        fill
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-ink/45" />

      <Reveal className="relative z-10 mx-auto flex min-h-[60dvh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-6 rounded-3xl bg-ink/55 px-8 py-6 backdrop-blur-sm md:gap-10">
          <Image
            src="/images/gallery-palace-logo.png"
            alt={partnership.partner}
            width={220}
            height={280}
            className="h-32 w-auto object-contain md:h-40"
          />
          <span className="hidden h-16 w-px bg-white/70 md:block" />
          <Image
            src="/brand/zen-mark.png"
            alt={site.name}
            width={220}
            height={68}
            className="h-12 w-auto md:h-14"
          />
        </div>
        <p className="mt-10 max-w-xl text-2xl font-medium leading-snug md:text-3xl">
          {partnership.text}
        </p>
      </Reveal>
    </section>
  );
}
