import * as THREE from '../vendor/three/three.module.min.js';
import { tileSize, stars, starTypes } from './star-field.js';
import { createCosmosGrid } from './cosmos-grid.js';
import { createSpiralGalaxy, galaxyProfiles } from './spiral-galaxies.js';

export const duration = 1800;

function ease(start, end, seconds) {
  const t = THREE.MathUtils.clamp((seconds - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

export function stateAt(milliseconds) {
  const t = milliseconds / 1000;
  return {
    expansion: ease(.38, 1.47, t),
    axes: ease(.37, 1.14, t),
    axisLight: ease(.37, .51, t) * (1 - ease(.85, 1.28, t)),
    grid: ease(.48, 1.32, t),
    stars: ease(.48, 1.66, t),
    flash: ease(.20, .32, t) * (1 - ease(.36, .79, t)),
    front: ease(.20, .69, t),
    nearGalaxy: ease(.96, 1.66, t),
    farGalaxy: ease(1.13, 1.80, t)
  };
}

const backdropVertex = `
  varying vec2 atlasUv;
  void main() {
    atlasUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const flashFragment = `
  uniform vec2 viewport, origin;
  uniform float reach, flash, front;
  varying vec2 atlasUv;
  void main() {
    vec2 pixel = vec2(atlasUv.x, 1.0 - atlasUv.y) * viewport;
    float distanceFromOrigin = length(pixel - origin);
    float radius = max(3.0, 1.12 * reach * front);
    float band = (distanceFromOrigin - radius) / max(16.0, 0.23 * reach);
    float halo = distanceFromOrigin / max(5.0, mix(9.0, .13 * reach, front));
    float core = distanceFromOrigin / mix(2.2, 5.8, front);
    vec3 color = vec3(16.0, 25.0, 29.0) / 255.0;
    color += flash * (vec3(.08,.25,.24) * exp(-band * band)
                   + vec3(.19,.65,.60) * exp(-2.0 * halo)
                   + vec3(1.0,.98,.88) * exp(-0.65 * core * core));
    gl_FragColor = vec4(color, 1.0);
  }
`;

const starVertex = `
  attribute vec3 tint;
  attribute float diameter, birth;
  uniform float pixelRatio, appearance;
  varying vec3 lightColor;
  varying float shine;
  void main() {
    lightColor = tint;
    shine = smoothstep(birth, birth + 0.14, appearance);
    gl_PointSize = diameter * pixelRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const starFragment = `
  varying vec3 lightColor;
  varying float shine;
  void main() {
    float r = 2.0 * length(gl_PointCoord - vec2(.5));
    float opacity = 1.0 - .17 * smoothstep(0.0, .22, r)
                        - .65 * smoothstep(.22, .48, r)
                        - .18 * smoothstep(.48, 1.0, r);
    gl_FragColor = vec4(lightColor, shine * max(opacity, 0.0));
  }
`;

// This is the fixed camera that produced raum.webp. Its line of sight passes
// above (0, 0, 0); the pulse must use the projection of the origin itself.
export function createAtlasView() {
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 80);
  const target = new THREE.Vector3(0, 1.5, 0);
  camera.position.set(-7.5, 5.4, 8.5);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  const forward = camera.getWorldDirection(new THREE.Vector3());
  const originDepth = -camera.position.dot(forward);
  const focusDistance = camera.position.distanceTo(target);
  let width, height, focalPixels;
  return {
    camera,
    resize(w, h, plot) {
      width = w;
      height = h;
      focalPixels = focusDistance * plot.height / 3.75;
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(h / (2 * focalPixels)));
      camera.setViewOffset(w, h, w / 2 - plot.x - plot.width / 2, h / 2 - plot.y - plot.height / 2, w, h);
    },
    pixel(point) {
      const p = point.clone().project(camera);
      return new THREE.Vector2((p.x + 1) * width / 2, (1 - p.y) * height / 2);
    },
    point(x, y, depthOffset) {
      const ray = new THREE.Vector3(2 * x / width - 1, 1 - 2 * y / height, 0).unproject(camera).sub(camera.position);
      return ray.multiplyScalar((originDepth + depthOffset) / ray.dot(forward)).add(camera.position);
    },
    unitsPerPixel(depthOffset) { return (originDepth + depthOffset) / focalPixels; }
  };
}

const tints = starTypes.map(({color}) => new THREE.Color(color).convertLinearToSRGB());

function starGeometry(width, height, view) {
  const positions = [], colors = [], sizes = [], births = [];
  // Overscan for the expansion and the orbit. Whole offscreen tiles would collapse
  // into bright bands when viewed side-on, especially on the narrow mobile stage.
  const margin = .45 * Math.min(width, height);
  const firstTile = Math.floor(-margin / tileSize) * tileSize;
  for (let y = firstTile; y < height + margin; y += tileSize) {
    for (let x = firstTile; x < width + margin; x += tileSize) {
      for (const star of stars) {
        const sx = x + star.x, sy = y + star.y;
        if (sx < -margin || sx > width + margin || sy < -margin || sy > height + margin) continue;
        const point = view.point(sx, sy, star.depth);
        positions.push(point.x, point.y, point.z);
        const tint = tints[star.type];
        colors.push(tint.r, tint.g, tint.b);
        sizes.push(starTypes[star.type].diameter);
        births.push(star.birth);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('tint', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('diameter', new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('birth', new THREE.Float32BufferAttribute(births, 1));
  return geometry;
}

// The camera supplies the original framing. All world-space objects share a
// pivot at (0, 0, 0), so dragging also preserves the origin's screen position.
export function createAtlasWorld(view) {
  const world = new THREE.Scene();
  const grid = createCosmosGrid();
  const sky = new THREE.Group();
  world.add(grid.group, sky);
  grid.faceLabels(view.camera.quaternion);
  const points = new THREE.Points(new THREE.BufferGeometry(), new THREE.ShaderMaterial({
    uniforms: { pixelRatio: { value: 1 }, appearance: { value: 0 } },
    vertexShader: starVertex, fragmentShader: starFragment, transparent: true, depthTest: false, depthWrite: false
  }));
  points.frustumCulled = false;
  points.renderOrder = 2;
  sky.add(points);
  const galaxies = galaxyProfiles.map(createSpiralGalaxy);
  for (const galaxy of galaxies) sky.add(galaxy.group);
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(view.camera.quaternion);
  const yawRotation = new THREE.Quaternion();
  const labelOrientation = new THREE.Quaternion();
  return {
    world,
    resize(width, height, plot, galaxyRects, ratio) {
      view.resize(width, height, plot);
      grid.resize(plot.height, view.camera);
      points.geometry.dispose();
      points.geometry = starGeometry(width, height, view);
      points.material.uniforms.pixelRatio.value = ratio;
      galaxies.forEach((galaxy, i) => galaxy.place(view, galaxyRects[i], height * ratio));
    },
    turn(yaw, pitch) {
      world.quaternion.setFromAxisAngle(right, pitch).multiply(yawRotation.setFromAxisAngle(up, yaw));
      grid.faceLabels(labelOrientation.copy(world.quaternion).invert().multiply(view.camera.quaternion));
    },
    update(elapsed, state) {
      grid.update(state);
      sky.scale.setScalar(state.expansion);
      points.material.uniforms.appearance.value = state.stars;
      // At the end of the entrance the arms have the reference orientation.
      // Their clock advances smoothly on both sides of that instant.
      galaxies[0].update(elapsed - duration, state.nearGalaxy);
      galaxies[1].update(elapsed - duration, state.farGalaxy);
    },
    dispose() {
      grid.dispose();
      for (const galaxy of galaxies) galaxy.dispose();
      points.geometry.dispose();
      points.material.dispose();
    }
  };
}

export function createCosmosScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.debug.onShaderError = (gl, program) => {
    throw new Error(gl.getProgramInfoLog(program) || 'Unable to draw the star atlas.');
  };
  renderer.setClearColor(0x10191d);
  renderer.autoClear = false;
  const view = createAtlasView();
  const atlas = createAtlasWorld(view);
  const settled = stateAt(duration);
  const uniforms = {
    viewport: { value: new THREE.Vector2() }, origin: { value: new THREE.Vector2() },
    reach: { value: 0 }, flash: { value: 0 }, front: { value: 0 }
  };
  const flashScene = new THREE.Scene();
  const screenCamera = new THREE.Camera();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms, vertexShader: backdropVertex, fragmentShader: flashFragment, depthTest: false, depthWrite: false
  }));
  quad.frustumCulled = false;
  flashScene.add(quad);
  return {
    resize(width, height, plot, galaxyRects, ratio) {
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      atlas.resize(width, height, plot, galaxyRects, ratio);
      const origin = view.pixel(new THREE.Vector3());
      uniforms.viewport.value.set(width, height);
      uniforms.origin.value.copy(origin);
      uniforms.reach.value = Math.hypot(Math.max(origin.x, width - origin.x), Math.max(origin.y, height - origin.y));
    },
    turn: atlas.turn,
    render(elapsed) {
      const state = elapsed < duration ? stateAt(elapsed) : settled;
      atlas.update(elapsed, state);
      renderer.clear();
      if (state.flash > 0) {
        uniforms.flash.value = state.flash;
        uniforms.front.value = state.front;
        renderer.render(flashScene, screenCamera);
      }
      if (state.axes > 0) renderer.render(atlas.world, view.camera);
    },
    dispose() {
      atlas.dispose();
      quad.geometry.dispose();
      quad.material.dispose();
      renderer.dispose();
    }
  };
}
