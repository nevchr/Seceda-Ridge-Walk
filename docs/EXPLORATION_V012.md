# Seceda V0.12 — connected pasture and shared landscape

Starts from V0.11 `5f952e614839f426b974b9d79486477f31fe238a`. V0.8–V0.11 builds and comparison galleries are retained. The original 327.98 m route, coordinate origin, controls, trail stones, fence, cross and survey files remain.

## What changed

Views toward and away from the ridge exposed three limitations: larger plants ended at the route corridor, middle-distance grass had a separate fixed footprint, and pale outer rock faces did not match the central massif. Eleven fixed cameras cover the original route, reverse views, and the southeast pasture. The V0.11 off-route images use the QA camera: those locations were scenic, not reachable in that build.

The landscape now uses shared metre-scale bedding, weathering and fracture fields on scenic survey faces and inherited cliff forms. Slope, curvature, uphill rock, elevation and exposure control limestone, broken turf, scree and pasture; the timberline and clustered woodland use elevation, slope and patch fields. These are authored rules, not a land-cover survey. Rock colour no longer has a special east-only grade. Scree is less chalky, scattered pasture stones use fractured geometry and the same stone material, and forest avoids the steepest faces.

The ledge retains its broad shape but its internal shelves vary in elevation and width, with some shelves thinning away. Turf cover breaks into irregular patches. The same rock field contributes to its face relief; no new block towers or isolated showcase mesh were added. Scenic survey surface sculpture stays within about 4.4 m of the underlying raster. It is excluded from the playable envelope and its 45 m buffer. The collision surface always reads the original survey.

The first terrain-chunk study produced dark seams because skirt normals contaminated the top surface. It was rejected. World-coordinate height and normal evaluation removed those seams in the second study. Both iterations remain in the gallery folder. A later micro-bump experiment on close turf produced speckling during the walk and was removed; short cover remains geometry with the shared ground palette.

## Where you can walk

Leave the trail toward the **southeast, downhill through open pasture**, preferably near the lower or middle route. The old rectangle remains included. The connected envelope spans local east −45 to 980 m and local south −130 to 550 m, with an irregular northern/eastern boundary. Its area is **601,700 m² (0.602 km²)**, versus the old rectangle's 136,875 m². This adds a 464,825 m² envelope; it does not make every square metre traversable. A conservative 5 m connectivity scan finds approximately **578,475 m²** connected to the start before prop clearance.

The exact polygon lives in `src/exploration.js` and the coverage image is `artifacts/exploration-v012/survey-coverage.png`. Native 2.5 m survey coverage is local x −700…1100, z −700…600. Origin remains EPSG:25832 east 708700, north 5164300, altitude 2500; x east, z south, y up, one unit per metre.

The western escarpment, northern cliff walls, high massif and terrain beyond this envelope remain **scenic**. Local steep banks are blocked as well. New pasture movement rejects slopes above 0.85 and stops before adjacent steep rock; the original route retains its previous limits and grounding behaviour. Trunk collision is generated for any woodland trees inside the envelope; the current distribution places all of them outside it. The outer development boundary is invisible and gives a movement message; it is not a surveyed trail closure. No climbing, falling, jumping, loading screen or separate level was added.

## Detail follows the player

- Plants are deterministically generated in 24 m world cells around the player, with near and middle assets. New cells enter out to 148 m; old cells are removed beyond 205 m. One cell is prepared per frame. The same position regenerates the same plants after leaving and returning.
- Short turf uses the entire native survey, with overlapping near/middle fades. The 70–285 m sward now shares that footprint instead of ending at its old fixed rectangle.
- 417 survey chunks allow camera culling. Gentle terrain uses native resolution nearby, then 2×/4× spacing farther away; rocky chunks keep native spacing. Seam skirts and world-derived normals join the grids. These terrain buffers are resident; detailed plants are the streamed and evicted part. This is not disk/network terrain streaming.
- The near sun-shadow region follows the player. The static massif capture is rebuilt from the current survey sculpture and cliff meshes.

The coordinates, deterministic cell keys, survey layer definitions and walking envelope are separate modules so an adjoining survey can reuse the approach.

## Sources and licenses

No new downloaded assets or textures. All five user photographs remain reference-only, excluded from game assets, packages and Git. The official South Tyrol/Bolzano DTM is **CC0**, at 1:1 scale; retained GeoTIFFs, request URLs and metadata are unchanged. See `TERRAIN.md`.

New rules, geometry and placement code are original project work. Existing Poly Haven CC0 Marble Cliff 04/05 (4096²), Marble Rock 01 (2048²), grass/rock ground, gravel and grass/dandelion assets retain their source metadata and notices. See `ASSETS.md`, `MATERIALS_V04.md` and `STONE_V09.md`. No photographic Seceda pixels are in the materials. The rock, woodland and flower distributions are art direction, not species or geological mapping. Asset files remain 166,169,822 bytes; 35 textures are loaded. Source application licensing remains undecided.

## Validation and remaining limitations

Packaged captures, real-time input walks, controller checks, performance and preservation results are linked from `artifacts/exploration-v012/index.html`. Conditions and final numerical results are recorded in `VALIDATION_V012.md`.

The southeast pasture is substantially more continuous and explorable. Outer faces now share rock contrast and relief, but the 40 m scenic terrain still has rounded silhouettes. The meadow still reveals repeated flower models and short blades, particularly in back light. Some broad grass slopes remain too smooth at medium range, and the low-poly forest is most convincing at distance. The ledge's terrace inheritance is reduced, not erased. There are no surveyed huts, paths or woodland boundaries beyond the retained authored route. The new area is a broad visual exploration space, without destinations or activities added.
