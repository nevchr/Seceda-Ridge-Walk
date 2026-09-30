# V0.14 validation — 29 September 2026

Final portable: release/Seceda-Windows-v0.14/Seceda.exe. Baseline: V0.13 checkpoint 0de5039. The 478 runtime-file hashes were frozen before the final traversal; the package audit rechecks them. Later edits concern documentation and delivery checks only.

## Rendered result

26 matched portable pairs at 1600 × 1000: seven sites in three directions, three regional angles and two inherited close cameras. Normal eye height 1.72 m and FOV 66°; cliff-close retains its inherited 38° FOV. Position, orientation and field of view are checked for equality. Zero capture errors. Full-size route, viewpoint, cliff, reverse and off-trail views were inspected through survey-only, mapped cover, relief, lighting, ground-texture and licensed regional-colour iterations. The inherited path-close camera looks at meadow beside the path and is labelled accordingly.

The clearest gains are the surveyed secondary crests/gullies, connected rockfall fans, varied pasture tracks/soil and fuller woodland pattern. The main authored ridge and close meadow remain intact. Private reference photographs were not used as assets. Public Ortofoto 2023 imagery is separately licensed and attributed under CC BY 4.0; see ASSETS.md.

## Packaged movement

- Original route: 421/421 samples, 189.30 seconds including reset/leg transition. Pasture loop: 68/68 waypoints, 758.80 seconds. Total 15.80 minutes. Zero blocked steps and zero runtime errors; 0 focus resumes through the normal pause UI.
- Maximum eye-height smoothing difference: 2.36 cm on route, 6.54 cm in pasture. Mouse look, pointer capture, Escape pause, R reset and stale-arrival reset were exercised. This is real-time held keyboard input with automated steering, not a human playtest. The endpoint is set once before the separate pasture leg; neither leg teleports internally.
- Moving frame intervals at 1600 × 1000: mean 14.41 ms, p95 26.60 ms, p99 26.80 ms. 2 of 65,798 active frames exceeded 50 ms; maximum 93.50 ms. Frames marked as loading geometry/vegetation: p95 26.70 ms. These are display-capped frame intervals, including capture/automation stalls, not GPU durations.
- Terrain geometry residency peaked at 97.0 MiB during the loop; native fine-height cache at 44.1 MiB, plus 25.8 MiB of shared 5 m heights. The final sampled cache held 12.2 MiB after 37 unused-tile evictions. Plants remain camera-following. Source caches and mesh levels are recorded per sample.

The original 327.98 m route and existing 0.602 km² southeast pasture envelope remain walkable, subject to steep-bank and prop limits. Northern cliff faces, western escarpment, high massif and terrain beyond that boundary are scenic. No additional walking area was opened in this regional V0.14 pass.

## Paired rendering cost

Both portable versions: AC power, battery saver off, same Windows Turbo scheme, High detail, shadows enabled, head motion off. RTX 4070 Laptop GPU through ANGLE/Direct3D11. Controlled buffer 1600 × 1000; normal primary LG ULTRAWIDE display 2560 × 1080, 75 Hz, pixel ratio 1. Other connected displays remained present. No power/display settings were changed. Actual conditions, temperatures, clock readings and buffers are retained before/after each version.

Sequential V0.13 then V0.14, eight poses per resolution; five-second samples, first second discarded. GPU queries supported and non-disjoint, no rendering errors. These are local snapshots, not identical thermal-state trials. Renderer triangles/calls include instancing and render passes, not unique asset counts.

| View | 1600 × 1000 GPU mean V13 → V14, ms | 2560 × 1080 GPU mean V13 → V14, ms | V14 native p95, ms | Native triangles | Draw calls |
|---|---:|---:|---:|---:|---:|
| start | 14.77 → 16.35 | 19.20 → 22.31 | 24.04 | 35,316,018 | 1441 |
| midpoint | 13.41 → 14.79 | 17.32 → 20.19 | 21.77 | 33,682,889 | 1381 |
| viewpoint | 15.07 → 17.03 | 18.66 → 23.53 | 25.67 | 28,812,949 | 999 |
| start-away | 10.46 → 13.11 | 13.01 → 14.94 | 16.57 | 26,820,285 | 741 |
| pasture-east | 13.10 → 14.00 | 16.40 → 20.00 | 21.66 | 31,536,315 | 1085 |
| pasture-away | 11.87 → 13.16 | 14.03 → 17.65 | 19.82 | 30,307,260 | 773 |
| cliff-edge | 15.51 → 18.43 | 21.29 → 25.03 | 27.21 | 29,058,839 | 1039 |
| cliff-close | 17.71 → 24.13 | 24.93 → 33.57 | 36.64 | 27,819,889 | 741 |

Observed ready times in the controlled pair: 14.27 s for V0.13, 22.79 s for V0.14. These are process-to-ready observations with local filesystem caches, not controlled cold-start tests.

## Data, assets and preservation

Native survey audit: 42 source tiles, 26,947,242 valid samples, every retained lower-resolution node equal to native source, 56,871 exact shared-source edge samples, 26,554 unchanged walking heights and 92 unchanged prior terrain/control/major-form/asset files. Installed mesh edges also pass the seven-pose moving-detail seam audit below 0.6 mm. Controller tests pass route, slope/drop, obstacle, diagonal-speed and large-delta checks.

Three regional derived fields are 2800 × 2400 RGBA8 at 5 m/texel. The ground-colour array is 2048² × 14 layers: two existing CC0 ingredients and twelve attributed aerial tiles, about 298.7 MiB with mipmaps. New regional imagery files total about 50 MB including original WMS responses. All project assets occupy 943.5 MB on disk, including preserved source and unused legacy material files. Approximately 430 MB of original DTM TIFFs remain in Git but are excluded from the playable package because the runtime reads derived height tiles. No visible density or resolution was reduced after the quality pass. Package and ZIP reports give exact shipped bytes/checksums and verify older builds/private-reference exclusion.

## Remaining limits

The result is a terrain/material reconstruction, not photogrammetry. Generic rock detail can still look striated; close plants and tree crowns repeat. Aerial ground retains some captured lighting and flat traces of roads/buildings; there are no corresponding reconstructed valley buildings or accessible roads. Heightfields cannot capture all overhangs. Clouds/sun are static, exploration is bounded, and adjacent coverage requires regenerated masks and collision validation. Other hardware, long unattended sessions and subjective audio quality are unverified.

## Measured cost investigation

The final native comparison uses exactly 2560 x 1080 buffers for both builds. At the normal viewpoint GPU means are 18.66 ms (V0.13) and 23.53 ms (V0.14); the inherited 38-degree cliff-close QA view is 24.93 vs 33.57 ms. These are sequential samples under the same recorded AC/Turbo/High settings, not identical thermal-state trials.

A separate isolated portable process at 1600 x 1000 tested temporary component toggles without editing any source/package file. At the normal viewpoint: full 16.70 ms, woodland hidden 14.73 ms, regional-ground branch disabled 14.82 ms. At cliff-close: full 23.67 ms, woodland hidden 22.14 ms, regional ground disabled 19.53 ms. Disabling the ground branch removes the entire distant land-cover/material treatment, not only the aerial sample; hiding woodland also changes occlusion. These are non-additive diagnostics, not alternative delivered quality settings. The visible regional work accounts for appreciable cost, especially in the zoomed QA camera. Quality is retained; shader cost and startup time remain useful future optimization targets. Normal gameplay stays at 66-degree FOV. All final delivery files keep the same runtime hashes used for the complete walk.
