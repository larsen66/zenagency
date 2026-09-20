"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Center, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Shape } from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

import { createEdgeShader, edgeRibbon, edgeVertexShader, edgeFragmentShader } from "./edge-shader";
import { createRevealShader } from "./reveal-shader";

const SVG_URL = "/brand/zen-letters.svg";

const SCALE = 0.0132;
const DEPTH = 6;

function LetterMesh({ shapes, texture }: { shapes: Shape[]; texture: THREE.Texture }) {
  const reveal = useMemo(() => {
    const video = texture.image as HTMLVideoElement;
    return createRevealShader(video.videoWidth, video.videoHeight);
  }, [texture]);
  const edge = useMemo(() => createEdgeShader(), []);
  const viewportSize = useThree((state) => state.size);
  const edgeMaterials = useRef<Array<THREE.ShaderMaterial | null>>([]);
  const elapsed = useRef(0);
  const reduced = useRef(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { reduced.current = preference.matches; };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.3,
      bevelSegments: 4,
      curveSegments: 6,
    });
    geo.computeBoundingBox();
    const bounds = geo.boundingBox!;
    const position = geo.attributes.position;
    const uv = geo.attributes.uv;
    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;
    const img = texture.image as HTMLVideoElement;
    const crop = Math.min(1, (width / height) / (img.videoWidth / img.videoHeight));
    // A continuous oblique projection carries the video across the
    // front, bevel, side walls and back without a separate border material.
    for (let i = 0; i < position.count; i++) {
      const depthOffset = position.getZ(i) - DEPTH;
      const x = position.getX(i) + depthOffset * 0.7;
      const y = position.getY(i) + depthOffset * 0.35;
      uv.setXY(i, ((x - bounds.min.x) / width - 0.5) * crop + 0.5, 1 - (y - bounds.min.y) / height);
    }
    geo.clearGroups();
    geo.computeVertexNormals();
    return geo;
  }, [shapes, texture]);

  useFrame((_, dt) => {
    elapsed.current += Math.min(dt, 0.05);
    const progress = 1;
    reveal.setProgress(progress);
    reveal.setBounds(geometry.boundingBox!.min.x, geometry.boundingBox!.max.x);
    // R3F copies uniform wrappers into ShaderMaterial; update the live material.
    for (const material of edgeMaterials.current) {
      if (!material) continue;
      material.uniforms.uTime.value = reduced.current ? 0 : elapsed.current;
      material.uniforms.uReveal.value = progress;
      material.uniforms.uBounds.value.set(geometry.boundingBox!.min.x, geometry.boundingBox!.max.x);
      material.uniforms.uSize.value.set(viewportSize.width, viewportSize.height);
    }
  });

  const contours = useMemo(() => shapes.flatMap((shape) => [shape, ...shape.holes]).map((path) => {
    const points = path.getPoints(12).map((point) => new THREE.Vector3(point.x, point.y, DEPTH + 0.35));
    if (points.length) points.push(points[0].clone());
    const progress = new Float32Array(points.length);
    for (let i = 1; i < points.length; i++) {
      progress[i] = progress[i - 1] + points[i].distanceTo(points[i - 1]);
    }
    const length = Math.max(progress[progress.length - 1], 0.001);
    for (let i = 0; i < progress.length; i++) progress[i] /= length;
    return edgeRibbon(new Float32Array(points.flatMap((point) => [point.x, point.y, point.z])), progress);
  }), [shapes]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial
        onBeforeCompile={reveal.compile}
        customProgramCacheKey={() => "zen-soft-video-v6"}
        transparent
        map={texture}
        roughness={0.9}
        metalness={0}
        toneMapped={false}
      />
      {contours.map(({ positions, others, sides, progress }, index) => (
        <mesh key={index} renderOrder={2} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-edgeOther" args={[others, 3]} />
            <bufferAttribute attach="attributes-edgeSide" args={[sides, 2]} />
            <bufferAttribute attach="attributes-edgeProgress" args={[progress, 1]} />
          </bufferGeometry>
          <shaderMaterial ref={(material) => { edgeMaterials.current[index] = material; }} uniforms={edge.uniforms} vertexShader={edgeVertexShader} fragmentShader={edgeFragmentShader}
            transparent side={THREE.DoubleSide} toneMapped={false} depthWrite={false} depthTest={false} />
        </mesh>
      ))}
    </mesh>
  );
}

