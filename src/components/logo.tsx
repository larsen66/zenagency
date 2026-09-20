import Image from "next/image";
import { site } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col gap-1", className)}>
      <Image
        src="/brand/zen-mark.png"
        alt={site.name}
        width={220}
        height={68}
        className={cn("h-8 w-auto md:h-9", markClassName)}
        priority
      />
      {showWordmark ? (
        <span className="max-w-[11rem] text-[10px] leading-tight font-semibold tracking-wide text-foreground uppercase">
          {site.tagline}
        </span>
      ) : null}
    </span>
  );
}
