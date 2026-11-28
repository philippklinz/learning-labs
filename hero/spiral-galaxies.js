import * as THREE from '../vendor/three/three.module.min.js';

// The winding, inclination and colours describe the same two disks as the static atlas.
export const galaxyProfiles = [
  { arms: 2, winding: 2.45, axisRatio: .58, roll: 19, degreesPerSecond: 1, depth: -1.2,
    seed: 9723, stars: 6300, gas: [.40,.90,1], bulge: [1,.76,.49] },
  { arms: 3, winding: 2.05, axisRatio: .29, roll: -24, degreesPerSecond: .5, depth: 2.5,
    seed: 3810, stars: 4200, gas: [.42,.76,.98], bulge: [.82,.92,.97] }
];

const gasVertex = `
  varying vec2 diskPoint;
  void main() {
    diskPoint = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gasFragment = `
  uniform float arms, winding, reveal;
  uniform vec3 gas, bulge;
  varying vec2 diskPoint;
  float hash(vec2 p) {
    vec3 h = fract(vec3(p.xyx) * .1031);
    h += dot(h, h.yzx + 33.33);
    return fract((h.x + h.y) * h.z);
  }
  float grain(vec2 p) {
    vec2 i = floor(p), f = smoothstep(vec2(0.0), vec2(1.0), fract(p));
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
               mix(hash(i + vec2(0,1)), hash(i + 1.0), f.x), f.y) * 2.0 - 1.0;
  }
  float square(float x) { return x * x; }
  void main() {
    float r = length(diskPoint);
    float theta = atan(-diskPoint.y, diskPoint.x + .000001);
    float phase = arms * (theta - winding * log(1.0 + 10.0 * r)
                          + .10 * sin(theta + 2.0*r) + .06 * sin(3.0*theta - 3.0*r));
    float ridge = sin(.5 * phase) / .34;
    float lane = sin(.5 * (phase + .72)) / .21;
    float edge = pow(clamp((1.1 - r) / .35, 0.0, 1.0), 1.7);
    float dust = 1.0 - .69 * exp(-lane*lane - square((r-.29)/.40));
    float knots = .76 + .37*grain(diskPoint*29.0) + .25*grain(diskPoint*88.0);
    float wisps = exp(-ridge*ridge - square((r-.37)/.39)) * knots;
    float disk = exp(-3.15*r) * (.37 + .14*cos(phase));
    float halo = exp(-4.7*length(diskPoint * vec2(1,.7)));
    float core = exp(-length(diskPoint / vec2(.155,.21)));
    vec3 light = edge * (vec3(.20,.20,.21)*halo + dust*(bulge*disk + .68*gas*wisps))
               + 2.3*bulge*core*dust;
    light *= 1.0 - smoothstep(.94, 1.16, r);
    vec3 emission = 1.0 - exp(-light);
    float alpha = max(emission.r, max(emission.g, emission.b));
    gl_FragColor = vec4(emission / max(alpha, .0001), reveal * alpha);
  }
`;

// The luminous nucleus has a round silhouette even when the dust disk is seen edge-on.
const nucleusVertex = `
  varying vec3 surfaceNormal, toEye;
  void main() {
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    surfaceNormal = normalMatrix * normal;
    toEye = -p.xyz;
    gl_Position = projectionMatrix * p;
  }
`;
const nucleusFragment = `
  uniform float reveal;
  varying vec3 surfaceNormal, toEye;
  void main() {
    float facing = clamp(dot(normalize(surfaceNormal), normalize(toEye)), 0.0, 1.0);
    float radiusSquared = 1.0 - facing * facing;
    float glow = exp(-7.6 * radiusSquared) * (1.0 - smoothstep(.72, 1.0, radiusSquared));
    vec3 light = 1.0 - exp(-vec3(1.95, 1.89, 1.68) * glow);
    gl_FragColor = vec4(light / max(light.r, .0001), reveal * light.r);
  }
`;

const clusterVertex = `
  attribute float diameter;
  uniform float bufferHeight;
  uniform vec3 gas, bulge;
  varying vec3 tint;
  varying float coverage;
  void main() {
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
    float pixels = diameter * length(modelViewMatrix[0].xyz) * projectionMatrix[1][1]
                   * (.5 * bufferHeight) / max(.001, -p.z);
    gl_PointSize = clamp(pixels, 1.0, 14.0);
    coverage = min(1.0, pixels * pixels);
    tint = mix(mix(bulge, vec3(1), .45), mix(gas, vec3(1), .48), smoothstep(.04,.45,length(position.xy)));
  }
