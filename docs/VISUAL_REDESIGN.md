# Seceda visual redesign — v0.2.0

## Scope and recovery

This is one focused visual pass on the existing **327.9799 m route**. No map bounds, route points, elevation samples, walking speeds, controls, or gameplay systems were changed. Source origin remains EPSG:25832 E708700/N5164300/elevation2500; horizontal and vertical scale remain 1:1.

The folder initially had no Git repository. It was initialized and the complete existing source, terrain and evidence were committed **before scene edits**:

`8a27e24 — Checkpoint playable Seceda before focused visual redesign`

The initial portable build remains in `release/Seceda-Windows`. The redesigned portable build is `release/Seceda-Windows-Redesign/Seceda.exe`; the root launcher opens the redesigned version. The final scene edits are available as a working-tree diff against the checkpoint.

## Photo references and resulting decisions

Two actual Seceda photographs were inspected locally, strictly as references:

1. Earth Trekkers, [Famous Seceda Viewpoint](https://www.earthtrekkers.com/wp-content/uploads/2022/08/Famous-Seceda-Viewpoint.jpg.webp), associated with [their Seceda article](https://www.earthtrekkers.com/seceda-dolomites/). Cues: pale towers with long vertical clefts, fine tilted beds on the nearer ridge, abruptly exposed rock beside a thin meadow cap, much darker lower valleys.
2. iStock image used by [The Independent's Seceda trail article](https://www.independent.co.uk/travel/news-and-advice/italy-dolomites-farmers-tourist-levy-odle-peaks-b2799456.html), [reference photograph](https://static.independent.co.uk/2025/07/31/8/10/iStock-2180425816.jpeg). Cues: narrow compacted soil, turf growing into the margins, islands/bands of buttercups, grass height variation, directional light separating illuminated limestone from recessed gullies.

Reference copies are confined to ignored `artifacts/references/`. **They are absent from assets, runtime requests, and the portable build.** Existing licensed CC0 Poly Haven textures remain the material ingredients; no new photo scenery or skybox was introduced.

## The focused changes

- **Trail:** removed the separate gravel ribbon. A distance field of the same route centreline blends compacted soil, grit, sparse margin pebbles and feathered turf shoulders directly on the terrain. Width varies naturally; clumps slightly encroach on worn edges. Source heights and collision remain unchanged.
- **Foreground:** replaced uniform scatter with clustered grass tussocks, dry seed-like stalks, flower islands with stems, and a small number of partly buried limestone outcrops with fragments on their downhill side. Start, midpoint and ridge have distinct foreground groups while stretches of open meadow remain.
- **Ridge:** pale weathered rock, irregular inclined bedding, vertical joints and larger-scale surface relief. Independent protruding rock panels follow steep parts of the surveyed ridge and blend back into the terrain material. They are authored detail, not new survey accuracy or enlarged mountains.
- **Light/depth:** a consistent west/southwest afternoon sun and cooler fill, plus a static solar-horizon mask calculated from the real terrain. This separates gullies and lower slopes from sunlit faces. Near rocks/posts retain real-time shadows, cached because the scene is static. **Fog density remains exactly 0.000075**, and no global saturation boost is used.
- **Opening:** only the initial look direction changed, toward the visible Odle; player position, eye height and FOV did not. The trail remains visible on the left. Reset uses that same opening view.

## Matched screenshot comparison

Open `artifacts/redesign/index.html` for three interactive wipe comparisons. Raw PNGs and capture reports are in `artifacts/redesign/before` and `after`.

| Camera | Local X / Z (m) | Yaw / pitch (rad) | Resolution |
|---|---|---|---|
| Start | 15 / 165 | -0.65 / +0.025 | 1600 × 1000 |
| Midpoint | 74 / 15 | -0.70 / +0.040 | 1600 × 1000 |
| Viewpoint | 150 / -120 | -1.14 / -0.040 | 1600 × 1000 |

Position, direction, FOV (66° vertical), resolution and hidden-UI state match in each pair. The **before start comparison also faces toward the peaks** to avoid attributing a camera turn to the material redesign. Separate `04-default-start.png` captures preserve the actual original and redesigned opening views.

## Validation

The desktop source build completed the route with all **75 revised scene colliders** in **188.55 simulated seconds**, with maximum ground smoothing error **0.023 m**. The actual W key, mouse input, pointer capture, Escape pause, fixed paused position and reset checks passed. The controller tests also passed obstacle, cliff approach, diagonal-speed and large-frame-delta checks. Traversal is accelerated fixed-step simulation through the production controller, not a claim of a manual timed playthrough.

At the three matched 1600×1000 views, the original rendered about **5.91 million triangles** and the redesign about **5.86 million**. Draw calls stayed at **37 / 30 / 9**. Observed steady frame intervals were approximately **13.3 ms** in both versions on this machine; that is a vsync-limited local observation, not a minimum hardware guarantee. Final packaged-build tests and performance comparison are recorded in `artifacts/redesign/packaged-tests.json` and `performance.json`.

The initial material pass exposed excessive micro-bump contrast and a cliff-panel transition crossing onto turf. Both were corrected after screenshot review. All final three camera captures were inspected again. The delivered portable executable independently passed the complete route, input/pause/reset checks and all three camera captures with no shader or console errors.

An additional identical 11-second camera sweep in both portable executables measured **13.33 ms mean / 13.5 ms p95** frame intervals for both, with **zero frames above 25 ms** after the first second. Startup-to-ready was about 2.01 s before and 1.86 s after in that run. These short, display-limited measurements show no observed regression on this machine; they do not predict lower-powered hardware.

## Still visibly artificial

Grass blades and flower heads remain inexpensive repeated geometry. Close limestone fragments are angular; the cliff-panel construction and some bed repetition can be spotted. The trail margins are texture blending rather than eroded soil geometry. The DTM rounds silhouettes and cannot supply true overhangs; added rock faces are interpretations. The static sky and broad terrain lack the fine detail and environmental complexity of the reference photographs. There is no claim of photorealism, geological reconstruction, or performance validation on other PCs.

## Relevant files

`src/landscape.js` holds route wear, ecological variation and the static terrain light mask. `src/materials.js` implements blended ground and rock shading. `src/details.js` owns clustered vegetation, outcrops and cliff panels. The original source rasters and `src/terrain.js` are unchanged. `src/player.js` differs only in the reset/opening look direction.
