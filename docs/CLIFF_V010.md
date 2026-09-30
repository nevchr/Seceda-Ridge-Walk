# Seceda V0.10 — restored cliff forms

Corrective art pass from committed V0.9 `9fd52712337a264e1dc3df865dc1d3bd0cb1366d`. V0.8 `5702b53` is the shape reference. Both earlier portable builds and comparison galleries are preserved.

The V0.8 wall, grassy bench, broad ridge and summit generators are unchanged. Their original geometry is retained in memory as the reference surface. Subdivision adds smaller inclined bedding recesses, intersecting finite joints and weathered face relief. No V0.9 jointed cliff volumes are rendered. Existing borders and grass shelf surfaces stay fixed; fine relief changes some interior occlusion edges and a few skyline pixels, quantified in the comparison gallery.

The survey and smooth walking collision are unchanged. New relief is confined to the authored cliff meshes outside the walking area. The static 2048² sun-space depth capture is rebuilt from the three surveyed terrain meshes and all four restored, refined cliff meshes. The near shadow map, sunlight, sky and valley materials remain unchanged.

## Sources and licenses

No new third-party assets were downloaded. The fifth supplied Seceda photograph guided bedding, warm exposed limestone, dark weathering and turf caps. All user photographs remain reference-only; no pixels, snow, person or low-cloud scenery are copied into assets or the package.

- Original surface refinement: `src/cliff-surface.js`, authored for this project. Not a geological reconstruction.
- Poly Haven **Marble Cliff 04**, Amal Kumar, CC0: unchanged 4096² color and packed normal/roughness/height, sampled at its documented 12.656 m footprint. Cliff-only grading removes the V0.9 pale additive color floor and corrects two-sided normal handling.
- Poly Haven **Marble Cliff 05**, Amal Kumar, CC0: existing 4096² color at 20.002 m, blended as a secondary fractured/weathered color ingredient. Metadata, original source URLs, license and checksums remain in `assets/materials/marble_cliff_05-license.json`. These marble scans are art ingredients, not samples of local Dolomite rock.
- Existing **Marble Rock 01** 2048² packed channels provide close fine normal/height detail; other V0.9 materials remain unchanged. The two-sided cliff shader uses lower normal strength to retain the modeled planes.
- `assets/geology/v09-talus.bin` stores the exact original V0.9 debris transforms exported from the preserved executable. Original project work, no third-party imagery. Its accompanying JSON records provenance, format, count and hash.
- Terrain: official South Tyrol DTM, CC0, EPSG:25832, one unit per metre. Details remain in `TERRAIN.md`. Existing vegetation, gravel and timber licenses remain in `ASSETS.md` and `STONE_V09.md`.

The surface art is still an approximation. Some inherited bench bands remain regular, the survey softens untreated distant faces, and the procedural cliff relief does not reproduce individual fractures from the reference.

## Verification

Final packaged measurements and comparison evidence are recorded in `artifacts/cliff-v010/`. Main views use 1600×1000 pixels, 66° FOV and 1.72 m eye height. The inherited cliff-close view uses a clearly labeled 38° FOV. The new cliff-edge angle also uses 66°.

Four source-render iterations and a final packaged pass test geometry, two-sided normals and material treatment. Isolated no-massif, clay and original-geometry captures identified shader-related dark patches. The regular striped bedding trial was rejected. The full-quality result was packaged without a reduced-quality optimization pass.

## Measured rendering cost

Same-machine sequential portable runs on the NVIDIA RTX 4070 Laptop GPU / ANGLE D3D11, 1600×1000, High settings. Each pose is sampled for five seconds with the first second discarded. GPU values use EXT_disjoint_timer_query_webgl2, supported and non-disjoint. Frame intervals are display-capped; CPU submission is wall time around renderer.render, not the whole simulation.

