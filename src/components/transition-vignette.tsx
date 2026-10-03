// The original cubic radial attenuation, rasterized once by CSS rather than
// creating a second WebGL context and redrawing a viewport-sized canvas on scroll.
export function TransitionVignette() {
  return <div aria-hidden="true" className="transition-vignette pointer-events-none fixed inset-0 z-30 h-dvh w-full motion-reduce:hidden" data-transition-vignette />;
}
