"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createHeroMetalScene } from "@/components/hero-metal-scene";
import { creativeFragment, creativeVertex } from "@/components/metal-motion-shaders";
import { motionPresets } from "./motion-presets";

export type LightSettings = { glow: number; morph: number; speed: number; light: number; shadow: number; beamWidth: number };

export function MetalPreview({ variant, replay, paused, settings, inspection = null }: { variant: number; replay: number; paused: boolean; settings: LightSettings; inspection?: number | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useRef({ replay, paused, settings, inspection });
  useEffect(() => { controls.current = { replay, paused, settings, inspection }; }, [replay, paused, settings, inspection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "low-power" });
    } catch {
      canvas.dataset.state = "fallback";
      if (canvas.parentElement) canvas.parentElement.dataset.visible = "true";
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const metal = createHeroMetalScene();
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const duration = motionPresets[variant].duration;
    const speed = variant === 6 ? .425 : [0.35, 0.55, 0.65, 0.45, 0.6, 0.4][variant % 6];
    metal.materials.forEach((material) => {
      material.uniforms.uEntry = { value: 0 };
      material.uniforms.uLabTime = { value: 0 };
      material.uniforms.uMorph = { value: controls.current.settings.morph };
      material.uniforms.uGlow = { value: controls.current.settings.glow };
      material.uniforms.uLight = { value: controls.current.settings.light };
      material.uniforms.uShadow = { value: controls.current.settings.shadow };
      material.uniforms.uBeamWidth = { value: controls.current.settings.beamWidth };
      material.vertexShader = creativeVertex(material.vertexShader, variant === 6 ? 0 : variant, variant === 6 ? 4 : undefined);
      material.fragmentShader = creativeFragment(material.fragmentShader, variant === 6 ? 0 : variant, variant === 6 ? 4 : undefined);
    });
    let elapsed = 0;
    let entry = 0;
    let lastReplay = controls.current.replay;
    let previous = 0;
    let frame = 0;
    let visible = false;
    let lost = false;
    let failed = false;
    let dirty = true;
    let lastSettings = controls.current.settings;
    let lastVisibilityCheck = -Infinity;
    let lastInspection = controls.current.inspection;
    renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
      failed = true;
      canvas.dataset.state = "fallback";
      console.error(`Motion Lab ${variant + 1}: shader failed`, gl.getProgramInfoLog(program), gl.getShaderInfoLog(vertex), gl.getShaderInfoLog(fragment));
    };

    const draw = () => {
      const reduced = motion.matches;
      const progress = reduced ? 1 : controls.current.inspection ?? Math.min(entry / duration, 1);
      canvas.dataset.progress = progress.toFixed(3);
      const logicalTime = controls.current.inspection === null ? elapsed : progress * duration;
      const currentSettings = controls.current.settings;
      metal.clock.value = 12.5 + (reduced ? 0 : logicalTime * speed);
      metal.materials.forEach((material) => {
        material.uniforms.uEntry.value = progress;
        material.uniforms.uLabTime.value = reduced ? 0 : logicalTime;
        material.uniforms.uMorph.value = currentSettings.morph;
        material.uniforms.uGlow.value = currentSettings.glow;
        material.uniforms.uLight.value = currentSettings.light;
        material.uniforms.uShadow.value = currentSettings.shadow;
        material.uniforms.uBeamWidth.value = currentSettings.beamWidth;
        material.uniforms.uExposure.value = 1;
      });
      renderer.render(metal.scene, metal.camera);
      if (!failed) canvas.dataset.state = "ready";
      dirty = false;
    };
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - lastVisibilityCheck >= 250) {
        const bounds = canvas.getBoundingClientRect();
        const nextVisible = bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.width > 0;
        if (nextVisible && !visible) dirty = true;
        visible = nextVisible;
        if (canvas.parentElement) canvas.parentElement.dataset.visible = String(visible);
        lastVisibilityCheck = now;
      }
      if (!visible || document.hidden || lost || failed) { previous = now; return; }
      const replayed = lastReplay !== controls.current.replay;
      if (replayed) {
        lastReplay = controls.current.replay;
        entry = 0;
        elapsed = 0;
        dirty = true;
      }
      if (lastSettings !== controls.current.settings) { lastSettings = controls.current.settings; dirty = true; }
      if (lastInspection !== controls.current.inspection) {
        if (!replayed && controls.current.inspection === null && lastInspection !== null) {
          entry = lastInspection * duration;
          elapsed = entry;
        }
        lastInspection = controls.current.inspection;
        dirty = true;
      }
      if (controls.current.paused || motion.matches || controls.current.inspection !== null) {
        if (dirty) draw();
        previous = now;
        return;
      }
      if (now - previous < 1000 / 30) return;
      const dt = Math.min((now - previous) / 1000, 0.08);
      previous = now;
      elapsed += dt * controls.current.settings.speed;
      entry += dt * controls.current.settings.speed;
      draw();
    };
    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5, Math.sqrt(1500000 / (width * height))));
      renderer.setSize(width, height, false);
      metal.resize(width, height);
      dirty = true;
    };
    const sizes = new ResizeObserver(resize);
    const preferenceChanged = () => { dirty = true; };
    const onLost = (event: Event) => { event.preventDefault(); lost = true; canvas.dataset.state = "fallback"; };
    const onRestored = () => { lost = false; resize(); };
    sizes.observe(canvas);
    motion.addEventListener("change", preferenceChanged);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    resize();
    // Give every card the same material before its first visible entrance.
    entry = duration;
    draw();
    entry = 0;
    dirty = true;
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      motion.removeEventListener("change", preferenceChanged);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      metal.dispose();
      renderer.dispose();
    };
  }, [variant]);

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}
