// Novatrix flow adapted from UVCanvas by Latent Cat (MIT).
// https://github.com/latentcat/uvcanvas/blob/e0ab64089c33ef0251932e2dafc99f82c5feff1b/core/lib/components/novatrix/frag.glsl
// All geometry, studio lights and graphite shading below are original.
// Source attribution and license: THIRD_PARTY_NOTICES.md.
const flow = `
vec3 novatrix(vec2 uv, float time) {
  float d = -time * 0.5;
  float a = 0.0;
  for (int i = 0; i < 8; ++i) {
    a += cos(float(i) - d - a * uv.x);
    d += sin(uv.y * float(i) + a);
  }
  d += time * 0.5;
  vec3 field = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  return cos(field * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
}
float bell(float v, float c, float w) {
  float x = (v - c) / w;
  return exp(-x * x);
}
float cubic(vec4 points, float t) {
  float s = 1.0 - t;
  return s*s*s*points.x + 3.0*s*s*t*points.y + 3.0*s*t*t*points.z + t*t*t*points.w;
}
`;

export const metalVertexShader = `
uniform float uTime;
uniform float uAspect;
uniform float uSide;
uniform vec4 uLeftContour;
uniform float uLeftCrease[9];
uniform float uRightCrease[11];
uniform vec4 uRightTop;
uniform vec4 uRightBottom;
uniform vec4 uProfile;
varying vec3 vPoint;
varying vec3 vNormal;
varying vec2 vSheet;
varying vec2 vRoll;
${flow}

float catmull(float a, float b, float c, float d, float t) {
  return 0.5 * (2.0*b + (-a+c)*t + (2.0*a-5.0*b+4.0*c-d)*t*t + (-a+3.0*b-3.0*c+d)*t*t*t);
}
float leftFold(float y) {
  if (y < 0.28) return uLeftCrease[0] + (y-0.28) * (uLeftCrease[1]-uLeftCrease[0]) / 0.18;
  float p = (y - 0.28) / 0.09;
  int i = int(clamp(floor(p), 0.0, 7.0));
  return catmull(uLeftCrease[max(i-1,0)], uLeftCrease[i], uLeftCrease[i+1], uLeftCrease[min(i+2,8)], p-float(i));
}
float rightFold(float y) {
  float p = y * 10.0;
  int i = int(clamp(floor(p), 0.0, 9.0));
  return catmull(uRightCrease[max(i-1,0)], uRightCrease[i], uRightCrease[i+1], uRightCrease[min(i+2,10)], p-float(i));
}

vec3 surface(vec2 sheet, vec2 deformation, out vec2 roll) {
  float y = 1.0 - sheet.y;
  float phase = uTime - 12.5;
  float edgeScale = min(1.0, uAspect / 1.777);
  float border;
  float crease;
  float x;
  if (uSide < 0.5) {
    border = cubic(uLeftContour, y);
    crease = leftFold(y);
    float across = 1.0 - sheet.x;
    x = border - 0.52 * (0.06 * across + 0.94 * across * across);
  } else {
    border = y < 0.50 ? cubic(uRightTop, y * 2.0)
      : cubic(uRightBottom, (y - 0.5) * 2.0);
    crease = rightFold(y);
    x = border + 0.5 * (0.06 * sheet.x + 0.94 * sheet.x * sheet.x);
  }
  float wave = sin(y * 5.0 + phase * 0.25) - sin(y * 5.0);
  float drift = deformation.y * 0.0035 + wave * 0.0015;
  x += drift;
  crease += drift + deformation.x * 0.003 + wave * 0.001;
  float d = (x - crease) * 1.777 * mix(-1.0, 1.0, step(0.5, uSide));
  // A rolled cross-section has a single rounded shoulder, not repeated ridges.
  float width = uProfile.x + uProfile.y * bell(y, 0.55, 0.3);
  float height = uProfile.z * atan(d / width);
  height += uProfile.w * atan((d - 0.15) / 0.12);
  height += 0.008 * sin(d * 10.0 + y * 3.0 + phase * 0.15) * bell(d, 0.15, 0.3);
  if (uSide < 0.5) {
    float upperFold = (border - x - 0.008) * 1.777;
    height += 0.035 * atan(upperFold / 0.035) * (1.0 - smoothstep(0.35, 0.65, y));
  }
  roll = vec2(d, (border - x - 0.008) * 1.777);
  float worldX = uSide < 0.5 ? x * edgeScale : 1.0 - (1.0 - x) * edgeScale;
  return vec3((worldX - 0.5) * uAspect, 0.5 - y, height);
}
void main() {
  const float e = 0.0003;
  vec2 q = vec2(uv.x * 0.2, 1.0 - uv.y) * 0.18 + vec2(-0.15, 0.1);
  vec2 deformation = novatrix(q, uTime).rg - novatrix(q, 12.5).rg;
  vec2 roll;
  vec2 unused;
  vec3 point = surface(uv, deformation, roll);
  vec3 tangent = surface(uv + vec2(e, 0.0), deformation, unused) - surface(uv - vec2(e, 0.0), deformation, unused);
  vec3 bitangent = surface(uv + vec2(0.0, e), deformation, unused) - surface(uv - vec2(0.0, e), deformation, unused);
  vRoll = roll;
  vNormal = normalize(cross(tangent, bitangent));
  vPoint = point;
  vSheet = vec2(uv.x, 1.0 - uv.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
}`;

