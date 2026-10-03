"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createHeroMetalScene } from "./hero-metal-scene";
import { createHeroMetalMotion, HERO_ENTRY_DURATION } from "./hero-metal-motion";
import { SHUTTER_SCRUB_MS } from "./scroll-shutters";
import styles from "./hero-background.module.css";

const MAX_PIXELS = 1600 * 900;
const FRAME_INTERVAL = 1000 / 30;

export function HeroBackground({ speed = 0.18 }: { speed?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const track = root.closest<HTMLElement>(".hero-scroll-track");
    const hero = root.closest<HTMLElement>(".zen-hero");
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
    } catch {
      root.dataset.state = "fallback";
      if (hero) hero.dataset.heroIntro = "complete";
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(1);
    const metal = createHeroMetalScene();
    const metalMotion = createHeroMetalMotion(metal);
    const mark = hero?.querySelector<HTMLElement>(".hero-mark");
    const button = hero?.querySelector<HTMLElement>(".hero-button-primary");
    const main = hero?.querySelector<HTMLElement>(".hero-main");
    const composition = new THREE.Vector4();
    const cta = new THREE.Vector4();
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const playbackSpeed = Number.isFinite(speed) ? THREE.MathUtils.clamp(speed, 0, 0.5) : 0.18;
    let frame = 0;
    let previousTime = 0;
    let visible = false;
    let lost = false;
    let failed = false;
    let entryTime = 0;
    let motionTime = 0;
    let scrollTarget = 0;
    let scrollProgress = 0;
    let trackTop = 0;
    let heroHeight = 1;
    let heroWidth = 1;
    let heroLeft = 0;
    let lastTelemetry = -Infinity;
    const pointer = new THREE.Vector3();
    const pointerTarget = new THREE.Vector3();
    const neutralPointer = new THREE.Vector3();
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const staticMotion = () => motion.matches || connection?.saveData || playbackSpeed === 0;
    const sampleScroll = () => {
      scrollTarget = THREE.MathUtils.clamp((window.scrollY - trackTop) / heroHeight, 0, 1);
    };

    renderer.debug.onShaderError = (gl, program) => {
      failed = true;
      delete root.dataset.ready;
      root.dataset.state = "fallback";
      if (hero) hero.dataset.heroIntro = "complete";
      console.error("Novatrix shader failed to link:", gl.getProgramInfoLog(program));
    };

    const draw = () => {
      if (lost || failed) return;
      const reduced = staticMotion();
      const progress = reduced ? 1 : Math.min(entryTime / HERO_ENTRY_DURATION, 1);
      const now = performance.now();
      if (now - lastTelemetry >= 250 || progress === 1 && root.dataset.progress !== "1.000") {
        root.dataset.progress = progress.toFixed(3);
        root.dataset.scroll = reduced ? "0.000" : scrollProgress.toFixed(3);
        root.dataset.pointer = reduced ? "0.000" : pointer.z.toFixed(3);
        root.dataset.time = reduced ? "0.000" : motionTime.toFixed(3);
        lastTelemetry = now;
      }
      metalMotion.update(reduced ? 0 : motionTime, progress, reduced ? neutralPointer : pointer, reduced ? 0 : scrollProgress);
      renderer.render(metal.scene, metal.camera);
      if (!failed) {
        if (root.dataset.ready !== "true") root.dataset.ready = "true";
        const intro = progress === 1 ? "complete" : "running";
        if (hero && hero.dataset.heroIntro !== intro) hero.dataset.heroIntro = intro;
      }
    };
    const shouldPlay = () => visible && (scrollTarget < .85 || Math.abs(scrollProgress - scrollTarget) > .0001)
      && !document.hidden && !staticMotion() && !lost && !failed;
    const animate = (now: number) => {
      frame = 0;
      if (!shouldPlay()) {
        root.dataset.state = failed || lost ? "fallback" : "paused";
        return;
      }
      const elapsed = now - previousTime;
      const interacting = entryTime < HERO_ENTRY_DURATION || Math.abs(scrollProgress - scrollTarget) > .001
        || pointer.distanceToSquared(pointerTarget) > .0001;
      const interval = interacting ? 1000 / 60 : FRAME_INTERVAL;
      if (elapsed >= interval - .5) {
        const delta = Math.min(elapsed, 100) / 1000;
        entryTime = scrollTarget > .08 ? HERO_ENTRY_DURATION : entryTime + elapsed / 1000;
        pointer.lerp(pointerTarget, 1 - Math.exp(-delta / .18));
        scrollProgress = THREE.MathUtils.lerp(scrollProgress, scrollTarget, 1 - Math.exp(-delta * 1000 / SHUTTER_SCRUB_MS));
        if (Math.abs(scrollProgress - scrollTarget) < .0005) scrollProgress = scrollTarget;
        motionTime += delta * playbackSpeed / .18;
        metal.clock.value += delta * playbackSpeed;
        previousTime = now;
        draw();
      }
      frame = requestAnimationFrame(animate);
    };
    const update = () => {
      sampleScroll();
      if (!visible) scrollProgress = scrollTarget;
      if (staticMotion()) {
        pointer.set(0, 0, 0);
        pointerTarget.set(0, 0, 0);
      }
      const playing = shouldPlay();
      const state = failed || lost ? "fallback" : playing ? "running" : "paused";
      if (root.dataset.state !== state) root.dataset.state = state;
      if (playing) {
        if (!frame) {
          previousTime = performance.now();
          frame = requestAnimationFrame(animate);
        }
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
        // Offscreen scroll events must not submit another GPU frame.
      }
    };
    const resize = () => {
      const width = Math.max(root.clientWidth, 1);
      const height = Math.max(root.clientHeight, 1);
      trackTop = track ? track.getBoundingClientRect().top + window.scrollY : 0;
      heroHeight = Math.max(hero?.offsetHeight ?? height, 1);
      heroWidth = Math.max(hero?.clientWidth ?? width, 1);
      const heroBounds = hero?.getBoundingClientRect();
      heroLeft = heroBounds?.left ?? 0;
      if (mark && button && heroBounds) {
        // offset geometry excludes the entrance/scroll scale of these elements.
        composition.set(.5, ((main?.offsetTop ?? 0) + mark.offsetTop + mark.offsetHeight / 2) / heroHeight,
          mark.offsetWidth / heroWidth / 2, mark.offsetHeight / heroHeight / 2);
        const actions = button.parentElement;
        cta.set(.5, ((main?.offsetTop ?? 0) + (actions?.offsetTop ?? 0) + button.offsetHeight / 2) / heroHeight,
          button.offsetWidth / heroWidth / 2, button.offsetHeight / heroHeight / 2);
        metalMotion.setComposition(composition, cta);
      }
      const scale = Math.min(1, Math.sqrt(MAX_PIXELS / (width * height)));
      renderer.setSize(Math.round(width * scale), Math.round(height * scale), false);
      metal.resize(width, height, true);
      sampleScroll();
      if (visible || scrollTarget < .85) draw();
      update();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      delete root.dataset.ready;
      update();
    };
    const onRestored = () => {
      lost = false;
      resize();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !finePointer.matches || staticMotion() || !hero) return;
      pointerTarget.set(
        THREE.MathUtils.clamp((event.clientX - heroLeft) / heroWidth * 2 - 1, -1, 1),
        THREE.MathUtils.clamp(1 - event.clientY / heroHeight * 2, -1, 1), 1);
    };
    const onLeave = () => pointerTarget.set(0, 0, 0);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
      if (visible && staticMotion()) draw();
    }, { threshold: 0.05 });
    const sizes = new ResizeObserver(resize);
    intersection.observe(root);
    sizes.observe(root);
    if (main) sizes.observe(main);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    window.addEventListener("scroll", update, { passive: true });
    hero?.addEventListener("pointermove", onPointer, { passive: true });
    hero?.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", update);
    const onMotion = () => { update(); if (visible) draw(); };
    motion.addEventListener("change", onMotion);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      sizes.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      window.removeEventListener("scroll", update);
      hero?.removeEventListener("pointermove", onPointer);
      hero?.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", update);
      motion.removeEventListener("change", onMotion);
      metal.dispose();
      renderer.dispose();
      if (hero) hero.dataset.heroIntro = "pending";
    };
  }, [speed]);

  return (
    <div ref={rootRef} className={styles.background} data-hero-background aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
