import * as THREE from "three";

// Webcam Glitch, Leon Denise, 08-06-2022. User-supplied source:
// https://www.shadertoy.com/view/NdKyDR
// hash33/hash21 by Dave Hoskins: https://www.shadertoy.com/view/4djSRW
// Host changes: video UVs, 15% intensity, one-shot envelope, transparent crop.
export function createRevealShader(width: number, height: number) {
  const progress = { value: 0 };
  const bounds = { value: new THREE.Vector2(0, 1) };
  const resolution = { value: new THREE.Vector2(width, height) };
  const compile = (shader: THREE.WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uReveal = progress;
    shader.uniforms.uRevealBounds = bounds;
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying float vRevealX;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRevealX = position.x;");
    shader.uniforms.uGlitchResolution = resolution;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
      uniform float uReveal;
      uniform vec2 uRevealBounds;
      varying float vRevealX;
      uniform vec2 uGlitchResolution;
      vec3 hash33(vec3 p3) {
        p3 = fract(p3 * vec3(.1031, .1030, .0973));
        p3 += dot(p3, p3.yxz + 33.33);
        return fract((p3.xxy + p3.yxx) * p3.zyx);
      }
      vec2 hash21(float p) {
        vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.xx + p3.yz) * p3.zy);
      }`,
    ).replace(
      "#include <map_fragment>",
      `#ifdef USE_MAP
        if (uReveal <= 0.0) discard;
        if (uReveal < 1.0) {
          float x = (vRevealX - uRevealBounds.x) / max(uRevealBounds.y - uRevealBounds.x, 0.001);
          float front = mix(-0.12, 1.12, smoothstep(0.0, 1.0, uReveal));
          float coverage = 1.0 - smoothstep(front - 0.12, front, x);
          if (coverage < 0.005) discard;
          diffuseColor.a *= coverage;
        }
        vec4 sampledDiffuseColor;
        if (uReveal >= 1.0) {
          sampledDiffuseColor = texture2D(map, vMapUv);
          // Blend 16% of a small blur into the video, leaving geometry edges crisp.
          vec2 texel = 3.0 / max(uGlitchResolution, vec2(1.0));
          vec4 softened = sampledDiffuseColor * 0.4;
          softened += texture2D(map, vMapUv + vec2(texel.x, 0.0)) * 0.15;
          softened += texture2D(map, vMapUv - vec2(texel.x, 0.0)) * 0.15;
          softened += texture2D(map, vMapUv + vec2(0.0, texel.y)) * 0.15;
          softened += texture2D(map, vMapUv - vec2(0.0, texel.y)) * 0.15;
          sampledDiffuseColor = mix(sampledDiffuseColor, softened, 0.16);
        } else {
          vec2 uv = vMapUv;
          vec2 resolution = max(uGlitchResolution, vec2(1.0));
          float intensity = 0.15 * (1.0 - smoothstep(0.0, 1.0, uReveal));
          uv = (uv - .5) * (1.0 + .1 * intensity) + .5;
          float speed = 10.0;
          float time = uReveal * .6;
          float t = floor(time * speed);
          vec2 lod = resolution / max(hash21(t), vec2(.0001)) / 200.0;
          vec2 p = floor(uv * lod);
          vec3 rng = hash33(vec3(p, t));
          vec2 offset = vec2(cos(rng.x * 6.283), sin(rng.x * 6.283)) * rng.y;
          float fade = sin(fract(time * speed) * 3.14);
          vec2 scale = 50.0 / resolution;
          float threshold = step(.9, rng.z);
          uv += offset * threshold * fade * scale * intensity;
          vec2 rgb = 10.0 / resolution * fade * threshold * intensity;
          sampledDiffuseColor.r = texture2D(map, uv + rgb).r;
          sampledDiffuseColor.g = texture2D(map, uv).g;
          sampledDiffuseColor.b = texture2D(map, uv - rgb).b;
          sampledDiffuseColor.a = 1.0;
          // Preserve the transparent page background outside the source image.
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
        }
        #ifdef DECODE_VIDEO_TEXTURE
          sampledDiffuseColor = sRGBTransferEOTF(sampledDiffuseColor);
        #endif
        diffuseColor *= sampledDiffuseColor;
      #endif`,
    );
  };
  return { compile, setProgress(value: number) { progress.value = value; }, setBounds(min: number, max: number) { bounds.value.set(min, max); } };
}
