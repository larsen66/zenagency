import * as THREE from "three";

// Original contour effect; Shadertoy dly3WG was inaccessible (HTTP 403).
// A screen-space ribbon avoids subpixel WebGL line rasterization at high DPR.
export function createEdgeShader() {
  const uniforms = {
    uTime: { value: 0 },
    uReveal: { value: 0 },
    uBounds: { value: new THREE.Vector2(0, 1) },
    uSize: { value: new THREE.Vector2(1, 1) },
    uWidth: { value: 12 }, // Full ribbon width in CSS pixels.
  };
  return {
    uniforms,
  };
}

export function edgeRibbon(positions: Float32Array, progress: Float32Array) {
  const vertices: number[] = [];
  const others: number[] = [];
  const sides: number[] = [];
  const distances: number[] = [];
  for (let i = 0; i < progress.length - 1; i++) {
    // Six vertices per segment; skip the duplicate closing point's zero-length edge.
    const a = new THREE.Vector3().fromArray(positions, i * 3);
    const b = new THREE.Vector3().fromArray(positions, (i + 1) * 3);
    if (a.distanceToSquared(b) < 1e-8) continue;
    for (const [end, side] of [[0, -1], [0, 1], [1, -1], [1, -1], [0, 1], [1, 1]]) {
      const point = end ? b : a;
      const other = end ? a : b;
      vertices.push(point.x, point.y, point.z);
      others.push(other.x, other.y, other.z);
      sides.push(side * (end ? -1 : 1), side);
      distances.push(progress[i + end]);
    }
  }
  return {
    positions: new Float32Array(vertices),
    others: new Float32Array(others),
    sides: new Float32Array(sides),
    progress: new Float32Array(distances),
  };
}

export const edgeVertexShader = `
uniform vec2 uSize;
uniform float uWidth;
attribute vec3 edgeOther;
attribute vec2 edgeSide;
attribute float edgeProgress;
varying float vRevealX;
varying float vAcross;
varying float vProgress;
void main() {
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 other = projectionMatrix * modelViewMatrix * vec4(edgeOther, 1.0);
  vec2 delta = (other.xy / other.w - clip.xy / clip.w) * uSize;
  vec2 normal = vec2(-delta.y, delta.x) / max(length(delta), 0.0001);
  clip.xy += normal * edgeSide.x * uWidth / max(uSize, vec2(1.0)) * clip.w;
  vRevealX = position.x;
  vAcross = edgeSide.y;
  vProgress = edgeProgress;
  gl_Position = clip;
}`;

export const edgeFragmentShader = `
uniform float uTime;
uniform float uReveal;
uniform vec2 uBounds;
varying float vRevealX;
varying float vAcross;
varying float vProgress;
void main() {
  if (uReveal <= 0.0) discard;
  float revealCoverage = 1.0;
  if (uReveal < 1.0) {
    float x = (vRevealX - uBounds.x) / max(uBounds.y - uBounds.x, 0.001);
    float front = mix(-0.12, 1.12, smoothstep(0.0, 1.0, uReveal));
    revealCoverage = 1.0 - smoothstep(front - 0.12, front, x);
  }
  float phase = 6.28318530718 * (vProgress - uTime * 0.16);
  float shimmer = pow(0.5 + 0.5 * cos(phase), 6.0);
  float distanceFromCenter = abs(vAcross);
  float core = 1.0 - smoothstep(0.06, 0.2, distanceFromCenter);
  float halo = exp(-4.5 * distanceFromCenter) * (1.0 - smoothstep(0.75, 1.0, distanceFromCenter));
  vec3 color = mix(vec3(0.56, 0.86, 0.12), vec3(1.0, 1.0, 0.82), core * shimmer);
  float alpha = core * (0.22 + 0.7 * shimmer) + halo * shimmer * 0.6;
  gl_FragColor = vec4(color, min(alpha, 0.98) * revealCoverage);
  #include <colorspace_fragment>
}`;
