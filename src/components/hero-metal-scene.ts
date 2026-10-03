import * as THREE from "three";
import { backdropFragmentShader, backdropVertexShader, metalFragmentShader, metalVertexShader } from "./novatrix-shader";

const REFERENCE_ASPECT = 1672 / 941;

// Soft studio reflection cards in (roll distance, vertical position) coordinates.
// The third and fourth components are finite Gaussian widths, not screen pixels.
const reflectionCards = [
  [
    [0.559989, -0.061222, 0.015137, 0.05648],
    [0.017773, 0.117544, 0.014397, 0.039877],
    [0.055592, 0.095649, 0.08149, 0.301333],
    [-0.002295, 0.335934, 0.013069, 0.032023],
    [-0.067029, 0.509397, 0.091471, 0.070003],
    [0.050334, 0.568399, 0.028003, 0.025],
    [0.265222, 0.577836, 0.066997, 0.102916],
    [0.159025, 0.303069, 0.044253, 0.278177],
    [0.027009, 0.767751, 0.168844, 0.129883],
    [0.346351, 0.916872, 0.177993, 0.212259],
    [0.115954, 1.148343, 0.084191, 0.116868],
    [0.053022, 0.971653, 0.011715, 0.029874],
    [0.344132, 0.665603, 0.02404, 0.104816],
    [0.241587, 0.868658, 0.077865, 0.061522],
    [-0.019221, 0.553561, 0.021211, 0.04069],
    [0.355625, 0.30931, 0.018237, 0.105266],
    [0.083409, 0.325874, 0.029803, 0.067639],
    [0.181923, 0.573183, 0.05227, 0.068563],
    [0.075998, 0.73695, 0.021924, 0.085667],
    [0.287251, 0.782479, 0.073708, 0.101662],
    [0.014954, 0.420866, 0.014325, 0.071557],
    [0.154273, 0.950309, 0.051971, 0.084419],
    [0.203722, 0.322102, 0.091702, 0.100358],
    [0.220334, 0.653854, 0.068297, 0.073453],
  ],
  [
    [0.031662, 0.05386, 0.009602, 0.195713],
    [0.091261, 0.045628, 0.032994, 0.124015],
    [0.028092, 0.288047, 0.017279, 0.025],
    [0.09266, 0.338821, 0.0232, 0.043868],
    [0.151902, 0.35001, 0.021699, 0.048026],
    [0.007686, 0.366514, 0.03307, 0.032181],
    [-0.015912, 0.703561, 0.01377, 0.051737],
    [-0.000986, 0.767787, 0.017915, 0.126509],
    [-0.029254, 0.664237, 0.194056, 0.067192],
    [0.034486, 0.913967, 0.157979, 0.076646],
    [0.055709, 0.812737, 0.069307, 0.101343],
    [0.182016, 0.408794, 0.052209, 0.132415],
    [0.064104, 0.938665, 0.049892, 0.107151],
    [-0.089187, 0.827677, 0.030113, 0.050815],
    [0.016793, 0.576763, 0.02886, 0.040244],
    [0.031182, 0.909609, 0.017346, 0.070217],
    [0.052964, 0.141233, 0.015282, 0.099572],
    [0.40908, 0.410901, 0.104853, 0.059291],
    [0.121426, 0.556986, 0.017913, 0.05154],
    [-0.036112, 0.439909, 0.009699, 0.077293],
    [0.141544, 0.597109, 0.007542, 0.039913],
    [0.227143, 0.641226, 0.071977, 0.135533],
    [0.008757, 0.964513, 0.078585, 0.051357],
    [0.280082, 0.979957, 0.099959, 0.09999],
  ],
];
// Each weight is [shadow attenuation, silver radiance, lime radiance].
const reflectionWeights = [
  [
    [0.733319, 0.243863, 0.130265],
    [7.41498, 0.8, 0.286023],
    [5.917178, 0.02719, 0.006582],
    [0.0, 0.25904, 0.786214],
    [6.975666, 0.031799, 0.000466],
    [0.498077, 0.44046, 0.743152],
    [1.567586, 0.013081, 0.000159],
    [5.005435, 0.020096, 0.001674],
    [3.180764, 0.013075, 0.000214],
    [2.109407, 0.005615, 0.000255],
    [0.19906, 0.137647, 2.1e-05],
    [2.496913, 0.017237, 0.001375],
    [0.770069, 0.015682, 7e-06],
    [0.001354, 0.014408, 0.011749],
    [7.163339, 0.220782, 0.167454],
    [0.018488, 0.009895, 0.004728],
    [0.004747, 0.10806, 0.009701],
    [0.062632, 0.002082, 0.011509],
    [0.00056, 0.006414, 0.003091],
    [3.628836, 0.000469, 0.000124],
    [5e-06, 0.063496, 0.065818],
    [1.010851, 0.003543, 9.6e-05],
    [2.932515, 0.074984, 0.003239],
    [0.116953, 0.001324, 0.001879],
  ],
  [
    [2.98679, 0.050043, 0.025395],
    [3.298652, 0.010774, 0.0],
    [0.0, 0.276538, 0.297012],
    [1.883824, 0.000442, 0.016852],
    [0.947345, 0.063184, 0.03494],
    [4.652652, 0.040875, 0.009066],
    [3.39875, 0.694786, 0.359055],
    [5.993369, 0.015755, 0.042228],
    [2.292502, 0.008895, 0.0],
    [5.709736, 0.0, 0.004668],
    [4.140962, 0.000509, 0.0],
    [3.444853, 0.013454, 0.0],
    [0.370288, 0.248387, 0.0],
    [0.028433, 0.225914, 0.698219],
    [4.532063, 0.012193, 5e-05],
    [0.159219, 0.765251, 0.220172],
    [2.151166, 0.013146, 0.007118],
    [0.082703, 0.028356, 0.009211],
    [0.152048, 0.033201, 0.011656],
    [0.148081, 0.000903, 0.021968],
    [0.16992, 0.092055, 0.00713],
    [1.393929, 0.00094, 0.0],
    [0.173254, 0.637495, 0.421124],
    [0.100338, 0.003287, 0.000984],
  ],
];

