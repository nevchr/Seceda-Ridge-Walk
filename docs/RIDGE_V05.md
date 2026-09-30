# Seceda v0.5 — ridge and meadow study

The v0.4 checkpoint is `2ed02dbd12a8def8af602cf0079d27b08fb9df9f`. It was committed before edits, including source, documentation and v0.4 comparison evidence. Reference photographs and all portable builds remain ignored. The new build is `release/Seceda-Windows-v0.5`; previous builds are preserved.

## Visual diagnosis and changes

The five v0.4 camera captures were inspected alongside all four supplied photographs before editing. Gravel was already useful. Larger problems were smooth heightfield cliff faces, weakly differentiated slopes, and oversized ribbon grass/flower heads. A material-only change could not fix the main cliff forms.

The new original geometry adds survey-fitted vertical prows, fractured relief, connected turf shelves and nine asymmetric summit blades. These are artistic interpretations aligned to the metre-based DTM, not measured geology. Summit additions rise 8–43 m above their local survey anchors. The DTM itself, route, walking collision, lights and sky remain unchanged. Cliff additions lie outside the bounded walking area.

Slope, curvature, aspect and nearby upslope exposure now govern exposed rock, thinner turf and approximate scree deposits. This is terrain-informed art direction, not a geological classification. Far slopes remain coarsely resolved.

Near vegetation uses four CC0 grass clumps (833, 653, 310 and 79 triangles per source mesh) at a quarter of accepted scatter positions. Original short tufts use 42 folded blades / 336 triangles nearby and four blades / 16 triangles at mid distance. Small original yellow, pink and white flowers replace the large star-shaped heads. Instances align to the terrain normal; detailed leaves use an 18 m tile-centre threshold with 4 m hysteresis. Short cover tapers from 28 to 95 m; vegetation tiles end at 105 m. Beyond this, the terrain material supplies cover. This keeps the expensive geometry near the camera.

## Rendered iteration

Several source renders were examined at the same 1600 × 1000 start, midpoint, viewpoint, path-close and cliff-close poses. Changes driven by those images included removing painted-looking altitude stripes, fixing a wrong contour crossing that created a diagonal ledge, reducing derivative-bump artifacts, fitting plant roots to the slope, rejecting visibly repeated atlas cover cards in favor of folded-leaf geometry, reducing bright leaf shading, and tapering short cover into the distance. A coastal photogrammetry ledge experiment looked detached from the mountain and was excluded from source/runtime assets; its candidate files remain only in ignored references.

The final comparison uses preserved v0.4 and new v0.5 portable executables, not edited illustrations. Camera coordinates, FOV, viewport, route and lighting match. The arrival-reset flow is exercised before capture.

## Asset provenance

See `ASSETS.md` and the adjacent `*-license.json` manifests for authors, exact source URLs, dimensions, byte sizes, upstream MD5 checks and local SHA-256 hashes. New active ingredients are Poly Haven Grass Medium 01 (CC0, Rico Cilliers / Rob Tuytel) and Marble Cliff 05 (CC0, Amal Kumar). The latter is a marble surface ingredient, **not a scan of Seceda or proof of Dolomite geology**. The grass atlas photographs are licensed assets; none of the four user reference images are sampled, copied into assets, or packaged.

Original cliff/flower geometry and shaders are project-authored. No new application license is assigned. Three.js/Electron licenses remain in the portable package.

## Remaining visual limitations

The near cliff and foreground now differ clearly in the matched full view, but the photographic target is only partly achieved. The main Odle massif still has overly broad, smooth faces; this candidate should not be mistaken for a finished reference match.

This remains a visual prototype. Broad distant faces still reveal the heightfield foundation; authored prows can read as sculpted blocks, and the small summit additions do not reconstruct the real Odle fissure network. Clump silhouettes still repeat, and individual textured leaves can look speckled. Species placement is illustrative, with no ecological survey. Scree lacks individual distant debris geometry. The unchanged sky is static and stylized. There is no new walkable area, streaming or additional gameplay.

