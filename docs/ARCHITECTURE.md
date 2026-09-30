# V0.14 native regional terrain

`SurveyTiles` is a separate visual source; `Terrain` remains the unchanged walking authority. Tile metadata retains EPSG:25832 cores and sample spacing. The visual sampler protects the complete walking rectangle plus a transition buffer. Forty-two 5 m base grids remain available; native 2.5 m grids are requested locally when visible fine chunks need them and retired after they are no longer needed. There is no network dependency.

`tiled-terrain.js` divides the region into 1,672 cullable chunks. Offline native-vs-coarse height errors drive projected screen-error selection; nearby terrain is always native. A bounded construction queue replaces old geometry and disposes its buffers. Edges follow the **installed** neighbor level, including lateral scenic relief, so turns do not temporarily expose cracks while the queue catches up. Every neighboring segment is tested during and after changes. `regional-relief.js` adds small original fracture planes outside the protected walk and principal authored ridge. The V0.13 coarse interpolated overlay is retired.

The province's historical real-land-use polygons supply broad woodland/rock/scree/shrub regions. Offline 5 m terrain-derived slope, concavity, upslope debris and sun-horizon fields span the whole existing extent. Material variation, tree locations and fine fractures are art, not a new survey. The main cliff keeps its authored shadow bake; secondary terrain uses the new survey horizon. Close vegetation still follows the player through the existing plant/turf/sward system.

Adding adjacent terrain should retain this origin and EPSG frame, acquire native aligned cores, regenerate chunk errors and derived masks for the extended bounds, and then validate a separately defined walking area. The current field extents and vegetation/collision coverage are finite; dropping arbitrary tiles into the folder alone does not automatically open a new region.

Regional ground colour uses twelve georeferenced 4 km imagery cores, 2 m/texel with 48 m gutters, in the same projected frame. The 2048-square array shares two existing CC0 ground layers and twelve attributed CC BY 4.0 imagery layers without adding a fragment sampler. Explicit continuous texture derivatives avoid mip selection discontinuities at tile indices. Distance, slope and cover masks retain the close meadow and authored limestone. All imagery layers are currently resident (about 299 MiB with mips); geometry and near vegetation, rather than these modest regional images, follow the camera. Expanded coverage would need an imagery cache as well as new metadata/masks.

# V0.13 regional art

`meadow-habitat.js` derives plant density, thin cover, shelter and flower-colony fields from the native survey in the existing metre frame. `turf.js` uses the same dense roots at two curve-detail levels, overlapping the sparse middle cover; `ridge-meadow.js` retains moving 24 m cells across the connected pasture. Ground colour, short cover and accent plants share terrain-conditioned variation. CC0 maps are channel-packed without lowering colour or height resolution to stay within the terrain shader's sampler count.

`regional-rock.js` adds cullable scenic fracture surfaces outside the walking envelope, sharing world-coordinate fields and fading at survey-resolution joins. It does not modify the Terrain sampler or controller. The broader static sun-depth capture excludes artificial seam skirts and uses a larger receiver tolerance on coarse surroundings; the close ridge retains its prior tolerance. Source rasters, movement, walking polygon, props and original major-form generators remain unchanged. See REGION_V013.md for dimensions and limitations.

# V0.12 landscape and exploration foundation

`exploration.js` defines the current projected-coordinate pasture envelope. `player.js` retains the original movement integrator and raw DTM grounding, with expanded polygon bounds and extra steep-bank clearance in the new area. `terrain-stream.js` renders 417 cullable survey chunks with distance levels on gentle ground; `landform.js` supplies shared scenic rock relief. The original raster files and sampler are untouched. Scenic sculpture is excluded from the playable polygon plus 45 m.

`ridge-meadow.js` now generates deterministic 24 m cells around the moving camera and disposes old instance buffers. It no longer prepopulates only the route corridor. Turf and middle sward both use the full native survey footprint; nearby sun shadows follow the player. Terrain geometry buffers remain resident; this is vegetation streaming and render LOD, not disk/network terrain streaming. See `EXPLORATION_V012.md` for exact distances and playable/scenic boundaries. The sections below describe earlier milestones, not the current walking bounds.

# v0.5 ridge and meadow additions

`ridge.js`, `ridge-walls.js`, `ridge-benches.js` and `summit-fins.js` create original geometry in the existing UTM-relative metre frame. They decorate the non-walkable massif; they never replace the survey sampler or controller collision. `ridge-meadow.js` owns spatial tiles, near grass instances, short folded-leaf cover and original flowers; `botanical-material.js` supplies cutout shading, wind and distance taper. Only near tiles cast plant shadows. Shadow maps refresh when a tile changes detail level. The old meadow and cliff functions remain as historical source but are no longer invoked by `main.js`.

`landscape.js` now supplies slope, curvature, upslope exposure and aspect to terrain materials. `materials.js` uses CC0 pale rock alongside the retained v0.4 gravel. Geometry and materials are separate from `terrain.js` and `player.js`; route, coordinate origin, survey data, controls, light setup and sky are unchanged. See `RIDGE_V05.md` for measured cost and limitations.

