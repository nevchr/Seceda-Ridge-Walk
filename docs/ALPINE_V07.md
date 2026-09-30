# Seceda V0.7 — alpine meadow

V0.6 was checkpointed before editing: **1e958db2634b22ae017491f9677105bba6e7b45c**. Existing builds and comparison folders are preserved. Play `release/Seceda-Windows-v0.7/Seceda.exe`, or extract the new V0.7 ZIP. Matched images are in `artifacts/alpine-v07/index.html`.

## Visible changes

The route now has short and taller turf, low textured leaves and banks of yellow composite flowers, pink clover, white daisies and violet bells. Species, density, height and hue vary in patches. A shared wear field gives the trail scalloped margins and allows low leaves to encroach at the edges. The dirt/fine-gravel texture stays at its documented 2.48 m scale.

The limestone uses stronger inclined bedding, weathering and relief at metre-scale, with cooler shaded stone. Softer ambient fill keeps recessed faces readable. The sky, fog, sun direction, shadow resolutions and mountain shapes are unchanged. A final visual check exposed an aliased ground-bump pattern: removing micro-turf bump and blending separately evaluated rock/gravel gradients cleaned it up.

Five prototype passes at the trailhead and viewpoint preceded application across the route. The first rock pass was too noisy; an aggressively simplified source flower lost its blooms and was rejected. The final yellow flowers use a licensed atlas region on original curved heads. The supplied four photographs guided the work but supplied no game pixels. This followed the repeatable-camera, rendered-image and real-input approach described in https://developers.openai.com/blog/how-to-build-games-with-astra.

## Verified

- Eight matched **1600 × 1000** camera pairs from the preserved V0.6 and final V0.7 portable executables: start, midpoint, viewpoint, path close-up, cliff close-up, lower bend, upper meadow and ridge approach. Main views use 66° FOV and 1.72 m eye height; inherited cliff close-up uses 38°. Wind animation is not frame-locked.
- **327.98 m route**, normal W-key input with automated heading adjustments, **189.078 seconds**, zero blocked controller steps, zero focus interruptions, **0.02364 m** maximum grounding error. This is guided real-time input, not a human playtest. Images were also captured during traversal. Mouse capture/look, pause, resume and both arrival-reset paths passed; no runtime errors.
- Exact runtime equality of all three surveyed terrain meshes, 421 route samples, 65 collision volumes, fog and FOV. Survey assets, controller, sky, authored cliff generators and trail-detail geometry remain byte-identical. Controller tests also passed slope rejection, obstacle collision, diagonal speed and delta-time caps.

## Rendering cost

RTX 4070 Laptop GPU, Windows, ANGLE/D3D11, 1600 × 1000. Sequential 11-second camera sweeps, first second discarded. GPU timestamps use `EXT_disjoint_timer_query_webgl2`; no disjoint results. These are measurements on this machine, not a performance guarantee for other hardware.

| Measurement | V0.6 | V0.7 |
|---|---:|---:|
| Mean GPU time | 6.29 ms | 6.66 ms |
| GPU p95 | 9.28 ms | 8.67 ms |
| Mean frame interval | 13.33 ms | 13.33 ms |
| Frames over 25 ms | 0 | 0 |
| Mean CPU render submission | 1.02 ms | 1.01 ms |

Both held the approximately 75 Hz display cap. Small run-to-run timing variation means the lower V0.7 p95 should not be read as a general speedup.

| V0.7 matched pose | Submitted triangles | Draw calls |
|---|---:|---:|
| Start | 10,808,974 | 163 |
| Midpoint | 9,488,623 | 153 |
| Viewpoint | 7,326,640 | 51 |
| Path close-up | 9,465,610 | 82 |
| Cliff close-up | 7,329,365 | 51 |

## Assets and limits

South Tyrol's CC0 DTM remains the **1:1 EPSG:25832** foundation. Materials, plant placement, flowers and cliff embellishments are authored. New CC0 **Dandelion 01** source and derivatives total **3,436,864 bytes**; four 1024² maps, three leaf meshes of **543 / 411 / 355 triangles**. Original flower near/mid counts are yellow **192/79**, pink **148/58**, white **288/133**, violet **189/97** per three/two-stem plant. Existing cliff maps remain 4096² diffuse / 2048² height; gravel remains 2048² diffuse/height and 1024² roughness. Total on-disk assets: **53,084,616 bytes**. Full sources, hashes, texture allocation and licensing: ASSETS.md and `artifacts/alpine-v07/assets.json`.

It remains a visual prototype. Close grass blades and pink flower heads still reveal simple geometry; the plant library is small and near/mid substitutions can be noticed while moving. Distant meadow surfaces are smoother than the photographs, cliff shelves remain over-regular, and rock/scree boundaries need more local authorship. Fine vegetation uses approximate leaf lighting rather than individual cast shadows. The wider valley still lacks forests and buildings; the sky and sunlight are static. No map expansion or gameplay systems were added.
