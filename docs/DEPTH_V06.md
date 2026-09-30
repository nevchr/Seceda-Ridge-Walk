# Seceda V0.6 — cliff depth and continuous turf

V0.5 was checkpointed before edits: **f7c3fcaa97276994d4725540bc5452fe3eb9e732**. Source, assets, documentation and comparison artifacts are in that commit. Private reference photos and all portable builds remain ignored. V0.6 is a separate `release/Seceda-Windows-v0.6` build.

## Visible result and remaining limits

The normal walking views now show a continuous short-grass layer instead of radial tufts on exposed dark ground. Larger plants remain sparse accents. Actual cliff geometry now contributes distant cast shadows, making the main recesses and ledges more legible without changing the V0.5 silhouettes. The eight matched pairs and isolated tests are in `artifacts/depth-v06/index.html`.

This remains a visual prototype. Grass blades still look angular at close range; flowers and a few larger clumps are recognizably procedural. Beyond the blade field, surface turf is smoother and less botanically varied than the photos. The authored cliffs retain polygonal shelves, some repetitive fluting and broad smooth faces. The 4 m shadow receiver bias suppresses artifacts but loses very small contact shadows. The static lighting capture must be rebuilt if the sun or rock geometry changes. This is not a photogrammetric reconstruction.

## Controlled cliff diagnosis

The camera was already rendering the peaks. The original live shadow camera covers a **360 × 360 m** square at 4096²; the separate DTM solar-horizon texture covers 14 × 12 km at 512², approximately 27 × 23 m per texel. The DTM map excludes all four authored cliff meshes. Those meshes also did not cast into the live map.

At the identical V0.5 viewpoint, a fixed distant-ridge rectangle measured:

| Individual change | Mean RGB difference, 0–255 | Pixels changing over 2 levels |
|---|---:|---:|
| Live shadows disabled | 0.000 | 0.00% |
| DTM horizon disabled | 2.077 | 11.29% |
| Authored casting enabled in existing live area | 0.269 | 0.98% |
| Material bump disabled | 0.053 | 0.06% |

These are image differences, not quality scores. They establish why a larger rock texture or simply enabling nearby shadow casting would not solve the distant view. See `lighting-diagnosis.json` and `diagnostics-before/`.

`massif-light.js` renders the three surveyed terrain meshes and all four unchanged cliff meshes **once at startup** into a separate 2048² directional depth target. Its light-space footprint is about 4.82 × 3.88 km, giving 2.35 × 1.90 m texels. Nine filtered depth comparisons reveal occluded faces and ledges. Sampling uses actual geometry positions, rather than the survey anchors used for cliff texture mapping. The existing DTM horizon remains the fallback outside this massif region; clouds and near shadows are unchanged.

The solution study compares DTM visibility, terrain-only geometry depth, and terrain plus authored geometry at 1024²/2048². The latter preserves narrower ledge shadows with less coarse filtering. Bias tests exposed artificial striping from normal offsets on sharply changing walls; a sunward receiver offset reduced it. The 4096² near shadow map and all existing material texture sizes were retained.

## Continuous meadow

`turf.js` supplies original fine leaf strokes on a seamless 1024² surface texture, sampled at 1.5 m, plus two shared batches of independently positioned blades. The surface remains present across the visible meadow. Detailed blade tiles follow the camera across the entire existing walking area; they are not placed only around screenshot poses.

Near blades have narrow and broader leaf variants, varied height/bend, and shared world-space color patches. The density is 400 blades/m² nearby and 20/m² at mid range. Near geometry fades between 22–33 m, mid geometry between 58–90 m, with overlapping transitions and sufficient tile-selection margin. Roots interpolate the same surveyed mesh triangles using a 721 × 521 floating-point height texture. The unchanged trail mask excludes worn dirt, and steep ground reduces cover. Near and distant turf use the same palette, cloud visibility and sunlight direction.

The old repeated radial basal geometry was removed. The existing CC0 grass clumps are less numerous and fade smoothly into the fine cover. Flowers remain original project geometry. No user-photo pixels are used anywhere in these resources.

