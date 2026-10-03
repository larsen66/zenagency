import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";
import { site } from "@/lib/content";
import styles from "@/components/footer-surfaces.module.css";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-border bg-background"
    >
      <div aria-hidden className={`zen-grid pointer-events-none absolute inset-0 opacity-50 ${styles.grid}`} />
      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-7 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-14 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <Image
            src="/brand/zen-lockup-light.png"
            alt={`${site.name} ${site.tagline}`}
            width={280}
            height={150}
            className="h-auto w-36 shrink-0 dark:hidden"
          />
          <Image
            src="/brand/zen-mark.png"
            alt={`${site.name} ${site.tagline}`}
            width={220}
            height={68}
            className="hidden h-auto w-28 shrink-0 dark:block"
          />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {site.tagline}. Strategy, creativity, and growth in one space.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-1 text-sm font-medium sm:flex-row sm:gap-6 lg:flex-col lg:gap-1">
          <Link
            href={site.url}
            className="inline-flex min-h-11 items-center gap-2 hover:text-foreground"
          >
            <Globe className="size-4" />
            {site.urlLabel}
          </Link>
          <Link href={site.instagramUrl} className="inline-flex min-h-11 items-center hover:text-foreground">
            {site.instagram}
          </Link>
        </div>
      </div>
    </footer>
  );
}
