import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from '../vendor/three/three.module.min.js';
import { createAtlasView, createAtlasWorld, duration, stateAt } from '../hero/cosmos-scene.js';
import { createSpiralGalaxy, galaxyProfiles } from '../hero/spiral-galaxies.js';

test('the opening starts dark and completes its single pulse after 1.8 seconds', () => {
  for (const time of [0, 100, 200]) {
    assert.ok(Object.values(stateAt(time)).every(value => value === 0));
  }
  assert.ok(stateAt(320).flash > 0);
  assert.equal(stateAt(790).flash, 0);
  assert.equal(stateAt(320).stars, 0);
  assert.ok(stateAt(900).grid > 0 && stateAt(900).stars > 0);
  assert.equal(stateAt(900).nearGalaxy, 0);
  assert.equal(duration, 1800);
  const end = stateAt(duration);
  for (const layer of ['expansion', 'grid', 'stars', 'nearGalaxy', 'farGalaxy']) assert.equal(end[layer], 1);
  assert.equal(end.flash, 0);
  assert.equal(end.axisLight, 0);
  assert.deepEqual(stateAt(60000), end);
});

test('each galaxy turns through its own inclined plane with a three-dimensional stellar bulge', () => {
  const view = createAtlasView();
  view.resize(1440, 690, { x: 756, y: 130, width: 582, height: 388 });
  for (const profile of galaxyProfiles) {
    const galaxy = createSpiralGalaxy(profile);
    try {
      galaxy.place(view, { x: 900, y: 140, width: 300, height: 196 }, 690);
      const disk = galaxy.group.children[0];
      const cloud = disk.children.find(child => child.isPoints);
      assert.ok(disk.children.some(child => child.geometry.type === 'CircleGeometry'));
      assert.ok(disk.children.some(child => child.geometry.type === 'SphereGeometry'));
      const positions = cloud.geometry.getAttribute('position');
      assert.equal(positions.count, profile.stars);
      const depths = Array.from({ length: positions.count }, (_, i) => positions.getZ(i));
      assert.ok(Math.min(...depths) < -.08 && Math.max(...depths) > .08);
      for (const child of disk.children) {
        assert.ok(Object.values(child.material.uniforms).every(uniform => !uniform.value?.isTexture));
      }
      const normal = new Vector3(0, 0, 1).applyQuaternion(galaxy.group.quaternion);
      const towardsCamera = new Vector3(0, 0, 1).applyQuaternion(view.camera.quaternion);
      assert.ok(Math.abs(normal.dot(towardsCamera) - profile.axisRatio) < 1e-9);
      galaxy.update(-400, .3);
      assert.ok(disk.rotation.z < 0);
      galaxy.update(0, 1);
      const centre = disk.localToWorld(new Vector3());
      const initial = disk.localToWorld(new Vector3(1, 0, 0)).sub(centre);
      galaxy.update(10000, 1);
      const advanced = disk.localToWorld(new Vector3(1, 0, 0)).sub(centre);
      assert.ok(Math.abs(initial.angleTo(advanced) - 10 * profile.degreesPerSecond * Math.PI / 180) < 1e-9);
      assert.ok(disk.localToWorld(new Vector3()).distanceTo(centre) < 1e-9);
      assert.ok(Math.abs(advanced.dot(normal)) < 1e-9);
      galaxy.update(360000 / profile.degreesPerSecond, 1);
      assert.ok(disk.localToWorld(new Vector3(1, 0, 0)).sub(centre).distanceTo(initial) < 1e-9);
    } finally {
      galaxy.dispose();
    }
  }
});

test('turning the atlas produces parallax around the fixed origin and survives a reflow', () => {
  const view = createAtlasView();
  const atlas = createAtlasWorld(view);
  const rects = [{ x: 900, y: 140, width: 300, height: 196 }, { x: 670, y: 380, width: 160, height: 104 }];
  try {
    atlas.resize(1440, 690, { x: 756, y: 130, width: 582, height: 388 }, rects, 1);
    atlas.update(duration, stateAt(duration));
    const origin = view.pixel(new Vector3());
    const near = view.point(800, 330, -2), far = view.point(800, 330, 3);
    const pixel = point => view.pixel(atlas.world.localToWorld(point.clone()));
    assert.ok(pixel(near).distanceTo(pixel(far)) < 1e-8);
    atlas.turn(.7, -.3);
    assert.ok(pixel(new Vector3()).distanceTo(origin) < 1e-8);
    assert.ok(pixel(near).distanceTo(pixel(far)) > 30);
    const pose = atlas.world.quaternion.clone();
    atlas.resize(390, 800, { x: 20, y: 520, width: 350, height: 233 }, rects, 1);
    assert.ok(atlas.world.quaternion.equals(pose));
    atlas.turn(0, 0);
    assert.ok(pixel(near).distanceTo(pixel(far)) < 1e-8);
  } finally {
    atlas.dispose();
  }
});

