import { site } from "@/lib/content";
import { ZenMark3D } from "@/components/zen-mark-3d";

export function BrandMark() {
  return (
    <section
      id="mark"
      className="relative isolate min-h-[85dvh] overflow-hidden bg-ink text-white"
    >
      <div className="relative z-10 mx-auto flex min-h-[85dvh] max-w-[1400px] flex-col items-center justify-center px-4 py-20 text-center">
        <ZenMark3D className="w-full max-w-[1100px]" />
        <p className="mt-8 text-lg font-semibold tracking-[0.18em] text-white uppercase md:text-2xl">
          {site.tagline}
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-6 z-10 flex justify-between px-6 text-sm text-lime md:px-12">
        <span>{site.urlLabel}</span>
        <span>{site.instagram}</span>
      </div>
    </section>
  );
}