## Measurements (1600 × 1000, high detail)

Same preserved executables, 11-second route-camera sweep, first second discarded. WebGL2 timer queries were available and non-disjoint. Hardware: NVIDIA GeForce RTX 4070 Laptop GPU, ANGLE / Direct3D11. These are local measurements, not a minimum-spec guarantee.

| Measure | v0.4 | v0.5 |
|---|---:|---:|
| Mean GPU render time | 5.13 ms | 5.40 ms |
| GPU 95th percentile | 6.07 ms | 8.21 ms |
| Mean CPU render submission | 0.30 ms | 0.90 ms |
| Mean frame interval | 13.33 ms | 13.33 ms |
| Frames over 25 ms during sweep | 0 | 0 |
| Launch to QA-ready (single run) | 1.63 s | 4.36 s |

Both runs were display-capped near 75 fps. Viewpoint triangle submissions fell substantially, but the denser near cover raises start/midpoint counts. GPU time did not improve: cutout foliage, extra batches and tile-shadow refreshes have a cost. The GPU tail and CPU submission cost increased. See `artifacts/ridge-v05/performance.json` for samples and method.

| Matched pose | v0.4 triangles / calls | v0.5 triangles / calls |
|---|---:|---:|
| Start | 8,275,334 / 45 | 8,841,643 / 152 |
| Midpoint | 8,275,294 / 38 | 8,487,698 / 146 |
| Viewpoint | 8,269,998 / 16 | 4,387,038 / 32 |
| Path close | 8,274,438 / 24 | 8,082,521 / 72 |
| Cliff close | 8,274,398 / 17 | 4,348,946 / 29 |

These are Three.js submitted render counts after each view settles, including instances, rather than unique asset triangles. Shadow refresh frames can cost more. New original rock geometry totals 316,228 triangles: relief shell 213,096; contour prows 96,680; summit blades 2,412; shelf meshes 4,040. Their generated geometry buffers total 10,677,288 bytes.

| Active source textures | Resolution | Disk size |
|---|---|---:|
| New pale-rock diffuse / height | 4096² / 2048² | 16,912,311 bytes |
| New grass diffuse / alpha / normal / packed roughness | Four 1024² maps | 2,478,894 bytes |
| Existing meadow diffuse | 2048² | 2,624,635 bytes |
| Existing trail diffuse / height / roughness | 2048² / 2048² / 1024² | 6,089,714 bytes |

Grass glTF plus binary adds 1,033,742 bytes; new external source ingredients total 20,424,947 bytes. Rock textures retain upstream bytes; grass map files also match upstream MD5. Runtime generated maps include a 1536 × 1024 terrain-zone map and the retained trail/horizon/cloud maps. Disk compression sizes are not VRAM measurements. Legacy v0.4 Rock Face and unused meadow-height maps are retained in the package for source continuity.

## Verification

Exact runtime/hash checks confirm all three survey meshes, all 421 route points, all 65 collision objects, controller source, terrain data, sky source, FOV, light setup and fog match v0.4. All authored cliff vertices are outside the walking bounds. Controller tests cover the full route, cliff rejection, obstacle collision, diagonal speed and frame-delta capping. The simulated route took 188.6 seconds with 0.023 m maximum grounding error.

The package audit compares every shipped source, asset and documentation file with the workspace, verifies bundled software licenses, and checks that no supplied reference images or rejected coastal-cliff assets are present. The portable folder is approximately 394 MB. Previous builds remain alongside it.

The final portable build completed the entire route in **189.0 seconds**, using held W input and automated heading adjustments at normal speed. There were **zero blocked controller steps**, **0.02365 m maximum grounding error**, no focus resumes and no runtime errors. Mouse capture, Escape pause, resume, arrival, QA reset and keyboard R reset passed. An earlier traversal was interrupted by external focus loss near the end; the final recorded traversal was uninterrupted. This is an automated input playthrough, not a human usability test. See `artifacts/ridge-v05/packaged-walk.json`.
