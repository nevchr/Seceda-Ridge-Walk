# V0.13 validation — 29 September 2026

Final portable: `release/Seceda-Windows-v0.13/Seceda.exe`. Baseline: committed V0.12 `6ccdbf5`. The complete route and pasture test below ran after the last visual edit. `final-runtime.json` records the 111 runtime file hashes frozen before that traversal; the package audit checks them again. Later edits were documentation and delivery checks only.

## Rendered review

23 matched portable image pairs: seven locations in three directions (start, midpoint, viewpoint, cliff edge, south meadow, east pasture and south return), plus inherited close cameras. Exact position, direction and FOV equality is checked; every image is 1600 × 1000. Full-size images were inspected across the successive meadow, rock, woodland and sky studies. Final extra views at the southern faces, mid-pasture faces and eastern turn verify the regional shadow correction. The inherited path-close pose actually looks at the meadow beside the path and is labelled accordingly.

Visible gains are continuous fine cover, mixed flowers rather than broad pink/violet bands, less regular cliff ledges, shared fracture detail on secondary mountains, and less primitive woodland. Failed coarse-blade, horizon-strip, patch-seam and false-shadow studies remain available. The five private photographs remain reference-only.

## Packaged movement and preservation

- Actual held W input completed all 421 original-route points in **189.12 seconds**. A separate continuous W+Shift pasture loop completed all 68 waypoints, approximately **2.04 km**, in **758.96 seconds**. Combined run: **948.11 seconds / 15.8 minutes**.
- Zero blocked steps, zero rendering errors and zero focus resumes. Maximum smoothed eye-height error: **2.36 cm** on the route and **6.54 cm** on the pasture. Mouse/pointer capture, Escape pause, R reset and stale-arrival reset were exercised. This was automated steering with real-time keyboard movement, not a human playtest. The endpoint was set once before the separate pasture leg; neither leg teleported internally.
- Grass cell residency stayed bounded at **165 tiles** maximum. Moving-frame intervals at 1600 × 1000: mean **13.60 ms**, p95 **13.50 ms**, p99 **26.70 ms**. One of 69,719 active frames exceeded 50 ms (maximum **53.50 ms**). The 1,018 frames marked as loading vegetation had p95 **13.60 ms**, maximum **26.90 ms**. Screenshot readback and automation are included; these are frame intervals, not GPU durations.
- Production-controller tests passed route, slope/drop, obstacle, diagonal-speed and large-delta checks. **76** prior asset/control/major-form files remain byte-identical to V0.12. Scenic sculpture leaves **6,983** checked walking-ground samples unchanged. All **187,783** regional-rock vertices stay outside the walking area plus a 30 m buffer.

The original 328 m route and the existing **0.602 km² southeast pasture envelope** remain walkable, subject to local steep-bank limits. Northern cliff faces, western escarpment, high massif and land beyond the boundary are scenic. No further area was opened in this V0.13 pass. Survey provenance, EPSG:25832 metre coordinates and collision are preserved; see REGION_V013.md and TERRAIN.md.

## Paired performance

Both packaged versions used AC power, battery saver off, the same Windows **Turbo** scheme (`6fecc5ae-f350-48a5-b669-b472cb895ccf`), High settings and pixel ratio 1. GPU: **RTX 4070 Laptop**, ANGLE / Direct3D11. Controlled buffer: **1600 × 1000**. Normal primary display: **LG ULTRAWIDE, 2560 × 1080, 75 Hz, 100% scaling**; that mode rendered full-screen at 2560 × 1080. Other connected displays remained present. No system power settings were changed.

Sequential V0.12 then V0.13, eight fixed poses per mode; five-second samples with the first second discarded. GPU queries were supported and non-disjoint; all runs reported zero rendering errors. CPU submission and capped frame intervals are retained in the raw reports. These are one-machine snapshots, not identical thermal-state trials or cross-hardware guarantees.

GPU values below are milliseconds. Triangle and call counts are the renderer's per-frame totals at native resolution, including instancing/render passes; they are not unique asset geometry counts.

