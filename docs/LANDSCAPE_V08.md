# Seceda V0.8 — pasture and valley

Base: committed V0.7 f4bcebaed9023a2b6979c9dc14248677af9e98e0. Existing packages and comparison material are retained. The 327.98 m route, walking controls, survey coordinates, sky and near meadow are unchanged.

## Visual decisions

Reviewed the four user photographs and V0.7 start, midpoint and viewpoint captures before editing. Photo 02 provides the clearest direction for woodland below open alpine pasture and scree beneath cliffs; photos 01, 03 and 04 show the fine, continuous pasture and broken turf/limestone margins. No user photograph contributes pixels or geometry to the scene or package.

V0.7 grass ended at 90 m, flowers at 120 m, and 78% of distant ground color faded into a broad smooth palette by 360 m. Its 1536×1024 slope map covered only part of the far terrain. The valley contained no woodland or small vertical scale cues.

V0.8 adds a 1200×1000 terrain-conditioned land-cover field spanning the existing 14×12 km survey bounds. Pasture varies at metre, contour and hollow scales, with drier exposed shoulders, limestone ribs, broken scree and darker lower woodland ground. The field is original art direction derived from slope, altitude, curvature and nearby upslope exposure; **it is not a measured land-cover dataset**. Fine/coarse geology fields overlap over 120 m in fixed world coordinates. Ground detail blends in between 65 and 155 m from the camera, leaving the close material intact.

A separate one-triangle-per-sward layer bridges 70–285 m around the walk, at four representatives per square metre and one draw call. It overlaps the existing 58–90 m turf fade, is suppressed on steep rock and trail wear, and shrinks continuously at both distance limits. It does not fill the valley with close-up grass. Existing near grass and flower source files are byte-identical to V0.7.

Lower conifer stands use an irregular, elevation- and slope-conditioned timberline. Each original opaque crown has 54, 24 or 12 triangles depending on its static region, with randomized height, rotation and overlapping placement. This avoids runtime LOD switching while walking the short route. The forms are generic distant conifers supported by photo 02, **not exact mapped trees or a species inventory**. Individual crowns use existing cloud and terrain sunlight fields; they do not cast individual real-time shadows. No unverified huts, lakes or roads were invented.

Original embedded limestone fragments sit beyond the 88 m close-plant corridor and outside the full walking bounds with 15 m clearance. Distant cliff shading adds metre-scale recessed bedding and broad fractures while retaining the existing silhouettes, textures and light direction. Existing 4K diffuse / 2K height limestone assets were not enlarged.

## Visual iteration

- First pass: a better structured valley, but regularly spaced trees and smooth middle pasture.
- Second pass: overlapping, less uniform stands; more contour texture and embedded limestone. Tree cost was excessive.
- Third pass: a bounded inexpensive middle sward restores fine pasture silhouettes at the trailhead; close meadow remains intact.
- Packaged refinement: static lower-detail tree regions reduce submitted geometry; fracture bump strength reduced to avoid harsh tiny black marks; unnecessary close-range shader work removed.

Nine matched, unedited 1600×1000 captures are in before/ and after/: start, midpoint, viewpoint, valley-facing viewpoint, path close-up, cliff close-up, lower bend, upper meadow and ridge approach. All use identical metric positions, yaw, pitch and FOV in the two portable executables. Normal views use FOV 66° and eye height 1.72 m; inherited cliff close-up uses 38°. Capture frame averages include startup/pose transitions and are not benchmarks. See the separate performance.json measurements.

## Validation and cost

Tested the Windows portable executable at 1600×1000 on NVIDIA RTX 4070 Laptop GPU / ANGLE D3D11. Sequential V0.7 and V0.8 measurements use non-disjoint EXT_disjoint_timer_query_webgl2 samples. No frame-rate-derived GPU estimates.

