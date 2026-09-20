"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

type TextOpacityEnum = "none" | "soft" | "medium";
type ViewTypeEnum = "word" | "letter";
type TextGradientScrollType = {
  text: string;
  type?: ViewTypeEnum;
  className?: string;
  textOpacity?: TextOpacityEnum;
};
type SegmentProps = { children: ReactNode; progress: MotionValue<number>; range: [number, number] };
const TextGradientScrollContext = createContext<TextOpacityEnum>("soft");

export function TextGradientScroll({ text, className, type = "letter", textOpacity = "soft" }: TextGradientScrollType) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const words = text.trim().split(/\s+/);
  return <TextGradientScrollContext.Provider value={textOpacity}>
    <p ref={ref} className={cn("text-gradient-scroll relative m-0", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {reduced ? text : words.map((word, index) => {
          const range: [number, number] = [index / words.length, (index + 1) / words.length];
          return <span key={index}>
            <span className="inline-block">
              {type === "word" ? <Segment progress={scrollYProgress} range={range}>{word}</Segment> :
                Array.from(word).map((char, i, chars) => <Segment key={i} progress={scrollYProgress}
                  range={[range[0] + i / chars.length / words.length, range[0] + (i + 1) / chars.length / words.length]}>{char}</Segment>)}
            </span>{index < words.length - 1 ? " " : ""}
          </span>;
        })}
      </span>
    </p>
  </TextGradientScrollContext.Provider>;
}

function Segment({ children, progress, range }: SegmentProps) {
  const textOpacity = useContext(TextGradientScrollContext);
  const opacity = useTransform(progress, range, [0, 1]);
  return <span className="relative inline-grid">
    <span className={cn("[grid-area:1/1]", { "opacity-0": textOpacity === "none", "opacity-10": textOpacity === "soft", "opacity-30": textOpacity === "medium" })}>{children}</span>
    <motion.span className="text-gradient-foreground [grid-area:1/1]" style={{ opacity }}>{children}</motion.span>
  </span>;
}
