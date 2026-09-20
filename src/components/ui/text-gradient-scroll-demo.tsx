import { TextGradientScroll } from "@/components/ui/text-gradient-scroll";

export function TextGradientScrollExample() {
  return <div className="relative min-h-[200vh] bg-black px-6 py-[70vh] text-white">
    <TextGradientScroll className="mx-auto max-w-5xl text-3xl leading-tight md:text-6xl" text="The text gradient scroll component is designed to enhance user interaction by providing a visually dynamic effect as the user scrolls through the text. Unlike static text, this effect offers a more engaging visual experience with smooth color transitions that change as the text is scrolled." />
  </div>;
}
