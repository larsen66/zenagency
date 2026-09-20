import Image from "next/image";
import { smm, site } from "@/lib/content";
import { Reveal } from "@/components/reveal";

export function Smm() {
  return (
    <section className="relative isolate overflow-hidden bg-ink pt-28 pb-24 text-white md:pt-32 md:pb-32">
      <Image
        src="/images/bg/chandelier-up.jpg"
        alt=""
        fill
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-ink/58" />
      <div className="zen-grid-dark pointer-events-none absolute inset-0 opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-0 size-[22rem] rounded-full bg-[radial-gradient(circle,var(--lime)_0%,transparent_70%)] opacity-40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-10 size-[18rem] rounded-full bg-[radial-gradient(circle,var(--lime)_0%,transparent_70%)] opacity-25 blur-3xl"
      />

      <Reveal className="relative z-10 mx-auto max-w-[1400px] px-4 md:px-8">
        <Image
          src="/brand/zen-mark.png"
          alt={site.name}
          width={180}
          height={56}
          className="h-10 w-auto"
        />
        <p className="mt-10 text-4xl font-extrabold tracking-tight text-lime md:text-6xl">
          {smm.kicker}
        </p>
        <h2 className="mt-2 max-w-lg text-3xl font-extrabold tracking-tight text-lime md:text-5xl">
          {smm.title}
        </h2>
        <ul className="mt-10 max-w-xl space-y-3 text-base md:text-lg">
          {smm.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-white" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