| View | 1600 × 1000 mean, V12 → V13 | 2560 × 1080 mean, V12 → V13 | V13 native GPU p95 | V13 native triangles | Draw calls |
|---|---:|---:|---:|---:|---:|
| start | 13.16 → 15.40 | 15.63 → 19.62 | 20.85 | 31,357,112 | 1,233 |
| midpoint | 13.16 → 13.88 | 13.82 → 17.77 | 19.34 | 29,806,889 | 1,189 |
| viewpoint | 13.22 → 15.75 | 15.65 → 19.51 | 21.00 | 24,539,351 | 895 |
| start-away | 11.96 → 13.13 | 13.05 → 12.78 | 13.89 | 21,515,765 | 459 |
| pasture-east | 12.59 → 13.21 | 13.21 → 17.11 | 18.37 | 26,790,647 | 1,025 |
| pasture-away | 9.24 → 13.15 | 11.00 → 14.32 | 15.21 | 25,821,684 | 498 |
| cliff-edge | 13.48 → 16.67 | 17.36 → 21.41 | 23.30 | 24,896,421 | 932 |
| cliff-close | 16.29 → 18.84 | 21.61 → 24.75 | 26.68 | 22,318,169 | 698 |

At the native viewpoint, GPU mean rises **24.6%** (15.65 → 19.51 ms); mean frame interval is **19.71 ms**, p95 **40 ms**. Across normal 66° views, native mean frame intervals range **13.33–21.84 ms**; the inherited 38° close camera averages **25.00 ms**. This is not a locked 60 fps High preset. The controlled moving test was substantially steadier than the fixed native-resolution benchmark. No visible quality was removed merely to match the old frame time.

Before/after telemetry snapshots: controlled V12 **61→76°C**, **1980→2535 MHz**; V13 **75→77°C**, **2535→2535 MHz**. Native V12 **62→76°C**, **1980→2535 MHz**; V13 **76→78°C**, **2535→2535 MHz**. These bracket each run and are not continuous temperature logs. AC and the power scheme matched before and after every version. Raw results: `final-controlled.json`, `final-native.json` and their condition files.

The preserved full-detail first study was measured before optimization. Its native start/viewpoint means were 21.08/20.57 ms. Removing subpixel ledge subdivisions and adding grass curve levels improved cost while retaining density and texture resolution; matched images and the first study build are retained. Final shared scenic rock has **316,350 triangles across 355 tiles**. The ledge surface has **1,034,240 triangles**.

## Assets and delivery checks

Runtime asset files total **213,014,796 bytes** (including preserved unused source maps); V0.13 additions total **46,844,974 bytes**. New fine grass and broad ground maps are **2048²**; normal/AO and height/roughness channel packing preserves colour/height resolution. Existing limestone diffuse is **4096²**, with other source dimensions listed in `assets.json`. New material ingredients are ambientCG Grass005 and Poly Haven Grass Ground, both **CC0**. Added mesh geometry and environmental rules are original work. Sources, footprints, authors and hashes are documented in ASSETS.md and the asset manifests.

Delivery checks are machine-readable in `package-audit.json` (source/package equality, frozen runtime, photo exclusion, paired poses, completed traversal, conditions and previous archive hashes), `release.json` (ZIP CRC and every archived file compared with the portable) and `gallery-check.json` (all 23 image pairs, controls, performance modes and local links). Previous releases and comparisons are retained. The portable is unsigned and works offline.

## Remaining limitations

Fine grass and flower shapes still repeat and look angular on very steep nearby banks. Some vegetation-distance transitions remain visible during large turns. Rock-to-ground blending is smoother than the photographs; the 40 m far survey still rounds distant profiles. Forest crowns and static clouds remain simplified. Fractures, plant/woodland placement and scree are authored interpretations, not measured local geology or vegetation. The larger coarse-terrain shadow tolerance can soften small recess shadows. Other Windows hardware, sustained native-resolution roaming and critical audio listening were not tested. There is no disk terrain streaming, save system or valley traversal.
