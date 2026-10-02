import * as THREE from "three";
import {
  box,
  group,
  plinth,
  tree,
  car,
  label,
  securityCamera,
  person,
  materials,
} from "./objects.js";

export function createGate(root) {
  plinth(root, 17, 13);
  box(root, [0, 0.015, 0], [4.8, 0.06, 12.8], "road");
  for (let z = -5; z < 6; z += 1.5)
    box(root, [0, 0.053, z], [0.075, 0.016, 0.65], "ivory");
  const vehicle = car(root, [-1.15, 0, 4.2]);
  vehicle.rotation.y = Math.PI;
  box(root, [-4.2, 1.35, -0.7], [2.4, 2.7, 2.5], "ivory", 0.08);
  box(root, [-4.2, 1.68, 0.565], [1.98, 1.05, 0.03], "darkGlass");
  box(root, [-2.985, 1.68, -0.7], [0.03, 1.05, 1.98], "glass");
  box(root, [-4.2, 2.76, -0.7], [2.9, 0.15, 2.9], "teal", 0.06);
  label(root, "WELCOME", [-4.2, 2.48, 0.586], 1.5, 0.23);
  box(root, [-2.8, 0.65, 0.6], [0.4, 1.3, 0.4], "teal", 0.06);
  const arm = group(root, [-2.8, 1.3, 0.6]);
  box(arm, [2.25, 0, 0], [4.5, 0.11, 0.15], "ivory", 0.025);
  for (let x = 0.3; x < 4.5; x += 0.6)
    box(arm, [x, 0, 0.003], [0.28, 0.115, 0.16], "teal");
  for (const x of [-6.4, 5.2]) {
    box(root, [x, 0.8, -2], [3.1, 1.6, 0.12], "glass");
    for (let dx = -1.5; dx <= 1.5; dx += 0.75)
      box(root, [x + dx, 0.8, -2], [0.05, 1.6, 0.05], "deep");
  }
  securityCamera(root, 3.1, -1.9);
  person(root, [-3.15, 0, 2], "deep");
  tree(root, -6.5, -4.1, 1.1);
  tree(root, 6.5, -4, 1.25);
  tree(root, 5.8, 3.9, 0.9);
  label(root, "VIZMO CAMPUS", [4.6, 0.05, -0.2], 4, 0.6, {
    floor: true,
    background: "#fcfaf0",
    fontSize: 70,
  });
  const gateLight = box(
    root,
    [-2.58, 1.04, 0.81],
    [0.08, 0.15, 0.015],
    "coral",
  );
  return (t) => {
    arm.rotation.z = THREE.MathUtils.smoothstep(t, 0.18, 0.48) * 1.35;
    vehicle.position.z = THREE.MathUtils.lerp(
      4.2,
      -3.6,
      THREE.MathUtils.smoothstep(t, 0.36, 0.94),
    );
    gateLight.material = t > 0.24 ? materials.teal : materials.coral;
  };
}

export function createParking(root) {
  plinth(root, 17, 13);
  box(root, [0, 0.025, 0.4], [16.5, 0.08, 11], "road");
  const bay = box(root, [0, 0.075, -2], [2.55, 0.025, 4.45], "mint", 0.08);
  for (let x = -6; x <= 6; x += 3) {
    for (const dx of [-1.4, 1.4])
      box(root, [x + dx, 0.08, -2], [0.06, 0.03, 4.5], "ivory");
    box(root, [x, 0.08, -4.2], [2.8, 0.03, 0.06], "ivory");
    label(
      root,
      `P${Math.round(x / 3 + 3)
        .toString()
        .padStart(2, "0")}`,
      [x, 0.1, -0.15],
      1.1,
      0.5,
      {
        floor: true,
        background: x === 0 ? "#c4e5cb" : "#b8c3b4",
        color: "#284c47",
      },
    );
    box(root, [x, 0.16, -3.8], [1.5, 0.18, 0.25], "pale", 0.045);
  }
  car(root, [-6, 0, -2], "teal");
  car(root, [3, 0, -2], "sage");
  const vehicle = car(root, [-5.5, 0, 3.6]);
  vehicle.rotation.y = Math.PI / 2;
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.5, 0, 3.6),
    new THREE.Vector3(-1.8, 0, 3.6),
    new THREE.Vector3(0, 0, 2.3),
    new THREE.Vector3(0, 0, -1.9),
  ]);
  for (const x of [-7.1, 7.1]) tree(root, x, -5.1, 0.8);
  box(root, [5.8, 1.1, 4.6], [0.09, 2.2, 0.09], "deep");
  label(root, "P", [5.8, 2.2, 4.65], 1.1, 1.1, {
    background: "#458e84",
    color: "#ffffff",
  });
  for (let x = -6; x < 5; x += 1.4)
    box(root, [x, 0.08, 4.75], [0.65, 0.02, 0.07], "ivory");
  return (t) => {
    const progress = THREE.MathUtils.smoothstep(t, 0.08, 0.86);
    vehicle.position.copy(path.getPoint(progress));
    const tangent = path.getTangent(progress);
    vehicle.rotation.y = Math.atan2(tangent.x, tangent.z);
    bay.scale.y = 1 + 0.3 * Math.sin(progress * Math.PI);
  };
}

