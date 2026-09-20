import Image from "next/image";
import { contentKit, site } from "@/lib/content";
import { GridBackdrop, LimeGlow } from "@/components/grid-backdrop";
import { Reveal } from "@/components/reveal";

export function ContentKit() {
  return (
    <section className="relative overflow-hidden bg-background pt-28 pb-20 md:pt-32 md:pb-28">
      <GridBackdrop />
      <LimeGlow className="-right-16 top-10 opacity-40" />
      <LimeGlow className="-bottom-20 -left-10 opacity-25" />

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="hidden min-h-[44rem] md:block">
          <div className="relative mx-auto aspect-square max-w-4xl">
            <div className="absolute top-1/2 left-1/2 z-10 flex size-[46%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-lime p-8 text-center">
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink lg:text-4xl">
                {contentKit.title}
              </h2>
            </div>
            {contentKit.items.map((item) => (
              <div key={item.n} className={`absolute ${item.className}`}>
                <span className="mb-1 block text-xs font-bold text-foreground/70">
                  {item.n}
                </span>
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={360}
                  height={360}
                  className="h-auto w-full object-contain drop-shadow-md"
                />
              </div>
            ))}
          </div>
        </div>

        <Reveal className="mt-10 md:hidden">
          <div className="mx-auto mb-8 flex size-56 items-center justify-center rounded-full bg-lime p-6 text-center">
            <h2 className="text-2xl font-extrabold leading-tight text-ink">
              {contentKit.title}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {contentKit.items.map((item) => (
              <figure key={item.n} className="flex flex-col items-center">
                <span className="mb-2 text-xs font-bold">{item.n}</span>
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={280}
                  height={280}
                  className="h-28 w-auto object-contain"
                />
              </figure>
            ))}
          </div>
        </Reveal>

        <p className="mt-8 text-right text-xl font-extrabold">
          {site.urlLabel.replace("www.", "")}
        </p>
      </div>
    </section>
  );
}
