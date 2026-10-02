# Vizmo — a connected day

A standalone Three.js prototype for a long, vertically scrolling Vizmo homepage.

## Run

```sh
npm install
npm run dev
```

`npm run build` creates the static production build in `dist/`. `npm run preview` serves that build locally.

## Experience

Eight chapters: campus introduction → security gate → parking → visitor reception → desks → meeting room → Argus command centre → connected campus.

Native page scrolling controls the camera and object animation. Scroll upward to reverse. No scroll hijacking, autoplay, model-viewer controls or animation library. Anchor navigation and all copy remain standard HTML. Reduced-motion preferences show stable chapter views; unsupported WebGL falls back to readable content.

## Structure

- `src/main.js`: chapter progress, HTML state and native scroll events.
- `src/world.js`: Three.js scene, lighting, camera transitions and render-on-scroll.
- `src/objects.js`: shared architectural models, furniture, vehicles and people.
- `src/scenes-exterior.js`: campus, gate and parking sets.
- `src/scenes-interior.js`: reception, desks, meeting room and command centre sets.
- `src/style.css`: responsive page layout.

All 3D geometry is procedural and local. Google Fonts is the only external rendering asset. The booking links point to the existing Vizmo booking site. Booking, check-in and alert states are illustrative animations, not live integrations. The command-centre screens are labeled illustrative views.

This prototype explores direction and scroll choreography. It does not modify or deploy either existing Vizmo site.
