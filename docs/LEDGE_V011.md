# Seceda V0.11 — foreground cliff ledge

Continues committed V0.10 `a3afc96681a310efdc4f8f1a502aad37aaa23744`. Earlier builds and galleries are preserved. The five matched cameras are start, midpoint, viewpoint, cliff edge and cliff close-up; the last uses the inherited 38° FOV, the others the normal 66° FOV and 1.72 m eye height.

## Art pass

The broad ledge had long coplanar surfaces, a repeated groove treatment and continuous grass shelves. Surface identification renders showed that a separate wall also projected through its lower face. The new connected surface sculpture treats both the bench and that local support wall. Unequal dipping beds, offset shear fractures, exposed inclined planes and finite spall recesses create geometry that catches the existing sunlight. Small edge notches and a shared turf mask break the grass lips. The main ridge, summits and broad cliff envelope remain inherited; this adds no replacement block towers.

Seven source-render studies were inspected at fixed cameras. Closed fracture cells were rejected as block-like; early beds were too regular. More oblique relief exposed undersampling, so the ledge was subdivided further and the height field made continuous. The most strongly corrugated trial was reduced and interrupted with shears and local face recesses. All iteration images remain alongside the final packaged captures.

The adjacent surveyed rock receives a localized, warmer colour grade without the pale additive floor. Grass and path shading, survey geometry, props, route and collision remain unchanged. The existing 2048² massif shadow capture is rebuilt after the new sculpture, from the same seven casters; the near shadow map, sky, sunlight and ambient lighting are unchanged.

## Sources and scale

- New sculpture and turf-transition code in `src/ledge-study.js` is original project work, generated in metre coordinates. It is art direction, not a geological reconstruction or a new survey.
- No new third-party assets or texture files were added. Existing Poly Haven **Marble Cliff 04** (Amal Kumar, CC0) supplies 4096² colour and packed normal/roughness/height at a 12.656 m footprint. **Marble Cliff 05** (Amal Kumar, CC0) supplies 4096² secondary colour at 20.002 m. Existing **Marble Rock 01** 2048² packed channels supply fine detail. These are graded material ingredients, not scans of Seceda. Source URLs, metadata and licenses remain in `assets/materials/`, `ASSETS.md` and `STONE_V09.md`.
- Official South Tyrol DTM, CC0, EPSG:25832; horizontal and vertical scale remain 1:1. Terrain provenance and coordinate origin remain in `TERRAIN.md`.
- User photo `05-seceda-cliff-strata-reference.png` guided inclined layers, recessed joints, warm stone and broken grassy edges. All five user photos remain reference-only, outside the package and Git checkpoint. No photographic pixels, person, snow or low-cloud scenery are used as game assets.

## Remaining weaknesses

This is visibly modeled relief on the existing ledge, but the broad shelf spacing is still regular and some turf patches look too neatly bounded. Individual fractures are procedural approximations. More distant survey faces remain soft, and the existing meadow plants and forest still show repetition. The change is most apparent at the viewpoint and cliff-edge camera; the foreground ledge is mostly hidden by the meadow at the start and midpoint, where the visible difference is mainly the neighbouring rock grade. No claims of photographic reconstruction or improvement to the unchanged vegetation are made.



## Measured rendering cost

Same-machine sequential portable runs on the NVIDIA RTX 4070 Laptop GPU / ANGLE D3D11. Viewport 1600×1000; actual drawing buffer **2000×1250** at Windows 125% scaling, High settings. Native images in the gallery are 2000×1250; retained window screenshots are 1600×1000. Five seconds per pose, first second discarded. GPU timer queries were supported and non-disjoint. CPU submission excludes simulation.

| Camera | V0.10 GPU mean / p95 ms | V0.11 GPU mean / p95 ms | V0.11 triangles | Calls |
|---|---:|---:|---:|---:|
| start | 21.79 / 23.73 | 24.41 / 25.49 | 20,798,914 | 471 |
| midpoint | 19.31 / 20.23 | 22.06 / 23.23 | 19,349,173 | 453 |
| viewpoint | 22.02 / 23.39 | 26.85 / 34.74 | 16,650,184 | 192 |
| cliff-edge | 24.52 / 32.82 | 27.77 / 34.34 | 17,072,456 | 188 |
| cliff-close | 30.27 / 38.04 | 34.67 / 37.71 | 16,099,279 | 155 |

This run adds 3,102,720 rendered triangles and no draw calls at each measured pose. Mean GPU cost rises 2.62–4.84 ms. Recorded V0.11 frame intervals average 22.31–36.93 ms (about 27–45 displayed frames/s); the normal viewpoint averages 27.66 ms. This is **not a locked 60 fps result**. Both versions run slower in this session than the earlier V0.10 report, so comparisons here use the new paired baseline, not historical figures. Startup was 48.92 s versus 31.64 s for V0.10. Those local samples include current machine/display conditions and are not guarantees for other hardware. No quality-reduced optimization build was substituted.

The ledge contains 4,136,960 triangles, compared with 1,034,240 before. All four authored cliff meshes total 6,690,592 triangles and 273,116,580 bytes of vertex/index arrays (including sculpture coordinates and colours, excluding retained base geometry). The support-wall treatment affects 63,567 existing vertices. Local displacement reaches 4.34 m on the ledge and 3.94 m on that wall; the principal survey alignment remains fixed. No new texture or external geometry files are shipped; texture resolutions and 35 loaded textures are unchanged. Geometry is generated at startup. These array sizes are not a measured VRAM figure.

## Preservation and outline

The portable builds compare equal for all three DTM mesh hashes, all 421 route samples, 65 colliders, camera FOV, fog and lights. Eighteen preserved environment/gameplay source files are byte-identical to V0.10, including trail gravel, landmarks, meadow, forest, player and the four base cliff generators. The immutable pre-refinement cliff geometry and the 4,709 retained scree transforms also match. Every authored cliff vertex remains outside the walking bounds.

The complete terrain-and-cliff skyline masks are pixel-identical at all five matched cameras. The separate cliff mask records local internal boundary/intersection changes: 01-start 0.11%, 02-midpoint 0.12%, 03-viewpoint 0.36%, 06-cliff-close 0.40%, 13-cliff-edge 0.50%. These percentages are mask disagreement, not image-quality scores or a claim that every edge is unchanged. Raw 2000×1250 masks and overlays are included.

## Packaged walk and delivery

The final portable executable completed the full 327.98 m route in 194.51 seconds using actual normal-speed W input with automated heading changes. There were 0 blocked controller steps, 2.36 cm maximum ground-following error and no page/renderer errors. One external focus loss was resumed through the normal Continue walk button and is recorded. Mouse movement changed the view; pointer capture, Escape pause, arrival, QA reset and keyboard R reset passed. This is a guided real-time input test, not a human playtest. Walking screenshots were inspected alongside the five fixed-camera packaged views. Separate production-controller tests passed steep-ground rejection, prop collision, diagonal speed and frame-delta clamping.

The build audit hash-checks all source, assets and documentation against the portable copy, verifies that the five private reference photos are excluded, and confirms the V0.8, V0.9 and V0.10 archive hashes remain unchanged. Asset files total 166,169,822 bytes, unchanged. The new ZIP is separate; its byte count, SHA-256 and CRC integrity result are in `artifacts/ledge-v011/archive.json`. The folder executable was play-tested; the ZIP is checked for matching entries and integrity. Earlier comparison galleries are untouched.
