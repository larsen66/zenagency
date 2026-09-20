"use client";

import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { ScrambleText } from "@/components/ui/motion-scramble-text";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { nav } from "@/lib/content";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="zen-header fixed top-0 z-40 w-full">
      <div className="zen-header-inner">
        <Link href="#top" className="flex shrink-0 items-center gap-3" aria-label="ZEN home">
          <Logo showWordmark={false} markClassName="h-6 md:h-8" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-base text-white/90 transition-colors hover:text-[#d5ff51]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            asChild
            className="header-talk hidden lg:inline-flex"
          >
            <Link href="#contact"><ScrambleText text="LET’S TALK" trigger="hover" /> <ArrowUpRight className="ml-4 size-5" /></Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                className="rounded-full lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <Logo />
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4 px-4">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-semibold"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button asChild className="mt-4 rounded-full bg-lime text-ink hover:bg-lime/90">
                  <Link href="#contact" onClick={() => setOpen(false)}>
                    <ScrambleText text="Let’s talk" trigger="hover" />
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
