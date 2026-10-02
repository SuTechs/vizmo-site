# Vizmo — a connected day

A standalone Three.js prototype for a long, vertically scrolling Vizmo homepage.

## Run

```sh
npm install
npm run dev
```

`npm run build` creates the static production build in `dist/`. `npm run preview` serves that build locally.

## Experience

Eight chapters: car arrival → security gate → parking → visitor reception → desks → meeting room → Argus command centre → connected campus.

The cinematic version opens beside a metallic teal car and moves through a series of directed camera shots. A security scan crosses the entrance, an illuminated route guides parking, reception and desk elements assemble into place, and the meeting room reveals its ceiling lights. The command centre switches to a dark palette before the finale separates the campus into connected architectural layers and reassembles it. A scroll-controlled aperture reveals each new chapter.

Native page scrolling controls the camera and object animation. Scroll upward to reverse. No scroll hijacking, autoplay, model-viewer controls or animation library. Anchor navigation and all copy remain standard HTML. Reduced-motion preferences show stable chapter views; unsupported WebGL falls back to readable content.

## Structure

- `src/main.js`: chapter progress, HTML state and native scroll events.
- `src/world.js`: studio lighting, lazy scene construction, dual render targets, aperture transitions and render-on-scroll.
- `src/camera-paths.js`: camera position, target and field-of-view keyframes for each chapter.
- `src/cinematic-scenes.js`: arrival scene and scroll choreography layered onto the architectural sets.
- `src/objects.js`: shared architectural models, furniture, vehicles and people.
- `src/scenes-exterior.js`: campus, gate and parking sets.
- `src/scenes-interior.js`: reception, desks, meeting room and command centre sets.
- `src/style.css`: responsive page layout.
- `tests/choreography.test.js`: finite transforms, reversible animation, valid geometry ranges and complete camera paths. Run with `npm test`.

The renderer caps device pixel ratio at 1.65, creates sets as they are reached, and renders only after scroll or resize events. The aperture transition briefly renders two sets. GPU performance and visual framing should be checked on target devices before using this as a production homepage.

All 3D geometry is procedural and local. Google Fonts is the only external rendering asset. The booking links point to the existing Vizmo booking site. Booking, check-in and alert states are illustrative animations, not live integrations. The command-centre screens are labeled illustrative views.

This prototype explores direction and scroll choreography. It does not modify or deploy either existing Vizmo site.
