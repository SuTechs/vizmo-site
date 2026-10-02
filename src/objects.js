import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const palette = {
  paper: "#f2f2e9",
  ivory: "#fcfaf0",
  teal: "#458e84",
  deep: "#284c47",
  sage: "#a6b9a0",
  pale: "#e0e7d8",
  wood: "#c4a680",
  road: "#b8c3b4",
  white: "#ffffff",
  mint: "#c4e5cb",
  glass: "#a9d4cd",
  coral: "#df9b69",
};
export const materials = Object.fromEntries(
  Object.entries(palette).map(([key, color]) => [
    key,
    new THREE.MeshStandardMaterial({
      color,
      roughness: key === "deep" ? 0.45 : 0.8,
      metalness: key === "deep" ? 0.18 : 0,
    }),
  ]),
);
materials.glass = new THREE.MeshPhysicalMaterial({
  color: palette.glass,
  transparent: true,
  opacity: 0.2,
  roughness: 0.12,
  metalness: 0.1,
  depthWrite: false,
  side: THREE.DoubleSide,
});
materials.darkGlass = new THREE.MeshStandardMaterial({
  color: "#4f7772",
  roughness: 0.18,
  metalness: 0.35,
});
materials.light = new THREE.MeshStandardMaterial({
  color: "#ffffe7",
  emissive: "#fff5c9",
  emissiveIntensity: 0.6,
});
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const sphereGeometry = new THREE.SphereGeometry(1, 16, 12);

