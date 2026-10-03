// Surface coordinates: y runs top to bottom; d is distance across the fold.
// All displacement is evaluated by surface(), including its normal samples.
// Studio colors and calibrated light anchors stay unchanged.
const shapePatterns = [
  `float bend = sin(t * 0.3) * 0.004;
   float depthChange = sin(t * 0.25) * 0.007;`,
  `float bend = sin(t * 0.3 + y * 2.0) * 0.005;
   float depthChange = sin(t * 0.3) * 0.014;`,
  `float anchorMask = sin(clamp(y, 0.0, 1.0) * 3.14159265);
   float bend = sin(t * 0.3) * anchorMask * 0.005;
   float depthChange = sin(t * 0.3) * anchorMask * 0.008;`,
  `float bend = sin(t * 0.35) * (y - 0.5) * 0.023;
   float depthChange = sin(t * 0.35) * (y - 0.5) * 0.045;`,
  `float cycle = mod(t, 9.0);
   float packet = bell(y, -0.35 + cycle * 0.44, 0.16) * (1.0 - smoothstep(3.3, 4.0, cycle));
   float bend = packet * 0.018;
   float depthChange = packet * 0.034;`,
  `float rollShift = sin(t * 0.28) * bell(y, 0.55, 0.4) * 0.015;
   crease += side * rollShift * uMorph;
   float bend = 0.0;
   float depthChange = sin(t * 0.28) * 0.012;`,
];

const entrances = [
  `float alignment = (1.0 - settled) * 0.19;
   x += side * alignment; crease += side * alignment;
   float entryDepth = (1.0 - settled) * 0.06;`,
  `float hinge = (1.0 - settled) * bell(y, 0.5, 0.45);
   crease += side * hinge * 0.055;
   x += side * hinge * 0.025;
   float entryDepth = hinge * 0.09;`,
  `float sag = (1.0 - settled) * anchorMask;
   x += side * sag * 0.055; crease += side * sag * 0.055;
   float entryDepth = sag * 0.085;`,
  `float twist = (1.0 - settled) * (y - 0.5);
   x += side * twist * 0.13; crease += side * twist * 0.13;
   float entryDepth = twist * 0.14;`,
  `float formed = smoothstep(y - 0.12, y + 0.12, uEntry * 1.4 - 0.2);
   x += side * (1.0 - formed) * 0.075; crease += side * (1.0 - formed) * 0.075;
   float entryDepth = bell(y, uEntry * 1.4 - 0.2, 0.14) * 0.06;`,
  `float travelingRoll = (1.0 - settled) * bell(y, 0.55, 0.4);
   crease += side * travelingRoll * 0.095;
   float entryDepth = travelingRoll * 0.035;`,
];

const beams = [
  `float entryBeam = bell(y, uEntry * 1.4 - 0.2, 0.07 * uBeamWidth) * (1.0 - smoothstep(0.88, 1.0, uEntry));
   float beam = entryBeam + bell(y, 0.5 + 0.22 * sin(t * 0.22), 0.22 * uBeamWidth) * 0.25;`,
  `float entryBeam = bell(y, uEntry * 1.3 - 0.15, 0.055 * uBeamWidth) * (1.0 - smoothstep(0.9, 1.0, uEntry));
   float cycle = mod(t, 10.0);
   float beam = entryBeam + bell(y, -0.25 + cycle * 0.32, 0.06 * uBeamWidth) * (1.0 - smoothstep(4.0, 5.0, cycle));`,
  `float entryBeam = 0.0;
   float beam = bell(y, 0.5 + sin(t * 0.3) * 0.12, (0.12 + (1.0 - uEntry) * 0.12) * uBeamWidth);`,
  `float entryBeam = 0.0;
   float beam = bell(y, 0.5 + sin(t * 0.35 + uSide * 3.14159) * 0.3, 0.13 * uBeamWidth);`,
  `float entryBeam = bell(y, uEntry * 1.4 - 0.2, 0.075 * uBeamWidth) * (1.0 - smoothstep(0.9, 1.0, uEntry));
   float cycle = mod(t, 9.0);
   float beam = entryBeam + bell(y, -0.35 + cycle * 0.44, 0.09 * uBeamWidth) * (1.0 - smoothstep(3.3, 4.0, cycle));`,
  `float entryBeam = bell(y, uEntry * 1.4 - 0.2, 0.2 * uBeamWidth) * (1.0 - smoothstep(0.9, 1.0, uEntry));
   float beam = entryBeam + bell(y, 0.5 + sin(t * 0.32 + uSide * 1.5) * 0.38, 0.22 * uBeamWidth);`,
];

const visibility = [
  "smoothstep(0.0, 0.2, uEntry)",
  "smoothstep(0.0, 0.2, uEntry)",
  "smoothstep(0.0, 0.25, uEntry)",
  "smoothstep(0.0, 0.25, uEntry)",
  "smoothstep(y - 0.12, y + 0.12, uEntry * 1.4 - 0.2)",
  "smoothstep(0.0, 0.2, uEntry)",
];

