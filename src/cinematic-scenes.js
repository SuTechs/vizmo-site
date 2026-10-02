import * as THREE from "three";
import { box, group, tree, car, label, materials } from "./objects.js";
import { createGate, createParking, createCampus } from "./scenes-exterior.js";
import {
  createReception,
  createDesks,
  createMeeting,
  createCommand,
} from "./scenes-interior.js";

const smooth = (a, b, t) => THREE.MathUtils.smoothstep(t, a, b);
const glow = new THREE.MeshBasicMaterial({
  color: "#78e9b9",
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
});

function path(parent, points, radius = 0.025, material = glow) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
  );
  const geometry = new THREE.TubeGeometry(curve, 96, radius, 6, false);
  const mesh = new THREE.Mesh(geometry, material);
  parent.add(mesh);
  return { mesh, curve };
}
function rings(parent, position, radius = 1) {
  const g = group(parent, position);
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(radius + i * 0.18, 0.014, 6, 80),
      glow,
    );
    m.rotation.x = Math.PI / 2;
    g.add(m);
  }
  return g;
}
function skyline(parent) {
  const city = group(parent, [0, 0, -20]);
  [
    [-12, 6, 6],
    [-5, 10, 5],
    [4, 7, 7],
    [11, 13, 5],
  ].forEach(([x, h, w]) => {
    box(city, [x, h / 2, 0], [w, h, 4], "ivory", 0.15);
    box(city, [x, h / 2, 2.05], [w - 0.25, h - 0.3, 0.05], "glass");
    for (let y = 0.5; y < h; y += 1.4)
      box(city, [x, y, 2.12], [w, 0.055, 0.04], "deep");
    for (let dx = -w / 2 + 0.5; dx < w / 2; dx += 1.3)
      box(city, [x + dx, h / 2, 2.13], [0.045, h, 0.04], "deep");
  });
  return city;
}
function arrival(root) {
  box(root, [0, -0.17, 0], [60, 0.3, 65], "pale");
  box(root, [0, 0.003, 0], [6, 0.02, 50], "road");
  for (let z = -24; z < 24; z += 2)
    box(root, [0, 0.024, z], [0.075, 0.015, 0.75], "ivory");
  const vehicle = car(root, [0, 0, 1.5], "teal");
  vehicle.scale.setScalar(1.65);
  vehicle.rotation.y = Math.PI - 0.2;
  const city = skyline(root);
  const arch = group(root, [0, 0, -9]);
  box(arch, [-4.7, 3.7, 0], [0.65, 7.4, 0.7], "ivory", 0.15);
  box(arch, [4.7, 3.7, 0], [0.65, 7.4, 0.7], "ivory", 0.15);
  box(arch, [0, 7.2, 0], [10, 0.6, 0.7], "ivory", 0.15);
  box(arch, [0, 6.85, 0.34], [8, 0.035, 0.035], glow);
  label(arch, "V I Z M O", [0, 7.2, 0.365], 3, 0.35, { background: "#fcfaf0" });
  for (const x of [-7, 7])
    for (const z of [-12, -6, 0, 7]) tree(root, x, z, 1.2 + (z + 12) * 0.018);
  const route = path(
    root,
    [
      [2.6, 0.07, 12],
      [2.6, 0.07, 3],
      [2.6, 0.07, -5],
      [1, 0.07, -14],
    ],
    0.035,
  );
  const pulse = rings(root, [2.6, 0.09, 10], 0.3);
  return (t) => {
    vehicle.position.z = 1.5 - t * 5;
    vehicle.rotation.y = Math.PI - 0.2 + t * 0.2;
    city.position.y = -smooth(0.7, 1, t) * 1.2;
    route.mesh.geometry.setDrawRange(
      0,
      Math.floor((0.35 + t * 0.65) * 96) * 36,
    );
    pulse.position.copy(route.curve.getPoint(t));
  };
}
function gate(root) {
  const animate = createGate(root);
  const portal = group(root, [0, 0, -2.7]);
  box(portal, [-5.5, 3.2, 0], [0.4, 6.4, 0.5], "ivory", 0.07);
  box(portal, [5.5, 3.2, 0], [0.4, 6.4, 0.5], "ivory", 0.07);
  box(portal, [0, 6.2, 0], [11.4, 0.45, 0.55], "ivory", 0.08);
  label(portal, "A GOOD DAY STARTS HERE", [0, 6.2, 0.29], 5, 0.3, {
    fontSize: 56,
  });
  const scan = new THREE.Mesh(
    new THREE.PlaneGeometry(4.5, 3.4),
    new THREE.MeshBasicMaterial({
      color: "#58c6a4",
      transparent: true,
      opacity: 0.085,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  root.add(scan);
  const border = box(root, [0, 0.05, 2], [4.4, 0.025, 0.045], glow);
  return (t) => {
    animate(t);
    scan.position.set(-0.35, 1.75, 4 - t * 7);
    scan.visible = t > 0.08 && t < 0.5;
    border.position.z = scan.position.z;
    border.visible = scan.visible;
  };
}
function parking(root) {
  const animate = createParking(root);
  const route = path(
    root,
    [
      [-6, 0.13, 3.6],
      [-2, 0.13, 3.6],
      [0, 0.13, 2.3],
      [0, 0.13, -1.9],
    ],
    0.04,
  );
  const halo = rings(root, [0, 0.15, -2], 1.4);
  return (t) => {
    animate(t);
    route.mesh.geometry.setDrawRange(
      0,
      Math.floor(smooth(0.03, 0.85, t) * 96) * 36,
    );
    halo.scale.setScalar(0.9 + smooth(0.2, 0.8, t) * 0.3);
    halo.visible = t > 0.2;
  };
}
function assemble(root, build, strength = 3) {
  const animate = build(root);
  const pieces = root.children
    .filter((o) => o.position.y > 0.1)
    .map((o, i) => ({
      o,
      y: o.position.y,
      x: o.position.x,
      delay: (i % 7) * 0.022,
    }));
  return (t) => {
    animate(t);
    pieces.forEach(({ o, y, x, delay }) => {
      const a = 1 - smooth(delay, 0.32 + delay, t);
      o.position.y = y + a * strength * (0.5 + Math.abs(x) * 0.12);
    });
  };
}
function reception(root) {
  const animate = assemble(root, createReception, 3);
  const halo = rings(root, [-2.8, 0.1, 1.8], 0.7);
  return (t) => {
    animate(t);
    halo.visible = t > 0.45;
    halo.scale.setScalar(0.7 + smooth(0.45, 0.8, t) * 0.8);
  };
}
function desks(root) {
  const animate = assemble(root, createDesks, 5);
  const network = [];
  for (const x of [-3.5, 0, 3.5])
    network.push(
      path(
        root,
        [
          [x, 1.2, -2],
          [x, 4, -0.2],
          [0, 4, 1.5],
          [0, 1.2, 1.8],
        ],
        0.012,
      ),
    );
  return (t) => {
    animate(t);
    network.forEach((p, i) => {
      p.mesh.visible = t > 0.37 && t < 0.87;
      p.mesh.geometry.setDrawRange(
        0,
        Math.floor(smooth(0.35 + i * 0.04, 0.7 + i * 0.04, t) * 96) * 36,
      );
    });
  };
}
function meeting(root) {
  const animate = createMeeting(root);
  const ceiling = group(root, [0, 7, 0]);
  for (const x of [-2, 0, 2])
    box(ceiling, [x, 0, -0.3], [0.045, 0.08, 3.2], glow);
  return (t) => {
    animate(t);
    ceiling.position.y = 7 - smooth(0, 0.4, t) * 3;
  };
}
function command(root) {
  const animate = createCommand(root);
  root.traverse((o) => {
    if (!o.isMesh || o.material.map) return;
    if (o.material === materials.ivory || o.material === materials.pale) {
      o.material = new THREE.MeshStandardMaterial({
        color: "#17332f",
        roughness: 0.55,
        metalness: 0.15,
      });
    }
    if (o.material === materials.wood) {
      o.material = new THREE.MeshStandardMaterial({
        color: "#456357",
        roughness: 0.5,
      });
    }
    if (o.material === materials.deep) {
      o.material = new THREE.MeshStandardMaterial({
        color: "#0c211e",
        roughness: 0.3,
        metalness: 0.4,
      });
    }
  });
  const beams = group(root);
  for (const x of [-6, 6])
    path(
      beams,
      [
        [x, 0.08, 4],
        [x, 0.08, -4],
        [x, 4.8, -4],
      ],
      0.025,
    );
  path(
    beams,
    [
      [-6, 4.8, -4],
      [0, 4.8, -4],
      [6, 4.8, -4],
    ],
    0.025,
  );
  const lights = new THREE.PointLight("#5dffbe", 35, 16);
  lights.position.set(0, 3, -2);
  root.add(lights);
  return (t) => {
    animate(t);
    beams.scale.y = 0.3 + smooth(0, 0.5, t) * 0.7;
    lights.intensity = 20 + t * 20;
  };
}
function finale(root) {
  const animate = createCampus(root);
  const building = root.children.find(
    (o) => o.isGroup && Math.abs(o.position.x - 1.2) < 0.01,
  );
  const layers = building.children.map((o) => ({ o, y: o.position.y }));
  const arcs = [];
  [
    [-5, 0.2, 3],
    [-2, 1, 0],
    [1, 4.5, 0],
    [5, 1.5, -3],
  ].forEach((p, i) => {
    const end = [p[0] + (i < 2 ? -4 : 4), 0.12, p[2] + 3];
    const arc = path(root, [p, [p[0], 7 + i, end[2]], end], 0.02);
    arcs.push(arc);
    rings(root, end, 0.4);
  });
  const orbit = rings(root, [1, 0.12, 0], 10.2);
  return (t) => {
    animate(0);
    const explode = Math.sin(smooth(0, 0.9, t) * Math.PI) * 3.5;
    layers.forEach(({ o, y }) => {
      o.position.y = y + (y > 6 ? explode * 2.2 : y > 3.3 ? explode : 0);
      o.visible = true;
    });
    arcs.forEach((a, i) =>
      a.mesh.geometry.setDrawRange(
        0,
        Math.floor(smooth(0.25 + i * 0.035, 0.65 + i * 0.035, t) * 96) * 36,
      ),
    );
    orbit.scale.setScalar(0.85 + smooth(0.25, 0.9, t) * 0.25);
    root.rotation.y = -0.18 + smooth(0, 1, t) * 0.38;
  };
}
export const cinematicFactories = [
  arrival,
  gate,
  parking,
  reception,
  desks,
  meeting,
  command,
  finale,
];
