# Asset sources

## V0.13 regional landscape

- **Grass 005**, ambientCG / Lennart Demes: https://ambientcg.com/view?id=Grass005 â€” CC0-1.0, https://docs.ambientcg.com/license/. Unmodified 2048Â² colour, OpenGL normal, ambient-occlusion and roughness JPEG maps retained under `assets/materials/v13/`. Fine turf footprint is an authored 1.4 m choice; the asset page does not specify a physical size. Colour, normal and AO are sampled in V0.13; roughness is retained with the source set, while dense live grass remains matte. This is a generic procedural/bitmap grass material, not Seceda photography.
- **Grass Ground**, Charlotte Baglioni / Poly Haven: https://polyhaven.com/a/grass_ground â€” CC0-1.0, https://polyhaven.com/license. Unmodified 2048Â² diffuse JPEG, sampled at the documented 25.1 m footprint for broad ground variation. Source API metadata and file manifest are retained alongside it.
- Exact download URLs and SHA-256 values are in `assets/materials/v13/sources.json`. All runtime files are local. Inspected but rejected Leafy Grass (fallen leaves unsuitable here) and Grass Path 2/3 (gravel-dominant) remain outside game assets and packages.
- `grass005-NA.png` packs the decoded 2048Â² normal X/Y, AO and roughness channels without resampling. `gravelly_sand-HR.png` retains the 2048Â² height and bilinearly upsamples the existing 1024Â² roughness into its second channel. This fits the terrain shader's fragment-sampler limit; it does not reduce colour or height resolution. Script and exact derivative hashes: `scripts/pack-meadow-materials.py`, `assets/materials/v13/packing.json`. Roughness is packed for completeness; the fine turf currently uses a matte constant. Original maps are retained.
- New habitat rules and mesh alterations are original project work. The private photographs remain visual references only. No application license is assigned.
- Regional face tiles, continuous curved turf, flower-head/leaf changes and irregular conifer branch geometry are original project work. Scenic relief is generated from shared fields over the existing survey, not from private-photo pixels. Static shadow textures are scene renders, not external assets. The earlier assets remain on disk unchanged, including ones no longer sampled.

## Elevation

Autonomous Province of Bolzano / South Tyrol, DTM 2.5 m; CC0. https://data.civis.bz.it/it/dataset/modello-digitale-del-terreno-dtm-25m

## Licensed material ingredients

Poly Haven assets are CC0, including commercial modification and redistribution: https://polyhaven.com/license

- **Aerial Grass Rock**, Rob Tuytel: https://polyhaven.com/a/aerial_grass_rock â€” 2K JPEG diffuse and displacement. Legacy meadow ingredient retained unchanged; no longer sampled by V0.13. It is not an aerial photograph of Seceda. Source footprint is 15 m; earlier milestone sampling is documented below.
- **Rock Face**, Dario Barresi (processing), Greg Zaal (photography): https://polyhaven.com/a/rock_face â€” legacy v0.4 2K JPEG diffuse and displacement retained locally, no longer sampled by v0.5.

- **Marble Cliff 05**, Amal Kumar: https://polyhaven.com/a/marble_cliff_05 â€” CC0. 4096Â² JPEG diffuse (11,379,735 bytes) and 2048Â² PNG displacement (5,532,576 bytes). Source footprint 20.002 m; 20 m primary and 80 m macro sampling. This marble scan is an art-directed pale-rock ingredient, not surveyed Dolomite rock. Original download files unchanged. See `assets/materials/marble_cliff_05-license.json`.

- **Grass Medium 01**, Rico Cilliers (modeling), Rob Tuytel (photography): https://polyhaven.com/a/grass_medium_01 â€” CC0. Four source clumps (833 / 653 / 310 / 79 triangles) used near the camera. The glTF/binary and four 1024Â² JPEG maps total 3,512,636 bytes. Diffuse, alpha, normal and packed AO/roughness/metal are local. Original folded-leaf geometry supplies the shorter cover. Runtime scaling, shading, cutout and wind are authored; glTF image URIs adapted to local files. See `assets/models/grass_medium_01/grass_medium_01-license.json`.

