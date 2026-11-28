import * as THREE from '../vendor/three/three.module.min.js';
import { studies } from './studies.js';

const fieldHeight = 3.75;

function coordinates() {
  const space = new THREE.Scene();
  const plane = new THREE.PlaneGeometry(180, 180);
  const gridMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true,
    vertexShader: `
      varying vec2 planePoint;
      varying float depth;
      void main() {
        planePoint = position.xy;
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        depth = -p.z;
        gl_Position = projectionMatrix * p;
      }`,
    fragmentShader: `
      varying vec2 planePoint;
      varying float depth;
      float grid(vec2 p) {
        vec2 pixel = max(fwidth(p), vec2(0.0001));
        vec2 dist = abs(fract(p + 0.5) - 0.5) / pixel;
        vec2 line = (1.0 - smoothstep(vec2(0.10), vec2(0.95), dist))
                  * (1.0 - smoothstep(vec2(0.24), vec2(0.80), pixel));
        return max(line.x, line.y);
      }
      void main() {
        float fine = grid(planePoint / 0.30);
        float major = grid(planePoint / 1.50);
        float fade = 1.0 - smoothstep(11.0, 58.0, depth);
        gl_FragColor = vec4(0.37, 0.49, 0.52, (0.052*fine + 0.086*major) * fade);
      }`
  });
  const xy = new THREE.Mesh(plane, gridMaterial);
  const xz = xy.clone(), yz = xy.clone();
  xz.rotation.x = Math.PI / 2;
  yz.rotation.y = Math.PI / 2;
  space.add(xy, xz, yz);

  const axes = [
    { label: 'X', direction: [1, 0, 0], ticks: [0, 0, 1], color: '#d29d8b', marker: 2.50 },
    { label: 'Y', direction: [0, 1, 0], ticks: [1, 0, 0], color: '#afc39d', marker: 3.38 },
    { label: 'Z', direction: [0, 0, 1], ticks: [1, 0, 0], color: '#8ab7d3', marker: 2.08 }
  ];
  const labels = [];
  for (const axis of axes) {
    const direction = new THREE.Vector3(...axis.direction);
    const cross = new THREE.Vector3(...axis.ticks);
    const points = [direction.clone().multiplyScalar(-85), direction.clone().multiplyScalar(85)];
    for (let i = -12; i <= 12; i++) {
      const point = direction.clone().multiplyScalar(i * 0.25);
      const tick = i % 4 === 0 ? 0.053 : 0.025;
      points.push(point.clone().addScaledVector(cross, -tick), point.clone().addScaledVector(cross, tick));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: axis.color, transparent: true, opacity: 0.56 });
    const line = new THREE.LineSegments(geometry, material);
    line.renderOrder = 1;
    space.add(line);

    const glyph = document.createElement('canvas');
    glyph.width = glyph.height = 64;
    const ctx = glyph.getContext('2d');
    ctx.font = '48px "Liberation Mono Web", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = axis.color;
    ctx.fillText(axis.label, 32, 33);
    const texture = new THREE.CanvasTexture(glyph);
    texture.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
    label.position.copy(direction).multiplyScalar(axis.marker).addScaledVector(cross, 0.14);
    label.renderOrder = 2;
    labels.push(label);
    space.add(label);
  }
  return { space, labels };
}

export function createHeroScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x10191d);
  renderer.autoClear = false;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.10, 80);
  // Frame the space above the origin so the entire grown crystal fits above its foot.
  const framingCenter = new THREE.Vector3(0, 1.5, 0);
  camera.position.set(-7.5, 5.4, 8.5);
  camera.lookAt(framingCenter);
  const focusDistance = camera.position.distanceTo(framingCenter);
  const { space, labels } = coordinates();
  const subjects = new THREE.Scene();
  subjects.add(new THREE.HemisphereLight(0xd6f1f0, 0x3a484c, 1.75));
  const lamp = new THREE.DirectionalLight(0xffe4b9, 2.5);
  lamp.position.set(-3, 6, 4);
  subjects.add(lamp);

  const cache = new Map();
  let current = null;
  return {
    resize(width, height, centerX, centerY, studyHeight, pixelRatio) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      // Keep the same perspective at the subject. Only its position in the full header changes.
      const focalLength = focusDistance * studyHeight / fieldHeight;
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(height / (2 * focalLength)));
      camera.setViewOffset(width, height, width / 2 - centerX, height / 2 - centerY, width, height);
      for (const label of labels) label.scale.setScalar(20 * fieldHeight / studyHeight);
    },
    render(name, progress) {
      if (!cache.has(name)) {
        const study = studies[name]();
        subjects.add(study.group);
        cache.set(name, study);
      }
      const next = cache.get(name);
      if (current !== next) {
        if (current) current.group.visible = false;
        current = next;
        current.group.visible = true;
      }
      current.update(progress);
      renderer.clear();
      renderer.render(space, camera);
      renderer.clearDepth();
      renderer.render(subjects, camera);
    }
  };
}