type LightAnchors = [number, number][];

function cubic(points: THREE.Vector4, t: number) {
  const s = 1 - t;
  return s * s * s * points.x + 3 * s * s * t * points.y + 3 * s * t * t * points.z + t * t * t * points.w;
}
function catmull(points: number[], position: number) {
  const index = Math.min(Math.max(Math.floor(position), 0), points.length - 2);
  const t = position - index;
  const a = points[Math.max(index - 1, 0)], b = points[index];
  const c = points[index + 1], d = points[Math.min(index + 2, points.length - 1)];
  return 0.5 * (2*b + (-a+c)*t + (2*a-5*b+4*c-d)*t*t + (-a+3*b-3*c+d)*t*t*t);
}

function bell(value: number, center: number, width: number) {
  return Math.exp(-(((value - center) / width) ** 2));
}

/** Place each procedural softbox so its reflection passes through its reference anchor. */
export function calibrateMetalLights(material: THREE.ShaderMaterial, anchors: LightAnchors) {
  const u = material.uniforms;
  const side = u.uSide.value as number;
  const aspect = u.uAspect.value as number;
  const scale = Math.min(1, aspect / 1.777);
  const profile = u.uProfile.value as THREE.Vector4;
  function height(x: number, y: number) {
    let crease: number;
    if (side === 0) {
      const points = u.uLeftCrease.value as number[];
      crease = y < 0.28 ? points[0] + (y - 0.28) * (points[1] - points[0]) / 0.18
        : catmull(points, (y - 0.28) / 0.09);
    } else {
      crease = catmull(u.uRightCrease.value, y * 10);
    }
    const d = (x - crease) * 1.777 * (side === 0 ? -1 : 1);
    const width = profile.x + profile.y * bell(y, 0.55, 0.3);
    const upperFold = (cubic(u.uLeftContour.value, y) - x - 0.008) * 1.777;
    const upperHeight = side === 0 ? 0.035 * Math.atan(upperFold / 0.035) * (1 - THREE.MathUtils.smoothstep(y, 0.35, 0.65)) : 0;
    return upperHeight + profile.z * Math.atan(d / width) + profile.w * Math.atan((d - 0.15) / 0.12)
      + 0.008 * Math.sin(d * 10 + y * 3) * bell(d, 0.15, 0.3);
  }
  for (const [index, [x, y]] of anchors.entries()) {
    const e = 0.0001;
    const dx = (height(x + e, y) - height(x - e, y)) / (2 * e * aspect * scale);
    const dy = (height(x, y + e) - height(x, y - e)) / (2 * e);
    const normal = new THREE.Vector3(-dx, dy, 1).normalize();
    const reflected = new THREE.Vector3(0, 0, -1).reflect(normal);
    const screenX = side === 0 ? x * scale : 1 - (1 - x) * scale;
    const point = new THREE.Vector3((screenX - 0.5) * aspect, 0.5 - y, height(x, y));
    u[`uLamp${index + 1}`].value.copy(point).addScaledVector(reflected, 0.8);
    u[`uLampAxis${index + 1}`].value.copy(reflected);
  }
}