- **Gravelly Sand**, Dario Barresi: https://polyhaven.com/a/gravelly_sand â€” CC0. 2048Â² JPEG diffuse and height; 1024Â² JPEG roughness. Source metadata footprint is 2.48 m (website rounded to 2.5 m); runtime repeats at 2.48 m. Diffuse is partially desaturated toward neutral limestone dust in the shader. Height is subtle bump only, never terrain displacement. File URLs, verified upstream MD5 and SHA-256 values are in `assets/materials/gravelly_sand-license.json`; raw API metadata is retained beside it.

Exact download URLs, byte sizes and upstream MD5 values are retained in `assets/materials/*-source.json`. Runtime textures are local; the game never contacts Poly Haven. The downloaded grass displacement remains available for future material work but is not currently sampled by the renderer.

## Authored locally

Original flower, boulder, cliff, trail, rope/post and marker geometry; terrain-shaped surface zones and wear masks; grass placement/LOD and folded-leaf short cover; cloud/sky shader; generated wind and gravel steps. Near-camera grass models and their atlas have the CC0 source above. No image-generation output or reference-photo backdrop is used. Fonts use the Windows Segoe UI and Georgia system installations, not redistributed font files.

## Reference only

- Seceda cableways hiking descriptions: https://www.seceda.it/en/hiking
- Seceda ridge reference photography reviewed via search, including https://www.earthtrekkers.com/seceda-dolomites/ and https://www.starealpasso.it/seceda/

Reference-site and user-supplied photographs are restricted to the ignored `artifacts/references/` folder. The five user images in its `user/` subfolder are visual direction only. No reference photographs are game textures or distributed with the portable builds. Only the explicitly licensed material ingredients above are shipped.

## Software

Three.js (MIT) and Electron (MIT plus Chromium/other components) retain their upstream licenses. The portable package includes Electron's LICENSE and LICENSES.chromium.html, and Three.js's LICENSE. Conversion tools geotiff and proj4 are development dependencies only. No application license has been assigned.

## V0.6 original resources

The fine short-turf geometry and 1024-square leaf-stroke texture are original project work generated at startup. They contain no photo pixels. Larger Grass Medium 01 models remain CC0 accent plants. The new 2048-square static sun-depth map is rendered from the unchanged surveyed terrain and authored V0.5 cliffs. No external assets were added or resized; all existing asset bytes match V0.5. See DEPTH_V06.md and artifacts/depth-v06/assets.json for runtime dimensions and allocation sizes.

## V0.7 additions and changes

- **Dandelion 01**, Rico Cilliers (modeling), Rob Tuytel (photography), Poly Haven: https://polyhaven.com/a/dandelion_01 â€” **CC0-1.0**, https://polyhaven.com/license. Four original 1024-square JPEG maps (diffuse, normal, packed AO/roughness/metal, alpha). Original glTF and binary retained. Three leaf rosettes reduced with Three.js SimplifyModifier to 543, 411 and 355 triangles; the derivative glTF/binary totals about 57 KB. The yellow flower atlas region is also used on original curved flower heads. It is a licensed asset photograph, unrelated to the user's reference photographs. Exact URLs, upstream MD5 checks and local SHA-256 hashes are in `assets/models/dandelion_01/license.json`; reduction details are in `optimization.json`.
- **Original V0.7 work:** branched yellow composite flowers, pink clover, white daisies and violet bells; folded leaf geometry, placement fields, modified short turf, path erosion boundaries, limestone bedding/weathering shaders. These are visual studies, not a botanically surveyed Seceda flora inventory. No new application/source license has been selected.
- Existing Marble Cliff 05 and Gravelly Sand texture dimensions are unchanged. Grass Rock diffuse sampling is now 4 m near the player, fading toward a broader distant meadow palette. Grass Medium 01 uses two near variants as sparse taller accents. The four new maps add roughly 21.3 MiB of GPU texture allocation including mipmaps; all new source/derivative asset files total **3,436,864 bytes**.
- No user photo pixels were used in an atlas, texture, model, sky or package. Source photographs remain only in the ignored reference folder. Runtime remains offline. Full file inventory and original geometry triangle counts: `artifacts/alpine-v07/assets.json`.

