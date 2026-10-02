import * as THREE from "three";
import { cinematicFactories } from "./cinematic-scenes.js";
import { shots } from "./camera-paths.js";

const LIGHT = new THREE.Color("#e9eee2");
const DARK = new THREE.Color("#0b211d");

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.background = LIGHT.clone();
  scene.fog = new THREE.Fog(LIGHT, 30, 90);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 180);
  // A compact studio reflection map avoids compiling a second lit 3D room.
  const studio = document.createElement("canvas");
  studio.width = 512;
  studio.height = 256;
  const ctx = studio.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.5, "#b6c5ad");
  gradient.addColorStop(1, "#6c8071");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(30, 35, 100, 130);
  ctx.fillRect(280, 40, 35, 110);
  const environment = new THREE.CanvasTexture(studio);
  environment.mapping = THREE.EquirectangularReflectionMapping;
  environment.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(environment);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.6;
  environment.dispose();
  pmrem.dispose();
  const hemi = new THREE.HemisphereLight("#faffec", "#75947b", 1.8);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff3d5", 3);
  sun.position.set(-10, 18, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -22,
    right: 22,
    top: 22,
    bottom: -22,
    near: 0.5,
    far: 65,
  });
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.0001;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight("#b2fbd6", 2.1);
  rim.position.set(7, 7, -10);
  scene.add(rim);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: LIGHT, roughness: 0.86 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.64;
  floor.receiveShadow = true;
  scene.add(floor);
  const sets = new Array(cinematicFactories.length);
  function ensureSet(index) {
    if (sets[index]) return;
    const root = new THREE.Group();
    root.visible = false;
    scene.add(root);
    sets[index] = { root, animate: cinematicFactories[index](root) };
  }
  // Two live renders blend through a reversible, scroll-controlled aperture.
  const targetA = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    depthBuffer: true,
  });
  const targetB = targetA.clone();
  const mixScene = new THREE.Scene();
  const mixCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const blend = new THREE.ShaderMaterial({
    uniforms: {
      a: { value: targetA.texture },
      b: { value: targetB.texture },
      mixValue: { value: 0 },
      aspect: { value: 1 },
      origin: { value: new THREE.Vector2(0.65, 0.48) },
    },
    vertexShader:
      "varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}",
    fragmentShader: `
      uniform sampler2D a; uniform sampler2D b; uniform float mixValue; uniform float aspect; uniform vec2 origin; varying vec2 vUv;
      void main(){
        vec2 p=vUv-origin; p.x*=aspect;
        float distance=length(p);
        float edgeDistance=length(vec2(max(origin.x,1.0-origin.x)*aspect,max(origin.y,1.0-origin.y)));
        float radius=mix(-.22,edgeDistance+.25,mixValue);
        float reveal=1.0-smoothstep(radius-.16,radius+.16,distance);
        float edge=sin(clamp(reveal,0.,1.)*3.14159265)*.018;
        vec2 distort=normalize(p+vec2(.0001))*edge;
        vec4 first=texture2D(a,vUv+distort);
        vec4 second=texture2D(b,vUv-distort);
        gl_FragColor=mix(first,second,reveal);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    depthTest: false,
    depthWrite: false,
  });
  mixScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blend));
  const p = new THREE.Vector3(),
    t = new THREE.Vector3(),
    q = new THREE.Vector3();
  let saved = null,
    width = 1,
    height = 1;
  function pose(index, progress, reduced) {
    const keys = shots[index];
    const value = reduced ? 0.55 : progress;
    let segment = keys.findIndex(
      (k, i) => i < keys.length - 1 && value >= k.at && value <= keys[i + 1].at,
    );
    if (segment < 0) segment = keys.length - 2;
    const start = keys[segment],
      end = keys[segment + 1];
    const fraction = THREE.MathUtils.smootherstep(value, start.at, end.at);
    p.fromArray(start.p).lerp(q.fromArray(end.p), fraction);
    t.fromArray(start.t).lerp(q.fromArray(end.t), fraction);
    camera.position.copy(p);
    camera.lookAt(t);
    const mobile = width < 900;
    const fov = THREE.MathUtils.lerp(start.f, end.f, fraction);
    camera.fov = THREE.MathUtils.radToDeg(
      2 *
        Math.atan(
          Math.tan(THREE.MathUtils.degToRad(fov / 2)) *
            Math.max(1, (mobile ? 1.06 : 1.1) / camera.aspect),
        ),
    );
    const offset = mobile ? 0 : index === 5 ? 0.19 : -0.17;
    camera.setViewOffset(
      width,
      height,
      width * offset,
      -height * (mobile ? 0.06 : 0.055),
      width,
      height,
    );
    camera.updateProjectionMatrix();
  }
  function drawSet(index, progress, target, reduced) {
    ensureSet(index);
    const dark = index === 6;
    sets.forEach((set, i) => {
      set.root.visible = i === index;
    });
    sets[index].animate(reduced ? 0.75 : progress);
    scene.background.copy(dark ? DARK : LIGHT);
    scene.fog.color.copy(scene.background);
    floor.material.color.copy(dark ? DARK : LIGHT);
    hemi.intensity = dark ? 0.65 : 1.8;
    sun.intensity = dark ? 1.2 : 3;
    rim.intensity = dark ? 3.5 : 2.1;
    scene.environmentIntensity = dark ? 0.3 : 0.6;
    pose(index, progress, reduced);
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
  }
  function render(index, progress, transition = 0, reduced = false) {
    saved = [index, progress, transition, reduced];
    const next = Math.min(index + 1, sets.length - 1);
    if (transition > 0 && !reduced && next !== index) {
      drawSet(index, progress, targetA, reduced);
      drawSet(next, 0, targetB, reduced);
      blend.uniforms.mixValue.value = transition;
      renderer.setRenderTarget(null);
      renderer.render(mixScene, mixCamera);
    } else drawSet(index, progress, null, reduced);
    canvas.dataset.chapter = String(transition > 0.5 ? next : index);
    canvas.dataset.progress = progress.toFixed(3);
  }
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const scale = renderer.getPixelRatio();
    targetA.setSize(width * scale, height * scale);
    targetB.setSize(width * scale, height * scale);
    blend.uniforms.aspect.value = width / height;
    if (saved) render(...saved);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  return {
    render,
    dispose() {
      observer.disconnect();
      targetA.dispose();
      targetB.dispose();
      env.dispose();
      renderer.dispose();
    },
  };
}
