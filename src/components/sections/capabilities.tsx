import type { CSSProperties } from "react";
import { Plus } from "lucide-react";
import { capabilities, smm } from "@/lib/content";
import { CapabilityMotion } from "@/components/capability-motion";

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
    <div id="capabilities" role="group" aria-label="Our capabilities" className="relative overflow-hidden bg-black pt-4 pb-16 md:pt-6 md:pb-24">
      <ul className="sr-only">
        {labels.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <CapabilityMotion>
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
      </CapabilityMotion>
    </div>
  );
}
