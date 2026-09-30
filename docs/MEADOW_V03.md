# Seceda v0.3 — summer meadow milestone

## Recovery checkpoint and scope

The complete v0.2 source, docs and comparison artifacts were committed **before any implementation edits** as `cd0c1fc3fb1eb73064a4cd5a254816bb963ab3b8`. Reference photos, node_modules and release folders are ignored and absent from that commit.

The original 327.9799 m route, 1.72 m eye height, controls, conservative collision checks, camera field of view and viewpoint remain. No extra walk section was added: the work concentrates on the existing meadow and ridge. All terrain rasters, the sampling code and player controller are unchanged from the checkpoint. The separate portable folder is `release/Seceda-Windows-v0.3`; v0.1 and v0.2 remain available.

## Specific visual target

The four user-supplied images in the ignored `artifacts/references/user/` folder were viewed directly:

- `01-ridge-path-clouds.png`: narrow dirt path, grass approaching its worn edges, large sunlit clouds, strong meadow/rock contrast.
- `02-valley-peaks.png`: cool recesses, illuminated distant slopes, uneven flower cover, valley depth.
- `03-wildflower-meadow.png`: tall fine grass, low leaves, yellow radial flowers, smaller pink clover and white flowers in irregular banks.
- `04-ridge-walk-clouds.png`: fractured upright limestone, turf breaking around ledges, trail width at human scale.

These are visual direction only. No source-photo pixels are used in materials, sky, vegetation, comparison page or portable builds. The references have no assumed redistribution license. New vegetation and clouds are procedural authored assets; the existing Poly Haven CC0 material ingredients remain documented in ASSETS.md.