export function creativeVertex(shader: string, variant: number, secondary?: number, weight = .3) {
  const profiles = [.1, -.6, .65, .1, .25, .2];
  const profile = secondary === undefined ? profiles[variant] : profiles[variant] * (1-weight) + profiles[secondary] * weight;
  const pattern = secondary === undefined ? shapePatterns[variant] : `
    float bend, depthChange;
    { ${shapePatterns[variant]} primaryBend = bend; primaryDepth = depthChange; }
    { ${shapePatterns[secondary]} secondaryBend = bend; secondaryDepth = depthChange; }
    bend = mix(primaryBend, secondaryBend, ${weight});
    depthChange = mix(primaryDepth, secondaryDepth, ${weight});
  `;
  const entrance = secondary === undefined ? entrances[variant] : `
    float originX = x, originCrease = crease;
    float primaryX, primaryCrease, primaryEntryDepth, secondaryEntryDepth;
    { ${entrances[variant]} primaryX = x; primaryCrease = crease; primaryEntryDepth = entryDepth; }
    x = originX; crease = originCrease;
    { ${entrances[secondary]} secondaryEntryDepth = entryDepth; }
    x = mix(primaryX, x, ${weight});
    crease = mix(primaryCrease, crease, ${weight});
    float entryDepth = mix(primaryEntryDepth, secondaryEntryDepth, ${weight});
  `;
  return `uniform float uLabTime;\nuniform float uMorph;\nuniform float uEntry;\n${shader}`
    .replace("float phase = uTime - 12.5;", "float phase = 0.0;")
    .replace("novatrix(q, uTime)", "novatrix(q, 12.5)")
    .replace("x += drift;", `
      float t = uLabTime;
      float side = mix(-1.0, 1.0, step(0.5, uSide));
      float settled = 1.0 - pow(1.0 - smoothstep(0.15, 0.85, uEntry), 3.0);
      ${secondary === undefined ? "" : "float primaryBend, primaryDepth, secondaryBend, secondaryDepth;"}
      ${pattern}
      x += drift + bend * uMorph;
      crease += bend * uMorph;
      ${entrance}
    `)
    .replace("float width = uProfile.x + uProfile.y * bell(y, 0.55, 0.3);", `
      float width = uProfile.x + uProfile.y * bell(y, 0.55, 0.3);
      width *= 1.0 + ${profile} * (1.0 - settled);
    `)
    .replace("float height = uProfile.z * atan(d / width);", `
      float height = uProfile.z * atan(d / width);
      height += depthChange * uMorph * bell(d, 0.05, 0.32);
      height += entryDepth * atan(d / 0.08);
    `);
}

export function creativeFragment(shader: string, variant: number, secondary?: number, weight = .3) {
  const shadow = (index: number) => `bell(y, ${index === 1 ? "uEntry < 0.95 ? uEntry * 1.3 - 0.24 : 0.5 + sin(t * 0.32) * 0.3" : index === 4 ? "-0.45 + mod(t, 9.0) * 0.44" : "0.5 + 0.3 * sin(t * 0.32 + uSide * 1.2 + 0.65)"}, 0.18)`;
  const darkCard = secondary === undefined ? shadow(variant) : `mix(${shadow(variant)}, ${shadow(secondary)}, ${weight})`;
  const coverage = secondary === undefined ? visibility[variant] : `mix(${visibility[variant]}, ${visibility[secondary]}, ${weight})`;
  const beamPattern = secondary === undefined ? beams[variant] : `
    float primaryBeam, secondaryBeam, primaryEntry, secondaryEntry;
    { ${beams[variant]} primaryBeam = beam; primaryEntry = entryBeam; }
    { ${beams[secondary]} secondaryBeam = beam; secondaryEntry = entryBeam; }
    float beam = mix(primaryBeam, secondaryBeam, ${weight});
    float entryBeam = mix(primaryEntry, secondaryEntry, ${weight});
  `;
  return `uniform float uEntry;\nuniform float uLabTime;\nuniform float uGlow;\nuniform float uLight;\nuniform float uShadow;\nuniform float uBeamWidth;\n${shader}`
    .replace("float movement = sin(phase * 0.34) * 0.02;", `float movement = sin(uLabTime * ${variant === 5 ? "0.32" : "0.3"} + uSide * 1.2) * ${variant === 5 ? "0.07" : "0.025"};`)
    .replace("color *= 1.0 - trough * troughMask * 0.38;", "color *= max(0.08, 1.0 - trough * troughMask * 0.38 * uShadow);")
    .replace("color *= mix(1.0, foldedShadow, smoothstep(0.48, 0.65, y));", "color *= max(0.08, 1.0 - (1.0 - foldedShadow) * smoothstep(0.48, 0.65, y) * uShadow);")
    .replace("color *= uExposure;", `
      float t = uLabTime;
      ${beamPattern}
      float darkCard = ${darkCard} * bell(vRoll.x, 0.05, 0.15);
      color *= max(0.1, 1.0 - darkCard * uShadow * ${variant === 5 ? "0.45" : "0.22"});
      vec3 reflectedLight = mix(uSilver, uLime, clamp(green * 0.7, 0.0, 1.0));
      color *= 0.7 + 0.3 * uLight;
      color += reflectedLight * beam * (uLight * (card * 0.4 + halo * 0.8)
        + uGlow * (shoulder * 0.4 + bell(vRoll.x, 0.012, 0.045 * uBeamWidth) * 0.055));
      color *= uExposure;
    `)
    .replace("gl_FragColor = vec4(color, lipOpacity);", `gl_FragColor = vec4(color, lipOpacity * ${coverage});`);
}