test('the pulse meets the XYZ origin on the archived perspective grid at every size', () => {
  const view = createAtlasView();
  for (const [w, h, x, y, pw, ph] of [[2400,1920,960,800,480,320], [1440,690,756,130,582,388], [390,750,20,473,350,233]]) {
    view.resize(w, h, { x, y, width: pw, height: ph });
    const origin = view.pixel(new Vector3());
    assert.ok(Math.abs(origin.x - (x + pw / 2)) < .001);
    // The grid plate is 2400 x 1920, with its shared crystal foot at pixel (1200, 1076.3).
    assert.ok(Math.abs(origin.y - (y + ph * (1076.3 - 800) / 320)) < .02);
    for (const depth of [-4.6, -1.2, 2.5, 3.4]) {
      const point = view.point(w * .19, h * .73, depth);
      const pixel = view.pixel(point);
      assert.ok(Math.abs(pixel.x - w * .19) < .001);
      assert.ok(Math.abs(pixel.y - h * .73) < .001);
      assert.ok(view.pixel(point.multiplyScalar(0)).distanceTo(origin) < .001);
    }
  }
});

test('X, Y and Z share the Y marker distance and fit the opening view', () => {
  const view = createAtlasView();
  const atlas = createAtlasWorld(view);
  const labels = [];
  atlas.world.traverse(object => {
    if (object.isLineSegments && object.renderOrder === 2) labels.push(object);
  });
  try {
    assert.equal(labels.length, 3);
    for (const [width, height, plot] of [
      [1440, 690, { x: 756, y: 130, width: 582, height: 388 }],
      [390, 823, { x: 16, y: 545, width: 358, height: 239 }]
    ]) {
      atlas.resize(width, height, plot, [plot, plot], 1);
      atlas.update(duration, stateAt(duration));
      const distance = labels[1].position.y;
      assert.ok(width === 1440 ? distance === 3.38 : distance > 0 && distance < 3.38);
      for (const [axis, label] of labels.entries()) {
        assert.equal(label.position.getComponent(axis), distance);
        assert.equal(label.position.clone().setComponent(axis, 0).length(), .14);
        const vertices = label.geometry.getAttribute('position');
        for (let i = 0; i < vertices.count; i++) {
          const pixel = view.pixel(label.localToWorld(new Vector3().fromBufferAttribute(vertices, i)));
          assert.ok(pixel.x > 0 && pixel.x < width && pixel.y > 0 && pixel.y < height);
        }
      }
    }
  } finally {
    atlas.dispose();
  }
});

test('turning the mobile star field side-on keeps a comparable number of visible stars', () => {
  const view = createAtlasView();
  const atlas = createAtlasWorld(view);
  const rect = { x: 16, y: 535, width: 358, height: 239 };
  try {
    atlas.resize(390, 823, rect, [rect, rect], 1);
    atlas.update(duration, stateAt(duration));
    let field;
    atlas.world.traverse(object => {
      if (object.isPoints && object.geometry.hasAttribute('birth')) field = object;
    });
    function visibleStars(yaw) {
      atlas.turn(yaw, 0);
      field.updateWorldMatrix(true, false);
      const positions = field.geometry.getAttribute('position');
      const point = new Vector3();
      let count = 0;
      for (let i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i).applyMatrix4(field.matrixWorld).project(view.camera);
        if (Math.abs(point.x) < 1 && Math.abs(point.y) < 1 && Math.abs(point.z) < 1) count++;
      }
      return count;
    }
    const initial = visibleStars(0);
    const side = visibleStars(Math.PI / 2);
    assert.ok(initial > 0 && side > initial / 2 && side < initial * 3);
  } finally {
    atlas.dispose();
  }
});
