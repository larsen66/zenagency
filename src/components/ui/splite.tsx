"use client";

import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { animate } from "motion";

// ZEN projected onto the robot chest with a 0.25-unit surface offset.
import robotDecal from "@/lib/robot-decal.json";

import type { Application } from "@splinetool/runtime";

const Spline = lazy(() => import("@splinetool/react-spline"));
// renderMode is documented by Application.requestRender but omitted from its type.
type ManagedApplication = Application & { renderMode: "auto" | "manual" | "continuous"; disposed?: boolean };

// Disable only the authored camera entrance; keep body and pointer events intact.
function disableCameraEntrance(app: Application) {
  const camera = app.findObjectByName("Camera 2");
  if (!camera) return;
  const data = app.data.scene.objects.get(camera.uuid)?.data as {
    events?: { data: { type: string; disabled: boolean } }[];
  } | undefined;
  for (const event of data?.events ?? []) {
    if (event.data.type === "Start") event.data.disabled = true;
  }
  // The load callback runs after Start actions are connected. Stop the current
  // camera action as well as disabling its future activation on scroll re-entry.
  const starts = app.eventManager?.handlers?.Start as {
    eventsPerObject?: Map<{ uuid: string }, { disconnect(): void }[]>;
  } | undefined;
  for (const [object, events] of starts?.eventsPerObject ?? []) {
    if (object.uuid !== camera.uuid) continue;
    for (const event of events) event.disconnect();
    starts?.eventsPerObject?.delete(object);
  }
}

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
  const prepared = useRef(false);
  const syncPlayback = useRef<() => void>(() => {});
  const fitRobotCamera = useRef<() => void>(() => {});
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const handleLoad = useCallback(async (app: Application) => {
    if ((app as ManagedApplication).disposed) return;
    appRef.current = app as ManagedApplication;
    if (!robotPalette) {
      setReady(true);
      syncPlayback.current();
      return;
    }
    const brandLime = getComputedStyle(root.current ?? document.documentElement).getPropertyValue("--lime").trim();
    disableCameraEntrance(app);
    fitRobotCamera.current();
    const body = app.findObjectByName("Body");
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
    if (body && !app.findObjectByName("ZEN chest logo")) {
      const logo = await app.createObject("CustomMesh", {
        name: "ZEN chest logo",
        parent: body,
        position: [0, 220, 0],
        vertices: robotDecal.vertices,
        normals: robotDecal.normals,
        castShadow: false,
        material: { color: brandLime, roughness: .9, metalness: 0 },
      });
      const material = logo.material as { alpha: number; layers: { type: string; alpha: number }[] };
      material.alpha = .62;
      for (const layer of material.layers) {
        if (layer.type === "light") layer.alpha = .35;
      }
    }
    if (appRef.current !== app || (app as ManagedApplication).disposed) return;
    prepared.current = true;
    app.requestRender();
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
    let revealFrame = 0;
    let revealed = false;
    let lastRender = 0;
    const fit = () => {
      if (!robotPalette || !appRef.current) return;
      const camera = appRef.current.findObjectByName("Camera 2");
      if (!camera) return;
      appRef.current.setSize(element.clientWidth, element.clientHeight);
      camera.state = "State";
      const mobile = element.clientWidth < 768;
      const aspect = element.clientWidth / Math.max(element.clientHeight, 1);
      // Keep the original screen size while the shorter section crops the lower body.
      const distance = mobile
        ? element.clientHeight * 1000 / 448
        : Math.max(element.clientHeight * 1000 / 864, element.clientHeight * 1440000 / (864 * element.clientWidth));
      // The canvas spans the section, behind the copy. Offset the fixed camera
      // to frame the robot on the right while leaving both arms inside the canvas.
      const viewWidth = aspect * distance * Math.tan(Math.PI / 8);
      camera.position.x = mobile ? 0 : -viewWidth * .16;
      camera.position.y = 200;
      camera.position.z = distance;
      camera.rotation.x = 0;
      camera.rotation.y = 0;
      camera.rotation.z = 0;
      appRef.current.requestRender();
    };
    fitRobotCamera.current = fit;
    const section = element.closest("section") ?? element;
    const hoverPointer = matchMedia("(hover: hover) and (pointer: fine)");
    let hovered = false;
    let hoverAnimation: ReturnType<typeof animate> | undefined;
    const turnRobot = (next: boolean) => {
      if (!robotPalette || hovered === next) return;
      const bot = appRef.current?.findObjectByName("Bot");
      if (!bot) return;
      hovered = next;
      hoverAnimation?.stop();
      hoverAnimation = animate(bot.rotation.y, next ? .16 : 0, {
        type: "spring", duration: .5, bounce: .2,
        onUpdate: (angle) => {
          bot.rotation.y = angle;
          appRef.current?.requestRender();
        },
      });
    };
    const hoverRobot = (event: PointerEvent) => {
      if (preference.matches || !hoverPointer.matches) return;
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      turnRobot(x > .5 && x < .95 && y > .15 && y < .95);
    };
    const leaveRobot = () => turnRobot(false);
    section.addEventListener("pointermove", hoverRobot);
    section.addEventListener("pointerleave", leaveRobot);
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
        if (app?.isStopped) {
          app.play();
          if (robotPalette) fit();
        }
        if (app && coarse.matches && !renderFrame) {
          lastRender = performance.now();
          app.requestRender();
          renderFrame = requestAnimationFrame(requestMobileFrame);
        }
        if (app && robotPalette && prepared.current && !revealed && !revealFrame) {
          // Keep the poster until the visible scene has submitted its first frame.
          revealFrame = requestAnimationFrame(() => {
            app.requestRender();
            revealFrame = requestAnimationFrame(() => {
              revealFrame = 0;
              revealed = true;
              setReady(true);
            });
          });
        }
      } else if (app && !app.isStopped) app.stop();
      if (!active) { cancelAnimationFrame(revealFrame); revealFrame = 0; }
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
      if (!robotPalette || !entry.isIntersecting || preference.matches || connection?.saveData) return;
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
      cancelAnimationFrame(revealFrame);
      observer.disconnect();
      preload.disconnect();
      sizes.disconnect();
      hoverAnimation?.stop();
      section.removeEventListener("pointermove", hoverRobot);
      section.removeEventListener("pointerleave", leaveRobot);
      window.removeEventListener("scroll", settle);
      document.removeEventListener("visibilitychange", update);
      preference.removeEventListener("change", update);
      coarse.removeEventListener("change", update);
      syncPlayback.current = () => {};
      fitRobotCamera.current = () => {};
      appRef.current = null;
      prepared.current = false;
    };
  }, [robotPalette]);

  return (
    <div ref={root} className={`relative ${className ?? ""}`} data-spline-scene>
    {robotPalette && <div aria-hidden="true" className={`pointer-events-none absolute inset-0 z-10 ${ready ? "opacity-0" : "opacity-100"}`}>
      <Image src="/images/zen/robot-portrait-poster.png" alt="" fill loading="eager" sizes="(min-width: 640px) 50vw, 100vw" className="hidden object-cover sm:block" />
      <Image src="/images/zen/robot-portrait-mobile-poster.png" alt="" fill loading="eager" sizes="(min-width: 640px) 1px, 100vw" className="object-cover sm:hidden" />
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
