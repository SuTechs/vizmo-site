import { createWorld } from "./world.js";

const chapters = [...document.querySelectorAll("[data-chapter]")];
const links = [...document.querySelectorAll(".chapter-nav a")];
const stage = document.querySelector(".scene-stage");
const canvas = document.querySelector("#world");
const progressBar = document.querySelector(".page-progress > div");
const note = document.querySelector("#scene-note");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const names = [
  "A connected workplace",
  "The security entrance",
  "A place to park",
  "A warmer welcome",
  "Your place to work",
  "Room to come together",
  "The command centre",
  "Every part connected",
];
const notes = [
  [
    [
      "ONE CONNECTED DAY",
      "Everything in its place.",
      "Security. People. Spaces.",
    ],
  ],
  [
    ["VEHICLE ENTRANCE", "Welcome to the campus.", "Entry awaiting approval"],
    ["ACCESS APPROVED", "You’re expected.", "The barrier is opening"],
  ],
  [
    ["VIZMO PARKING", "A space with your name on it.", "P03 · Reserved"],
    ["PARKING CHECK-IN", "You have arrived.", "P03 · Checked in"],
  ],
  [
    ["VIZMO VISITORS", "A little less waiting.", "Check in at reception"],
    ["CHECK-IN COMPLETE", "A warm welcome.", "Your host has been notified"],
  ],
  [
    ["VIZMO DESKS", "Find your kind of space.", "Choose an available desk"],
    ["DESK RESERVED", "Make yourself at work.", "Your space is ready"],
  ],
  [
    ["VIZMO ROOMS", "Good ideas need room.", "Find a space for your team"],
    [
      "ROOM RESERVED",
      "Bring everyone together.",
      "Calendars and spaces, in sync",
    ],
  ],
  [
    [
      "VIZMO ARGUS · EXAMPLE",
      "An exception, in view.",
      "Camera offline · New alert",
    ],
    [
      "VIZMO ARGUS · EXAMPLE",
      "An action, accounted for.",
      "Assigned → Acknowledged",
    ],
  ],
  [
    [
      "ONE DELIVERY PARTNER",
      "A workplace, connected.",
      "From design to daily operation",
    ],
  ],
];

let world,
  offsets = [],
  frame = 0,
  lastChapter = -1,
  lastNote = "",
  contextLost = false;
function failGracefully() {
  document.body.classList.add("scene-unavailable");
  document.querySelector("#webgl-message").hidden = false;
  const loader = document.querySelector("#scene-loader");
  if (loader) loader.hidden = true;
}
try {
  world = createWorld(canvas);
  document.querySelector("#scene-loader").remove();
} catch (error) {
  console.error("The 3D preview could not be initialized:", error);
  failGracefully();
}
canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  contextLost = true;
  failGracefully();
});
canvas.addEventListener("webglcontextrestored", () => {
  contextLost = false;
  document.body.classList.remove("scene-unavailable");
  document.querySelector("#webgl-message").hidden = true;
  schedule();
});

function measure() {
  offsets = chapters.map((el) => ({
    top: el.offsetTop,
    height: el.offsetHeight,
  }));
  schedule();
}
function update() {
  frame = 0;
  const y = Math.max(0, window.scrollY);
  let index = offsets.findLastIndex((item) => y >= item.top);
  index = Math.max(0, Math.min(index, chapters.length - 1));
  const chapter = offsets[index];
  if (!chapter) return;
  const local = Math.max(0, Math.min(1, (y - chapter.top) / chapter.height));
  // The action finishes before the last 26% of a chapter. That final segment
  // carries the camera vertically to the next set, matching the passing text.
  const action = Math.min(1, local / 0.68);
  const transition =
    index < chapters.length - 1 ? Math.max(0, (local - 0.74) / 0.26) : 0;
  if (world && !contextLost)
    world.render(index, action, transition, reducedMotion.matches);
  const active =
    transition > 0.5 ? Math.min(index + 1, chapters.length - 1) : index;
  if (active !== lastChapter) {
    links.forEach((link, i) => {
      if (i === active) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
    document.querySelector("#scene-name").textContent = names[active];
    document.querySelector("#scene-count").textContent =
      `${String(active).padStart(2, "0")} / 07`;
    lastChapter = active;
  }
  const state =
    active === index &&
    action > (index === 6 ? 0.61 : index === 2 ? 0.86 : 0.48)
      ? 1
      : 0;
  const content = notes[active][state] || notes[active][0];
  if (lastNote !== content[1]) {
    note.querySelector(".note-kicker").textContent = content[0];
    note.querySelector("strong").textContent = content[1];
    note.querySelector(".note-detail").textContent = content[2];
    lastNote = content[1];
  }
  note.classList.toggle(
    "transitioning",
    transition > 0.15 && transition < 0.85,
  );
  const length = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.transform = `scaleX(${length > 0 ? Math.min(1, y / length) : 0})`;
  const footerTop = document
    .querySelector(".site-footer")
    .getBoundingClientRect().top;
  stage.style.opacity = String(
    Math.max(
      0,
      Math.min(1, (footerTop - innerHeight * 0.15) / (innerHeight * 0.5)),
    ),
  );
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(update);
}
window.addEventListener("scroll", schedule, { passive: true });
window.addEventListener("resize", measure, { passive: true });
reducedMotion.addEventListener("change", measure);
document.fonts.ready.then(measure);
measure();
