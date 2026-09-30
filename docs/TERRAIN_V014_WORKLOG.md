# V0.14 regional terrain pass — working record

Base: committed V0.13 `0de5039fec999ba63a2d839e39ac4aced24a79ae`. The existing modification in `artifacts/controller-tests.json` is a timestamp-only change present before this work and is being preserved. No previous build/gallery is overwritten.

## Baseline and priorities

Fresh portable baseline: `artifacts/terrain-v014/baseline/`, 26 captures, seven inspection locations in three directions plus southern faces, mid-pasture faces, eastern turn and inherited close views. All captures use the production camera at 1.72 m eye height; normal views use 66° FOV. Reference photos remain private, reference-only inputs.

Visual priority, judged from ordinary route and roaming views:

1. **Secondary mountains and broad valley relief:** high prominence throughout peak-facing route/pasture views. The far source is only 40 m and rendering has no finer option there. Rounded crests and smooth gully profiles cannot be repaired by extra noise on that mesh.
2. **Middle slopes beneath the massif and opposite pasture:** occupy much of the image from south/east pasture, start reverse and viewpoint across views. Wide green surfaces and scattered pale blotches lack a coherent relation between exposed beds, debris flow and grassy soil.
3. **Regional rock consistency and survey joins:** the old 5 m / 40 m boundary affects normals, authored patches and shadows. The detailed geology map covers only 6.2 × 4.5 km within a 14 × 12 km scenic extent. Its edge clamp loses location-specific terrain information elsewhere.
4. **Main ridge/ledge:** recognizable outline must remain; inherited shelf spacing and broad smooth shoulder transitions still show from the viewpoint and east pasture. Improve within the mass after the regional foundation is corrected.
5. **Close pasture transitions:** retain the improved V0.13 vegetation, but make the visible soil/stone transitions belong to the terrain system. This milestone must not become another grass-only pass.

## Data evidence

Official WCS capabilities and coverage description retained in `artifacts/terrain-v014/source-research/`. The province-wide DTM is 2.5 m, EPSG:25832 and CC0. A native-aligned 2 km mountain tile returned 648,025 valid samples. A 100 × 100 m 0.5 m DTM probe at Seceda returned 40,000 NoData samples; the catalog describes that dataset as settlement-area coverage. No finer mountain coverage is claimed.

Acquisition: 42 georeferenced 2 × 2 km cores cover the existing scenic extent, with native 2.5 m samples and five-metre halos. Original responses and per-tile requests/hashes are retained. Runtime levels retain real sample heights at 2.5/5/10/20/40 m. The old survey and collision sampler remain preserved; separate visual terrain will consume the new tiles.

## Required completion evidence

Regional geometry and material improvements must be visible across all baseline directions, including secondary mountains and away views. Inspect matched renders and unplanned roaming angles after each meaningful revision. Preserve the route, pasture, projected frame and natural major ridge silhouette. Test seams and distance changes while moving. Final deliverables require the new portable build and gallery, source/license records, full route plus continuous pasture traversal after the last runtime edit, paired V0.13/final GPU tests at 1600 × 1000 and actual normal display settings under recorded AC/power conditions, package/reference-exclusion checks and a verified Git checkpoint. Large featureless visible slopes or prominent low-resolution mountains are not acceptable final limitations.


## Native foundation checkpoint

Rendered studies survey-01, cover-02, relief-03 and solar-05 are retained. The first replaces the survey only; subsequent studies introduce mapped land cover, small shared face relief and survey-derived regional lighting. Full-size images were inspected at the start, viewpoint, middle pasture facing secondary cliffs, east pasture reverse, south return reverse and across pasture. Secondary mountain crests/gullies are substantially sharper; mapped scree forms connected fans instead of scattered pale patches. The close meadow/props and main authored profile remain intact. The solar study removes coarse capture artefacts on the secondary faces while retaining the principal cliff bake.

Data audit passes all 26,947,242 native runtime samples, every lower-level retained node, all source hashes, 56,871 shared tile edge samples (zero difference), 26,554 preserved walking heights and 92 unchanged prior asset/generator/controller files. Seven CPU camera moves audit every installed shared edge both during and after detail changes: maximum gap below 0.6 mm from Float32 rounding. Full packaged traversal and final GPU comparisons still required.

