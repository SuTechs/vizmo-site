import * as THREE from "three";
import { createGate, createParking, createCampus } from "./scenes-exterior.js";
import {
  createReception,
  createDesks,
  createMeeting,
  createCommand,
} from "./scenes-interior.js";

// Each chapter has its own physical set. Scroll moves the camera down through
// the sets, while the chapter's local progress controls its reversible action.
const SPACING = 30;
const factories = [
  createCampus,
  createGate,
  createParking,
  createReception,
  createDesks,
  createMeeting,
  createCommand,
  createCampus,
];
const views = [
  { position: [18, 16, 22], target: [0, 2, 0] },
  { position: [16, 15, 19], target: [-0.7, 0.7, 0] },
  { position: [12, 18, 18], target: [0, 0, 0] },
  { position: [16, 12, 19], target: [0, 1.3, 0] },
  { position: [15, 17, 20], target: [0, 1.1, 0] },
  { position: [16, 13, 20], target: [0, 1.6, 0] },
  { position: [12, 12, 23], target: [0, 1.8, -0.5] },
  { position: [19, 18, 23], target: [0, 2, 0] },
];

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 350);
  scene.add(new THREE.HemisphereLight("#fff9e7", "#b2c5af", 3));
  const sunlight = new THREE.DirectionalLight("#fff7df", 3.3);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunlight.shadow.camera, {
    left: -17,
    right: 17,
    top: 17,
    bottom: -17,
    near: 0.5,
    far: 65,
  });
  sunlight.shadow.normalBias = 0.025;
  sunlight.shadow.bias = -0.0001;
  scene.add(sunlight, sunlight.target);
  const fill = new THREE.DirectionalLight("#d5ece3", 1);
  scene.add(fill);

  const chapters = factories.map((build, i) => {
    const group = new THREE.Group();
    group.position.y = -i * SPACING;
    scene.add(group);
    const animate = build(group);
    animate(0);
    return { group, animate };
  });
  const from = new THREE.Vector3(),
    to = new THREE.Vector3(),
    aim = new THREE.Vector3();
  let previousPosition = null;

  function resize() {
    const width = canvas.clientWidth,
      height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Preserve enough horizontal field of view on tall or narrow screens.
    camera.fov = THREE.MathUtils.radToDeg(
      2 *
        Math.atan(
          Math.tan(THREE.MathUtils.degToRad(17.5)) *
            Math.max(1, 1.2 / camera.aspect),
        ),
    );
    camera.updateProjectionMatrix();
    if (previousPosition) render(...previousPosition);
  }

  function render(index, localProgress, transition = 0, reduced = false) {
    previousPosition = [index, localProgress, transition, reduced];
    const next = Math.min(index + 1, chapters.length - 1);
    const mix = reduced ? 0 : THREE.MathUtils.smoothstep(transition, 0, 1);
    chapters.forEach((chapter, i) => {
      chapter.group.visible = i === index || (mix > 0 && i === next);
    });
    chapters[index].animate(reduced ? 0.8 : localProgress);
    if (mix > 0 && next !== index) chapters[next].animate(0);
    const p = views[index],
      n = views[next];
    from.set(...p.position);
    from.y -= index * SPACING;
    to.set(...n.position);
    to.y -= next * SPACING;
    camera.position.lerpVectors(from, to, mix);
    // A restrained dolly provides depth within each vignette; no idle orbit.
    const dolly = reduced ? 0 : (localProgress - 0.5) * 1.1 * (1 - mix);
    camera.position.x += dolly;
    from.set(...p.target);
    from.y -= index * SPACING;
    to.set(...n.target);
    to.y -= next * SPACING;
    aim.lerpVectors(from, to, mix);
    camera.lookAt(aim);
    const worldY = THREE.MathUtils.lerp(-index * SPACING, -next * SPACING, mix);
    sunlight.position.set(-7, worldY + 20, 10);
    sunlight.target.position.set(0, worldY, 0);
    fill.position.set(10, worldY + 8, -8);
    renderer.render(scene, camera);
    // DOM metadata is useful for diagnostics without exposing renderer internals.
    canvas.dataset.chapter = String(mix > 0.5 ? next : index);
    canvas.dataset.progress = localProgress.toFixed(3);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  return {
    render,
    dispose() {
      observer.disconnect();
      renderer.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose();
      });
    },
  };
}
