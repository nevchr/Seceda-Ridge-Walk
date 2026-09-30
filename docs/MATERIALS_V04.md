# v0.4 — trail and near-field material study

Checkpoint before changes: `bb91b88b42bbda7c405b84b45fa33966813a49a5` (complete v0.3 source, documentation and evidence; private reference photos and builds remain excluded).

## Diagnosis before material edits

The preserved v0.3 executable was rendered at the original start, midpoint and viewpoint poses, plus a downward path inspection and a narrower cliff-edge view. These are retained in `artifacts/materials-v04/before`. No source material had been changed when those captures were taken.

- Trail: a generated 512² canvas of independent noise and dots, repeated every 1.75 m. It lacks compacted soil, aggregate size variation and stone/soil relationships. Its normal relief is nearly flat, while broad shader noise causes blotches. The soft continuous shoulder reads as a blurred painted stripe in the downward view.
- Grass: three tiny meshes, with seven or five angular ribbon blades repeated over the whole corridor. Several centimetre-wide bases and bright dry strips dominate close views, while the underlying ground is flat. More instances of these same strips would repeat the problem.
- Limestone: identical 10 m and 41.7 m triplanar samples recur across the faces. Cosine bedding and sinusoidal joints introduce regular bands independently of the photograph-based surface; their height derivatives exaggerate the bands. The slope mask smoothly smears turf into white rock, and changes in overlay normals reveal triangular turf boundaries.
- The route is 327.9799 m and the survey is 1:1. Neither the geometry/survey mismatch nor softer distant silhouettes can be solved by a material pass; mountain geometry, terrain, route, movement and sky are held fixed in this milestone.

The supplied Seceda photos are reference-only. The target is compact pale fine gravel with worn soil between stones, little broken turf tongues at the edges, fine curved grass leaves in rooted tufts above short cover, and irregular rock exposures within turf. No user-photo pixels enter a runtime texture.

## Implementation, assets and measured results

### Materials and geometry

The generated gravel canvas is removed. Poly Haven **Gravelly Sand**, by Dario Barresi, supplies soil/aggregate colour, height and roughness. Its metadata footprint is **2.48 m** (rounded to 2.5 m on the asset page), and the shader uses the same repeat distance. A restrained neutral dust tint retains the photographed aggregate; broad compaction only subtly darkens/smooths the worn centre. Height contributes at most 11 mm of *shader bump*, with no geometric displacement. Irregular turf tongues use a narrower transition mask. 220 additional embedded chips are 2–7 cm across, at most a few millimetres high; they add 4,400 triangles and one draw call.

Three new folded, curved grass-clump meshes each contain 22 fine leaves and **308 triangles**. There are **960 instances total**, adding **295,680 triangles in three draw calls**, confined to twelve metre-coordinate pockets around the inspection positions. Existing strips in these pockets become narrower short cover, roughly 3–9 cm high. The rest of the 92,000 original clumps is not increased. These are authored geometry with vertex colour, no alpha cards, texture atlas, downloaded model or added asset license.

Large-scale limestone texture samples blend varying offsets; smaller detail uses a 4 m repeat. Nonperiodic field-based seams replace periodic cosine/sine lines. A 1024 × 768 survey-derived slope mask defines shared rock/turf exposure, and the existing cliff mesh receives a survey-position attribute for matching material coordinates. Its actual positions and indices are unchanged. Camera, sky, sun, fog and ambient lighting remain identical.

### Texture inventory

| Material / map | Pixels | Runtime scale / use | License |
|---|---|---|---|
| New Gravelly Sand diffuse | 2048 × 2048 | 2.48 m; sRGB colour | Poly Haven CC0 |
| New Gravelly Sand height | 2048 × 2048 | 2.48 m; linear bump | Poly Haven CC0 |
| New Gravelly Sand roughness | 1024 × 1024 | 2.48 m; linear roughness | Poly Haven CC0 |
| Existing Aerial Grass Rock diffuse | 2048 × 2048 | 12 m; meadow ingredient | Poly Haven CC0 |
| Existing Rock Face diffuse + height | 2048 × 2048 each | 4 m small detail, 41.7 m large variation | Poly Haven CC0 |
| Trail distance / width mask | 2048 × 2048 | Existing 265 × 355 m local domain | Authored from route |
| New geology/slope mask | 1024 × 768 | 3400 × 2000 m domain; about 3.32 × 2.60 m/texel | Derived from CC0 DTM |
| Solar horizon / cloud-light maps | 512 × 512 each | Unchanged | Authored, DTM-derived / procedural |
| HDR sky cube | 768 × 768 per face | Unchanged | Procedural, authored |
| Near shadow map | 4096 × 4096 | Unchanged | Runtime render target |

The downloaded Aerial Grass Rock height image remains 2048² and is not sampled. New source images total **6,089,714 bytes** on disk; standard RGBA8 mipmapped GPU allocation for the three new images is approximately 48 MiB. This estimate excludes the 3 MiB geology map and other renderer allocations. No new vegetation bitmap is used.

