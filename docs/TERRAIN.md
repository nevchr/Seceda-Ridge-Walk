# Terrain provenance and scale

Source: Autonomous Province of Bolzano — South Tyrol, **Modello Digitale del Terreno (DTM 2,5m)**.

- Catalog: https://data.civis.bz.it/it/dataset/modello-digitale-del-terreno-dtm-25m
- Catalog license: Creative Commons CCZero (CC0).
- WCS: https://geoservices9.civis.bz.it/geoserver/ows
- Coverage identifier: `p_bz-Elevation:DigitalTerrainModel-2.5m`
- Native CRS reported by DescribeCoverage: **EPSG:25832**, ETRS89 / UTM zone 32N.
- Native spacing: **2.5 m**. The service labels heights metres above sea level. No additional vertical-datum conversion was performed or claimed.
- Retrieved for this prototype on 2026-09-27; precise request times, URLs, ranges and raster metadata are in `assets/terrain/manifest.json` and `downloads.json`.
- Catalog release metadata is not a guarantee of LiDAR acquisition date. Acquisition vintage and survey accuracy were not independently validated.

## Local frame

World origin: **E 708700 m, N 5164300 m, elevation 2500 m**.

```text
world.x = easting - 708700
world.y = elevation - 2500
world.z = 5164300 - northing
```

X points east, Y up, Z south. One unit is one metre, without vertical exaggeration. The approximate WGS84 area is 46.60 N, 11.725 E. Original rasters and manifests preserve projected coordinates for future adjacent tiles. Use the projected frame for adjoining terrain, not independently rounded latitude/longitude offsets.

| Region | Projected extent E min, N min, E max, N max (m) | Requested sample spacing | Raster |
|---|---|---|---|
| Walk / Seceda | 708000, 5163700, 709800, 5165000 | 2.5 m | 720 × 520 |
| Odle surroundings | 708000, 5163000, 714000, 5168000 | 5 m | 1200 × 1000 |
| Scenic context | 702000, 5160000, 716000, 5172000 | 40 m | 350 × 300 |

Requests use WCS 1.0.0 GetCoverage with GeoTIFF output and bilinear interpolation. The original service response is retained. Raster pixels are interpreted at cell centres; runtime sampling is bilinear. Render grid boundaries use common metric coordinates, with skirts to close transitions. The source contains no missing or implausible samples within the retained bounds. An earlier, larger download crossed missing coverage and was replaced before use.

Start: local (15, 165), approx. 2456.56 m above sea level. End: local (150, -120), approx. 2516.57 m. Eye height is 1.72 m. The final curved trail measures approximately 327.98 m in 3D. Its shape is authored on the real meadow; it is not a surveyed trail alignment.

## Heightfield limits

The DTM supplies the real skyline and broad slopes. It cannot encode overhangs or multiple elevations at a single XY position. Independent 3D surfaces add protruding layered faces on the surveyed northern slopes east of the walk; these are artistic detail and are not traversable. Native heightfield collision governs the meadow. Authored outcrops on the walk have conservative circular collision; cliff approach checks prevent walking onto hazardous slopes.

The original route and connected southeast pasture inside the documented 0.602 km² envelope are walkable; local steep ground is excluded. Terrain beyond that envelope is scenic context. No selection screen or transition is present. Extending exploration later requires additional verified collision coverage and, beyond the retained rasters, adjoining source tiles while keeping this projected frame. V0.12 introduced player-following vegetation and terrain distance levels; this is in-memory detail management, not disk or network terrain streaming.


## V0.14 native regional replacement

The V0.14 visual terrain replaces the old 40 m scenic raster with 42 actual 2 × 2 km native 2.5 m cores over the same 14 × 12 km extent. The 2026-09-29 WCS requests use nearest-neighbor sampling aligned to native grid nodes, with a five-metre halo. Each 805 × 805 response, georeference, URL, valid-sample range and SHA-256 is retained in assets/terrain-v14/source and manifest.json. There are no missing values in these tiles. This is additional source elevation, not procedural upsampling of the old far raster.

The official 0.5 m dataset is settlement-area coverage; a Seceda probe returned only NoData. No finer mountain survey is claimed. A 2.5 m grid is not a claim of uniform LiDAR point density or 2.5 m positional/vertical accuracy. See the provincial elevation technical page linked in the manifest.

The original collision sampler and files stay unchanged. The new visual survey matches that sampler throughout the walkable area and its surrounding buffer, blending to the native regional nodes outside it. Native tile edges agree exactly in 56,871 checked samples; every decimated level retains original source-node values. Detail meshes use 2.5 / 5 / 10 / 20 / 40 m spacing selected by projected deviation from the native survey. Shared installed edges are interpolated in 3D; small lateral rock relief is included in this stitching. Local source files are loaded on demand for fine visible terrain and eventually evicted. No runtime network access.

The principal authored ridge/ledge generators and refinement remain intact. Small scenic face-plane and intersecting-joint displacement elsewhere is original art over the new survey, with the walking area and principal ridge pinned. It is not extra measured elevation. The terrain-derived 5 m slope, concavity and upslope-rock maps guide surface transitions; the corresponding constant-sun horizon gives regional terrain shadows. Those fields are derived art/lighting aids, not surveyed geology, soil or vegetation.

Broad land cover now uses the province's CC0 real-land-use map 1:10,000: 1,678 polygons intersect the existing region, downloaded in EPSG:25832. The map describes 2001-era aerial interpretation (2005 release), not current vegetation. Woodland, bare rock, unvegetated debris and shrub/wooded-pasture classes are rasterized at 5 m with softened edges. Tree species, individual positions, density, colour and all fine surface variation remain authored. See assets/terrain-v14/fields.json and docs/ASSETS.md. Original responses stay in the project; unused source TIFFs need not be duplicated into the playable package.
