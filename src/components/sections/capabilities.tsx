import type { CSSProperties } from "react";
import { Plus } from "lucide-react";
import { GridBackdrop, LimeGlow } from "@/components/grid-backdrop";
import { Reveal } from "@/components/reveal";
import { capabilities, smm } from "@/lib/content";

const labels = [...capabilities.items, ...smm.items];
const order = [8, 0, 12, 5, 10, 2, 13, 7, 3, 11, 1, 9, 4, 6];
const rows = Array.from({ length: 5 }, (_, row) => order.filter((_, index) => index % 5 === row).map((index) => labels[index]));
// Art-directed irregular order stays identical in both halves of each loop.
const layouts = [
  [null, 0, 1, null, null, null, 2, null],
  [0, null, null, 1, null, 2, null, null, null],
  [null, null, 0, 1, 2, null, null],
  [0, null, 1, null, null, null, null, 2],
  [null, 0, 1, null, null, null, null],
];

export function Capabilities() {
  return (
    <section id="capabilities" className="relative overflow-hidden bg-background pt-28 pb-20 md:pt-32 md:pb-28">
      <GridBackdrop />
      <LimeGlow className="-right-10 top-0 opacity-40" />
      <LimeGlow className="-bottom-24 left-0 opacity-25" />

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight text-lime-deep dark:text-lime md:text-5xl">
            {capabilities.title}
          </h2>
        </Reveal>
        <ul className="sr-only">
          {labels.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <div className="capability-lanes relative mt-12 flex flex-col gap-4 md:gap-5" aria-hidden="true">
        {rows.map((items, row) => (
          <div key={row} className="capability-track" style={{
            "--lane-duration": `${70 + row * 7}s`,
            "--lane-delay": `${-row * 9 - 6}s`,
          } as CSSProperties}>
            {[0, 1].map((copy) => (
              <div className="capability-group" key={copy}>
                {layouts[row].map((labelIndex, slot) => labelIndex === null ? (
                  <div className="capability-badge capability-empty" key={slot}
                    style={{ width: 110 + (slot * 137 + row * 83) % 260 }} />
                ) : (
                  <div className="capability-badge capability-label" key={slot}>
                    <Plus className="size-5 shrink-0" strokeWidth={2.5} />
                    <span>{items[labelIndex]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