export function createCampus(root) {
  plinth(root, 18, 13);
  box(root, [-5.2, 0.03, 1.2], [3.1, 0.08, 10.5], "road");
  box(root, [1.5, 0.03, 4.5], [11.5, 0.08, 2.9], "road");
  const building = group(root, [1.2, 0, -1.3]);
  box(building, [0, 0.2, 0], [10, 0.3, 6.3], "ivory", 0.08);
  for (const y of [1.8, 5.05]) {
    box(building, [0, y, -3], [9.8, 3.1, 0.12], "glass");
    box(building, [4.9, y, 0], [0.1, 3.1, 6], "glass");
    for (const x of [-4.8, -2.4, 0, 2.4, 4.8]) {
      box(building, [x, y, -3], [0.1, 3.1, 0.12], "deep");
      box(building, [x, y, 3], [0.1, 3.1, 0.12], "deep");
    }
  }
  box(building, [0, 3.45, 0], [10.15, 0.22, 6.45], "ivory", 0.05);
  const roof = group(building, [0, 6.7, 0]);
  box(roof, [0, 0, 0], [10.3, 0.18, 6.5], "ivory", 0.06);
  box(roof, [0, 0.15, 0], [9.5, 0.14, 5.7], "sage", 0.04);
  for (const x of [-3.5, -1.3, 0.9])
    for (const z of [-1.8, 0.8]) {
      box(building, [x, 4.45, z], [1.5, 0.1, 0.8], "wood");
      box(building, [x, 3.95, z], [0.08, 0.95, 0.55], "ivory");
      box(building, [x, 4.78, z - 0.2], [0.64, 0.42, 0.05], "deep");
    }
  box(building, [2.4, 5, 0], [0.06, 2.8, 5.8], "glass");
  box(building, [3.6, 4.45, 0], [1.8, 0.12, 2.8], "wood", 0.1);
  box(building, [-2.6, 0.9, 1.3], [2.3, 1.1, 0.8], "wood", 0.1);
  label(building, "vizmo", [-2.6, 1, 1.72], 1.1, 0.36, {
    background: "#c4a680",
  });
  for (const x of [1, 2.3, 3.6])
    for (const y of [1.5, 2.3])
      box(building, [x, y, -2.87], [1.1, 0.65, 0.05], "darkGlass");
  for (const x of [-1.8, 1, 3.8]) {
    car(root, [x, 0.08, 4.3], x === 1 ? "teal" : "ivory").scale.setScalar(0.66);
  }
  const vehicle = car(root, [-5.2, 0.08, 4.5]);
  vehicle.scale.setScalar(0.7);
  vehicle.rotation.y = Math.PI;
  box(root, [-7, 0.9, 1], [1.65, 1.8, 1.7], "ivory", 0.08);
  box(root, [-7, 1.2, 1.86], [1.2, 0.7, 0.03], "darkGlass");
  box(root, [-7, 1.86, 1], [1.95, 0.12, 1.95], "teal");
  for (const [x, z, s] of [
    [-7, -4, 1],
    [7.5, -4, 1.1],
    [7.4, 1.2, 0.9],
    [6.9, 4.8, 0.7],
    [-7.5, 4.8, 0.8],
  ])
    tree(root, x, z, s);
  securityCamera(root, -3.5, 2);
  person(root, [-1, 0.1, 2.3]);
  return (t) => {
    roof.position.y = 6.7 + THREE.MathUtils.smoothstep(t, 0, 0.8) * 3;
    roof.visible = t < 0.84;
    vehicle.position.z = 4.5 - t * 2.5;
  };
}