function useLetterVideo(src: string, active: boolean) {
  const texture = useVideoTexture(src, { start: false, muted: true, loop: true, playsInline: true, defaultPlaybackRate: 0.7, playbackRate: 0.7 });

  useEffect(() => {
    const video = texture.image as HTMLVideoElement;
    const updatePlayback = () => {
      if (active && !document.hidden) {
        void video.play().catch(() => {
          // Keep the loaded frame if the browser blocks autoplay.
        });
      } else {
        video.pause();
      }
    };
    updatePlayback();
    document.addEventListener("visibilitychange", updatePlayback);
    return () => {
      document.removeEventListener("visibilitychange", updatePlayback);
      video.pause();
    };
  }, [texture, active]);

  // useVideoTexture caches this texture; disposing it here cancels frame updates
  // when React replays effects or the component mounts again.
  return texture;
}

function Mark({ active }: { active: boolean }) {
  const svg = useLoader(SVGLoader, SVG_URL);
  const woman = useLetterVideo("/images/zen/woman-loop.mp4", active);
  const building = useLetterVideo("/images/zen/building-loop.mp4", active);
  const trails = useLetterVideo("/images/zen/light-trails-loop.mp4", active);
  const textures = [woman, building, trails];

  const letters = useMemo(
    () => svg.paths.map((path) => ({
      shapes: path.toShapes(),
      letter: (path.userData?.node as Element | undefined)?.getAttribute("data-letter"),
    })),
    [svg],
  );

  return (
    <Center>
      <group scale={[SCALE, -SCALE, SCALE]}>
        {letters.map(({ shapes, letter }, index) => (
          <LetterMesh key={index} shapes={shapes} texture={textures[letter === "z" ? 0 : letter === "e" ? 1 : 2]} />
        ))}
      </group>
    </Center>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { pointer, gl } = useThree();
  const reduced = useRef(false);
  const hovering = useRef(false);
  const phase = useRef(0);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateMotion = () => { reduced.current = motion.matches; };
    const enter = () => { hovering.current = hover.matches; };
    const leave = () => { hovering.current = false; };
    updateMotion();
    const canvas = gl.domElement;
    canvas.addEventListener("pointermove", enter);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointercancel", leave);
    motion.addEventListener("change", updateMotion);
    return () => {
      canvas.removeEventListener("pointermove", enter);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointercancel", leave);
      motion.removeEventListener("change", updateMotion);
    };
  }, [gl]);

  useFrame((_, dt) => {
    const group = ref.current;
    if (!group) return;
    const tracking = hovering.current && !reduced.current;
    const tx = tracking ? pointer.y * 0.05 : 0;
    const ty = tracking ? pointer.x * 0.11 : 0;
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, tx, 5, dt);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, ty, 5, dt);
    if (!reduced.current) phase.current += Math.min(dt, 0.05);
    const floatY = reduced.current ? 0 : Math.sin(phase.current * Math.PI / 3) * 0.065;
    group.position.y = THREE.MathUtils.damp(group.position.y, floatY, 5, dt);
  });

  return <group ref={ref}>{children}</group>;
}

function ContextRecovery() {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (event: Event) => event.preventDefault();
    const onRestored = () => invalidate();
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [gl, invalidate]);
  return null;
}

export default function ZenMarkScene({ active }: { active: boolean }) {
  return (
    <Canvas
      resize={{ offsetSize: true }}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      }}
      camera={{ position: [0, 0, 9.2], fov: 28, near: 0.1, far: 40 }}
      style={{ width: "100%", height: "100%", display: "block" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x141414, 0);
      }}
    >
      <ContextRecovery />
      <ambientLight intensity={0.65} />
      <directionalLight position={[-4, 6, 8]} intensity={2.5} />
      <directionalLight position={[5, 1, -3]} intensity={1.1} />
      <Suspense fallback={null}>
        <Rig>
          <Mark active={active} />
        </Rig>
      </Suspense>
    </Canvas>
  );
}
