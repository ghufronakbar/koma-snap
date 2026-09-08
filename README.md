# KomaSnap

**Your face. Four panels. Your story.** A manga-first, client-side photobooth built with Next.js, React, TypeScript, and Canvas. No account, photo upload endpoint, database, analytics, or runtime AI service.

## Live looks and local face effects

The camera now previews the collection look and panel decorations through the same artwork renderer used for export, with a small full-composition preview. Six optional face accessories are available: Soft Blush, Manga Blush, Freckles, Starry, Neko, and Drama. One face is supported at a time. Effects default to Off.

Face tracking runs in a local worker. MediaPipe JavaScript/WASM is copied from the pinned npm dependency at predev/prebuild; the model is bundled in `public/models`. These are same-origin static files, not external runtime APIs. First use downloads model/runtime files from your hosting and consumes hosting bandwidth. No API key or paid inference endpoint is needed. Static Vercel deployment remains subject to the plan's quotas and permitted use.

Raw photos stay editable in memory, with normalized landmarks saved from the captured frame. In Studio → Look, use **Fit effects to photos** for uploaded images or images captured with effects off. Missing faces remain undecorated. Live previews use lower resolution and tracking may lag; actual camera/device performance requires manual verification. `agy` is not used at runtime; these accessories are original procedural drawings, not generated images.

Implementation revision: `docs/plan/07-live-face-effects.md`.

## Local setup

Use Node.js 20.9 or newer and npm.

```sh
npm install
npm run dev
```

For a production-equivalent static preview:

```sh
npm run build
npm start
```

The local preview serves `out/` at `http://localhost:3000`. Set `PORT` to choose another port. It only serves static files; it is not a photo-processing backend. Deploy the contents of `out/` to an HTTPS static host for public use. Do not use `next start` with this static-export configuration.

Set `NEXT_PUBLIC_SITE_URL` to your final HTTPS origin before building for deployment so social-preview metadata uses your domain. The default is the local preview origin. No API keys are required.

`npm run lint` uses the existing ESLint configuration. There is no test suite or testing framework, as requested.

## What is included

- **Booth:** permission-based webcam, front/back switching when available, mirror, 3/5-second countdown per shot, optional synthesized shutter sound, pose prompts, cancellation, single-frame retake, and review/reordering.
- **Upload:** four local JPG, PNG, or WebP files; individual replacement; file/decode validation. Up to 20 MB and 32 megapixels per source, normalized to a 2400-pixel maximum working edge.
- **Nine looks:** Normal (original color, no automatic decor), Koma Impact (lifted shadows, graded screentone, local ink contours), Hero Press (color posterization, ink contours, staggered print dots), Soft Shoujo, Copy Club, Pocket ’98, Risograph (pink/teal print with ink offset), Midnight VHS (channel separation, scanlines, grain), and Flash Booth (warm highlights, contrast, subtle grain/vignette). All use the shared local filter pipeline for live camera, thumbnails, editor, and export.
- **Three layouts:** classic four-panel strip, four-panel manga page, and a cover using one of the four photos.
- **Studio:** per-layout crop, pan, zoom, exposure, mirror, intensity, captions, optional date/credit, 51 original vector stickers, two speech-bubble styles, object anchoring, move/resize/rotate, duplicate/delete/layer order, and undo/redo for the last 30 editing commands.
- **Remix:** three preset compositions per styled collection/layout, without removing user decorations or captions. Normal has no automatic decorations and hides the look-intensity/remix controls; optional face effects, crop, exposure, text, and hand-placed decor remain independent.
- **Result:** PNG export, optional native file sharing and image clipboard, actual-file preview, background selection, and 2× output.
- **Privacy:** session data stays in memory. The camera stops when leaving capture or hiding the tab. Refreshing/closing the tab clears the session. No persistent draft storage or offline guarantee.

## Export sizes

| Format | Standard | 2× |
| --- | --- | --- |
| Story | 1080 × 1920 | 2160 × 3840 |
| Square | 1080 × 1080 | 2160 × 2160 |
| Strip | 800 × 2400 | 1600 × 4800 |

Strip export is available only for the strip layout. Other formats contain the artwork without cropping it. Export size describes pixels, not guaranteed 300-DPI metadata or additional photographic detail. Platform overlays and share destinations vary by device.

## Architecture

- `src/components/koma-snap.tsx`: session, navigation, capture sequencing, entry/booth/result UI, distribution.
- `src/components/editor.tsx`: editor controls and accessible transform alternatives.
- `src/components/ui.tsx`: modal, icons, shared raster previews, labeled sliders.
- `src/hooks/use-camera.ts`: media permission and stream lifecycle.
- `src/lib/model.ts`: types, collection settings, scene/layout geometry.
- `src/lib/photos.ts`: serial local image import and normalization.
- `src/lib/filter.ts`: shared pixel algorithms.
- `src/lib/render.ts`: common canvas rendering pipeline for preview and export.
- `src/lib/stickers.ts`: original vector sticker definitions.
- `scripts/prepare-worker.mjs`: transpiles the same filter implementation into a browser module worker before development/build. If workers cannot run, processing falls back to chunked main-thread work.
- `scripts/serve.mjs`: dependency-free local static preview server.

Photo sources are separate from effects; changing a collection never overwrites them. Replacing/retaking a photo clears old undo history so it cannot reference a released source. User text is plain text, not executable HTML. SVG/HEIC/RAW/GIF uploads and remote image URLs are deliberately not accepted.

## Assets and references

The image-generation tool was unavailable during implementation. Demo portraits are **four original SVG illustrations**, not generated photographs or borrowed anime characters. Collection previews use the actual filter engine. All assets and fonts are served locally.

`public/assets-manifest.json` records provenance. Original illustrations, stickers, and the mark are CC0; font licenses are bundled in `public/fonts/`. A project-wide source-code license has not been selected; do not assume the asset license applies to all code.

`npm run assets` regenerates the original illustrations and simple wireframe proofs, and refreshes font files from the Google Fonts repository. This optional asset preparation needs network access; normal builds use the already bundled fonts and assets.

The bundled social-preview PNG is composed from the same original illustrations. Its source is `scripts/prepare-social.mjs` (using the Sharp installation supplied with Next.js); it is not regenerated during normal builds.

The research and full specification are in `docs/plan/`. The simple SVG files in `docs/plan/visual-proofs/` are layout studies, not AI-generated mockups or final product screenshots.

## Verification and limitations

Production static export and ESLint were checked. Browser inspection covered the demo journey, importing four local PNGs, collection/layout changes, speech-bubble editing, and full-size PNG preview at standard and 2× Story dimensions. Mobile viewport checks are browser emulation, not claims of testing on physical iOS/Android devices.

Real camera hardware, OS permission prompts, native share targets, and mobile save-to-Photos behavior still need checking on the intended devices. Download remains available independently of native sharing. KomaSnap never promises to post directly to Instagram or another platform.

Hosting necessarily receives requests for static files and may keep access logs. Explicitly sharing an image hands it to the app the user chooses; that operation leaves KomaSnap’s privacy boundary.