Licenses and originals: [Gravelly Sand](https://polyhaven.com/a/gravelly_sand), [Poly Haven CC0 license](https://polyhaven.com/license). Original new downloads are unchanged, and all three hashes match the upstream API. Existing Rock Face and Aerial Grass Rock are also CC0; source and author details are in ASSETS.md. The South Tyrol DTM remains CC0. New local meshes/shaders are project source with no separately assigned public license. Private Seceda reference-photo licensing is not assumed; those photos remain excluded from Git and every build.

### Rendered iteration

1. Inspected v0.3 start, midpoint, viewpoint, downward path and zoomed cliff-edge images before material edits. The diagnosis above records their observed faults.
2. Rendered the scanned-soil/limestone pass. The dirt read as aggregate rather than random dots; the overly broad cliff overlay boundary still needed attention.
3. Rendered local folded grass. Shortening old strips alone flattened their silhouettes; narrowing their horizontal scale corrected the short-cover appearance. Added tiny embedded chips.
4. Anchored overlay material coordinates to its underlying survey samples, reducing the visible faceted turf seam without changing geometry. Some overlay boundaries and coarse relief remain visible.
5. Measured a first-pass mean GPU render cost of 6.61 ms versus 4.76 ms for v0.3. Removed unnecessary small-scale stochastic sampling and skipped soil texture reads outside the trail. Re-rendered and inspected all five final packaged views to check that the optimization retained the material improvement.

### Final rendering measurements

Same 1600 × 1000 viewport, 11-second scripted route-camera sweep, first second discarded. Hardware: ANGLE/D3D11 on NVIDIA GeForce RTX 4070 Laptop GPU. GPU timing uses EXT_disjoint_timer_query_webgl2; no disjoint samples. Frame intervals are limited by the approximately 75 Hz display.

| Metric | Preserved v0.3 | Final v0.4 |
|---|---:|---:|
| Mean GPU render time | 4.955 ms | 5.322 ms |
| p95 GPU render time | 6.161 ms | 6.672 ms |
| Mean frame interval | 13.335 ms | 13.335 ms |
| p95 frame interval | 13.50 ms | 13.50 ms |
| Frames above 25 ms | 0 | 0 |
| Midpoint triangles | 7,975,214 | 8,275,294 |
| Midpoint draw calls | 34 | 38 |
| Loaded geometry / texture counts | 36 / 10 | 40 / 13 |
| Mean CPU render submission | 0.344 ms | 0.352 ms |
| Launch-to-ready in this run | 3.059 s | 3.387 s |

The increase is **300,080 triangles (+3.8%)**, four draw calls, and about **0.37 ms (+7.4%) mean GPU render time** in this test. This is a modest measured cost, not a claim of equal GPU performance. Results are specific to this machine, settings and route views; the repeated high-poly terrain remains the main geometry load. Raw timings and the slower first pass are preserved in the artifact folder.

### Preservation and validation

The portable v0.3 and v0.4 runtime terrain/cliff position arrays and index arrays have identical SHA-256 hashes. The 68 buttresses have identical geometry and instance transforms. All 421 route samples, 65 colliders, lights, fog and FOV compare exactly. Terrain rasters, manifests, sampler, Walker and atmosphere source compare byte-for-byte. See preservation.json.

CPU terrain/controller checks pass, including finite survey data, 1:1 scale, complete 328 m route, cliff stopping, rock/post-radius collision, diagonal-speed normalization and frame-delta limits. The final portable executable completed the route using normal-speed W input and automated steering in **189.314 seconds**, with **zero blocked steps**, a maximum ground-height error of **0.02365 m**, and **zero runtime errors**. No teleporting or direct controller stepping was used during traversal. Begin/pointer capture, mouse look, Escape/pause, screenshot-reset arrival clearing and R/reset arrival clearing also passed. This is an automated packaged input test, not a manual human playtest; see packaged-walk.json.

The comparison page includes **five matched before/after pairs**: original start, midpoint and viewpoint, a path close-up at x15.5/z158/yaw−0.12/pitch−0.68/FOV66°, and a zoomed cliff view from x150/z−120/yaw−1.12/pitch−0.27/FOV38°. The cliff close-up does not claim a new walkable location. All images are direct 1600 × 1000 runtime captures; no photo or image-generation compositing. The comparison page's ten images, five view tabs and wipe divider were checked successfully in the browser.

### Still rough

The new clumps are a local prototype, not a full vegetation replacement. The old broad strips remain outside those pockets, flowers remain simplified, and short cover still exposes the ground material between tufts. Limestone silhouettes and occasional overlay seams retain the limitations of the unchanged geometry. The scanned path still repeats some tiny twigs/aggregate patterns; it has no geometric rut or cut bank. Very small stone chips have no individual collision. These limits are visible in the close views and are not hidden by changing the sky, light or camera poses.
