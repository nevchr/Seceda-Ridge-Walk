# Seceda V0.9 â€” rock, trail and landmarks

Based on V0.8 checkpoint `5702b53a6ae47fc138ced8b0a1f92843763dd655`.

The real DTM remains the large-scale terrain and walking surface. Original jointed rock volumes replace the previous smooth wall and terrace models; their columns follow survey isoheight contours. Irregular bed thicknesses, intersecting fracture planes, projecting buttresses, eroded faces and limestone talus supply modeled depth. The existing broad terrain and authored summit fins remain underneath. The additional south-facing treatment is restricted to steep exposed rock above 2,615 m. These details are art direction, not a geological survey or photogrammetry reconstruction.

The trail retains its V0.8 material and route. Eight new pebble forms are partly buried in the actual rendered survey triangles, with wash pockets, edge accumulations and fewer large stones in the worn centre. Their surface relief is cosmetic; the smooth production controller is unchanged.

The existing fence, cross and trail sign were rebuilt in place with beveled weathered timber, end grain, drying checks, a lapped cross joint, bolts, washers, a metal foot shoe, eyelets and sagging three-strand rope. Their old collision centres and radii are retained. These are original interpretive models, not measured replicas of present-day Seceda fixtures.

## Materials and licenses

All three new texture sources are **CC0-1.0** under [Poly Haven's asset license](https://polyhaven.com/license). Original downloads, authors, physical footprints, URLs, MD5 and SHA-256 hashes are in `assets/materials/v09/*-source.json`.

| Source | Author | Delivered source channels | Physical use |
|---|---|---|---|
| [Marble Cliff 04](https://polyhaven.com/a/marble_cliff_04) | Amal Kumar | 4096Â² color, OpenGL normal, displacement, roughness | 12.656 m triplanar cliff surface |
| [Marble Rock 01](https://polyhaven.com/a/marble_rock_01) | Amal Kumar | 2048Â² color, OpenGL normal, displacement, roughness | 2.002 m fine rock layer, strongest within 24 m, fades by 95 m |
| [Weathered Planks](https://polyhaven.com/a/weathered_planks) | Dario Barresi / Dimitrios Savva | 4096Â² color, OpenGL normal, roughness | 2 m source height, individual plank strips mapped along timber grain |

The marble scans are material ingredients graded toward pale limestone, not a claim that the source scan is Dolomite rock. World-space projection avoids stretched mesh UVs. Offset blending reduces obvious cliff tiling. Roughness and normal maps retain their physical role; low-amplitude height gradients add fine relief without pretending to supply the major cliff geometry.

Normal X/Y, roughness and height channels are copied at their original resolution into RGBA PNGs by `scripts/pack-stone-textures.py`. This was needed for the hardware's 16 fragment-sampler limit; no texture resolution was reduced. The original channel files remain available. Wood end grain (256²), pebble contact masks (64²), and the refreshed sign lettering (1024 × 320) are original runtime-generated textures. No user reference-photo pixels enter any game asset or package.

Existing terrain, vegetation, gravel and software licenses remain documented in `ASSETS.md` and `TERRAIN.md`.

## Visual iteration

The V0.8 portable executable was captured before source edits. Eleven identical 1600 Ã— 1000 views cover start, midpoint, viewpoint, valley, path, cliff, three intermediate walking positions, fence and cross. Player eye height is 1.72 m, main FOV 66Â°. The inherited cliff-close comparison uses 38Â° FOV.

Source-render iterations are preserved in `artifacts/stone-v09/iteration-*`. The first valid rock pass had overly large wedge faces. Subsequent passes added finer fractures and eroded surfaces, then adjusted overly bright and raised gravel into more varied embedded stones. A south-facing trial incorrectly spread rock over meadow; the final version confines that treatment to steep high rock. These are actual game renders, not painted retouches.

## Performance and verification

Measured on the current NVIDIA RTX 4070 Laptop GPU, Windows / ANGLE D3D11, 1600 × 1000, normal High settings. Fixed views use five-second samples with the first second discarded; GPU timing is `EXT_disjoint_timer_query_webgl2`, supported and non-disjoint. These are local measurements, not guarantees for other machines.

| View | V0.8 GPU mean ms | V0.9 mean / p95 ms | V0.9 rendered triangles | Draw calls |
|---|---:|---:|---:|---:|
| Start | 10.00 | 11.02 / 12.21 | 17,061,894 | 469 |
| Midpoint | 8.82 | 9.86 / 10.70 | 15,612,153 | 451 |
| Viewpoint | 13.16 | 11.18 / 12.15 | 12,913,164 | 190 |
| Valley | 9.89 | 9.52 / 10.46 | 12,712,654 | 166 |

The matched moving-camera route sweep measured V0.8 **9.21 ms mean / 11.03 ms p95** and V0.9 **10.17 / 11.71 ms**. Both delivered about 13.33 ms display-capped frame intervals (75 Hz), with no sampled frame over 25 ms. The sweep is a camera-cost test; the separate real-time keyboard traversal verifies playability. V0.9 CPU submission averaged 1.92 ms; startup was about 12.8–13.3 seconds versus 6.2–7.0 seconds for V0.8.

**No performance-driven visual reduction was made.** The full-quality first packaged version is retained at `release/Seceda-Windows-v0.9-art`. The final `release/Seceda-Windows-v0.9` uses the same game source and assets; documentation was completed afterward. The increased geometry costs about 1 ms at start/midpoint, while the revised material shader saves work at the viewpoint. No arbitrary triangle, texture, or draw-call target was applied.

Geometry inventory: **5,688 fracture volumes, 2,738,064 cliff triangles**, plus 4,709 talus fragments / 178,942 triangles; **17,788 trail stones, 667,052 triangles** and 35,576 contact-mask triangles; **239,962 landmark triangles** across 188 meshes. These scene totals include hidden/off-camera work and differ from each camera's rendered totals. New geometry is generated from original authored rules at startup.

New texture files occupy **112,776,959 bytes** (original channels and packed copies retained); all project assets occupy **165,867,855 bytes**. Active new cliff textures are 4096² diffuse + packed normal/roughness/height, fine rock is 2048² diffuse + packed channels, and timber uses three 4096² maps. Approximate uncompressed RGBA8 allocation including mipmaps for these active new maps is 469.3 MiB. Total scene texture memory also includes existing materials and render targets; this is not a measured VRAM total. Per-file sizes and hashes are in `artifacts/stone-v09/assets.json`.

Exact packaged runtime comparisons passed for all three surveyed meshes, all 421 route points, all 65 collision volumes, fog and FOV. Terrain data, controls, sky, near vegetation and the retained broad ridge/summit generators are byte-identical to V0.8. No authored cliff vertex enters the walking bounds. Production controller tests pass; the inherited arrival-reset checks are exercised again in the packaged walk.

The final portable executable completed the full **327.98 m route in 189.18 seconds** using normal-speed real W-key input and automated steering. There were **zero blocked controller steps**, **zero focus resumes**, and **2.37 cm maximum ground-following error**. Pointer capture, mouse look, Escape pause, arrival, QA reset and keyboard R reset passed. No renderer or page errors were recorded. This was a guided real-time input test, not a human playtest. Four additional moving-route screenshots are retained. The preserved V0.8 ZIP still hashes to `18f337631839d8873d5d490fb6cb2d7701822b701cca5477811f8f9bcd492164`.


## Remaining visual limitations

Joint patterns can still read as angular blocks, and some untreated DTM faces remain smooth. Large-distance rock detail is constrained by projection into a small number of screen pixels. The pale rock palette and authored fractures are an interpretation rather than a scan of Seceda. Tiny pebbles use soft contact masks because the existing broad near-shadow map cannot resolve centimetre-scale shadows. The timber textures repeat, and the fixtures are weathered generic models rather than site replicas. V0.8 vegetation, forest placement, sky and distant terrain limitations remain. No new route or gameplay system is added.