## V0.8 original landscape work

No new external assets. All existing V0.7 asset files are byte-identical. `land-cover.js` generates a 1200Ã—1000 RGBA terrain-conditioned field (4,800,000 base bytes, approximately 6.1 MiB with mipmaps), original opaque 54/24/12-triangle conifer crowns and 20-triangle embedded limestone fragments. `pasture-sward.js` generates a 361Ã—381 R32F height field (550,164 bytes) and a 1024-triangle optical sward tile (4 representatives/mÂ², 70â€“285 m blend range). These contain no reference-photo pixels. Forest and scree distribution are authored interpretations, not measured data. No application license is assigned. See LANDSCAPE_V08.md and the runtime inventory in artifacts/landscape-v08/preservation.json.


## V0.9 rock and landmark pass

See [STONE_V09.md](STONE_V09.md) for the new original survey-fitted fracture geometry, original gravel and landmark models, and the three CC0 Poly Haven materials: Marble Cliff 04 and Marble Rock 01 (Amal Kumar), Weathered Planks (Dario Barresi and Dimitrios Savva). Sources, checksums and original resolutions are recorded in `assets/materials/v09/*-source.json`. Lossless channel packing is documented in `packed-channels.json`; no source-photo pixels are used. The existing Gravelly Sand path material remains unchanged. The new normal/roughness/height material files are specifically licensed CC0; this does not assign a new license to original project code or models.


## V0.14 regional terrain and land cover

- **South Tyrol DTM 2.5 m**, Autonomous Province of Bolzano / South Tyrol, **CC0-1.0**. Catalog: https://data.civis.bz.it/it/dataset/modello-digitale-del-terreno-dtm-25m ; technical description: https://natura-territorio.provincia.bz.it/it/modelli-digitali-di-elevazione . Forty-two native aligned tiles acquired 2026-09-29. Exact requests, GeoTIFF georeferencing and checksums: assets/terrain-v14/manifest.json and source/*.json. Existing terrain assets are unchanged.
- **Carta dell'uso del suolo 1:10.000**, same provincial publisher, **CC0-1.0**. Catalog: https://data.civis.bz.it/it/dataset/carta-delluso-del-suolo-1-10-000 . WFS layer p_bz-LandUse:RealLandUseMap-Polygons at https://geoservices1.civis.bz.it/geoserver/p_bz-LandUse/ows . Native EPSG:25832 response source/landuse.geojson contains 1,678 polygons over the same extent. Historical 2001 imagery / 2005 map release; it is not a current forest survey. The catalog license record, schema and request are retained in artifacts/terrain-v014/source-research and assets/terrain-v14/source/landuse-license.json.
- Three 2800 × 2400 RGBA8 maps (5 m/texel, 26,880,000 base bytes each): terrain geometry-derived slope/concavity/rock-source/aspect; mapped land-cover weights; survey-derived solar visibility. Approximately 102.5 MiB together on the GPU including mipmaps. Their mathematical derivation and hashes are in scripts/build-regional-fields.py and fields.json. No additional photograph or scanned texture is added.
- Original regional relief, screen-error terrain selection, tile stitching, slope-conditioned material rules and tree distribution are project work. Existing CC0 material textures and software licenses remain unchanged. No application/source license is newly assigned. All five private reference photographs remain excluded from Git and runtime packages.

- Final V0.14 middle-distance ground reuses **Aerial Grass Rock** (Poly Haven / Rob Tuytel, CC0) at its 15 m footprint. It is sampled only by the distance-blended pasture treatment; the close meadow keeps its V0.13 ingredient. Original JPEGs are unchanged. At startup the two 2048² RGBA layers (Grass Ground, Aerial Grass Rock) are placed in one sRGB texture array, with row orientation preserved, repeat wrapping and mipmaps. Base GPU storage is 32 MiB, about 42.7 MiB including mipmaps, replacing the prior 21.3 MiB single-layer allocation. The texture array keeps the fragment sampler count unchanged. No pixels from private reference photos are used. The visible improvement from this secondary material adjustment is modest compared with the native survey replacement.

