import * as THREE from '../vendor/three/three.module.min.js';

const turn = 2 * Math.PI;

function randomSequence(seed) {
  return () => {
    seed = seed * 16807 % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function crystalGeometry() {
  const vertices = [];
  const ring = (radius, y, tilt = 0) => Array.from({ length: 6 }, (_, index) => {
    const angle = turn * index / 6;
    return [radius * Math.cos(angle), y + tilt * Math.cos(angle - 0.7), radius * Math.sin(angle)];
  });
  const base = ring(0.65, 0);
  const foot = ring(1, 0.17);
  const crown = ring(1.02, 0.77, 0.045);
  const tip = [0.13, 1.04, -0.09];
  const face = (a, b, c) => vertices.push(...a, ...b, ...c);
  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6;
    for (const [lower, upper] of [[base, foot], [foot, crown]]) {
      face(lower[i], upper[i], upper[j]);
      face(lower[i], upper[j], lower[j]);
    }
    face(crown[i], tip, crown[j]);
    face([0, 0, 0], base[i], base[j]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createCrystal() {
  const group = new THREE.Group();
  const geometry = crystalGeometry();
  const edges = new THREE.EdgesGeometry(geometry, 19);
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xc0f3e6, transparent: true, opacity: 0.28 });
  const mineral = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 localPoint, facetNormal, toEye, insideRay;
      varying float crystalTint;
      void main() {
        localPoint = position;
        vec4 view = modelViewMatrix * vec4(position, 1.0);
        facetNormal = normalMatrix * normal;
        toEye = -view.xyz;
        insideRay = inverse(mat3(modelViewMatrix)) * refract(normalize(view.xyz), normalize(facetNormal), 0.66);
        crystalTint = fract(dot(modelMatrix[3].xz, vec2(12.9, 57.3)));
        gl_Position = projectionMatrix * view;
      }`,
    fragmentShader: `
      varying vec3 localPoint, facetNormal, toEye, insideRay;
      varying float crystalTint;
      // Trace to the back facets of a hexagonal prism to reveal the mineral's interior.
      void intersectFacet(vec3 n, float limit, vec3 ray, float id, inout vec3 hit) {
        float incidence = dot(n, ray);
        if (incidence < 0.001) return;
        float t = (limit - dot(n, localPoint)) / incidence;
        if (t < 0.002) return;
        if (t < hit.x) hit = vec3(t, hit.x, id);
        else hit.y = min(hit.y, t);
      }
      void main() {
        vec3 n = normalize(facetNormal), v = normalize(toEye);
        vec3 ray = normalize(insideRay), hit = vec3(9.0, 10.0, 0.0);
        for (int i = 0; i < 6; i++) {
          float a = (float(i) + 0.5) * 1.047198;
          vec3 sideNormal = vec3(cos(a), 0.0, sin(a));
          intersectFacet(sideNormal, 0.895, ray, float(i), hit);
          intersectFacet(sideNormal + vec3(0.0, 3.35, 0.0), 3.49, ray, float(i + 6), hit);
        }
        intersectFacet(vec3(0.0, -1.0, 0.0), 0.0, ray, 12.0, hit);
        vec3 inside = localPoint + ray * min(hit.x, 2.0);
        vec3 reflection = reflect(-v, n);
        vec3 light = normalize(vec3(-0.55, 0.78, 0.75));
        float side = 0.5 + 0.5 * dot(n, light);
        float height = smoothstep(0.02, 0.94, localPoint.y);
        vec3 color = mix(vec3(0.035, 0.13, 0.17), vec3(0.44, 0.78, 0.73), side * side);
        float backlight = 0.52 + 0.48*cos(hit.z * 2.25 + crystalTint);
        color += vec3(0.10, 0.20, 0.17) * backlight * exp(-0.7*hit.x);
        color *= mix(0.54, 1.10, height);
        float seam = exp(-19.0 * (hit.y - hit.x));
        float striation = sin(92.0*inside.y + 3.0*inside.x + 0.7*sin(19.0*inside.y));
        color += vec3(0.14, 0.21, 0.18)*seam + 0.009*striation;
        color += crystalTint * vec3(0.045, 0.016, 0.002);
        float rim = pow(1.0 - max(0.0, dot(n, v)), 3.0);
        float gleam = pow(max(0.0, dot(reflection, normalize(vec3(0.15, 0.80, 0.65)))), 14.0);
        color += rim * vec3(0.17, 0.34, 0.31) + gleam * vec3(0.65, 0.65, 0.52);
        gl_FragColor = vec4(color, 1.0);
      }`
  });
  // Each prism is anchored at its base, so new tips grow outwards from the seed.
  const stalks = [];
  const up = new THREE.Vector3(0, 1, 0);
  function prism(x, z, leanX, leanZ, length, radius, twist, delay) {
    const mesh = new THREE.Mesh(geometry, mineral);
    mesh.add(new THREE.LineSegments(edges, edgeMaterial));
    mesh.position.set(x, -1.13, z);
    mesh.quaternion.setFromUnitVectors(up, new THREE.Vector3(leanX, 1, leanZ).normalize());
    mesh.rotateY(twist);
    group.add(mesh);
    stalks.push({ mesh, radius, length, delay });
  }
  prism(0, 0, 0.15, -0.12, 2.63, 0.39, 0.18, 0);
  prism(0.15, -0.15, 0.82, -0.35, 2.19, 0.30, 0.62, 0.09);
  prism(-0.18, -0.05, -0.64, -0.42, 1.96, 0.33, 0.26, 0.13);
  prism(0.08, 0.24, 0.48, 0.78, 1.72, 0.30, 0.74, 0.19);
  prism(-0.22, 0.18, -0.94, 0.57, 1.49, 0.24, 0.30, 0.24);
  const random = randomSequence(1456);
  for (let i = 0; i < 13; i++) {
    const angle = turn * (i + random() * 0.6) / 13;
    const x = Math.cos(angle), z = Math.sin(angle);
    const lean = 0.63 + random() * 1.3;
    prism(x * 0.38, z * 0.38, x * lean, z * lean, 0.58 + random() * 0.79,
      0.12 + random() * 0.12, random(), 0.15 + random() * 0.30);
  }
  return { group, update(t) {
    group.rotation.y = -0.42 + 0.35 * t;
    for (const { mesh, radius, length, delay } of stalks) {
      const growth = THREE.MathUtils.smoothstep(t, delay, 1);
      mesh.visible = growth > 0 || delay === 0;
      const width = radius * (0.14 + 0.86 * Math.sqrt(growth));
      mesh.scale.set(width, length * (0.04 + 0.96 * growth), width);
    }
  } };
}

function createSand() {
  const group = new THREE.Group();
  group.rotation.set(0.37, -0.18, 0.24);
  const metal = new THREE.MeshStandardMaterial({ color: 0x414e50, roughness: 0.55, metalness: 0.35 });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x15272e, roughness: 0.78, metalness: 0.18 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc19859, roughness: 0.45, metalness: 0.32 });
  function part(geometry, material, y) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = y;
    group.add(mesh);
  }
  part(new THREE.BoxGeometry(2.95, 0.055, 2.95), metal, -0.045);
  part(new THREE.BoxGeometry(2.92, 0.025, 2.92), graphite, -0.008);
  part(new THREE.CylinderGeometry(0.095, 0.13, 0.65, 28), brass, -0.40);
  part(new THREE.CylinderGeometry(0.28, 0.38, 0.13, 40), metal, -0.77);
  part(new THREE.CylinderGeometry(0.053, 0.053, 0.022, 20), brass, 0.013);

  const start = [], target = [], grain = [];
  const random = randomSequence(7159);
  const m = 4 * Math.PI, n = 2 * Math.PI;
  for (let i = 0; i < 8600; i++) {
    let u = random(), v = random();
    start.push((u - 0.5) * 2.90, 0.02, (v - 0.5) * 2.90);
    // Project onto a zero of the standing-wave field along its local gradient.
    for (let step = 0; step < 12; step++) {
      const cu = Math.cos(m*u), cv = Math.cos(m*v), du = Math.cos(n*u), dv = Math.cos(n*v);
      const value = cu*dv - du*cv;
      const dx = -m*Math.sin(m*u)*dv + n*Math.sin(n*u)*cv;
      const dz = -n*cu*Math.sin(n*v) + m*du*Math.sin(m*v);
      const distance = value / Math.max(0.001, dx*dx + dz*dz);
      u = THREE.MathUtils.clamp(u - THREE.MathUtils.clamp(distance*dx, -0.055, 0.055), 0, 1);
      v = THREE.MathUtils.clamp(v - THREE.MathUtils.clamp(distance*dz, -0.055, 0.055), 0, 1);
    }
    target.push((u - 0.5) * 2.90 + (random() - 0.5)*0.023, 0.022,
      (v - 0.5) * 2.90 + (random() - 0.5)*0.023);
    grain.push(random());
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(start, 3));
  geometry.setAttribute('settled', new THREE.Float32BufferAttribute(target, 3));
  geometry.setAttribute('grain', new THREE.Float32BufferAttribute(grain, 1));
  const uniforms = { progress: { value: 0 }, height: { value: 1 } };
  const sand = new THREE.Points(geometry, new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: `
      attribute vec3 settled;
      attribute float grain;
      uniform float progress, height;
      varying float shade;
      void main() {
        float t = smoothstep(0.03, 0.91 + grain * 0.09, progress);
        vec3 p = mix(position, settled, t);
        float shake = sin(3.14159 * progress) * (1.0 - 0.65 * t);
        p.xz += vec2(sin(grain*174.0 + 60.0*progress), cos(grain*217.0 + 73.0*progress)) * 0.026 * shake;
        p.y += abs(sin(grain*213.0 + 70.0*progress)) * 0.082 * shake;
        vec4 view = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * view;
        gl_PointSize = clamp(height * projectionMatrix[1][1] * (0.005 + 0.006 * grain) / -view.z, 1.15, 7.0);
        shade = grain;
      }`,
    fragmentShader: `
      varying float shade;
      void main() {
        float a = 1.0 - smoothstep(0.20, 0.50, length(gl_PointCoord - 0.5));
        vec3 sand = mix(vec3(0.73, 0.42, 0.20), vec3(1.0, 0.88, 0.63), shade);
        gl_FragColor = vec4(sand, 0.88 * a);
      }`
  }));
  sand.onBeforeRender = (renderer) => { uniforms.height.value = renderer.domElement.height; };
  group.add(sand);
  return { group, update(t) { uniforms.progress.value = t; } };
}

function createVortex() {
  const group = new THREE.Group();
  group.lookAt(-7, 4, 9);
  group.rotateY(-0.46);
  group.rotateX(0.16);
  group.rotateZ(-0.32);
  const random = randomSequence(3187);
  const samples = [], strands = [];
  // The tube rolls about its own centreline. Older dye is stretched into its wake.
  for (let i = 0; i < 300; i++) {
    const start = random() * turn, phase = random() * turn;
    const radius = 0.04 + 0.32 * Math.sqrt(random());
    const length = 0.28 + 1.62 * random();
    const age = i < 215 ? 0 : 0.12 + 0.88 * random();
    const steps = 42 + Math.floor(30 * random());
    let previous;
    for (let j = 0; j < steps; j++) {
      const f = j / (steps - 1);
      const theta = start + length * f;
      const point = [theta, phase + 0.89*f + 0.6*Math.sin(theta*3 + phase), radius, age*f];
      if (i % 3 === 0 && previous) strands.push(...previous, ...point);
      for (let k = 0; k < 2; k++) {
        samples.push(theta + (random()-0.5)*0.035, point[1] + (random()-0.5)*0.11,
          radius + (random()-0.5)*0.035, point[3]);
      }
      previous = point;
    }
  }
  const uniforms = { progress: { value: 0 }, height: { value: 1 } };
  function build(data, points) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(data.length/4 * 3), 3));
    geo.setAttribute('flow', new THREE.Float32BufferAttribute(data, 4));
    const material = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false,
      defines: points ? { DYE_GRAINS: 1 } : {},
      vertexShader: `
        attribute vec4 flow;
        uniform float progress, height;
        varying vec3 pigment;
        varying float density;
        void main() {
          float t = smoothstep(0.0, 1.0, progress);
          float wake = flow.w * (0.12 + 0.88*t);
          float a = flow.x + 0.14*t + 0.11*sin(flow.y + flow.x*3.0)*wake;
          float b = flow.y - 3.25*t + 0.34*sin(4.0*a + t) + 2.3*wake;
          float radius = (0.84 + 0.26*t) + 0.063*sin(3.0*a + t) + 0.03*cos(5.0*a - 0.8);
          float section = flow.z * (0.70 + 0.38*t);
          float radial = radius + section*cos(b) + 0.21*wake*sin(5.0*a + b);
          vec3 p = vec3(radial*cos(a), radial*sin(a)*0.91, section*sin(b) + 0.14*sin(2.0*a + t));
          p.z += -1.8*wake + 0.62*t - 0.33;
          p.xy += wake * vec2(-0.63 + 0.23*sin(4.0*a+b), 0.38*cos(3.0*a));
          vec4 view = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * view;
          gl_PointSize = clamp(height * projectionMatrix[1][1] * (0.015 + 0.015*flow.z) / -view.z, 1.5, 9.0);
          float mixColor = smoothstep(-0.65, 0.90, sin(a + 0.58) + 0.24*cos(b));
          pigment = mix(vec3(0.26, 0.78, 0.89), vec3(0.84, 0.64, 0.96), mixColor);
          density = 1.0 - 0.65*wake;
        }`,
      fragmentShader: `
        varying vec3 pigment;
        varying float density;
        void main() {
          #ifdef DYE_GRAINS
            float ink = exp(-13.0 * dot(gl_PointCoord-0.5, gl_PointCoord-0.5));
            gl_FragColor = vec4(pigment, 0.34 * density * ink);
          #else
            gl_FragColor = vec4(pigment, 0.27 * density);
          #endif
        }`
    });
    const object = points ? new THREE.Points(geo, material) : new THREE.LineSegments(geo, material);
    object.frustumCulled = false;
    object.onBeforeRender = (renderer) => { uniforms.height.value = renderer.domElement.height; };
    group.add(object);
  }
  build(strands, false);
  build(samples, true);
  return { group, update(t) { uniforms.progress.value = t; } };
}

export const studies = { kristall: createCrystal, klangfigur: createSand, farbwirbel: createVortex };
