import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";
import { site } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-border bg-background"
    >
      <div className="zen-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-8 px-4 py-12 md:flex-row md:items-end md:justify-between md:px-8 md:py-16">
        <div className="flex flex-col gap-3">
          <Image
            src="/brand/zen-lockup-light.png"
            alt={`${site.name} ${site.tagline}`}
            width={280}
            height={150}
            className="h-auto w-48 dark:hidden"
          />
          <Image
            src="/brand/zen-mark.png"
            alt={`${site.name} ${site.tagline}`}
            width={220}
            height={68}
            className="hidden h-auto w-40 dark:block"
          />
          <p className="max-w-sm text-sm text-muted-foreground">
            {site.tagline}. Strategy, creativity, and growth in one space.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm font-medium">
          <Link
            href={site.url}
            className="inline-flex items-center gap-2 hover:text-foreground"
          >
            <Globe className="size-4" />
            {site.urlLabel}
          </Link>
          <Link href={site.instagramUrl} className="hover:text-foreground">
            {site.instagram}
          </Link>
        </div>
      </div>
    </footer>
  );
}