## V0.14 regional aerial ground colour

**Ortofoto 2023 RGB — Provincia Autonoma di Bolzano / Alto Adige, produced in collaboration with AgEA.** Source: https://data.civis.bz.it/it/dataset/ortofoto-2023 . Image-use license: **Creative Commons Attribution 4.0**, https://creativecommons.org/licenses/by/4.0/ . The catalog's general metadata label says CC0, but both its explicit description and access-constraints field require CC BY 4.0 for the imagery; that more specific image license is applied here. No endorsement is implied.

The provincial 20 cm orthophoto is requested at **2 m per texel**, EPSG:25832. Twelve 2048-square RGB tiles have 4 km cores and 48 m gutters; the outer column extends beyond the survey but is only sampled on existing terrain. The original 48 smaller WMS responses, exact geographic bounds, URLs and hashes remain in assets/terrain-v14/orthophoto. Four response quadrants are assembled and JPEG-encoded per runtime tile. Runtime changes: softened exposure, summer colour grading, distance blending, slope/cover masking and exclusion of strongly pale pixels. Close meadow and modeled cliff materials are retained. Imagery includes its original lighting; it is not a reconstructed albedo map or a current survey of individual trees/buildings. Catalog creation date: 2023-09-15.

This public licensed imagery is distinct from the five private reference photographs, which remain excluded. Ground textures share one 2048-square 14-layer sRGB array (two existing CC0 material layers plus twelve georeferenced layers), about 298.7 MiB including mipmaps. No new fragment sampler is needed. Normal terrain geometry still follows the real DTM rather than the photo surface.

## V0.15 regional surface reconstruction

V0.14 source assets, original imagery and native elevation tiles are retained unchanged. `assets/terrain-v15/` contains twelve **2048 × 2048 RGB** derivatives at **2 m/texel**, EPSG:25832, 4 km cores and 48 m gutters. Source: **Ortofoto 2023 RGB, Provincia Autonoma di Bolzano / Alto Adige, with AgEA**, https://data.civis.bz.it/it/dataset/ortofoto-2023 , **CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/ . The derivatives retain this attribution. No endorsement is implied.

Modifications: median filtering, local brightness normalisation, extraction of chromatic geographic pasture variation, an authored summer reflectance palette and naturalisation of historical artificial footprints from the CC0 provincial land-use map. These are interpreted material colours, **not calibrated albedo** or a current building classification. World-space material textures and common scene light are applied separately. Roads/buildings are not reconstructed as 3D assets; some unclassified traces may remain. File sizes, bounds, hashes and source hashes: `assets/terrain-v15/surface-albedo.json`. Reproducible derivation: `scripts/build-surface-albedo.py`.

The runtime 2048² × 14 sRGB array keeps its two existing CC0 ground ingredients and replaces the twelve aerial layers with these derivatives. Allocation remains about 298.7 MiB with mipmaps. Existing CC0 cliff, fine stone, gravel and grass maps retain their dimensions and licenses. No private reference-photo pixels are included.

Original V0.15 work: three chipped limestone variants, terrain-conditioned debris clusters, low uneven middle-sward crowns, material relief and colonisation rules. Positions follow mapped debris, slope and concavity but are not measured individual stones. No elevation or collision data is changed. No new application/source license is assigned. The final asset inventory and scene report record generated geometry and shipped sizes.


V0.15 also includes original prostrate evergreen spray geometry in the mapped historical dwarf-shrub/wooded-pasture classes, fuller existing conifer crowns, and shallow fractured outcrops fitted to the survey on exposed shoulders. Species, individual plants and rocks are authored. The visual middle-sward height apron is 941 × 765 R32F nodes at 2.5 m spacing (2,879,460 bytes), sampled from the preserved collision surface within walking bounds and existing regional survey outside. The camera-following sward blends over 60–110 m and 310–440 m; it does not add playable ground. Final geographic colour combines chromatic ratios with compressed-illumination natural RGB, suppresses blue cast shade and naturalises narrow bright linear marks as well as historical artificial polygons. This is not calibrated inverse rendering.
