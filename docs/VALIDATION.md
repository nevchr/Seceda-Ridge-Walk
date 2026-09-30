# Current milestone: v0.4

See [MATERIALS_V04.md](MATERIALS_V04.md) for the current material diagnosis, five matched view pairs, texture inventory, final GPU timing and preserved-geometry checks. Raw packaged evidence is in artifacts/materials-v04. The records below are historical.

# Current milestone: v0.3

See [MEADOW_V03.md](MEADOW_V03.md) for the final v0.3 packaged validation: 189.304-second real-time W-input route traversal, zero blocked steps, 2.4 cm maximum grounding error, matched screenshots, arrival-reset regression and v0.2/v0.3 GPU timing. The evidence below is historical.

# Validation — 2026-09-27

**v0.2.0 update:** See `VISUAL_REDESIGN.md` for the current visual pass, matched screenshot comparison and revised 75-collider validation. The sections below describe the original v0.1.0 milestone; the Git checkpoint preserves its original evidence. The current root launcher targets `release/Seceda-Windows-Redesign`.

## Confirmed

The **portable Windows executable** at `release/Seceda-Windows/Seceda.exe` was launched through Electron/Playwright. It loaded its files locally and rendered the scene without JavaScript or console errors. Its renderer was captured at the start, along the walk, and at the viewpoint. These are actual runtime captures, not concept art.

- Begin button captures the pointer; W key events move the player in the rendered application.
- Mouse input, Escape pause, fixed position while paused, and R reset were exercised.
- The complete authored route was traversed using the production controller and all **43 scene obstacle colliders**. It completed in **188.55 simulated seconds**. The traversal runs fixed 1/60 s movement updates faster than real time; it is not a manually timed playthrough.
- Route length: **327.98 m**. Maximum controller ground-following smoothing error: **0.023 m**.
- Arrival triggers successfully at the ridge and leaves free look available.
- Separate controller checks passed for a north-cliff approach, obstacle penetration rejection, equal diagonal/forward speed, capped large frame deltas, route gradients, and complete/finite raster data.
- Browser rendering also completed without errors after the unused favicon request was fixed.

Final portable-build evidence: `artifacts/desktop-packaged-tests.json` and `artifacts/controller-tests.json`.

Screenshots:

1. `artifacts/packaged-01-start.png` — start, with Begin walk interface.
2. `artifacts/packaged-02-walk.png` — mid-route, facing uphill and east.
3. `artifacts/desktop-packaged-viewpoint.png` — final ridge reveal.

## Problems found and addressed

Initial inspection found washed-out illumination, oversized sparse grass, a destination post obscuring the peaks, and outcrop placement too close to the trail. These were corrected through material/light tuning, denser smaller vegetation, relocating the marker and conservative scatter clearance. The viewpoint was moved to the surveyed crest for a clearer north-face reveal, extending the walk from 314 m to 328 m. The Odle sampling was increased from 10 m to 5 m. Transition cracks were addressed with shared metric grid boundaries and mesh skirts. A sign post was moved behind its sign face. Escape now explicitly releases pointer lock, including synthetic desktop input.

## Practical limits of this evidence

The frame interval recorded during the local check was approximately 13.3 ms, but this is a short, vsync-limited observation, not a representative hardware benchmark. The machine enumerated an NVIDIA RTX 4070 Laptop GPU and Intel UHD Graphics; the basic Electron GPU report did not positively identify the active renderer. No minimum hardware guarantee is made.

Audio nodes were exercised but the result was not assessed by ear. Installation/signing, testing on a fresh Windows PC, long-session stability, controller input, and integrated-GPU performance were not verified. No public release was uploaded.

## Still rough

This remains a procedural visual prototype. Close grass, boulders, and cliff faces lack photogrammetry-level detail; strata and texture tiling can repeat, and raster sampling rounds some rock forms. The trail is visibly a ribbon on the real ground. The wider terrain has no woodland, settlement or cableway reconstruction. Sun/clouds are static, and there is no weather system. There is no continuous traversal beyond the small playable area, world streaming, saved progress or persistent settings.