`;
const clusterFragment = `
  uniform float reveal;
  varying vec3 tint;
  varying float coverage;
  void main() {
    vec2 p = 2.0 * gl_PointCoord - 1.0;
    float rr = dot(p,p);
    float light = exp(-3.8*rr) * (1.0 - smoothstep(.55, 1.0, rr));
    gl_FragColor = vec4(tint, .78 * reveal * coverage * light);
  }
`;

function clusters(profile) {
  let seed = profile.seed;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function normal() {
    return Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  }
  const positions = new Float32Array(profile.stars * 3);
  const diameters = new Float32Array(profile.stars);
  for (let i = 0; i < profile.stars; i++) {
    const inBulge = i % 8 === 0;
    const radius = inBulge ? .115 * Math.sqrt(-2 * Math.log(1 - random())) :
      .025 + 1.06 * Math.pow(1 - Math.pow(random(), .4), .7);
    let angle = random() * Math.PI * 2;
    if (!inBulge && i % 4 !== 0) {
      const arm = Math.floor(random() * profile.arms);
      angle = profile.winding * Math.log1p(10 * radius)
        + arm * 2 * Math.PI / profile.arms + normal() * (.12 + .08 * radius);
    }
    positions[3 * i] = radius * Math.cos(angle);
    positions[3 * i + 1] = -radius * Math.sin(angle);
    // A thicker stellar bulge and a thin arm population give an edge-on view real depth.
    positions[3 * i + 2] = normal() * (inBulge ? .068 : .009 + .018 * Math.exp(-3 * radius));
    diameters[i] = .004 + .024 * Math.pow(random(), 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('diameter', new THREE.BufferAttribute(diameters, 1));
  return geometry;
}

export function createSpiralGalaxy(profile) {
  const group = new THREE.Group();
  const disk = new THREE.Group();
  group.add(disk);
  const reveal = { value: 0 };
  const gas = { value: new THREE.Vector3(...profile.gas) };
  const bulge = { value: new THREE.Vector3(...profile.bulge) };
  const gasDisk = new THREE.Mesh(new THREE.CircleGeometry(1.16, 96), new THREE.ShaderMaterial({
    uniforms: { reveal, gas, bulge, arms: { value: profile.arms }, winding: { value: profile.winding } },
    vertexShader: gasVertex, fragmentShader: gasFragment,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true
  }));
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(.13, 24, 16), new THREE.ShaderMaterial({
    uniforms: { reveal }, vertexShader: nucleusVertex, fragmentShader: nucleusFragment,
    transparent: true, depthWrite: false
  }));
  const bufferHeight = { value: 1 };
  const stars = new THREE.Points(clusters(profile), new THREE.ShaderMaterial({
    uniforms: { reveal, gas, bulge, bufferHeight },
    vertexShader: clusterVertex, fragmentShader: clusterFragment,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  gasDisk.renderOrder = 3;
  nucleus.renderOrder = 4;
  stars.renderOrder = 5;
  disk.add(gasDisk, nucleus, stars);
  const angularSpeed = THREE.MathUtils.degToRad(profile.degreesPerSecond) / 1000;
  return {
    group,
    place(view, rect, drawingBufferHeight) {
      group.position.copy(view.point(rect.x + rect.width / 2, rect.y + rect.height / 2, profile.depth));
      group.scale.setScalar(rect.width * view.unitsPerPixel(profile.depth) / 2.35);
      group.quaternion.copy(view.camera.quaternion);
      group.rotateZ(THREE.MathUtils.degToRad(profile.roll));
      group.rotateX(Math.acos(profile.axisRatio));
      bufferHeight.value = drawingBufferHeight;
    },
    update(timeFromReference, opacity) {
      group.visible = opacity > 0;
      reveal.value = opacity;
      disk.rotation.z = (angularSpeed * timeFromReference) % (2 * Math.PI);
    },
    dispose() {
      for (const child of disk.children) {
        child.geometry.dispose();
        child.material.dispose();
      }
    }
  };
}