/** The fixed pose is calibrated at logical time 12.5, in a 1672 x 941 viewport. */
export function createHeroMetalScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 0.5, -0.5, 0.1, 10);
  camera.position.z = 3;
  const clock = { value: 12.5 };
  const aspect = { value: REFERENCE_ASPECT };
  const geometry = new THREE.PlaneGeometry(1, 1, 64, 160);
  const backgroundGeometry = new THREE.PlaneGeometry(2, 2);
  const backgroundMaterial = new THREE.ShaderMaterial({
    vertexShader: backdropVertexShader, fragmentShader: backdropFragmentShader,
    depthTest: false, depthWrite: false, toneMapped: false,
  });
  const backdrop = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
  backdrop.frustumCulled = false;
  backdrop.renderOrder = -1;
  scene.add(backdrop);

  const anchors: LightAnchors[] = [
    [[0, 0.09125], [0.261, 0.93], [0.001, 0.29], [0.092, 0.61], [0.109, 0.57375], [0.025, 0.735]],
    [[0.878, 0.305], [0.863, 0.645], [0.983, 0.0625], [1.03, 0.88125], [0.951, 0.37125], [0.942, 0.75375]],
  ];
  const profiles = [
    new THREE.Vector4(0.03, 0.089, 0.12, 0.12),
    new THREE.Vector4(0.01, 0.004, 0.011, 0.043),
  ];
  const strengths = [
    new THREE.Vector4(1.335, 0.84, 0.575, 0.315),
    new THREE.Vector4(1.115, 0.305, 0.715, 1.485),
  ];
  const widths = [
    new THREE.Vector4(0.083125, 0.074375, 0.042, 0.051875),
    new THREE.Vector4(0.084375, 0.244375, 0.220625, 0.083125),
  ];
  const stretches = [
    new THREE.Vector4(0.25, 1.475, 1.7125, 1.3625),
    new THREE.Vector4(1.2125, 1.5625, 1.4875, 1.6625),
  ];
  const fillStrengths = [
    new THREE.Vector2(0.33, 0.06),
    new THREE.Vector2(0.024, 0.08),
  ];
  const fillWidths = [
    new THREE.Vector2(0.025, 0.065625),
    new THREE.Vector2(0.29375, 0.059375),
  ];
  const fillStretches = [
    new THREE.Vector2(2.3125, 1.6875),
    new THREE.Vector2(0.9625, 3.8875),
  ];
  const materials = [0, 1].map((side) => new THREE.ShaderMaterial({
    vertexShader: metalVertexShader,
    fragmentShader: metalFragmentShader,
    uniforms: {
      uTime: clock,
      uAspect: aspect,
      uSide: { value: side },
      uLeftContour: { value: new THREE.Vector4(0, 0.075, 0.282, 0.318) },
      uLeftCrease: { value: [0.0018, 0.02392, 0.06579, 0.12141, 0.17644, 0.22548, 0.26256, 0.29187, 0.317] },
      uRightCrease: { value: [1.01, 0.951, 0.905, 0.866, 0.834, 0.824, 0.849, 0.902, 0.954, 1.013, 1.075] },
      uRightTop: { value: new THREE.Vector4(1.005, 0.90, 0.823, 0.824) },
      uRightBottom: { value: new THREE.Vector4(0.824, 0.825, 0.925, 0.99) },
      uProfile: { value: profiles[side] },
      uGraphite: { value: new THREE.Color("#151a16") },
      uSilver: { value: new THREE.Color("#e6eae2") },
      uLime: { value: new THREE.Color("#b8ef55") },
      uLightStrength: { value: strengths[side] },
      uLightWidth: { value: widths[side] },
      uLightStretch: { value: stretches[side] },
      uFillStretch: { value: fillStretches[side] },
      uLamp1: { value: new THREE.Vector3() },
      uLamp2: { value: new THREE.Vector3() },
      uLamp3: { value: new THREE.Vector3() },
      uLamp4: { value: new THREE.Vector3() },
      uLamp5: { value: new THREE.Vector3() },
      uLamp6: { value: new THREE.Vector3() },
      uLampAxis1: { value: new THREE.Vector3() },
      uLampAxis2: { value: new THREE.Vector3() },
      uLampAxis3: { value: new THREE.Vector3() },
      uLampAxis4: { value: new THREE.Vector3() },
      uLampAxis5: { value: new THREE.Vector3() },
      uLampAxis6: { value: new THREE.Vector3() },
      uFillStrength: { value: fillStrengths[side] },
      uFillTint: { value: side === 0 ? new THREE.Vector2(0, 0.8) : new THREE.Vector2(0.8, 0) },
      uFillWidth: { value: fillWidths[side] },
      uExposure: { value: 1 },
      uReflectionCards: { value: reflectionCards[side].map((card) => new THREE.Vector4().fromArray(card)) },
      uReflectionWeights: { value: reflectionWeights[side].map((weights) => new THREE.Vector3().fromArray(weights)) },
      uRimEnergy: { value: side === 0 ? [1, 1, 1, 3.8, 4.5, 0.8, 1.5, 0.5, 2.7, 0.6, 1]
        : [2.5, 2.5, 1, 0.8, 1, 1.3, 0.8, 1.4, 1, 1, 1] },
    },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    forceSinglePass: true,
    toneMapped: false,
  }));
  const sheets: THREE.Mesh[] = [];
  for (const [index, material] of materials.entries()) {
    calibrateMetalLights(material, anchors[index]);
    const sheet = new THREE.Mesh(geometry, material);
    sheet.frustumCulled = false;
    scene.add(sheet);
    sheets.push(sheet);
  }
  return {
    scene,
    camera,
    clock,
    materials,
    backgroundMaterial,
    anchors,
    resize(width: number, height: number, preserveShape = false) {
      const viewportAspect = width / Math.max(height, 1);
      // Keep geometry and lighting in the calibrated reference coordinates.
      // Only the uniform mesh scale and edge placement adapt to the viewport.
      aspect.value = preserveShape ? REFERENCE_ASPECT : viewportAspect;
      const portrait = preserveShape && height > width;
      const scale = portrait ? Math.max(viewportAspect, 1 / REFERENCE_ASPECT) : 1;
      sheets.forEach((sheet, index) => {
        sheet.scale.setScalar(scale);
        // Rotate the reference composition into portrait and cover the viewport.
        // The folds frame the content vertically without stretching either axis.
        sheet.rotation.z = portrait ? Math.PI / 2 : 0;
        sheet.position.x = preserveShape && !portrait
          ? (index === 0 ? -1 : 1) * (viewportAspect - REFERENCE_ASPECT * scale) / 2
          : 0;
        // Anchor each rotated fold to its own viewport edge instead of letting
        // a wider portrait screen push both folds out of the composition.
        sheet.position.y = portrait
          ? (index === 0 ? -1 : 1) * (1 - REFERENCE_ASPECT * scale) / 2
          : 0;
      });
      camera.left = -viewportAspect / 2;
      camera.right = viewportAspect / 2;
      camera.updateProjectionMatrix();
      materials.forEach((material, index) => calibrateMetalLights(material, anchors[index]));
    },
    dispose() {
      geometry.dispose();
      backgroundGeometry.dispose();
      backgroundMaterial.dispose();
      for (const material of materials) material.dispose();
    },
  };
}