| Eye-level pose | V0.7 GPU mean / p95 ms | V0.8 GPU mean / p95 ms | Triangles V0.7 / V0.8 (M) | Draw calls V0.7 / V0.8 |
|---|---:|---:|---:|---:|
| start | 6.81 / 7.77 | 9.71 / 10.72 | 10.81 / 13.35 | 163 / 302 |
| midpoint | 5.91 / 6.66 | 8.46 / 9.38 | 9.49 / 11.91 | 153 / 286 |
| viewpoint | 7.85 / 8.74 | 13.31 / 14.35 | 7.33 / 9.44 | 51 / 182 |
| valley | 6.53 / 7.41 | 10.68 / 13.91 | 7.62 / 9.24 | 54 / 159 |

Fixed tests discard the first second after settling at each pose. The V0.8 ridge viewpoint had 5 frames above 25 ms in 295 measured intervals (mean frame interval 13.56 ms); the other three fixed V0.8 views had none. This view is close to the 75 Hz GPU budget. These are short samples on this machine, not hardware-independent guarantees.

The eleven-second route camera sweep measured V0.7 7.84 ms GPU mean / 13.92 p95, versus V0.8 9.00 / 10.84 ms. V0.8 mean frame interval 13.33 ms, 0 frames over 25 ms, CPU render submission 1.74 ms. Peak sampled submission: 13,701,194 triangles / 304 calls. There is real run-to-run GPU-clock/system variability; the fixed-pose comparison is the clearer per-view cost comparison.

Full normal-speed W-key route completed in 190.37 seconds with automatic heading guidance, 0 blocked controller steps, maximum ground smoothing error 2.36 cm, and 2 focus resumes. Pointer capture, mouse look, Escape pause, arrival, QA reset and keyboard R reset passed. This was automated real-time input, not a human playtest. The first chained test launch failed to acquire pointer capture; the harness now explicitly brings the window forward before clicking Begin walk.

Exact comparisons passed for all three terrain meshes, all 421 route points, 65 collision volumes, fog, camera FOV, terrain files, original cliff geometry source, controller, sky and close-vegetation modules. Cosmetic limestone fragments are excluded from the entire walking rectangle plus 15 m clearance, checked independently. Scene images were inspected at the nine fixed poses and along the normal-speed walk; the middle pasture continues across the old grass cutoff without a hard ring. Remaining density changes from inherited close flower/clump LODs are still visible on close scrutiny.

Runtime additions: 243,816 conifer instances across the existing scenic extent, 4,509,228 total tree triangles before frustum culling, 18,530,016 instance-buffer bytes and 9,720 shared crown-geometry bytes. 2,264 limestone fragments × 20 triangles; 144,896 instance bytes. Middle-sward shared geometry 135,168 bytes plus 96,000 allocated tile-instance bytes and a 550,164-byte R32F height texture. Land-cover RGBA base 4,800,000 bytes, approximately 6.1 MiB including mipmaps. Active texture count increases from 25 to 27. All 53,084,616 existing asset-file bytes are unchanged; zero new third-party image/model bytes.

All nine camera pairs use the two portable builds; package parity and reference-photo exclusion are recorded in package-audit.json. Archive CRC/SHA-256 are in archive.json. The final package is release/Seceda-Windows-v0.8, alongside the preserved V0.7 build.

## Sources and licenses

All 53,084,616 bytes of existing asset files remain byte-identical to V0.7. No new external assets. New cover fields, conifer crowns, swards, rock fragments and shader changes are original project work; no application license has been assigned. Existing Poly Haven material/plant licenses remain CC0-1.0, with exact sources and notices in ASSETS.md and asset license JSON files. The terrain remains the South Tyrol DTM 2.5 m CC0 dataset, EPSG:25832, one world unit per metre, with existing 2.5/5/40 m layers. See TERRAIN.md.

## Remaining limitations

The woodland is an authored ecological approximation and repeated low-poly crowns are visible in the zoomed view. It has no per-tree cast shadows. The closest authored cliff benches remain too regular and smooth; a few thin silhouette/overlay seams are visible. Far geometry still reflects the 40 m terrain sampling. Some pasture color streaks and material repetition remain, and the start/midpoint change is subtler than the valley reveal. The scene is not photogrammetric or a reconstruction of exact forest boundaries. No valley traversal or map extension was added.
