import { fullCycle, site } from "@/lib/content";
import { GridBackdrop } from "@/components/grid-backdrop";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

const layout = [
  { tab: "left-[10%] md:left-[14%]", shift: "md:ml-0", clip: true },
  { tab: "left-[46%] md:left-[52%]", shift: "md:ml-[7%]", clip: false },
  { tab: "left-[14%] md:left-[18%]", shift: "md:ml-[3%]", clip: true },
  { tab: "left-[40%] md:left-[46%]", shift: "md:ml-[9%]", clip: false },
];

export function FullCycle() {
  return (
    <section className="relative overflow-hidden bg-background pt-28 pb-20 md:pt-32 md:pb-28">
      <GridBackdrop />
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <h2 className="max-w-xl text-4xl font-extrabold tracking-tight md:text-5xl">
            {fullCycle.title}
          </h2>
        </Reveal>

        <Reveal className="relative mt-16" delay={0.08}>
          <div className="flex flex-col">
            {fullCycle.folders.map((folder, i) => {
              const meta = layout[i];
              const isLast = i === fullCycle.folders.length - 1;
              const lime = folder.tone === "lime";
              return (
                <div
                  key={folder.label}
                  className={cn("relative -mt-6 first:mt-10", meta.shift)}
                  style={{ zIndex: i + 1 }}
                >
                  <div
                    className={cn(
                      "absolute -top-9 flex h-10 items-center rounded-t-2xl px-5 text-sm font-extrabold md:h-11 md:px-6 md:text-lg",
                      meta.tab,
                      lime ? "bg-lime text-ink" : "bg-ink text-white"
                    )}
                  >
                    {folder.label}
                  </div>
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-2xl px-8 pt-10 md:px-12",
                      isLast ? "pb-16 md:pb-20" : "pb-14 md:pb-16",
                      lime ? "bg-lime text-ink" : "bg-ink text-white"
                    )}
                  >
                    {meta.clip ? <Paperclip className="absolute left-8 top-3" /> : null}
                    {isLast ? (
                      <div className="mt-6 max-w-sm">
                        <p className="text-lg font-semibold md:text-xl">
                          {fullCycle.cta}
                        </p>
                        <p className="mt-4 text-2xl font-extrabold md:text-3xl">
                          {site.urlLabel.replace("www.", "")}
                        </p>
                      </div>
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Paperclip({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 52"
      className={cn("h-14 w-6 rotate-[-18deg] text-white/80", className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M8 22V12.5a4 4 0 1 1 8 0V32a6 6 0 1 1-12 0V18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