## Measured performance

Final sequential portable runs: RTX 4070 Laptop GPU, ANGLE/D3D11, 1600 × 1000, same eleven-second route-camera sweep; first second discarded. GPU queries used `EXT_disjoint_timer_query_webgl2`, with no disjoint interval.

| Metric | V0.5 | V0.6 |
|---|---:|---:|
| GPU mean | 5.52 ms | 5.95 ms |
| GPU p95 | 8.23 ms | 8.90 ms |
| CPU render submission mean | 0.98 ms | 1.02 ms |
| Frame interval mean, display capped | 13.33 ms | 13.33 ms |
| Frames over 25 ms in sweep | 0 | 0 |
| Startup to ready | 3.96 s | 4.14 s |

V0.6 costs about 0.43 ms more GPU time in this run. This is a short machine-specific comparison, not a hardware-wide performance guarantee.

| Matched pose | V0.5 triangles / calls | V0.6 triangles / calls |
|---|---:|---:|
| Start | 8,841,643 / 152 | 8,308,099 / 137 |
| Midpoint | 8,487,698 / 146 | 8,077,389 / 126 |
| Viewpoint | 4,387,038 / 32 | 7,807,810 / 41 |
| Path close | 8,082,521 / 72 | 8,306,337 / 68 |
| Cliff close | 4,348,946 / 29 | 7,694,963 / 32 |

The viewpoint triangle count increases because continuous coverage extends beyond the old vegetation corridor. These are steady-view renderer counts, excluding the one-time depth bake. The unchanged authored cliffs contain 316,228 triangles. The startup depth capture draws 3,466,688 triangles in seven meshes.

## Assets and licenses

All **49,647,752 bytes** of existing asset files are byte-identical to V0.5; no external assets were added. `assets.json` records hashes and sizes. New geometry and surface strokes are original project work; the height field derives from the retained CC0 South Tyrol DTM.

- Original turf texture: 1024² RGBA8 with mipmaps, generated at startup; no added bitmap download. Shared turf geometry: 6,730,240 bytes, plus 76,800 bytes of instance matrices. Near/mid shared tiles contain 76,800/1,280 triangles, reused across instances.
- Terrain-root height texture: 721 × 521 R32F, 1,502,564 bytes, no mipmaps.
- Static depth target: 2048² depth plus color attachment, about 33.55 MB before driver overhead.
- Retained Poly Haven **CC0** Marble Cliff 05: 4096² diffuse + 2048² height, 16,912,311 bytes. Grass Medium 01: four 1024² maps and glTF/binary, 3,512,636 bytes. Gravelly Sand: 2048² diffuse/height + 1024² roughness, 6,089,714 bytes, unchanged 2.48 m scale.
- South Tyrol terrain: **CC0**, EPSG:25832, metre units and 1:1 elevation. Three.js: **MIT**. Electron and its bundled component licenses remain in the portable folder. Full source links and retained license metadata are in `ASSETS.md`.

## Verification

The actual portable executable completed the 327.98 m route with real normal-speed W-key input and automated steering in **189.13 seconds**. There were zero blocked steps, zero focus resumes, and maximum grounding error **0.02365 m**. Pointer capture, mouse look, Escape pause, arrival, QA reset and keyboard R reset passed. This is an automated real-time input traversal, not a human playtest. Additional controller checks passed for slope stopping, obstacle collision, diagonal speed and frame-delta capping.

Runtime comparisons preserve the three surveyed terrain meshes, all 421 route samples, 65 collision volumes, lights, fog and camera FOV. Source/data hashes preserve the survey, controller, sky, trail maps/details and all V0.5 cliff generators. All eight before/after pairs use identical camera metadata. The package audit checks source/asset/doc parity, software licenses, and absence of the four private reference images.

The matched start, midpoint, viewpoint, path-close and cliff-close captures were inspected, along with lower-bend, upper-meadow and ridge-approach views and captures during the actual traversal. Rejected early turf grain and shadow-offset experiments remain in `iterations/` and `bias-study/` for review. Performance on other GPUs and long-session stability remain unverified.
