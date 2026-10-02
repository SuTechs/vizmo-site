import * as THREE from "three";
import {
  box,
  group,
  cylinder,
  label,
  plant,
  person,
  chair,
  desk,
  roomShell,
} from "./objects.js";

export function createReception(root) {
  roomShell(root, 12, 9, 4.7);
  box(root, [0, 0.035, 0], [11.8, 0.04, 8.8], "pale");
  for (let x = -5; x < 6; x += 2)
    box(root, [x, 0.064, 0], [0.012, 0.008, 8.7], "ivory");
  for (let z = -4; z < 5; z += 2)
    box(root, [0, 0.064, z], [11.8, 0.008, 0.012], "ivory");
  label(root, "vizmo", [0, 3.1, -4.38], 3.5, 1.15, {
    background: "#fcfaf0",
    color: "#377f78",
  });
  label(root, "GOOD TO SEE YOU.", [0, 2.25, -4.37], 2.6, 0.27, {
    fontSize: 63,
  });
  box(root, [0, 0.83, -1.9], [4.8, 1.65, 1.3], "wood", 0.22);
  box(root, [0, 1.7, -1.9], [5, 0.14, 1.48], "ivory", 0.15);
  for (let x = -2.15; x < 2.2; x += 0.18)
    box(root, [x, 0.9, -1.235], [0.025, 1.3, 0.02], "ivory");
  box(root, [-0.9, 2, -1.8], [0.75, 0.49, 0.06], "deep", 0.03);
  person(root, [-0.8, 0.65, -2.9], "sage");
  plant(root, -4.5, 0, -3.3, 1.9);
  plant(root, 4.7, 0, -3.5, 2.1);
  // The kiosk is on a real stand and the check mark is a separate scroll state.
  const kiosk = group(root, [-2.8, 0, 0.65]);
  box(kiosk, [0, 0.05, 0], [0.75, 0.08, 0.6], "deep", 0.04);
  box(kiosk, [0, 0.75, 0], [0.12, 1.4, 0.16], "deep");
  box(kiosk, [0, 1.66, 0], [0.83, 1.04, 0.13], "deep", 0.07);
  label(kiosk, "Check in", [0, 1.67, 0.075], 0.71, 0.88, {
    background: "#e0e7d8",
    fontSize: 75,
  });
  const checked = label(kiosk, "✓", [0, 1.67, 0.078], 0.71, 0.88, {
    background: "#458e84",
    color: "#ffffff",
    fontSize: 440,
  });
  const guest = person(root, [-2.7, 0.08, 3.7]);
  guest.rotation.y = Math.PI;
  for (const x of [2.5, 3.6, 4.7]) {
    box(root, [x, 0.68, 1.5], [0.23, 1.3, 1.2], "deep", 0.05);
    box(root, [x + 0.43, 0.9, 1.5], [0.6, 0.8, 0.03], "glass");
  }
  box(root, [4.1, 1.75, 1.56], [0.15, 0.15, 0.015], "teal");
  return (t) => {
    guest.position.z = THREE.MathUtils.lerp(
      3.7,
      1.85,
      THREE.MathUtils.smoothstep(t, 0.02, 0.42),
    );
    checked.visible = t > 0.48;
  };
}

export function createDesks(root) {
  roomShell(root, 13, 9, 4.4);
  const rug = box(root, [0, 0.02, 0], [9.4, 0.05, 7.4], "pale", 0.2);
  rug.receiveShadow = true;
  let selected;
  for (const x of [-3.5, 0, 3.5])
    for (const z of [-2, 1.7]) {
      const station = desk(root, [x, 0.06, z]);
      if (x === 0 && z > 0) selected = station;
      if (x !== 0) plant(root, x + 0.8, 1.19, z - 0.17, 0.4);
    }
  const marker = box(root, [0, 0.085, 2.2], [2.7, 0.02, 2.8], "mint", 0.16);
  label(root, "MAKE YOURSELF AT WORK.", [0, 3, -4.39], 6, 0.45, {
    fontSize: 65,
  });
  plant(root, -5.4, 0, -3.5, 1.8);
  plant(root, 5.4, 0, -3.5, 1.8);
  box(root, [5.3, 0.6, 3.3], [1.4, 1.2, 0.55], "wood", 0.07);
  const worker = person(root, [0.1, 0.1, 5]);
  worker.rotation.y = Math.PI;
  const flag = label(root, "RESERVED", [0, 2.05, 1.85], 1.3, 0.3, {
    background: "#458e84",
    color: "#ffffff",
    fontSize: 90,
  });
  return (t) => {
    const reserve = THREE.MathUtils.smoothstep(t, 0.2, 0.48);
    marker.visible = t > 0.18;
    flag.visible = t > 0.42;
    selected.seat.position.z = 1.02 + 0.4 * reserve;
    worker.position.z = 5 - THREE.MathUtils.smoothstep(t, 0.43, 0.95) * 1.5;
  };
}

