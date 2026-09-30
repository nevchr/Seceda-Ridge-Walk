# Seceda V0.14 — native regional terrain

V0.14 continues V0.13 `0de5039`. Verified foundation checkpoint: `7fa297f`. The biggest change is real source detail across the visible region, rather than another isolated cliff or a denser close meadow.

## What changed

The previous distant 40 m raster is replaced by 42 actual native 2.5 m survey tiles over the same 14 × 12 km extent. Secondary mountain crests, buttresses, gullies and valley slopes now have measured structure that was absent in V0.13. The original route, player collision, projected frame and main authored ridge profile are preserved.

Broad woodland, bare limestone, debris and shrub regions follow the province's CC0 1:10,000 land-use map. It is historical (2001-era imagery, 2005 release), not current tree mapping. Survey slope and concavity refine those boundaries; connected scree fans replace many scattered pale patches. Woodland instances and loose scenic stones are grounded on the new visual terrain. A full-region survey-derived light field replaces the sparse old horizon sampling outside the principal cliff bake.

Small original intersecting fractures and uneven projecting beds are integrated into steep scenic faces. The principal ridge/ledge keeps its V0.13 form and refinement. There are no new stacked cliff volumes. Existing CC0 ground ingredients add fine middle-distance texture. More substantially, licensed provincial Ortofoto 2023 imagery at 2 m per texel supplies georeferenced pasture tracks, soil variation and woodland ground texture beyond the close meadow. A restrained summer grade and broad distance blend connect it to the original plants. Near meadow density, flowers, props, trail and controls are retained.

## What is measured, and what is art

The elevation is the Autonomous Province of Bolzano / South Tyrol DTM 2.5 m, CC0. Native aligned WCS responses, georeferencing and checksums remain in the project. A local 0.5 m probe found no data; no finer mountain survey is claimed. Grid spacing is not a statement of uniform LiDAR accuracy. Coordinates remain EPSG:25832, origin E708700 / N5164300 / altitude 2500 m; one unit is one metre.

The broad land-cover polygons are mapped data. Regional ground colour uses **Ortofoto 2023 RGB, Provincia Autonoma di Bolzano / Alto Adige, with AgEA**, under **CC BY 4.0**. Source: https://data.civis.bz.it/it/dataset/ortofoto-2023 ; license: https://creativecommons.org/licenses/by/4.0/ . Modifications are resampling, quadrant assembly, JPEG encoding and runtime colour/exposure/mask blending. Steep rock and strongly pale pixels are masked; it is not used as a cliff photograph. Fine soil/scree transitions, material weathering, tree positions/species, cliff surface relief and all plants are authored interpretations. Generic CC0 material photographs remain licensed ingredients. None of the five private reference photographs is a texture, model, gallery image or package asset. Exact records: ASSETS.md, TERRAIN.md and assets/terrain-v14 manifests.

## Walking and detail coverage

The same 327.98 m ridge route and connected southeast pasture remain open. Leave the lower or middle trail toward the southeast. The 0.602 km² envelope contains roughly 0.578 km² of connected usable ground under the existing slope/obstacle rules. Northern cliff faces, western escarpment, high massif and outer region remain scenic. Native data coverage does not make every mountain walkable. The gallery includes an updated coverage diagram.

The terrain uses 1,672 chunks and 2.5 / 5 / 10 / 20 / 40 m render spacing selected by screen error against the native survey. Near terrain stays at 2.5 m. Native source files are loaded locally for fine visible chunks; old geometry is disposed. The close plant system continues to follow the player. Shared geometry edges are tested during detail changes. Adjoining areas can use the same projected tile format, but expanded masks, walking bounds and validation are still required.

## Iteration and limits

The gallery includes 26 matched V0.13 / V0.14 cameras: start, midpoint, viewpoint, cliff edge and three pasture sites in three directions, three wider regional angles and two inherited close views. Survey-only, material, relief, lighting and regional-colour studies remain available. Candidate5 and ground7 are preserved alongside the final portable.

This is substantially better regional terrain, not photogrammetric reconstruction. Generic rock scans do not reproduce every local formation, and repeated plant/tree shapes remain apparent. The aerial ground retains some baked illumination and tiny flat traces of roads/buildings; it does not create traversable valley infrastructure or reconstructed buildings. Fine rock can still look striated, and heightfields cannot describe all overhangs. The protected main-cliff forms remain an interpretation. Static summer clouds, bounded exploration and unbuilt valley routes are unchanged. Performance on other machines is unverified.

Validation, actual performance conditions and remaining test limitations are recorded separately in VALIDATION_V014.md. The previous builds and galleries are preserved.
