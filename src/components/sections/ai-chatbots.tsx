import { Check } from "lucide-react";
import { ai } from "@/lib/content";
import { SplineScene } from "@/components/ui/splite";
import styles from "./ai-chatbots.module.css";

export function AiChatbots() {
  return (
    <section id="ai-chatbots" aria-labelledby="ai-heading" className={`section-spacing overflow-hidden bg-background ${styles.section}`}>
      <div className={styles.robot} role="group" aria-label="Interactive 3D robot">
        <SplineScene robotPalette scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="h-full w-full" />
      </div>
      <div className="section-container relative grid items-start gap-6 md:grid-cols-[1.05fr_1fr] md:gap-8 lg:gap-16">
        <div className="relative z-10 min-w-0">
          <h2 id="ai-heading" className="section-title max-w-[12ch]">
            {ai.kicker} {ai.title}
          </h2>
          <p className="section-description">
            Better conversations. Less busywork. Connect your business with customers, around the clock.
          </p>
          <ul className="mt-8 space-y-4 lg:mt-10">
            {[...new Set(ai.cards)].map((card) => (
              <li key={card} className="section-body flex items-start gap-3">
                <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-lime" />
                {card}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.space} aria-hidden="true" />
      </div>
    </section>
  );
}