export function box(parent, position, size, material = "ivory", radius = 0) {
  const mesh = new THREE.Mesh(
    radius ? new RoundedBoxGeometry(...size, 3, radius) : boxGeometry,
    typeof material === "string" ? materials[material] : material,
  );
  mesh.position.set(...position);
  if (!radius) mesh.scale.set(...size);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function cylinder(
  parent,
  position,
  radius,
  height,
  material = "deep",
  radial = 24,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, radial),
    materials[material],
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function sphere(parent, position, scale, material = "sage") {
  const mesh = new THREE.Mesh(sphereGeometry, materials[material]);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
export function group(parent, position = [0, 0, 0]) {
  const result = new THREE.Group();
  result.position.set(...position);
  parent.add(result);
  return result;
}
export function label(parent, text, position, width, height, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = Math.round((768 * height) / width);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = options.background || palette.ivory;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = options.color || palette.deep;
  let fontSize = options.fontSize || Math.floor(canvas.height * 0.48);
  ctx.font = `${options.weight || 500} ${fontSize}px Arial`;
  if (ctx.measureText(text).width > canvas.width * 0.9) {
    fontSize *= (canvas.width * 0.9) / ctx.measureText(text).width;
    ctx.font = `${options.weight || 500} ${fontSize}px Arial`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }),
  );
  mesh.position.set(...position);
  if (options.floor) mesh.rotation.x = -Math.PI / 2;
  parent.add(mesh);
  return mesh;
}
export function plinth(parent, width = 16, depth = 12) {
  box(parent, [0, -0.32, 0], [width, 0.58, depth], "pale", 0.2);
  box(
    parent,
    [0, -0.035, 0],
    [width - 0.15, 0.07, depth - 0.15],
    "ivory",
    0.15,
  );
}
export function tree(parent, x, z, scale = 1) {
  const g = group(parent, [x, 0, z]);
  g.scale.setScalar(scale);
  cylinder(g, [0, 1, 0], 0.095, 2, "wood", 10);
  sphere(g, [0, 2.2, 0], [0.72, 1.04, 0.72], "sage");
  sphere(g, [0.27, 2.62, 0.05], [0.5, 0.67, 0.52], "sage");
  return g;
}
export function plant(parent, x, y, z, scale = 1) {
  const g = group(parent, [x, y, z]);
  g.scale.setScalar(scale);
  cylinder(g, [0, 0.24, 0], 0.22, 0.48, "ivory");
  [
    [0, 0.73, 0],
    [-0.18, 0.6, 0.08],
    [0.16, 0.68, 0.05],
  ].forEach((p) => sphere(g, p, [0.16, 0.36, 0.12], "sage"));
  return g;
}
export function person(parent, position, color = "teal") {
  const g = group(parent, position);
  box(g, [0, 0.83, 0], [0.4, 0.62, 0.26], color, 0.12);
  sphere(g, [0, 1.34, 0], [0.19, 0.21, 0.19], "wood");
  sphere(g, [0, 1.44, -0.015], [0.195, 0.14, 0.19], "deep");
  for (const x of [-0.115, 0.115])
    box(g, [x, 0.28, 0], [0.15, 0.55, 0.18], "deep", 0.04);
  for (const x of [-0.27, 0.27])
    box(g, [x, 0.83, 0], [0.13, 0.55, 0.18], color, 0.06);
  return g;
}
export function car(parent, position = [0, 0, 0], color = "ivory") {
  const g = group(parent, position);
  box(g, [0, 0.58, 0], [1.65, 0.55, 3.2], color, 0.24);
  box(g, [0, 0.92, -0.12], [1.4, 0.59, 1.85], color, 0.23);
  box(g, [0, 1.01, 0.63], [1.28, 0.36, 0.11], "darkGlass", 0.08).rotation.x =
    0.25;
  box(g, [0, 1.01, -0.94], [1.23, 0.33, 0.1], "darkGlass", 0.07).rotation.x =
    -0.2;
  for (const x of [-0.7, 0.7]) {
    box(g, [x, 1.03, -0.14], [0.03, 0.33, 1.25], "darkGlass", 0.01);
    box(g, [x, 1.03, -0.15], [0.06, 0.4, 0.08], color);
    for (const z of [-0.99, 0.99]) {
      const wheel = cylinder(g, [x * 1.12, 0.36, z], 0.34, 0.19, "deep");
      wheel.rotation.z = Math.PI / 2;
      const hub = cylinder(g, [x * 1.27, 0.36, z], 0.18, 0.025, "road");
      hub.rotation.z = Math.PI / 2;
    }
  }
  for (const x of [-0.56, 0.56]) {
    box(g, [x, 0.65, 1.59], [0.34, 0.12, 0.03], "light", 0.02);
    box(g, [x, 0.65, -1.59], [0.34, 0.1, 0.03], "coral", 0.02);
  }
  box(g, [0, 0.49, 1.62], [0.49, 0.12, 0.02], "deep");
  return g;
}
export function securityCamera(parent, x, z) {
  cylinder(parent, [x, 1.9, z], 0.065, 3.8, "deep");
  box(parent, [x + 0.2, 3.75, z], [0.5, 0.24, 0.27], "ivory", 0.05);
  box(parent, [x + 0.46, 3.75, z], [0.015, 0.16, 0.18], "deep");
}
export function chair(parent, position, angle = 0) {
  const g = group(parent, position);
  g.rotation.y = angle;
  box(g, [0, 0.65, 0], [0.69, 0.15, 0.68], "teal", 0.09);
  box(g, [0, 1.09, -0.3], [0.67, 0.72, 0.12], "teal", 0.08);
  cylinder(g, [0, 0.32, 0], 0.05, 0.65, "deep");
  box(g, [0, 0.07, 0], [0.66, 0.05, 0.06], "deep");
  box(g, [0, 0.07, 0], [0.06, 0.05, 0.66], "deep");
  return g;
}
export function desk(parent, position) {
  const g = group(parent, position);
  box(g, [0, 1.1, 0], [2.05, 0.13, 1.08], "wood", 0.07);
  for (const x of [-0.78, 0.78])
    box(g, [x, 0.54, 0], [0.08, 1.06, 0.72], "ivory");
  box(g, [0, 1.58, -0.24], [0.94, 0.58, 0.06], "deep", 0.04);
  box(g, [0, 1.58, -0.2], [0.85, 0.49, 0.012], "darkGlass");
  box(g, [0, 1.25, -0.25], [0.04, 0.3, 0.05], "deep");
  box(g, [0, 1.19, 0.23], [0.65, 0.035, 0.24], "pale", 0.02);
  cylinder(g, [0.73, 1.25, 0.13], 0.08, 0.18, "ivory");
  const seat = chair(g, [0, 0, 1.02], Math.PI);
  return { g, seat };
}
export function roomShell(parent, width = 13, depth = 10, height = 4.8) {
  plinth(parent, width + 1.5, depth + 1.5);
  box(parent, [0, height / 2, -depth / 2], [width, height, 0.18], "ivory");
  box(parent, [-width / 2, height / 2, 0], [0.16, height, depth], "glass");
  for (const z of [-depth / 2, 0, depth / 2])
    box(parent, [-width / 2, height / 2, z], [0.09, height, 0.09], "deep");
  box(parent, [-width / 2, height, 0], [0.16, 0.13, depth], "deep");
  box(parent, [0, height, -depth / 2], [width, 0.13, 0.16], "deep");
}
