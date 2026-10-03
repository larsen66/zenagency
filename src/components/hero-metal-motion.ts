import * as THREE from "three";
import { createHeroMetalScene } from "./hero-metal-scene";
import { creativeFragment, creativeVertex } from "./metal-motion-shaders";

export const HERO_ENTRY_DURATION = 2.31;

const uniformsGLSL = `
uniform float uHeroTime;
uniform float uHeroEntry;
uniform float uHeroScroll;
uniform vec3 uHeroPointer;
`;

export function createHeroMetalMotion(metal: ReturnType<typeof createHeroMetalScene>) {
  const uniforms = {
    uHeroTime: { value: 0 },
    uHeroEntry: { value: 0 },
    uHeroScroll: { value: 0 },
    uHeroPointer: { value: new THREE.Vector3() },
  };
  // Soft reflection cards fitted in sheet coordinates, so highlights follow
  // the folds during motion and keep their scale on portrait screens.
  const referenceReflections = `
    vec3 studioColor = color;
    float reflectionAcross = uSide < .5
      ? mix(vRoll.y, vRoll.x, smoothstep(.24, .28, y)) : vRoll.x;
    if (uSide < .5) {
      color += vec3(0.0360967, 0.0476152, 0.0245012) * bell(reflectionAcross, 0.025, 0.025) * bell(y, 0.090, 0.090);
      color += vec3(0.0042564, 0.0270944, -0.0153687) * bell(reflectionAcross, 0.070, 0.070) * bell(y, 0.160, 0.180);
      color += vec3(-0.0023362, -0.0023362, -0.0022194) * bell(reflectionAcross, 0.110, 0.085) * bell(y, 0.300, 0.120);
      color += vec3(0.0028415, 0.0057298, 0.0002444) * bell(reflectionAcross, 0.140, 0.130) * bell(y, 0.480, 0.150);
      color += vec3(0.0310833, 0.0310833, 0.0295291) * bell(reflectionAcross, 0.015, 0.015) * bell(y, 0.420, 0.100);
      color += vec3(-0.0075854, -0.0073768, -0.0073835) * bell(reflectionAcross, 0.025, 0.030) * bell(y, 0.600, 0.090);
      color += vec3(0.0053155, 0.0141682, -0.0024750) * bell(reflectionAcross, 0.100, 0.090) * bell(y, 0.690, 0.150);
      color += vec3(-0.0005787, -0.0005787, -0.0005498) * bell(reflectionAcross, 0.240, 0.160) * bell(y, 0.700, 0.180);
      color += vec3(-0.0046677, -0.0046677, -0.0044343) * bell(reflectionAcross, 0.040, 0.055) * bell(y, 0.810, 0.120);
      color += vec3(0.0027505, 0.0027505, 0.0026130) * bell(reflectionAcross, 0.120, 0.120) * bell(y, 0.940, 0.140);
      color += vec3(0.0375123, 0.0375123, 0.0356367) * bell(reflectionAcross, -0.025, 0.035) * bell(y, 0.080, 0.130);
      color += vec3(0.0253831, 0.0281660, 0.0217485) * bell(reflectionAcross, -0.015, 0.028) * bell(y, 0.310, 0.140);
      color += vec3(-0.0009630, 0.0017479, -0.0032192) * bell(reflectionAcross, -0.025, 0.040) * bell(y, 0.620, 0.130);
      color += vec3(-0.0141759, -0.0141759, -0.0134671) * bell(reflectionAcross, 0.300, 0.200) * bell(y, 0.350, 0.190);
      color += vec3(-0.0004445, -0.0002118, -0.0006201) * bell(reflectionAcross, 0.300, 0.180) * bell(y, 0.920, 0.150);
    } else {
      color += vec3(0.0458705, 0.0458705, 0.0435770) * bell(reflectionAcross, 0.025, 0.025) * bell(y, 0.090, 0.090);
      color += vec3(-0.0071276, -0.0032203, -0.0100924) * bell(reflectionAcross, 0.070, 0.070) * bell(y, 0.160, 0.180);
      color += vec3(0.0080190, 0.0168596, 0.0001035) * bell(reflectionAcross, 0.110, 0.085) * bell(y, 0.300, 0.120);
      color += vec3(0.0015269, 0.0015269, 0.0014505) * bell(reflectionAcross, 0.140, 0.130) * bell(y, 0.480, 0.150);
      color += vec3(-0.0148520, -0.0144763, -0.0144288) * bell(reflectionAcross, 0.015, 0.015) * bell(y, 0.420, 0.100);
      color += vec3(-0.0074200, 0.0024381, -0.0154284) * bell(reflectionAcross, 0.025, 0.030) * bell(y, 0.600, 0.090);
      color += vec3(-0.0044754, -0.0044754, -0.0042516) * bell(reflectionAcross, 0.100, 0.090) * bell(y, 0.690, 0.150);
      color += vec3(0.0032153, 0.0054496, 0.0011554) * bell(reflectionAcross, 0.240, 0.160) * bell(y, 0.700, 0.180);
      color += vec3(0.0032978, 0.0032978, 0.0031329) * bell(reflectionAcross, 0.040, 0.055) * bell(y, 0.810, 0.120);
      color += vec3(0.1176100, 0.1303822, 0.1008731) * bell(reflectionAcross, 0.120, 0.120) * bell(y, 0.940, 0.140);
      color += vec3(0.0415339, 0.0415339, 0.0394572) * bell(reflectionAcross, -0.025, 0.035) * bell(y, 0.080, 0.130);
      color += vec3(-0.0313349, -0.0313349, -0.0297681) * bell(reflectionAcross, -0.015, 0.028) * bell(y, 0.310, 0.140);
      color += vec3(-0.1060914, -0.1060914, -0.1007869) * bell(reflectionAcross, -0.025, 0.040) * bell(y, 0.620, 0.130);
      color += vec3(-0.0029993, -0.0029993, -0.0028493) * bell(reflectionAcross, 0.300, 0.200) * bell(y, 0.350, 0.190);
      color += vec3(-0.0887082, -0.0887082, -0.0842728) * bell(reflectionAcross, 0.300, 0.180) * bell(y, 0.920, 0.150);
    }
    color = max(mix(studioColor, color, .7), vec3(.0005));
    if (uSide < .5) {
      float upperRim = bell(vRoll.y, -.011, max(fwidth(vRoll.y), .001));
      color += uSilver * upperRim * .16 * (1. - smoothstep(.28, .62, y));
    }
  `;
  metal.materials.forEach((material) => {
    Object.assign(material.uniforms, uniforms, {
      uEntry: { value: 0 }, uLabTime: { value: 0 },
      uMorph: { value: 1 }, uGlow: { value: .65 }, uLight: { value: 1 },
      uShadow: { value: 1 }, uBeamWidth: { value: 1 },
    });
    material.uniforms.uExposure.value = material.uniforms.uSide.value === 0 ? .92 : 1;
    material.vertexShader = uniformsGLSL + creativeVertex(material.vertexShader, 0, 4, .3)
      .replace("return vec3((worldX - 0.5) * uAspect, 0.5 - y, height);", `
        float departure = smoothstep(0.0, .75, uHeroScroll);
        float cursorFold = bell(y, .5 - uHeroPointer.y * .35, .27);
        height += cursorFold * bell(d, .08, .25) * uHeroPointer.z * .008;
        return vec3((worldX - .5) * uAspect + side * departure * .07 * edgeScale * uAspect,
          .5 - y + departure * .035, height - departure * .035);`);
    material.fragmentShader = uniformsGLSL + creativeFragment(material.fragmentShader, 0, 4, .3)
      .replace("vec3 normal = normalize(vNormal + ripple);", `
        vec3 cursorTilt = vec3(uHeroPointer.x * .018, uHeroPointer.y * .012, 0.) * uHeroPointer.z;
        vec3 normal = normalize(vNormal + ripple + cursorTilt);`)
      .replace("vec4 cardShape = uReflectionCards[i];", `
        vec4 cardShape = uReflectionCards[i];
        cardShape.y += (sin(uHeroTime * .32 + float(i) * .63) - sin(float(i) * .63)) * .014
          + uHeroPointer.y * uHeroPointer.z * .025;
        cardShape.x += uHeroPointer.x * uHeroPointer.z * .012;`)
      .replace("color *= uExposure;", `
        float cursorSpot = bell(y, .5 - uHeroPointer.y * .35, .23) * uHeroPointer.z;
        color += reflectedLight * cursorSpot * (halo * .07 + card * .035);
        ${referenceReflections}
        color *= uExposure;`)
      .replace("lipOpacity * mix(", "lipOpacity * (1.0 - smoothstep(.08, .78, uHeroScroll)) * mix(");
  });
  const backdrop = metal.backgroundMaterial;
  const composition = { value: new THREE.Vector4(.5, .39, .26, .15) };
  const cta = { value: new THREE.Vector4(.5, .825, .09, .03) };
  Object.assign(backdrop.uniforms, uniforms, {
    uHeroComposition: composition,
    uHeroCta: cta,
    uSilver: metal.materials[0].uniforms.uSilver,
    uLime: metal.materials[0].uniforms.uLime,
  });
  const [header, body] = backdrop.fragmentShader.split("void main() {");
  // Linear RGB light fields fitted to the supplied 1672 x 941 reference.
  // Broad positive/negative cards reproduce haze and the dark space around copy.
  const atmosphere = `
      vec3 color = vec3(0.0050888, 0.0059508, 0.0051333);
      color += vec3(0.0123211, 0.0156511, 0.0112816) * bell(heroUv.x, 0.260, 0.170) * bell(y, -0.060, 0.240);
      color += vec3(0.0293809, 0.0341301, 0.0315689) * bell(heroUv.x, 0.430, 0.190) * bell(y, -0.040, 0.160);
      color += vec3(-0.0078593, -0.0099106, -0.0076327) * bell(heroUv.x, 0.560, 0.140) * bell(y, 0.060, 0.180);
      color += vec3(-0.0033957, -0.0042360, -0.0028084) * bell(heroUv.x, 0.170, 0.130) * bell(y, 0.200, 0.170);
      color += vec3(0.0012969, 0.0016942, 0.0014549) * bell(heroUv.x, 0.690, 0.150) * bell(y, 0.160, 0.180);
      color += vec3(-0.0044378, -0.0058753, -0.0041322) * bell(heroUv.x, 0.420, 0.130) * bell(y, 0.480, 0.170);
      color += vec3(-0.0036879, -0.0044425, -0.0037885) * bell(heroUv.x, 0.700, 0.150) * bell(y, 0.450, 0.180);
      color += vec3(-0.0014323, -0.0015996, -0.0014468) * bell(heroUv.x, 0.320, 0.150) * bell(y, 0.750, 0.160);
      color += vec3(0.0079224, 0.0154509, 0.0021282) * bell(heroUv.x, uHeroCta.x, max(uHeroCta.z, .08)) * bell(y, uHeroCta.y + .015, .08);
      color += vec3(-0.0024073, -0.0036117, -0.0015744) * bell(heroUv.x, 0.550, 0.150) * bell(y, 0.960, 0.120);
      color += vec3(0.0000687, 0.0001929, 0.0001213) * bell(heroUv.x, 0.780, 0.130) * bell(y, 0.890, 0.180);
      color += vec3(0.0051264, 0.0058310, 0.0056324) * bell(heroUv.x, 0.940, 0.100) * bell(y, 0.940, 0.100);
      color += vec3(0.0021680, 0.0029452, 0.0016576) * bell(heroUv.x, 0.015, 0.060) * bell(y, 0.600, 0.190);
      color += vec3(-0.0041247, -0.0066395, -0.0010642) * bell(heroUv.x, 0.060, 0.120) * bell(y, 0.920, 0.130);
      color += vec3(-0.0002023, -0.0002095, -0.0000412) * bell(heroUv.x, 0.910, 0.130) * bell(y, 0.070, 0.140);
      color = max(color, vec3(.0008));
  `;
  backdrop.fragmentShader = uniformsGLSL + `
    uniform vec4 uHeroComposition;
    uniform vec4 uHeroCta;
    uniform vec3 uSilver;
    uniform vec3 uLime;
  ` + header + "void main() {" + body
    .replaceAll("vUv", "heroUv")
    .replace(/  \/\/ Static studio atmosphere[\s\S]*?(?=  gl_FragColor)/, atmosphere)
    .replace("float y = 1.0 - heroUv.y;", `
      float formed = smoothstep(0., 1., uHeroEntry);
      vec2 drift = vec2(sin(uHeroTime * .3 + vUv.y * 3.) - sin(vUv.y * 3.),
        cos(uHeroTime * .22 + vUv.x * 4.) - cos(vUv.x * 4.));
      vec2 heroUv = vUv + drift * mix(.024, .003, formed)
        + uHeroPointer.xy * uHeroPointer.z * .008 + vec2(0., uHeroScroll * .035);
      float y = 1.0 - heroUv.y;`)
    .replace("gl_FragColor = vec4(color, 1.0);", `
      // The same studio light continues through the negative space. Its focal
      // regions follow the actual letter and button positions on every viewport.
      vec3 reflectedPalette = mix(uSilver, uLime, .55);
      float reflectionDrift = sin(uHeroTime * .32) * .008;
      float mediaBounce = bell(heroUv.x, uHeroComposition.x, uHeroComposition.z * 1.45)
        * bell(y, uHeroComposition.y + reflectionDrift, uHeroComposition.w * 1.35);
      float leftBounce = bell(heroUv.x, .32, .21)
        * bell(y + (heroUv.x - .5) * .27, uHeroComposition.y + .08 + reflectionDrift, .095);
      float rightBounce = bell(heroUv.x, .72, .22)
        * bell(y - (heroUv.x - .5) * .35, uHeroComposition.y + .21 - reflectionDrift, .12);
      float ctaBounce = bell(heroUv.x, uHeroCta.x, max(uHeroCta.z * 1.6, .09))
        * bell(y, uHeroCta.y, max(uHeroCta.w * 3.5, .065));
      color += reflectedPalette * (mediaBounce * .0006 + leftBounce * .0005 + rightBounce * .0004)
        * mix(.35, 1., formed);
      color += mix(uSilver, uLime, .8) * ctaBounce * .0005 * formed;
      float edgeLight = bell(heroUv.x, .05, .3) + bell(heroUv.x, .95, .3);
      color *= mix(.8, 1., formed) * (1. + edgeLight * .045 * (sin(uHeroTime * .4 + y * 4.) - sin(y * 4.)));
      color *= 1. - .72 * smoothstep(.05, .85, uHeroScroll);
      gl_FragColor = vec4(color, 1.0);`);
  return {
    setComposition(mark: THREE.Vector4, button: THREE.Vector4) {
      composition.value.copy(mark);
      cta.value.copy(button);
    },
    update(time: number, entry: number, pointer: THREE.Vector3, scroll: number) {
      uniforms.uHeroTime.value = time;
      uniforms.uHeroEntry.value = entry;
      uniforms.uHeroPointer.value.copy(pointer);
      uniforms.uHeroScroll.value = scroll;
      metal.materials.forEach((material) => {
        material.uniforms.uEntry.value = entry;
        material.uniforms.uLabTime.value = time;
      });
    },
  };
}
