import * as THREE from '../vendor/three/three.module.min.js';
import { tileSize, stars, starTypes } from './star-field.js';

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

const backdropFragment = `
  uniform sampler2D gridPlate;
  uniform vec2 viewport, plotCenter, origin, axisX, axisY, axisZ;
  uniform float plotHeight, reach, expansion, axes, axisLight, grid, flash, front;
  varying vec2 atlasUv;
  float stroke(vec2 p, vec2 direction) {
    return 1.0 - smoothstep(0.12, 1.2, abs(p.x * direction.y - p.y * direction.x));
  }
  void main() {
    vec2 pixel = vec2(atlasUv.x, 1.0 - atlasUv.y) * viewport;
    vec2 offset = pixel - origin;
    float distanceFromOrigin = length(offset);
    vec3 dark = vec3(16.0, 25.0, 29.0) / 255.0;
    vec3 color = dark;
    // The retained panorama is the fixed XYZ camera's projected coordinate grid.
    // Its 2400 x 1920 plate was exposed with a 320-pixel-high subject window.
    vec2 stillPixel = origin + offset / max(expansion, 0.008);
    vec2 plateUv = (stillPixel - plotCenter) / (plotHeight * vec2(7.5, 6.0)) + 0.5;
    vec2 edge = min(plateUv, 1.0 - plateUv);
    float inside = smoothstep(0.0, 0.012, min(edge.x, edge.y));
    float gridWave = 1.0 - smoothstep(grid * reach, grid * reach + 0.10 * reach, distanceFromOrigin);
    vec3 plate = texture2D(gridPlate, vec2(plateUv.x, 1.0 - plateUv.y)).rgb;
    color = mix(dark, plate, inside * gridWave * smoothstep(0.0, 0.28, grid));
    float axisWave = 1.0 - smoothstep(axes * reach, axes * reach + 9.0, distanceFromOrigin);
    vec3 lines = stroke(offset, axisX) * vec3(.47,.32,.23)
               + stroke(offset, axisY) * vec3(.34,.47,.37)
               + stroke(offset, axisZ) * vec3(.27,.42,.52);
    color += lines * (0.48 * axisLight * axisWave);
    float radius = max(3.0, 1.12 * reach * front);
    float band = (distanceFromOrigin - radius) / max(16.0, 0.23 * reach);
    float halo = distanceFromOrigin / max(5.0, mix(9.0, .13 * reach, front));
    float core = distanceFromOrigin / mix(2.2, 5.8, front);
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
  // Include the next tile beyond each edge so stars can cross the frame as space expands.
  for (let y = -tileSize; y < height + tileSize; y += tileSize) {
    for (let x = -tileSize; x < width + tileSize; x += tileSize) {
      for (const star of stars) {
        const point = view.point(x + star.x, y + star.y, star.depth);
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

export function createCosmosScene(canvas, gridImage, galaxyImages) {
  const renderer = new THREE.WebGLRenderer({ canvas, powerPreference: 'low-power' });
  // Hand a failed GPU program back to the player's static-atlas fallback.
  renderer.debug.onShaderError = (gl, program) => {
    throw new Error(gl.getProgramInfoLog(program) || 'Unable to draw the star atlas.');
  };
  renderer.autoClear = false;
  const view = createAtlasView();
  const plate = new THREE.Texture(gridImage);
  plate.needsUpdate = true;
  const uniforms = { gridPlate: { value: plate } };
  for (const key of ['viewport','plotCenter','origin','axisX','axisY','axisZ']) uniforms[key] = { value: new THREE.Vector2() };
  for (const key of ['plotHeight','reach','expansion','axes','axisLight','grid','flash','front']) uniforms[key] = { value: 0 };
  const backdrop = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms, vertexShader: backdropVertex, fragmentShader: backdropFragment, depthTest: false, depthWrite: false
  }));
  quad.frustumCulled = false;
  backdrop.add(quad);
  const screenCamera = new THREE.Camera();
  const sky = new THREE.Scene();
  const points = new THREE.Points(new THREE.BufferGeometry(), new THREE.ShaderMaterial({
    uniforms: { pixelRatio: { value: 1 }, appearance: { value: 0 } },
    vertexShader: starVertex, fragmentShader: starFragment, transparent: true, depthTest: false, depthWrite: false
  }));
  points.frustumCulled = false;
  points.renderOrder = 2;
  sky.add(points);
  const galaxies = galaxyImages.map((image, index) => {
    const map = new THREE.Texture(image);
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
    sprite.renderOrder = index === 0 ? 1 : 0;
    sky.add(sprite);
    return sprite;
  });
  return {
    resize(width, height, plot, images, ratio) {
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      view.resize(width, height, plot);
      uniforms.viewport.value.set(width, height);
      uniforms.plotCenter.value.set(plot.x + plot.width / 2, plot.y + plot.height / 2);
      uniforms.plotHeight.value = plot.height;
      const origin = view.pixel(new THREE.Vector3());
      uniforms.origin.value.copy(origin);
      uniforms.reach.value = Math.hypot(Math.max(origin.x, width - origin.x), Math.max(origin.y, height - origin.y));
      for (const [key, axis] of [['axisX',[1,0,0]], ['axisY',[0,1,0]], ['axisZ',[0,0,1]]]) {
        uniforms[key].value.copy(view.pixel(new THREE.Vector3(...axis)).sub(origin).normalize());
      }
      points.geometry.dispose();
      points.geometry = starGeometry(width, height, view);
      points.material.uniforms.pixelRatio.value = ratio;
      galaxies.forEach((sprite, i) => {
        const rect = images[i], depth = i === 0 ? -1.2 : 2.5;
        sprite.position.copy(view.point(rect.x + rect.width / 2, rect.y + rect.height / 2, depth));
        const unit = view.unitsPerPixel(depth);
        sprite.scale.set(rect.width * unit, rect.height * unit, 1);
      });
    },
    render(elapsed) {
      const state = stateAt(elapsed);
      for (const key of ['axes','axisLight','grid','flash','front','expansion']) uniforms[key].value = state[key];
      sky.scale.setScalar(state.expansion);
      points.material.uniforms.appearance.value = state.stars;
      galaxies[0].material.opacity = state.nearGalaxy;
      galaxies[1].material.opacity = state.farGalaxy;
      renderer.clear();
      renderer.render(backdrop, screenCamera);
      if (state.stars || state.nearGalaxy || state.farGalaxy) renderer.render(sky, view.camera);
    },
    dispose() {
      for (const sprite of galaxies) { sprite.material.map.dispose(); sprite.material.dispose(); }
      plate.dispose();
      points.geometry.dispose();
      points.material.dispose();
      quad.geometry.dispose();
      quad.material.dispose();
      renderer.dispose();
    }
  };
}
