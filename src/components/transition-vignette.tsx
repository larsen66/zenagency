"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// User-supplied Vignette function, adapted to a transparent DOM overlay.
// The host page supplies the image; alpha multiplies it by the attenuation.
const fragmentShader = `
uniform vec2 iResolution;
uniform float uEnvelope;
float Vignette(in vec2 fragCoord) {
    const float kVignetteStrength = 0.5;
    const float kVignetteScale = 0.6;
    const float kVignetteExponent = 3.0;
    const float kRoot2 = 1.41421356237;
    vec2 uv = fragCoord / iResolution.xy;
    uv.x = (uv.x - 0.5) * (iResolution.x / iResolution.y) + 0.5;
    float x = 2.0 * (uv.x - 0.5);
    float y = 2.0 * (uv.y - 0.5);
    float dist = sqrt(x*x + y*y) / kRoot2;
    return mix(1.0, max(0.0, 1.0 - pow(dist * kVignetteScale, kVignetteExponent)), kVignetteStrength);
}
void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, (1.0 - Vignette(gl_FragCoord.xy)) * uEnvelope);
}`;

export function TransitionVignette() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const track = canvas?.closest<HTMLElement>(".hero-scroll-track");
    if (!canvas || !track) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch { return; }
    renderer.setPixelRatio(1);
    const uniforms = { iResolution: { value: new THREE.Vector2() }, uEnvelope: { value: 0 } };
    const material = new THREE.ShaderMaterial({
      uniforms, fragmentShader,
      vertexShader: "void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }",
      transparent: true, depthTest: false, depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.Camera();
    let frame = 0;
    let lastEnvelope = -1;
    const draw = () => {
      frame = 0;
      const height = track.querySelector<HTMLElement>(".zen-hero")?.offsetHeight || innerHeight;
      const progress = THREE.MathUtils.clamp(-track.getBoundingClientRect().top / height, 0, 1);
      const envelope = motion.matches ? 0 : THREE.MathUtils.smoothstep(progress, 0, .2) * (1 - THREE.MathUtils.smoothstep(progress, .55, .85));
      if (envelope === lastEnvelope) return;
      lastEnvelope = envelope;
      uniforms.uEnvelope.value = envelope;
      canvas.style.visibility = envelope > 0 ? "visible" : "hidden";
      if (envelope > 0) renderer.render(scene, camera);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const resize = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      renderer.getDrawingBufferSize(uniforms.iResolution.value);
      lastEnvelope = -1;
      schedule();
    };
    const lost = (event: Event) => { event.preventDefault(); canvas.style.visibility = "hidden"; };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", resize);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    motion.addEventListener("change", schedule);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      motion.removeEventListener("change", schedule);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", resize);
      geometry.dispose(); material.dispose(); renderer.dispose();
    };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none invisible fixed inset-0 z-30 h-dvh w-full motion-reduce:hidden" data-transition-vignette />;
}