| View | V0.9 GPU mean / p95 ms | V0.10 GPU mean / p95 ms | V0.10 triangles | Calls |
|---|---:|---:|---:|---:|
| start | 10.70 / 11.84 | 12.19 / 13.42 | 17,696,194 | 471 |
| midpoint | 9.55 / 10.55 | 10.68 / 11.72 | 16,246,453 | 453 |
| viewpoint | 10.88 / 12.01 | 12.49 / 13.64 | 13,547,464 | 192 |
| valley | 9.20 / 10.36 | 10.95 / 12.17 | 13,346,954 | 168 |

Both versions held roughly 13.33 ms display-capped frame intervals (75 Hz), with no sampled interval above 25 ms. Startup was 9.46 s for V0.10 versus 11.69 s for V0.9. CPU render submission was 1.19–1.82 ms. The correction adds 634,300 rendered triangles and two draw calls in these views; GPU mean cost increases 1.13–1.75 ms. No visible quality was reduced to meet a preselected budget. These are local samples, not guarantees for other hardware.

The four refined cliff meshes contain 3,587,872 triangles and 129,914,844 bytes of vertex/index arrays, excluding the retained immutable V0.8 reference geometry. The original 4,709 debris fragments add 178,942 triangles. Disk geometry added this milestone is a 301,376-byte transform file plus provenance JSON; mesh relief is generated at startup.

Active cliff material ingredients: 4096² Marble Cliff 04 color and packed normal/roughness/height, 4096² Marble Cliff 05 color, and 2048² Marble Rock 01 packed channels. Existing close props still use their 2048² color. Marble Cliff 05 was already shipped on disk but is now loaded for the cliff blend: approximately 85.3 MiB additional RGBA8 texture allocation including mipmaps, not a measured VRAM figure. No texture resolutions were reduced.

## Silhouette evidence

The original four V0.8 geometry generators are byte-preserved. Their runtime pre-refinement geometry is hash-compared to V0.8. Fine sculpting is not claimed to be pixel-identical: at the viewpoint the complete skyline mask differs by 40 pixels, with a maximum two-pixel skyline displacement. Start and midpoint also have maximum two-pixel changes; the close-up has one pixel, the additional cliff-edge angle five pixels. All raw masks and the three-color overlays are available.

The separate cliff-only mask includes internal terrain intersections: 4.69% of its V0.8 pixels differ at the viewpoint after local relief, versus 6.71% for V0.9. This is not an image-quality score. At some other poses the corrected internal mask changes more than V0.9 because shallow cuts reveal the underlying DTM. The outer skyline and full-color images should be assessed together.

## Packaged walk

The final portable executable completed the 327.98 m route in 189.16 seconds using actual normal-speed W-key input with automated heading adjustments. No teleporting or accelerated controller stepping occurred during traversal. There were 0 blocked steps, 0 focus resumes, 2.36 cm maximum ground-following error, and no page/renderer errors. Mouse look/pointer capture, Escape pause, arrival, QA reset and keyboard R reset passed. This was a guided real-time input test, not a human playtest. Four additional walking screenshots are retained. Production-controller checks also passed for steep-ground rejection, prop collision, diagonal speed and frame-delta clamping.

Preservation checks passed: exact hashes for all three runtime DTM meshes, 421 route points, 65 colliders, lighting and FOV; original V0.8 cliff base geometry; and all 4,709 V0.9 scree transforms. Nineteen preserved gameplay/environment source files remain byte-identical to V0.9. All refined cliff vertices remain outside the walking bounds.

## Delivery audit

All source, assets and docs matched the portable copy by hash. All five private reference photos were checked for accidental inclusion and excluded. Active asset files total 166,169,822 bytes (including unchanged source texture channels and terrain). Existing V0.8 and V0.9 ZIP hashes remain unchanged. The new ZIP and its SHA-256/CRC report are retained separately in `release/` and `artifacts/cliff-v010/archive.json`. The executable in the folder was play-tested; archive integrity is checked separately.
