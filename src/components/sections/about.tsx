import { about } from "@/lib/content";
import { TextGradientScroll } from "@/components/ui/text-gradient-scroll";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative isolate flex min-h-[110svh] items-center bg-black px-6 pt-16 pb-48 text-[#e1e3dc] md:px-14 md:pt-24 md:pb-72">
      <div data-about-content className="mx-auto w-full max-w-[1280px] translate-y-[calc(20%_-_15svh)]">
        <h2 id="about-title" className="mb-12 text-xs font-medium uppercase tracking-[.24em] text-[#c8df8b] md:mb-16">01 / {about.title}</h2>
        <TextGradientScroll
          text={`${about.highlight} ${about.body}`}
          type="letter"
          textOpacity="medium"
          className="max-w-[24ch] text-[clamp(2rem,4.8vw,5rem)] font-medium leading-[1.16] tracking-[-.035em]"
        />
      </div>
    </section>
  );
}
