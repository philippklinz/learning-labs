import * as THREE from '../vendor/three/three.module.min.js';

const gridVertex = `
  varying vec2 planePoint;
  varying float depth;
  void main() {
    planePoint = position.xy;
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    depth = -p.z;
    gl_Position = projectionMatrix * p;
  }
`;
const gridFragment = `
  uniform float reveal, expansion;
  varying vec2 planePoint;
  varying float depth;
  float grid(vec2 p) {
    vec2 pixel = max(fwidth(p), vec2(.0001));
    vec2 dist = abs(fract(p + .5) - .5) / pixel;
    vec2 line = (1.0 - smoothstep(vec2(.10), vec2(.95), dist))
              * (1.0 - smoothstep(vec2(.24), vec2(.80), pixel));
    return max(line.x, line.y);
  }
  void main() {
    float radius = length(planePoint) * expansion;
    float wave = mix(1.0 - smoothstep(16.0*reveal, 16.0*reveal + 1.4, radius),
                     1.0, smoothstep(.75, 1.0, reveal));
    float light = .052*grid(planePoint/.30) + .086*grid(planePoint/1.50);
    gl_FragColor = vec4(.37,.49,.52, light * (1.0-smoothstep(11.0,58.0,depth)) * reveal * wave);
  }
`;

// Use the original Y label as the reference for all three positive axes.
const markerDistance = 3.38;
const axes = [
  { dir: [1,0,0], cross: [0,0,1], color: '#d29d8b', glyph: [-.3,-.46,.3,.46, -.3,.46,.3,-.46] },
  { dir: [0,1,0], cross: [1,0,0], color: '#afc39d', glyph: [-.3,.46,0,0, .3,.46,0,0, 0,0,0,-.46] },
  { dir: [0,0,1], cross: [1,0,0], color: '#8ab7d3', glyph: [-.3,.46,.3,.46, .3,.46,-.3,-.46, -.3,-.46,.3,-.46] }
];

export function createCosmosGrid() {
  const group = new THREE.Group();
  const planes = new THREE.Group();
  const plane = new THREE.PlaneGeometry(180, 180);
  const gridMaterial = new THREE.ShaderMaterial({
    uniforms: { reveal: { value: 0 }, expansion: { value: 0 } },
    vertexShader: gridVertex, fragmentShader: gridFragment,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true
  });
  const xy = new THREE.Mesh(plane, gridMaterial);
  const xz = xy.clone(), yz = xy.clone();
  xz.rotation.x = Math.PI / 2;
  yz.rotation.y = Math.PI / 2;
  planes.add(xy, xz, yz);
  group.add(planes);

  const rulers = new THREE.Group();
  group.add(rulers);
  const labels = [];
  const materials = [];
  for (const { dir, cross, color, glyph } of axes) {
    const axis = new THREE.Vector3(...dir), tickDirection = new THREE.Vector3(...cross);
    const points = [axis.clone().multiplyScalar(-85), axis.clone().multiplyScalar(85)];
    for (let i = -12; i <= 12; i++) {
      const tick = axis.clone().multiplyScalar(i * .25);
      const half = i % 4 === 0 ? .053 : .025;
      points.push(tick.clone().addScaledVector(tickDirection, -half), tick.clone().addScaledVector(tickDirection, half));
    }
    const ink = new THREE.LineBasicMaterial({ color, transparent: true, depthTest: false, depthWrite: false });
    materials.push(ink);
    const line = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), ink);
    line.renderOrder = 1;
    rulers.add(line);

    const strokes = [];
    for (let i = 0; i < glyph.length; i += 2) strokes.push(new THREE.Vector3(glyph[i], glyph[i + 1], 0));
    const label = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(strokes), ink);
    const offset = tickDirection.multiplyScalar(.14);
    label.position.copy(offset).addScaledVector(axis, markerDistance);
    label.renderOrder = 2;
    labels.push({ label, axis, offset });
    rulers.add(label);
  }
  return {
    group,
    resize(plotHeight, camera) {
      const glyphScale = 14 * 3.75 / plotHeight;
      const clip = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      const frustum = new THREE.Frustum().setFromProjectionMatrix(clip);
      // Z can reach the bottom edge on phones. Fit one shared distance to the
      // opening view and keep the labels anchored there when the reader turns it.
      let distance = markerDistance;
      for (const { axis, offset } of labels) {
        for (const plane of frustum.planes) {
          const towardEdge = -plane.normal.dot(axis);
          if (towardEdge > 0) distance = Math.min(distance, (plane.distanceToPoint(offset) - glyphScale) / towardEdge);
        }
      }
      for (const { label, axis, offset } of labels) {
        label.position.copy(offset).addScaledVector(axis, Math.max(0, distance));
        label.scale.setScalar(glyphScale);
      }
    },
    faceLabels(orientation) {
      for (const { label } of labels) label.quaternion.copy(orientation);
    },
    update(state) {
      planes.visible = state.grid > 0;
      planes.scale.setScalar(state.expansion);
      gridMaterial.uniforms.expansion.value = state.expansion;
      gridMaterial.uniforms.reveal.value = state.grid;
      rulers.visible = state.axes > 0;
      rulers.scale.setScalar(state.axes);
      for (const m of materials) m.opacity = .56 * Math.min(1, 4 * state.axes) + .22 * state.axisLight;
    },
    dispose() {
      plane.dispose();
      gridMaterial.dispose();
      for (const child of rulers.children) child.geometry.dispose();
      for (const m of materials) m.dispose();
    }
  };
}
