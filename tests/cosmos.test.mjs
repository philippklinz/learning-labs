import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from '../vendor/three/three.module.min.js';
import { createAtlasView, duration, stateAt } from '../hero/cosmos-scene.js';

test('the hero starts dark, pulses once and settles after 1.8 seconds', () => {
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