The iteration follows the concrete-target, repeatable-view and measurement approach in [Building games with Astra](https://developers.openai.com/blog/how-to-build-games-with-astra): compare identical views, inspect the actual running game, isolate effects when diagnosing faults, and distinguish render counters from hardware timings.

## What changed

- **Meadow:** 92,000 instanced clumps divided among fine bent blades, taller arching blades, and shorter broad leaves. Heights, greens, dry tips and density vary in overlapping local patches, with supplemental cover alongside the trail. 4,200 yellow hawkweed-inspired flowers, 1,500 pink clover-inspired heads, and 1,600 white daisy-inspired flowers have separate geometry. These are botanical approximations, not identified species reconstructions.
- **Trail:** doubled distance-field resolution over a tighter metric extent; narrowed soft shoulders, irregular worn edges, natural plant overlap and additional embedded margin stones. Original centreline and terrain surface are retained. The path is authored, not a surveyed recreation of a particular photographed path.
- **Rock:** continuous 4 m fracture skin replaces independent rectangular panels. Its authored outward relief is limited to roughly 1–6 m and stays outside the walkable area. Embedded angular buttresses, larger irregular beds and long dark fractures add local depth. Cliff geometry does not replace the survey or claim measured geological accuracy.
- **Atmosphere:** a world-space procedural cloud density field is rendered once into a 768-pixel-per-face HDR cube. A separate 512² transmission map uses the same cloud density and sun direction to modulate terrain/plant sunlight. No per-frame cloud raymarch is needed. The sky has more blue depth, cloud interiors receive self-shadowing, and the existing light-distance fog density is unchanged. Ambient illumination is softer; static 4096² near-field shadows now include vegetation.
- **Reset:** a shared reset path clears reached state, the arrival banner, movement keys, velocity and old toast state. QA camera repositioning clears arrival state before the next HUD evaluation. The capture harness checks reset before returning to the visible start screen. The preserved v0.2 executable is not patched; its known stale-banner bug is suppressed only in the baseline capture harness.

## Repeatable evidence

`artifacts/meadow-v03/index.html` is a matched screenshot comparison. Poses are identical to v0.2, not reframed to flatter v0.3:

| View | Local X / Z metres | Yaw / pitch radians |
|---|---|---|
| Start | 15 / 165 | -0.65 / +0.025 |
| Midpoint | 74 / 15 | -0.70 / +0.040 |
| Viewpoint | 150 / -120 | -1.14 / -0.040 |

All matched images use the same 1600 × 1000 viewport, 66° vertical FOV and survey-derived eye elevation. The v0.2 capture comes from its preserved portable executable. The final v0.3 captures come from the new portable executable. `04-default-start.png` additionally verifies the post-viewpoint reset flow with the UI visible.

The first inspection found overly dark back-facing leaves and undersampled cloud bands; both were corrected and re-rendered. A controlled cliff-skin-off render showed that the remaining grid was also present in the material; continuous, wider-spaced bedding replaced the discontinuous seam function. These diagnostic images are distinct from final packaged evidence.

## Verification results

Final machine-readable evidence: `packaged-walk.json`, `performance.json`, and each stage's `report.json` in `artifacts/meadow-v03`. The packaged real-time traversal completed in **189.304 seconds**, with **zero blocked steps**, **0.02364 m** maximum eye/ground smoothing error and **zero runtime errors**. The test held real KeyW input, steering automatically every 200 ms; it did not teleport or call controller.step directly during the traversal. Pointer capture, mouse input, Escape pause, QA reset and keyboard R were exercised. Final start, midpoint, viewpoint and post-reset UI captures were inspected. All six matched screenshots load, and comparison tabs and divider passed the browser check.

Measured at 1600 × 1000 using ANGLE/D3D11 on the **NVIDIA GeForce RTX 4070 Laptop GPU**:

| Metric | Preserved v0.2 | v0.3 |
|---|---:|---:|
| Mean frame interval | 13.334 ms | 13.334 ms |
| p95 frame interval | 13.50 ms | 13.50 ms |
| Frames above 25 ms in sweep | 0 | 0 |
| Mean GPU render query | 4.724 ms | 4.712 ms |
| p95 GPU render query | 5.673 ms | 5.630 ms |
| Mean CPU render submission | 0.233 ms | 0.267 ms |
| Midpoint triangles | 5,859,604 | 7,975,214 |
| Midpoint draw calls | 30 | 34 |
| Loaded geometries / textures | 32 / 8 | 36 / 10 |
| Launch to ready in this run | 1.530 s | 1.865 s |

Both versions reach the approximately 75 Hz display limit here. GPU timing uses EXT_disjoint_timer_query_webgl2, with no disjoint result; the small difference is measurement variation, not evidence that v0.3 is faster. Geometry grows by about 36%, and CPU submission increases slightly. This is a sequential 11-second repeatable camera sweep, excluding its first second; it is not a cross-hardware benchmark. Static cloud/shadow baking is included in startup time, not ordinary frame GPU queries. The full traversal separately verifies actual-time controller/input behavior.

The CPU terrain/controller checks pass: all data finite, expected CRS and 1:1 scale, complete original route, maximum accelerated-test grounding error 0.023 m, cliff stop, conservative rock collision, diagonal-speed normalization and frame-delta cap. These isolated checks supplement, rather than replace, the actual-time packaged traversal.

## What still needs work

- Close grass still reveals repeated blade models and simplified bent strips. Pink heads are small and simplified; the flower shapes are stylized, especially close to the camera. Flower stems lack a full botanical leaf/branch structure.
- Broad meadow cover beyond the decorated route corridor remains a ground material. The lush strip should eventually become a streamed, slope-aware ecosystem covering the wider terrain.
- Rock silhouettes still inherit the heightfield's softened survey sampling. Authored buttresses help locally, but cannot substitute for careful major cliff/overhang meshes. Some bedding and surface-texture repetition remains visible.
- The path remains a material on the DTM: no eroded cut bank, micro-ruts or small terrain displacement. Plants and pebbles have no individual collision; substantial rocks and posts do.
- Clouds and their shadows are static baked conditions. Grass moves slightly, but its shadow is baked in the initial wind pose. Cloud horizon blending and distance lighting remain artistic approximations, not a physical weather simulation.
- No extension, valleys, buildings or forest reconstruction was added. Performance on other PCs and critical audio listening remain unverified. This is a playable visual prototype, not a photorealistic reconstruction.