export function createMeeting(root) {
  roomShell(root, 12, 9, 4.7);
  box(root, [0, 0.03, 0], [9.3, 0.06, 6.8], "pale", 0.2);
  box(root, [0, 1.22, -0.3], [5.5, 0.2, 2.3], "wood", 0.55);
  for (const x of [-1.6, 1.6])
    box(root, [x, 0.6, -0.3], [0.16, 1.2, 1.6], "deep");
  for (const x of [-1.8, 0, 1.8]) {
    chair(root, [x, 0, 1.5], Math.PI);
    chair(root, [x, 0, -2.1]);
  }
  box(root, [0, 2.8, -4.35], [4.1, 2.1, 0.12], "deep", 0.08);
  label(root, "Room for ideas.", [0, 2.8, -4.27], 3.88, 1.89, {
    background: "#d1e1cd",
    color: "#284c47",
    fontSize: 65,
  });
  cylinder(root, [0, 1.35, -0.3], 0.23, 0.065, "deep");
  for (const x of [-1.8, 1.8]) {
    box(root, [x, 1.36, 0.1], [0.58, 0.04, 0.44], "ivory", 0.025);
    cylinder(root, [x + 0.47, 1.45, 0], 0.09, 0.18, "ivory");
  }
  const glass = box(root, [2.8, 2.3, 4.2], [5.6, 4.6, 0.08], "glass");
  for (const x of [-5.8, 0, 5.8])
    box(root, [x, 2.35, 4.2], [0.085, 4.7, 0.1], "deep");
  box(root, [0, 4.7, 4.2], [11.7, 0.1, 0.12], "deep");
  const door = group(root, [-5.8, 0, 4.2]);
  box(door, [2.8, 2.3, 0], [5.6, 4.6, 0.06], "glass");
  box(door, [5.4, 2, 0.08], [0.065, 0.65, 0.09], "deep");
  box(root, [5.85, 2, 4.28], [0.6, 0.9, 0.13], "deep", 0.03);
  const bookingPanel = label(root, "Available", [5.85, 2, 4.36], 0.51, 0.78, {
    background: "#c4e5cb",
    fontSize: 70,
  });
  const reservedPanel = label(root, "Reserved", [5.85, 2, 4.365], 0.51, 0.78, {
    background: "#458e84",
    color: "#ffffff",
    fontSize: 70,
  });
  plant(root, 4.9, 0, -3.5, 2);
  plant(root, -4.9, 0, -3.6, 1.5);
  const guest = person(root, [-3.3, 0, 5.25], "sage");
  guest.rotation.y = Math.PI;
  return (t) => {
    const open = THREE.MathUtils.smoothstep(t, 0.3, 0.65);
    door.rotation.y = -open * 1.35;
    guest.position.z = 5.25 - THREE.MathUtils.smoothstep(t, 0.58, 0.95) * 2.8;
    reservedPanel.visible = t > 0.28;
    bookingPanel.visible = t <= 0.28;
    glass.visible = true;
  };
}

function screenTexture(index) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 300;
  const c = canvas.getContext("2d");
  c.fillStyle = "#d3dfd2";
  c.fillRect(0, 0, 512, 300);
  // Architectural thumbnails are illustrative camera views, never live data.
  c.fillStyle = "#aabfaf";
  c.beginPath();
  c.moveTo(0, 160);
  c.lineTo(260, 78);
  c.lineTo(512, 163);
  c.lineTo(512, 300);
  c.lineTo(0, 300);
  c.fill();
  for (let i = 0; i < 4; i++) {
    c.fillStyle = i % 2 ? "#6b8f80" : "#f1f0e4";
    c.fillRect(60 + i * 102, 75 + (index % 2) * 20, 75, 120);
    c.fillStyle = "#668b81";
    c.fillRect(70 + i * 102, 94 + (index % 2) * 20, 55, 35);
  }
  c.fillStyle = "#203f3a";
  c.fillRect(0, 0, 512, 35);
  c.fillRect(0, 270, 512, 30);
  c.fillStyle = "#eff4e9";
  c.font = "15px Arial";
  c.fillText(
    [
      "GATE 01",
      "RECEPTION",
      "PARKING",
      "PERIMETER",
      "ENTRANCE",
      "SITE OVERVIEW",
    ][index],
    15,
    23,
  );
  c.font = "12px Arial";
  c.fillText("ILLUSTRATIVE CAMERA VIEW", 15, 289);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
export function createCommand(root) {
  roomShell(root, 13, 9, 5);
  box(root, [0, 2.6, -4.35], [11.6, 4.3, 0.16], "deep", 0.1);
  const screens = [];
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 3; col++) {
      const x = -3.7 + col * 3.7,
        y = 1.65 + row * 1.9;
      const material = new THREE.MeshBasicMaterial({
        map: screenTexture(row * 3 + col),
      });
      box(root, [x, y, -4.22], [3.48, 1.73, 0.08], "deep", 0.04);
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(3.35, 1.62),
        material,
      );
      screen.position.set(x, y, -4.167);
      root.add(screen);
      screens.push(screen);
    }
  for (const x of [-3.5, 0, 3.5]) {
    desk(root, [x, 0, 0.5]);
    person(root, [x, 0.15, 2.15], "deep").rotation.y = Math.PI;
  }
  plant(root, -5.8, 0, 3.4, 1.8);
  plant(root, 5.8, 0, 3.4, 1.8);
  const alert = group(root, [0, 2.7, -3.9]);
  box(alert, [0, 0, 0], [3.15, 0.94, 0.07], "ivory", 0.08);
  const pending = label(alert, "CAMERA OFFLINE", [0, 0, 0.045], 2.95, 0.75, {
    background: "#fcfaf0",
    color: "#995827",
    fontSize: 63,
  });
  const acknowledged = label(alert, "ACKNOWLEDGED", [0, 0, 0.05], 2.95, 0.75, {
    background: "#c4e5cb",
    color: "#284c47",
    fontSize: 63,
  });
  return (t) => {
    alert.visible = t > 0.18;
    pending.visible = t < 0.61;
    acknowledged.visible = t >= 0.61;
    screens.forEach((s, i) =>
      s.material.color.setScalar(
        0.55 + THREE.MathUtils.smoothstep(t, i * 0.045, 0.4 + i * 0.045) * 0.45,
      ),
    );
  };
}
