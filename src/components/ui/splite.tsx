"use client";

import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

// Triangulated from public/brand/zen-letters.svg.
import robotLogo from "@/lib/robot-logo.json";

import type { Application } from "@splinetool/runtime";

const Spline = lazy(() => import("@splinetool/react-spline"));
// renderMode is documented by Application.requestRender but omitted from its type.
type ManagedApplication = Application & { renderMode: "auto" | "manual" | "continuous" };

class SplineBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

interface SplineSceneProps {
  scene: string;
  className?: string;
  robotPalette?: boolean;
}

export function SplineScene({ scene, className, robotPalette = false }: SplineSceneProps) {
  const appRef = useRef<ManagedApplication | null>(null);
  const syncPlayback = useRef<() => void>(() => {});
  const fitRobotCamera = useRef<() => void>(() => {});
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const handleLoad = useCallback((app: Application) => {
    appRef.current = app as ManagedApplication;
    if (!robotPalette) {
      setReady(true);
      syncPlayback.current();
      return;
    }
    const brandLime = getComputedStyle(root.current ?? document.documentElement).getPropertyValue("--lime").trim();
    // Jump directly to the camera's authored wide state.
    const camera = app.findObjectByName("Camera 2");
    if (camera) camera.state = "State";
    fitRobotCamera.current();
    const body = app.findObjectByName("Body");
    if (body && !app.findObjectByName("ZEN chest logo")) {
      void app.createObject("CustomMesh", {
        name: "ZEN chest logo",
        parent: body,
        position: [0, 220, 57],
        vertices: robotLogo.vertices,
        indices: robotLogo.indices,
        material: { color: brandLime, roughness: 0.65, metalness: 0.2 },
      }).then((logo) => {
        // Keep the brand color bright instead of darkening it with scene lighting.
        const material = logo.material as { layers?: { type: string; alpha: number }[] };
        for (const layer of material.layers ?? []) {
          if (layer.type === "light") layer.alpha = 0;
        }
      });
    }
    // Palette applies only to the original robot meshes.
    for (const object of app.getAllObjects()) {
      if (!object.material || object.name === "ZEN chest logo") continue;
      const material = object.material as { layers?: { type: string; color?: string; alpha: number; mode?: number; crop?: boolean }[] };
      const face = object.name === "Head 2";
      for (const layer of material.layers ?? []) {
        if (layer.type === "color") {
          layer.color = face ? brandLime : "#d3d3d3";
          layer.alpha = 1;
        }
        // Multiply the monochrome eye animation by the lime base color.
        if (face && layer.type === "video") {
          layer.mode = 1;
          layer.crop = false;
        }
        if (face && layer.type === "light") layer.alpha = 0.25;
        if (face && layer.type === "rainbow") layer.alpha = 0;
      }
    }
    app.requestRender();
    setReady(true);
    syncPlayback.current();
  }, [robotPalette]);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;
    let scrolling = false;
    let timer: ReturnType<typeof setTimeout>;
    let renderFrame = 0;
    let lastRender = 0;
    let cameraZ = 0;
    const fit = () => {
      if (!robotPalette || !appRef.current) return;
      const camera = appRef.current.findObjectByName("Camera 2");
      if (!camera) return;
      // The authored upper-body framing is calibrated to the 583 x 541 poster.
      // Dolly back on smaller containers instead of cropping the head and hands.
      const scale = Math.max(1, 583 / Math.max(element.clientWidth, 1), 541 / Math.max(element.clientHeight, 1));
      const nextZ = 1000 + 650 * (scale - 1);
      if (cameraZ === nextZ) return;
      camera.position.z = nextZ;
      cameraZ = nextZ;
      appRef.current.requestRender();
    };
    fitRobotCamera.current = fit;
    const sizes = new ResizeObserver(fit);
    sizes.observe(element);
    const requestMobileFrame = (now: number) => {
      if (now - lastRender >= 1000 / 30 - .5) {
        appRef.current?.requestRender();
        lastRender = now;
      }
      renderFrame = requestAnimationFrame(requestMobileFrame);
    };
    const update = () => {
      const active = visible && !scrolling && !document.hidden && !preference.matches && !connection?.saveData;
      const app = appRef.current;
      if (app) app.renderMode = coarse.matches ? "manual" : "auto";
      if (active) {
        setMounted(true);
        if (app?.isStopped) app.play();
        if (app && coarse.matches && !renderFrame) {
          lastRender = performance.now();
          app.requestRender();
          renderFrame = requestAnimationFrame(requestMobileFrame);
        }
      } else if (app && !app.isStopped) app.stop();
      if (!active || !coarse.matches) { cancelAnimationFrame(renderFrame); renderFrame = 0; }
      const state = active ? app ? "running" : "loading" : "paused";
      if (element.dataset.state !== state) element.dataset.state = state;
    };
    syncPlayback.current = update;
    const settle = () => {
      clearTimeout(timer);
      scrolling = true;
      if (!visible) return;
      update();
      // Keep module evaluation and GPU scene initialization outside active scroll.
      timer = setTimeout(() => { scrolling = false; update(); }, 180);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) settle(); else update();
    }, { threshold: .05 });
    observer.observe(element);
    // Prepare the scene while the preceding sections are on screen.
    // Playback still uses the actual visibility observer above.
    const preload = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || preference.matches || connection?.saveData) return;
      setMounted(true);
      preload.disconnect();
    }, { rootMargin: "200% 0px" });
    preload.observe(element.closest("section") ?? element);
    window.addEventListener("scroll", settle, { passive: true });
    document.addEventListener("visibilitychange", update);
    preference.addEventListener("change", update);
    coarse.addEventListener("change", update);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(renderFrame);
      observer.disconnect();
      preload.disconnect();
      sizes.disconnect();
      window.removeEventListener("scroll", settle);
      document.removeEventListener("visibilitychange", update);
      preference.removeEventListener("change", update);
      coarse.removeEventListener("change", update);
      syncPlayback.current = () => {};
      fitRobotCamera.current = () => {};
      appRef.current = null;
    };
  }, [robotPalette]);

  return (
    <div ref={root} className={`relative ${className ?? ""}`} data-spline-scene>
    {robotPalette && <div aria-hidden="true" className={`pointer-events-none absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none ${ready ? "opacity-0" : "opacity-100"}`}>
      <Image src="/images/zen/robot-poster.png" alt="" fill loading="eager" sizes="(min-width: 640px) 50vw, 100vw" className="hidden object-cover sm:block" />
      <Image src="/images/zen/robot-mobile-poster.png" alt="" fill loading="eager" sizes="(min-width: 640px) 1px, 100vw" className="object-cover sm:hidden" />
    </div>}
    <Suspense
      fallback={
        robotPalette ? null : <div className="flex h-full w-full items-center justify-center" role="status">
          <span className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-lime motion-reduce:animate-none" />
          <span className="sr-only">Loading interactive scene</span>
        </div>
      }
    >
      {mounted && <SplineBoundary><Spline scene={scene} className="h-full w-full" onLoad={handleLoad} /></SplineBoundary>}
    </Suspense>
    </div>
  );
}
