# V0.15 validation

Portable: release/Seceda-Windows-v0.15/Seceda.exe. Baseline: V0.14 e3c27b6, checkpointed before editing as 3b9f606. All 494 runtime hashes were frozen before final captures/traversal and rechecked by the package audit. Later delivery edits are documentation/artifacts only.

## Rendered comparison

31 matched 1600 × 1000 portable views: seven sites in three directions, three regional views, two inherited close poses, four additional off-trail angles and the outward pasture rim. Eye height 1.72 m, normal FOV 66°; cliff-close retains 38°. Camera position/orientation/FOV equality is checked. The rim baseline used a separate portable launch. These are actual game captures, not composited scene art. Packaged studies and critiques remain in WORKLOG.md.

The strongest gains are fuller modeled canopy across both valleys, continuous middle vegetation, naturalised image artifacts and terrain-conditioned mineral detail. Broad far pasture still relies on texture; rock ingredients and plant crowns repeat. Corrected geographic colour can retain residual photographed light or tracks. It is not calibrated reflectance, photogrammetry or a current building/vegetation survey.

## Packaged movement

421/421 route samples and 68/68 pasture waypoints completed in 15.80 minutes, including a 758.75 s continuous pasture leg. Zero blocked steps, 0 rendering errors, 0 focus resumes. Maximum eye-height smoothing error: 2.36 cm on the route and 6.54 cm in pasture. Mouse look, pointer capture, pause, keyboard reset and stale-arrival clearing passed.

This uses real-time held W / W+Shift with automated steering through the production controller, not a human playtest. No teleports occur within either leg; the endpoint is set once before the separate pasture leg. New rocks and shrubs stay outside the playable area; the middle meadow remains cosmetic, and woodland reports 0 walkable tree colliders.

Moving frame intervals at 1600 × 1000: V14 mean/p95 14.27 / 26.60 ms; V15 19.90 / 40.10 ms, p99 53.30 ms. 863 of 47,647 active frames exceed 50 ms; maximum 120.00 ms. These include display pacing, capture and automation stalls, and are not GPU durations.

## Paired rendering cost

Both versions: plugged in, battery saver off, same Windows power scheme (Power Scheme GUID: 6fecc5ae-f350-48a5-b669-b472cb895ccf  (Turbo)), High detail, shadows on, head motion off. RTX 4070 Laptop GPU / ANGLE Direct3D11. Controlled buffer 1600 × 1000; native primary display 2560 × 1080 at 75 Hz, DPR 1. No power/display settings were changed. Actual before/after conditions, clocks and temperatures are in the raw reports; thermal state is not claimed identical.

Sequential runs, five-second samples, first second discarded. GPU queries use EXT_disjoint_timer_query_webgl2 and must be supported/non-disjoint. Counts include submitted instances/passes, not unique assets. No visual quality was removed to meet a performance target.

Time to scene-ready on these native launches: V14 21.3 s; V15 26.2 s. This includes startup generation/loading on this machine; it is not a cold-disk benchmark.

| View | Controlled GPU mean V14 → V15, ms | Native GPU mean V14 → V15, ms | V15 native p95, ms | Native triangles | Draw calls |
|---|---:|---:|---:|---:|---:|
| start | 16.04 → 23.58 | 21.06 → 30.24 | 32.34 | 51,024,290 | 2400 |
| midpoint | 14.36 → 21.33 | 18.76 → 27.97 | 29.98 | 49,455,723 | 2355 |
| viewpoint | 16.19 → 25.62 | 20.98 → 33.20 | 36.18 | 46,959,589 | 2214 |
| start-away | 13.05 → 13.87 | 13.66 → 18.77 | 20.68 | 35,220,272 | 867 |
| pasture-east | 13.24 → 20.82 | 18.55 → 28.03 | 29.47 | 48,010,273 | 2309 |
| pasture-away | 13.08 → 15.92 | 16.48 → 21.52 | 23.39 | 37,953,874 | 898 |
| cliff-edge | 17.53 → 26.31 | 23.65 → 34.49 | 37.83 | 46,964,746 | 2245 |
| cliff-close | 23.18 → 31.31 | 32.39 → 43.19 | 45.64 | 41,941,565 | 1651 |

## Preservation and assets

417 baseline assets/invariant source files match V14. 26,947,242 valid native samples; all lower levels equal source nodes; 56,871 exact shared-source edge samples; 26,554 unchanged walking heights. Route 327.98 m, EPSG:25832, 1 m/unit, no vertical exaggeration. Native mesh/stitching and principal ridge generators are unchanged.

The twelve 2048², 2 m/texel derivatives and manifest total 24.69 MB. The same 14-layer array remains about 298.7 MiB with mipmaps; other texture dimensions are unchanged. Middle-sward height apron: 941 × 765 R32F nodes at 2.5 m, 2,879,460 bytes.

Full-region generated totals: 276,466 fragments / 10,505,708 triangles; 22,669 low shrubs at 140 triangles each; 2,889 shallow outcrop groups / 273,996 triangles; 518,498 conifers / 30,688,306 triangles across three detail levels. Frustum culling limits visible submissions; these totals are not rendered at every camera.

DTM and historical land use: provincial CC0. Ortofoto 2023 RGB: Provincia Autonoma di Bolzano / Alto Adige, with AgEA, CC BY 4.0. Derivative modifications and attribution remain in ASSETS.md and the image manifest. Individual detail is original authored work. Five private reference images remain excluded. Package/ZIP audits verify parity, licenses and older archives.

Walking remains the original ridge route and 0.602 km² southeast pasture envelope, with existing steep-bank/prop limits. Northern cliffs, western escarpment, high massif and outer terrain are scenic. Other PCs, long unattended sessions and subjective audio quality remain unverified.