export const metalFragmentShader = `
uniform float uTime;
uniform float uSide;
uniform vec3 uGraphite;
uniform vec3 uSilver;
uniform vec3 uLime;
uniform vec4 uLightStrength;
uniform vec4 uLightWidth;
uniform vec3 uLamp1;
uniform vec3 uLamp2;
uniform vec3 uLamp3;
uniform vec3 uLamp4;
uniform vec3 uLamp5;
uniform vec3 uLamp6;
uniform vec3 uLampAxis1;
uniform vec3 uLampAxis2;
uniform vec3 uLampAxis3;
uniform vec3 uLampAxis4;
uniform vec3 uLampAxis5;
uniform vec3 uLampAxis6;
uniform vec2 uFillStrength;
uniform vec2 uFillTint;
uniform vec2 uFillWidth;
uniform vec4 uLightStretch;
uniform vec2 uFillStretch;
uniform float uExposure;
uniform vec4 uReflectionCards[24];
uniform vec3 uReflectionWeights[24];
uniform float uRimEnergy[11];
varying vec3 vPoint;
varying vec3 vNormal;
varying vec2 vSheet;
varying vec2 vRoll;
${flow}
float softbox(vec3 reflected, vec3 position, vec3 lamp, vec3 lampAxis, float size, float stretch) {
  vec3 delta = lamp - position;
  float spread = size / max(length(delta), 0.1);
  vec3 direction = delta / max(length(delta), 0.0001);
  vec3 axis = abs(direction.y) < 0.98 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 horizontal = normalize(cross(axis, direction));
  vec3 vertical = cross(direction, horizontal);
  vec2 offset = vec2(dot(reflected, horizontal), dot(reflected, vertical));
  vec2 width = vec2(spread, spread * stretch);
  vec2 uv = offset / max(width, vec2(0.0001));
  float beam = exp((dot(direction, lampAxis) - 1.0) / 0.0324);
  // Soft rectangular studio cards make elongated reflections rather than round spots.
  float footprint = pow(abs(uv.x), 1.6) + pow(abs(uv.y), 2.4);
  return exp(-0.5 * footprint) * beam * smoothstep(0.0, 0.25, dot(reflected, direction));
}
void main() {
  float phase = uTime - 12.5;
  float y = vSheet.y;
  // Low-frequency polish follows the roll, without grain or repeated ridges.
  float polish = sin(y * 13.0 + vRoll.x * 9.0 + phase * 0.08);
  float broad = sin(y * 5.0 - vRoll.x * 6.0 - phase * 0.045);
  vec3 ripple = vec3(polish * 0.032 + broad * 0.018,
    sin(y * 19.0 + vRoll.x * 14.0 - phase * 0.06) * 0.028, 0.0);
  vec3 normal = normalize(vNormal + ripple);
  vec3 reflected = reflect(vec3(0.0, 0.0, -1.0), normal);
  float side = mix(-1.0, 1.0, step(0.5, uSide));
  float movement = sin(phase * 0.34) * 0.02;
  vec3 lamp1 = uLamp1 + vec3(0.0, movement, 0.0);
  vec3 lamp2 = uLamp2 - vec3(0.0, movement, 0.0);
  vec3 lamp3 = uLamp3 + vec3(0.0, movement, movement * 0.3);
  vec3 lamp4 = uLamp4 - vec3(0.0, movement, movement * 0.3);
  float silver1 = softbox(reflected, vPoint, lamp1, uLampAxis1, uLightWidth.x, uLightStretch.x) * uLightStrength.x;
  float silver2 = softbox(reflected, vPoint, lamp2, uLampAxis2, uLightWidth.y, uLightStretch.y) * uLightStrength.y;
  float green1 = softbox(reflected, vPoint, lamp3, uLampAxis3, uLightWidth.z, uLightStretch.z) * uLightStrength.z;
  float green2 = softbox(reflected, vPoint, lamp4, uLampAxis4, uLightWidth.w, uLightStretch.w) * uLightStrength.w;
  // Broad, dark studio environment; the colored softboxes supply local glints.
  float window = bell(reflected.x * side, 0.35, 0.32) * bell(reflected.y, -0.2, 0.75);
  float grazing = pow(1.0 - max(normal.z, 0.0), 3.0);
  vec3 color = uGraphite * (0.25 + 0.75 * normal.z);
  float fill1 = softbox(reflected, vPoint, uLamp5 + vec3(0.0, movement, 0.0), uLampAxis5, uFillWidth.x, uFillStretch.x) * uFillStrength.x;
  float fill2 = softbox(reflected, vPoint, uLamp6 - vec3(0.0, movement, 0.0), uLampAxis6, uFillWidth.y, uFillStretch.y) * uFillStrength.y;
  color += uSilver * (silver1 + silver2 + window * 0.025);
  color += mix(uSilver, uLime, uFillTint.x) * fill1 + mix(uSilver, uLime, uFillTint.y) * fill2;
  color += uLime * (green1 + green2);
  color *= 0.75 + grazing * 0.25;
  // A dark reflected card gives the bright fold an adjacent, soft trough.
  float trough = bell(vRoll.x, 0.06 + broad * 0.014, 0.035);
  float troughMask = bell(y, uSide < 0.5 ? 0.53 : 0.40, 0.28);
  color *= 1.0 - trough * troughMask * 0.38;
  // The raised right-hand roll shades the surface tucked beneath it.
  float foldedShadow = 0.2 + 0.8 * smoothstep(-0.075, 0.01, vRoll.x);
  if (uSide > 0.5) color *= mix(1.0, foldedShadow, smoothstep(0.48, 0.65, y));
  // A subtle rim comes from the mesh boundary, not a raster outline.
  float boundary = uSide < 0.5 ? 1.0 - vSheet.x : vSheet.x;
  float rim = 1.0 - smoothstep(0.0, max(fwidth(boundary), 0.0002) * 1.2, boundary);
  color += mix(uSilver, uLime, 0.4 + 0.3 * sin(y * 7.0)) * rim * (uSide < 0.5 ? 0.025 : 0.07);
  // A narrow grazing reflection follows the rolled shoulder of the actual surface.
  float rollWidth = max(fwidth(vRoll.x), 0.001);
  float shoulder = bell(vRoll.x, 0.0, 0.0005 + rollWidth * 0.45);
  float halo = bell(vRoll.x, 0.006, 0.013);
  float green = bell(y, uSide < 0.5 ? 0.46 : 0.82, 0.18) + bell(y, 0.04, 0.25);
  vec3 glint = mix(uSilver, uLime, clamp(green * 0.7, 0.0, 1.0));
  float lowerMask = uSide < 0.5 ? smoothstep(0.25, 0.32, y) : 1.0;
  float rollLight = uSide < 0.5 ? 0.08 + 1.8 * (1.0 - smoothstep(0.74, 0.94, y))
    : 1.55 + 0.5 * bell(y, 0.3, 0.25);
  float rimPosition = clamp(y, 0.0, 1.0) * 10.0;
  int rimIndex = min(int(floor(rimPosition)), 9);
  float rimEnergy = mix(uRimEnergy[rimIndex], uRimEnergy[rimIndex + 1], smoothstep(0.0, 1.0, rimPosition - float(rimIndex)));
  float glintVariation = 0.42 + 0.4 * smoothstep(-0.65, 0.8, polish * 0.65 + broad * 0.35)
    + 0.3 * bell(y, uSide < 0.5 ? 0.53 : 0.75, 0.09);
  float flare = bell(y, uSide < 0.5 ? 0.52 : 0.67, 0.13);
  color += glint * (shoulder * 0.48 * rollLight * glintVariation * rimEnergy
    + halo * (0.022 + flare * 0.16)) * lowerMask;
  // A broad card is stretched by the shoulder, with a softer green reflection behind it.
  float cardCenter = uSide < 0.5 ? 0.065 : -0.045;
  float card = bell(vRoll.x, cardCenter + polish * 0.006, uSide < 0.5 ? 0.032 : 0.025)
    * bell(y, uSide < 0.5 ? 0.575 : 0.69, uSide < 0.5 ? 0.065 : 0.16);
  vec3 cardColor = mix(uSilver, uLime, uSide < 0.5 ? 0.85 : green * 0.3);
  color += cardColor * card * (uSide < 0.5 ? 0.38 : 0.65) * lowerMask;
  if (uSide < 0.5) {
    float upper = bell(vRoll.y, 0.0, 0.005 + fwidth(vRoll.y));
    color += uSilver * upper * 0.18 * (1.0 - smoothstep(0.25, 0.65, y));
  }
  // Environment cards are attached to the rolled sheet, so their reflections
  // follow its deformation and remain the same scale on narrow viewports.
  float cardShadow = 0.0;
  vec2 cardLight = vec2(0.0);
  for (int i = 0; i < 24; ++i) {
    vec4 cardShape = uReflectionCards[i];
    float across = uSide < 0.5 && cardShape.y < 0.26 ? vRoll.y : vRoll.x;
    vec2 offset = (vec2(across, y) - cardShape.xy) / max(cardShape.zw, vec2(0.001));
    float footprint = exp(-dot(offset, offset)) * smoothstep(0.004, 0.012, abs(vRoll.x));
    cardShadow += footprint * uReflectionWeights[i].x;
    cardLight += footprint * uReflectionWeights[i].yz;
  }
  color = color * exp(-cardShadow) + uSilver * cardLight.x + uLime * cardLight.y;
  color *= uExposure;
  float lipOpacity = uSide > 0.5 ? mix(1.0, smoothstep(0.0, 0.16, vSheet.x), smoothstep(0.55, 0.72, y)) : 1.0;
  gl_FragColor = vec4(color, lipOpacity);
  #include <colorspace_fragment>
}`;

