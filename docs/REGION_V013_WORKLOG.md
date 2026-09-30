# Regional visual goal â€” working record

Base: V0.12 `6ccdbf500aed6eb08956fd0b33ba0997eae1fcff`, clean at inspection on 2026-09-29.

## Completion evidence required

- Inspect all five private references, retained V0.12 images and validation. Photos remain reference-only.
- New baseline: start, midpoint, viewpoint, cliff edge and three separate pasture sites, each facing peaks, away and across; cliff/path close views.
- Baseline packaged original route plus continuous pasture traversal, inspect actual walking captures.
- Multiple rendered iterations covering meadow continuity/species mix, middle ground, rock/strata/turf boundary and broader landscape. Preserve surveyed heights, projected coordinates, current walking region, controller, route, major V0.8/V0.12 silhouettes.
- Final matched images, source/license log, coverage explanation, new portable ZIP and gallery; retain previous builds.
- Final packaged entire original route and continuous off-trail loop **after the final visual edit**, rendering/streaming/collision checks.
- Paired V0.12/final GPU measurements at 1600Ã—1000 and normal display setting, actual AC/power/display recorded.
- Verified milestone commits and final commit. Goal is not achieved until the visual and traversal gates have current evidence.

## Initial diagnosis

All five references inspected. References show dense fine grass with leaves and stems at several heights, predominantly yellow blooms with smaller pale pink/white species, irregular patches of pasture and exposed stone, and steep limestone with directional fractures rather than evenly repeated shelves.

V0.12 retained images show thin separated blades over smooth green ground, over-large uniform pink flower bands, weak middle-ground relief, pale smooth outer cliffs beside a darker central massif, terraced inherited ledges and uniform conifer shapes. These are active priorities, not accepted final limitations.

Workflow reference: https://developers.openai.com/blog/how-to-build-games-with-astra â€” fixed camera scenes plus independent real-input journeys, rendered iteration and measured cost. No source images are copied into game assets.

## Baseline and first studies

- Preserved V0.12: 23 fixed 1600Ã—1000 captures from seven sites in three directions, plus inherited close views. Baseline original route and 2.04 km pasture tour passed through real-time keyboard input with automated steering, zero blocked steps and zero rendering errors. The tour has no teleports during either leg. Evidence: `baseline/`, `baseline-walk/`.
- `meadow-01` was rejected: added textures exceeded the 16-fragment-sampler limit. Its error log and images are retained as failed diagnostic evidence. Channel packing fixed the issue without lowering image resolution.
- `meadow-02` filled the bare turf and removed species-wide purple bands, but its blades were too broad and straight. Replaced those with narrower curved leaves, varied height, occasional broad leaves and dry blades. Flower colonies now mix yellow, pink and white with sparse violet; their heads lean and clover uses trifoliate leaves.
- `meadow-03` and `meadow-study-walk/`: original route completed in 189.23 seconds, zero blocked steps, maximum grounding error 2.37 cm, zero rendering errors. This test precedes the subsequent rock/tree/sky edits and is **not final-build validation**.
- First paired controlled GPU study: start 13.16 â†’ 14.99 ms, viewpoint 13.20 â†’ 15.20 ms; reverse start 11.81 â†’ 9.99 ms, east pasture 13.16 â†’ 13.12 ms. Four poses, RTX 4070 Laptop, 1600Ã—1000, High, forced DPR 1. Sequential samples; initial AC/Turbo condition was recorded, but per-version before/after condition capture was added for later runs. Raw `meadow-study-controlled.json` retains all samples.
- `rock-01`: stronger intersecting recesses, less regular ledge intervals and reduced turf shelf width. The original ridge generators and silhouette anchors remain intact. Shared regional scenic relief increased outside the protected walking corridor, with coherent cooler limestone grading and normal detail. Existing source texture dimensions are unchanged.
- `landscape-02` / `packaged-study-1`: original branch-whorl conifers replace the most visible stacked cones. Nearby flower heads now tilt. Cloud-horizon extension removed the empty high band but introduced a distracting distant horizontal cloud strip in reverse views; this remains a revision item, not accepted final art.
- `preservation.json`: 76 prior asset/control/major-form source files byte-identical to V0.12; 6,983 walking-area samples show zero scenic displacement. Full original terrain, route, collision and bounds are unchanged.

Study build: `release/Seceda-Windows-v0.13-study-1/`. The package tool now refuses to overwrite an existing output directory. The study remains available for comparison; it is not the final delivery.

## Later rendered studies

- `ceceeef` preserves the first verified regional study. Normal-display measurements showed 21.08 ms mean GPU at the start and 20.57 ms at the viewpoint. That justified removing redundant subpixel geometry: ledge subdivision rounds reduced from five to four (4,136,960 to 1,034,240 triangles), with five/three/two grass curve rows across overlapping distance levels. Root density and texture dimensions were retained. The matched cliff-region image comparison and full study build remain available.
- `geometry-cost-01-native.json`: start 19.63 ms and viewpoint 18.61 ms after that adjustment, under the same AC/Turbo/display conditions. These are source-study results, not final portable measurements.
- `sky-03`: reduced distant-cloud contrast eliminated the distracting heavy horizontal strip seen in the first sky study. Sky remains static and simplified.
- `study-2-walk/`: the second portable candidate completed the original route and 2.04 km pasture loop in 948.10 seconds, zero blocked steps/rendering errors. Its moving-frame p95 was 13.5 ms at 1600Ã—1000; no frame exceeded 50 ms. This exposed the still-rounded southern face and is retained as a study, not final validation.
- `regional-rock-01/`: broader scenic face treatment added detail but produced thin raised seams where clipped patches met the terrain. Rejected those joins. `regional-rock-02/` uses buried margins and shared world-derived normals, and was inspected from the viewpoint, south-facing walking view and reverse pasture angles.
- `regional-isolation/`: same-camera surface and shadow toggles, with shadow recaptured for the corresponding visible geometry. This study used 323,350 triangles across 356 culled tiles. All 191,877 study vertices remained outside the walking area plus 30 m. It improved secondary faces without adding terrain or opening more ground. The coarser underlying profiles remained a limitation; final counts appear below.

- The next full traversal (`study-3-walk/`, 948.19 seconds, zero blocked steps/rendering errors) exposed a thin distant shadow streak. Removing seam skirts and fading regional relief around survey-resolution joins were insufficient on their own. Exact-pixel ray checks found no corresponding shadow occluder. A controlled receiver-offset sweep removed the false line at 12 m; the final shader applies this only to coarse regional faces, retaining the main ridge's 4 m tolerance. Final regional geometry is 316,350 triangles, 355 tiles. The unchanged coarse survey still limits far silhouettes. This candidate and all failed diagnostic renders remain available.
- `final-regional/` confirms the correction in the portable build at the southern faces, the mid-pasture view and eastern turn. The grass transition at that turn was also reinspected from a settled walking-height pose.

Final matched portable images are in `final/`. Final route/loop, performance and package evidence are recorded in VALIDATION_V013.md; study evidence above is not substituted for those gates.

Final traversal after the last visual edit passed in 948.11 seconds: route 421/421, pasture 68/68, zero blocked steps, rendering errors or focus resumes. Paired final GPU measurements passed at 1600×1000 and normal 2560×1080 under AC/Turbo, High. Native viewpoint GPU mean was 19.51 ms versus 15.65 ms in V0.12. The richer scene does not hold a locked 60 fps on High; full conditions and frame pacing are reported in VALIDATION_V013.md.
