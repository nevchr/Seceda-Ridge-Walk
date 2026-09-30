# V0.12 packaged validation

## Conditions and performance

Paired preserved V0.11 and final V0.12 portable executables on the same machine. Windows reports AC online, battery saver off and the **Turbo** power scheme before and after. NVIDIA RTX 4070 Laptop GPU, ANGLE D3D11. The window stayed on the **LG UltraWide, 2560×1080 at 75 Hz**. Both games rendered **1600×1000, pixel ratio 1, High**, 66° FOV except the inherited 38° cliff-close view. The fixed pixel ratio is a QA launch flag; the normal build still follows the user's display scale. Other attached displays were the 1920×1200 165 Hz internal panel and a portrait 1080×1920 144 Hz panel. No system power or display settings were changed.

Five seconds per pose, first second discarded, after vegetation loading settled. GPU timer queries were supported and non-disjoint. Frame timing includes the 75 Hz display cap; CPU submission excludes simulation. Raw reports include display bounds, renderer, sample counts, temperature/power/clock snapshots, and timestamps. These are local measurements, not guarantees for other hardware or full-screen resolutions.

| View | V0.11 GPU mean / p95 ms | V0.12 GPU mean / p95 ms | V0.12 triangles | Draw calls |
|---|---:|---:|---:|---:|
| start | 14.80 / 16.06 | 13.18 / 14.25 | 20,709,762 | 769 |
| midpoint | 13.59 / 15.01 | 13.16 / 15.13 | 18,580,366 | 740 |
| viewpoint | 16.07 / 17.64 | 14.65 / 15.92 | 15,910,242 | 488 |
| start-away | 9.15 / 16.27 | 8.05 / 12.68 | 10,329,758 | 254 |
| pasture-east | 11.61 / 16.34 | 12.40 / 15.64 | 17,270,500 | 505 |
| pasture-away | 9.51 / 15.69 | 9.64 / 14.40 | 15,171,960 | 279 |
| cliff-edge | 17.41 / 19.12 | 15.50 / 16.86 | 16,892,734 | 508 |
| cliff-close | 21.44 / 23.14 | 18.66 / 20.36 | 14,559,182 | 355 |

Readiness was 16.92 s for V0.11 and 20.95 s for V0.12 in this run; final streaming cells are allowed to settle separately before fixed-view measurements. The first visual implementation was preserved and measured. No later quality-reduced build was substituted. Culling reduces redundant distant terrain work, while the new pasture adds flowers and draw calls where V0.11 had little detail.

## Traversal and collision

- The complete original **327.98 m route** passed with actual normal-speed W input and automated steering: **0 blocked steps**, maximum grounding error **2.36 cm**. Pointer capture, actual mouse look, Escape pause, arrival and both resets passed.
- A separate **2.04 km planar pasture loop**, including the descent off the route and return to the start, completed with actual W+Shift input in **759.16 s (12.65 minutes)**: **0 blocked steps**, maximum grounding error **6.54 cm**. There were 0 focus resumes across the tests. Each leg is continuous; the endpoint was placed once before the separate pasture leg.
- Plant cells were created and disposed throughout the loop; peak residency was **165 cells**, rather than all cells across the survey. The sampled moving frame averages were mostly about 13.33 ms, but these snapshots are not a continuous percentile benchmark.
- The full traversal exposed an aliased short-turf bump experiment. It was removed. The final package then passed **three further actual-input, 24-second walks** at the original route, middle pasture and east pasture, plus all matched captures and the final paired benchmark. Final short checks have 0 blocked steps. The full 2.04 km loop was not repeated after that shading-only cleanup; collision and terrain were unchanged.
- Production-controller simulations independently passed the route and pasture loop, diagonal speed, delta clamping, prop collision, northern cliff rejection and development-boundary stops. The polygon plus local slope/clearance rejection is not a general cliff-climbing or rigid-body system.

This is automated real-time input testing, not a human playtest. No teleport occurs during either long traversal. The walk images and raw path samples remain available.

## Images, assets and preservation

Eleven matched portable camera pairs use 1600×1000 native canvas captures: start, midpoint, viewpoint, three reverse/uphill views, three new-area views, cliff edge and cliff close-up. V0.11 new-area cameras were QA placements in scenic terrain; those positions become reachable in V0.12. Two iteration sets preserve the rejected chunk seams and repaired terrain. Final captures and walking images were visually inspected.

All survey files, their metadata, all 421 route points, original prop/trail sources, sky and movement integration are preserved; 8,722 sampled heights match V0.11. The V0.11 folder also matches all 1,301 files in its original ZIP. Previous archive hashes are checked again before delivery.

Asset files remain **166,169,822 bytes**, with **35 loaded textures**, no new downloads and no reference photos included. Rock colour/packed maps remain 4096² and 2048²; grass/dandelion maps remain 1024²; gravel colour/height are 2048² with 1024² roughness. The dynamic sward height field now spans 721×521 float samples.

There are **417 survey chunks**, 3,330,228 native terrain triangles including skirts, and 6,690,592 authored cliff triangles. The new woodland rules produce 193,284 distant trees and 0 reachable trunk colliders. Runtime triangle counts in the table include grass, trees and props as well as terrain. This is not a measured VRAM figure. The final package audit hash-matches source/assets/docs, excludes all five reference images, checks licenses, and the separate ZIP receives a CRC and SHA-256 check.