export const backdropVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.99, 1.0);
}`;
export const backdropFragmentShader = `
varying vec2 vUv;
${flow}
void main() {
  float y = 1.0 - vUv.y;
  // Static studio atmosphere fitted to exposed regions of the original reference.
  vec3 color = vec3(0.0032402, 0.0036040, 0.0034248);
  color += vec3(0.0372290, 0.0453423, 0.0374636) * bell(vUv.x - (y + 0.1) * 0.1, 0.24, 0.16) * bell(y, -0.1, 0.26);
  color += vec3(0.0137423, 0.0157413, 0.0150507) * bell(vUv.x - (y + 0.025) * 0.1, 0.43, 0.24) * bell(y, -0.025, 0.14);
  color += vec3(0.0011675, 0.0020108, 0.0003004) * bell(vUv.x + (y - 0.78) * 0.5, 0.42, 0.16) * bell(y, 0.78, 0.13);
  color += vec3(0.0019205, 0.0023230, 0.0021399) * bell(vUv.x - (y - 0.92) * 0.2, 0.77, 0.08) * bell(y, 0.92, 0.25);
  color += vec3(0.0066634, 0.0114938, 0.0034322) * bell(vUv.x, 0.5, 0.065) * bell(y, 0.825, 0.105);
  color += vec3(0.0002256, 0.0001819, 0.0005276) * bell(vUv.x, 0.34, 0.15) * bell(y, 0.95, 0.17);
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}`;