The preserved study4 portable measured 15.960 ms mean viewpoint GPU versus V0.13's 15.333 ms, and 13.267 versus 13.062 ms at east pasture, 1600 � 1000 DPR1. Both ran sequentially on AC, Turbo plan, RTX 4070 Laptop GPU, High detail. These are intermediate results; final lighting is not yet included in that pair. No visual density reduction was made. Large original source TIFFs can remain in the repository without being copied as unused runtime files.


## Full regional inspection and final candidate

Candidate5 preserves a complete 26-view portable capture set. Full-size route, reverse viewpoint, start reverse, south-meadow peaks and east-pasture across images were inspected as well as the study views. This exposed remaining softness in broad pasture ground. Ground-06 and ground-07 test reuse of the existing CC0 Aerial Grass Rock ingredient at its 15 m footprint and stronger fine surface relief. Its contribution is modest; do not attribute the large regional change to that texture. The source images remain byte-identical, with row orientation corrected during two-layer GPU packing. Native survey and mapped surface distribution remain the main visible gains. Candidate5 portable and all study images are preserved.

The final candidate keeps the original route, walking heights, props, ridge generators and close plant system. No polygon/texture/plant density reduction was made. The complete final traversal and fresh paired measurements must still be recorded below.

## Licensed regional-colour study

The ground-07 candidate completed a 15.8 minute route/pasture traversal (421 route samples and 68 loop samples), zero blocked steps and zero runtime errors. It is preserved as ground7-walk with its runtime snapshot and portable folder. It is not the final post-edit traversal.

Full-size inspection of the across-valley view still showed an overly uniform pasture hill. Ortho-08 and ortho-09 tested the province's explicitly CC BY 4.0 Ortofoto 2023 RGB, georeferenced at 2 m per texel. The second revision softens exposure/colour and widens the transition from unchanged close turf. Start reverse, viewpoint across/peaks, eastern pasture across and secondary faces were inspected at 1600 x 1000. Real pasture tracks, uneven soil and woodland texture now break up the broad slopes. This is visibly more useful than the earlier fine-noise change. Steep limestone and the close meadow retain their authored materials; strongly pale image pixels are excluded from the summer ground blend. The image retains some original lighting and is not claimed to be reconstructed albedo.

The 48 original WMS responses and 12 assembled tiles have recorded EPSG:25832 bounds, requests, checksums and attribution. Audit verifies all hashes, 2 m georeferencing and assembly orientation; JPEG re-encoding mean byte error is below 0.72. No private reference photo pixels are used. The final portable has been rebuilt and runtime files frozen; fresh final validation follows.

## Final movement evidence

Frozen final portable completed the full 421-sample original route and 68-waypoint connected pasture loop in 948.102 seconds, with zero blocked steps, zero rendering errors and zero focus resumes. Ground-following differences peaked at 2.36 cm on the route and 6.54 cm in pasture. During the actual loop the fine-height cache evicted 37 unused tiles; geometry peaked around 97 MiB and later fell to about 30 MiB. Moving-frame mean was 14.41 ms; two of 65,798 active frames exceeded 50 ms. Walking captures were inspected on the descent, eastern approach and return slope.

The first full-screen performance pair had a 2560 x 1079 baseline buffer versus a 2560 x 1080 final buffer. That run and power records are preserved as native-first-unmatched, and excluded from the final matched comparison. The measurement harness now sets the content viewport to the observed primary display dimensions after entering full screen; it does not change display or power settings. Controlled measurements exposed a larger cost increase in the inherited 38-degree cliff-close QA camera, so transient component toggles are being measured before deciding whether quality should be changed. No runtime edit has occurred since the final freeze.

Cost diagnosis completed without runtime changes. At 1600 x 1000 the normal viewpoint measured 16.70 ms full, 14.73 with woodland hidden, 14.82 with regional ground disabled. The zoomed cliff-close measured 23.67 / 22.14 / 19.53 ms respectively. These non-additive toggles remove visible work; the delivered build retains full quality. Final matched native measurements use exact 2560 x 1080 buffers, unlike the preserved first attempt. The largest cost increase remains in the inherited 38-degree QA close-up. Source, package and final-walk runtime are still identical.
