# Seceda V0.13 — regional landscape

Continues V0.12 `6ccdbf5`; intermediate rendered study preserved at `ceceeef`. This is a visual pass across the same connected region. No terrain expansion, gameplay systems or new destination were added.

## Visible treatment

- A dense layer of narrow, curved leaves replaces the sparse grass over plain ground. Short cover, taller accents and yellow/pink/white flower colonies share terrain-conditioned placement. Violet flowers are occasional accents instead of broad species bands. Flower heads lean and clover has trifoliate leaves.
- ambientCG Grass005 supplies fine ground colour, normal and AO at an authored 1.4 m footprint; Poly Haven Grass Ground supplies broad variation at its documented 25.1 m footprint. These are licensed generic CC0 ingredients, not Seceda land-cover imagery. All sources and derivative packing are in ASSETS.md and the asset manifests.
- Existing cliff forms now have less regular bedding, stronger intersecting recesses and smaller, broken grassy shelves. Regional scenic relief, limestone shading and scree normals use shared rules beyond the main cliff. The original ridge generators remain unchanged; the survey is still the foundation.
- Secondary exposed mountain faces receive an original survey-aligned surface treatment: 355 culled tiles, 316,350 triangles in total, sampled at 8 m. World-coordinate fracture fields meet at tile boundaries; buried margins avoid raised patch edges. Detail fades around changes in survey resolution so a sampling boundary is not treated as a geological fracture. These are authored surface forms over the existing 5 m and 40 m scenery, not new measured detail. The mask starts beyond 50 m of walking clearance.
- Original irregular branch whorls replace the most visible cone-like conifers. Forest positions remain an authored terrain-conditioned interpretation. Clouds retain the existing summer sun direction, with softer distant contrast and a less abrupt horizon transition.

The private photographs guided proportions and rock/plant character. Their pixels are not runtime assets, gallery images or package contents.

## Where you can walk

The original 327.98 m route is intact. Leave its lower or middle section toward the southeast to enter the connected pasture. The existing 0.602 km² envelope remains unchanged; approximately 0.578 km² is connected under the controller's slope and obstacle rules. Local steep banks remain blocked.

The northern cliff faces, western escarpment, high massif and ground outside the development boundary remain scenic. This pass does not open those areas. The existing coverage diagram is retained at `artifacts/exploration-v012/survey-coverage.png`; its V0.12 walking envelope also describes V0.13.

Coordinates remain EPSG:25832, with origin easting 708700, northing 5164300 and altitude 2500 m. Local x is east, z is south, y is up. One unit is one metre, including vertical scale. Native walking survey: 2.5 m; massif: 5 m resampling; far scenery: 40 m resampling. See TERRAIN.md for source and acquisition details.

## Detail follows the player

Plants are deterministic 24 m cells, loaded within 148 m and retired beyond 205 m. Near/mid plant models, curved turf within 33 m, finer distant cover through 90 m and optical pasture swards through 285 m overlap across the same ground. The terrain keeps native detail around the player and on rocky faces, with coarser geometry only on distant gentle ground. Collision always reads the unchanged survey.

The first full-detail V0.13 study remains in `release/Seceda-Windows-v0.13-study-1/`. Measurements justified fewer subpixel ledge subdivisions and three curve-detail levels for grass; close blades retain their full curved geometry. Matched study images and the numerical cliff-region comparison are retained. No texture resolution or vegetation density was reduced for that adjustment.

The second candidate, before the broader scenic-face treatment, remains in `release/Seceda-Windows-v0.13-study-2/`. Its full traversal is retained as `study-2-walk/`. The final build is tested again after the last visual edit. The immutable sun-depth capture covers the wider faces at 3072² (approximately 2.71 × 1.82 m per texel); the existing 4096² near shadow remains unchanged. Isolated surface/shadow renders are retained in `regional-isolation/`.

The third candidate exposed a thin false shadow near the 5 m / 40 m join during traversal. It remains in `release/Seceda-Windows-v0.13-study-3/`. Ray checks and matched 4/8/12/20 m receiver-offset renders isolated the shadow mismatch. The final scene uses 12 m tolerance on coarse surrounding faces and retains 4 m on the main ridge. Artificial terrain seam skirts are excluded from the static shadow capture. `final-regional/` shows the corrected portable views.

## Limits

This remains an authored prototype, not a photographic reconstruction. Fine grass and flowers still repeat, some terrain-to-rock transitions are too smooth, and distant 40 m terrain remains rounded. Woodland crowns and static clouds are simplified. The original broad cliff outlines are retained, so this pass does not reproduce individual reference-photo formations. The walking area is bounded and there is no disk terrain streaming, climbing, save system or valley traversal.

Current validation and measured costs are recorded separately in VALIDATION_V013.md and `artifacts/region-v013/`.
