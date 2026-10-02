import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { cinematicFactories } from "../src/cinematic-scenes.js";
import { shots } from "../src/camera-paths.js";

// Canvas text is a visual asset; these tests exercise scene construction and
// reversible choreography independently of the browser and graphics driver.
const context = new Proxy(
  { measureText: (text) => ({ width: text.length * 30 }) },
  {
    get: (target, key) => (key in target ? target[key] : () => {}),
  },
);
globalThis.document = {
  createElement: () => ({ width: 768, height: 400, getContext: () => context }),
};

function snapshot(root) {
  const result = [];
  root.traverse((object) => {
    result.push([
      ...object.position,
      ...object.quaternion,
      ...object.scale,
      object.visible,
    ]);
    if (object.isMesh) {
      const { count } = object.geometry.drawRange;
      if (Number.isFinite(count))
        assert.ok(
          count <=
            (object.geometry.index?.count ??
              object.geometry.attributes.position.count),
        );
    }
  });
  return result;
}
for (let i = 0; i < cinematicFactories.length; i++) {
  test(`chapter ${i}: scroll actions are finite and reversible`, () => {
    const root = new THREE.Group();
    const animate = cinematicFactories[i](root);
    animate(0.43);
    const expected = snapshot(root);
    for (const progress of [0, 0.2, 0.7, 1, 0.8, 0.1, 0.43]) {
      animate(progress);
      root.traverse((o) =>
        assert.ok(
          [...o.position, ...o.quaternion, ...o.scale].every(Number.isFinite),
        ),
      );
    }
    assert.deepEqual(snapshot(root), expected);
  });
}
test("each chapter has a complete camera path and valid field of view", () => {
  assert.equal(shots.length, cinematicFactories.length);
  for (const path of shots) {
    assert.equal(path[0].at, 0);
    assert.equal(path.at(-1).at, 1);
    path.forEach((key, i) => {
      assert.ok(key.f > 10 && key.f < 90);
      assert.ok([...key.p, ...key.t].every(Number.isFinite));
      assert.notDeepEqual(key.p, key.t);
      if (i) assert.ok(key.at > path[i - 1].at);
    });
  }
});