# v0.4 material and local-detail additions

`near-meadow.js` contains three small folded-leaf clump meshes and twelve inspection pockets. `trail-details.js` adds shallow decorative stone chips. `materials.js` samples the CC0 scanned soil and blends large limestone texture offsets; the original generated gravel canvas is removed. `landscape.js` adds a survey-derived slope texture shared by terrain and cliff skin. The skin now stores survey coordinates as a material attribute; its position and index buffers remain identical to v0.3. Route, terrain, Walker and atmosphere are unchanged.

# v0.3 module additions

`meadow.js` owns deterministic botanical mesh generation, patch placement, wind and detail selection. `atmosphere.js` bakes a shared procedural cloud-density field into an HDR sky cube and terrain sunlight texture at startup. The main loop only samples those maps. `landscape.js` keeps trail and lighting maps in the existing metric frame; the DTM and Walker remain unchanged. See MEADOW_V03.md for current visual and performance limits.

# Scene architecture

Visual redesign v0.2.0 adds `landscape.js`: deterministic meadow variation, a route-distance texture for surface wear, and a static terrain solar-horizon texture. The trail is now blended into the terrain shader instead of drawn as an overlay ribbon. Survey sampling, collision and the route centreline are unchanged. Near shadows are cached for static props; no extra gameplay systems were added.

The scene is a single continuous 3D world, built from georeferenced source rasters with nested static levels of detail. The local origin keeps float coordinates small while the source manifest retains global UTM coordinates. The detailed walk is a single chunk, ready to be split along grid boundaries if streaming is added later.

- `terrain.js`: source sampling, projected coordinate origin, mesh rings and transition skirts, route curve.
- `materials.js`: terrain material blending, triplanar rock detail, world-aligned turf, natural-light sky.
- `details.js`: deterministic authored geometry and instance batches; source data is never overwritten by decoration.
- `player.js`: metre-based fixed-step walker, acceleration/deceleration, normalized diagonal input, terrain grounding, slope/drop rejection and obstacle sliding.
- `audio.js`: local Web Audio wind and footsteps; paused when the game pauses.
- `main.js`: rendering, input, scene setup, small HUD and arrival trigger.
- `desktop.cjs`: isolated renderer with no Node integration, no arbitrary external windows, desktop fullscreen toggle.

Movement uses 1/60 s substeps and caps individual updates, preventing one slow frame from tunnelling through a post. It is a grounded walker rather than a gravity/jump rigid body: slope checks stop at steep ground, and circles block rocks/posts. The play bounds are deliberately small (`x -45..320`, `z -130..245`); this boundary is a prototype restriction, not the future continuous-world design. Walkable cliff geometry is not supported yet.

The QA surface `window.__seceda` exposes the same controller used by live input and lets inspection scripts place cameras without changing game controls. Test camera placement is distinct from the complete simulated walking test. The shipped controls contain no teleport-to-viewpoint shortcut.

Future adjacent areas should carry EPSG:25832 tile metadata and use the same global-to-local conversion. A floating-origin coordinator can later rebase loaded tiles, actors and collisions together. Do not attach new areas to a mountain-selection UI.

# V0.6 additions

`turf.js` owns two camera-following instanced blade batches, a shared meadow palette, original micro-turf surface strokes, and a height texture sampled from unchanged survey-mesh vertices. Per-blade distance fades overlap; camera tiles select a generous view margin. `massif-light.js` makes a separate one-time directional depth capture of three terrain meshes and four V0.5 cliff meshes. It supplements the DTM horizon without resizing the live near-shadow camera. Texture coordinates still use the survey anchors, but depth comparisons use actual world positions. These modules change appearance only; they do not participate in walking collision. See DEPTH_V06.md.

## V0.7 visual revision

`alpine-plants.js` supplies original metric flower/leaf geometry. `ridge-meadow.js` places species in correlated banks through a 122 m wide route corridor, with 24 m visibility cells, near/mid meshes and distance fades. It combines original flowers with optimized CC0 dandelion leaves and sparse Grass Medium 01 accents. `turf.js` reduces near blade density from 400 to 240/m² while varying blade proportions, lighting, height and colour; fine cover continues outside flower banks. `landscape.js` shares irregular visual path margins with the ground and plants while retaining the route centreline and original collider-placement widths. Ground material derivatives are blended after evaluating separate rock and gravel heights; the aliased micro-turf bump was removed. Lighting intensity/fill changed, but solar direction, sky, fog, shadow resolutions, survey coordinates, controller and authored cliff geometry are preserved.

## V0.8 landscape distance treatment

`land-cover.js` derives a full-extent, metre-aligned cover field from the existing Terrain sampler and adds static, region-LOD conifer stands and pasture fragments. `pasture-sward.js` adds a bounded 70–285 m transition over the native 2.5 m walking terrain. `materials.js` blends these fields without changing DTM vertex positions or the route. Existing near turf, flower placement, trail masks and sky modules are unchanged. All additional detail is cosmetic and does not add collision volumes. Exact distance limits, visual comparisons and costs are in LANDSCAPE_V08.md.
