# Seceda — A ridge walk

**Regional surface pass v0.15.0.** Corrected geographic ground colour, broader meadow detail, fuller mapped woodland, low shrubs, and survey-fitted limestone/debris connect the landscape beyond the close meadow. Native surveyed peaks, the ridge profile, route, controls and walking bounds are preserved. See `artifacts/surface-v015/index.html` and `docs/SURFACE_V015.md`. Earlier builds and galleries remain on the development machine; historical artifacts are not included in this source snapshot.

A small, offline Windows exploration prototype. Walk through a summer meadow to the Seceda ridge and look east toward the Odle. One continuous scene, approximately 328 m / 3 minutes of walking, with free look and a bounded area of off-trail exploration.

## Run this source checkout

This repository publishes the v0.15.0 application source separately from its licensed runtime assets. The GitHub release contains **assets**, not an installer or a prebuilt application. Original local Git history, private reference photos, raw regional GeoTIFF inputs and historical screenshots stay on the development machine.

Prerequisites: Windows x64, Node.js 22 or newer, pnpm 11.19.0, and a WebGL2-capable GPU. Initial dependency and asset setup needs internet access and approximately 1 GB of free space for the archive and extracted assets, plus dependencies. Once prepared, the app runs offline. Other OS/hardware configurations are not verified.

```powershell
git clone https://github.com/nevchr/Seceda-Ridge-Walk.git
cd Seceda-Ridge-Walk
pnpm install --frozen-lockfile
pnpm assets:fetch
pnpm assets:check
pnpm test
pnpm start
```

For a browser preview, run `pnpm dev` and open http://127.0.0.1:4173. On Windows, `pnpm package` creates `release/Seceda-Windows-v0.15/`; packaging is a local operation and does not publish a binary. Keep that whole folder together. There is no separate bundler build step: the app uses ES modules directly.

### Runtime asset version

`runtime-assets.json` pins runtime-v0.15.0, the public download URL, archive size/SHA-256 and every extracted file hash. The 404,599,305-byte archive has SHA-256 `cb934225a71c530063509d31b5c318e10c0132f5c7832c3e6ddaa39c367f3699`. Assets install into their original `assets/` paths. The downloader verifies all bytes, rejects unexpected/traversal paths, and refuses to replace different existing files. `pnpm assets:check` rehashes the full asset set. A partial setup gives a direct `pnpm assets:fetch` instruction.

For offline installation, obtain the same release archive and run `node scripts/fetch-runtime-assets.mjs --from-file=C:\path\to\seceda-runtime-v0.15.0.zip`. Quote the entire argument if the path contains spaces. Read [ASSET-LICENSES.md](ASSET-LICENSES.md) and [docs/ASSETS.md](docs/ASSETS.md) for provenance and credit. Application source licensing is still unspecified.

`pnpm test` checks every runtime hash, downloader integrity/preservation cases and production terrain/controller invariants. Historical visual and traversal scripts remain for reference; some expect retained local artifacts or machine-specific Playwright paths and are not portable fresh-checkout commands. Fresh publication verification is described below; performance figures in older milestone documents are historical, not new measurements.

## Existing local Windows builds

Double-click **Launch Seceda.cmd**, or **release/Seceda-Windows-v0.15/Seceda.exe**. Keep the entire Seceda-Windows-v0.15 folder together. For sharing, extract **release/Seceda-Windows-v0.15.zip** first. No Node installation, terminal, account, or internet connection is required for that portable build. The build is unsigned.

Click **Begin walk** to capture the mouse.

- **W A S D** — walk; **mouse** — look freely.
- **Shift** — brisk walk.
- **Esc** — pause and release the mouse; click Continue walk to resume.
- **R** — return to the trailhead.
- **H** — hide/show the interface.
- **F11** — fullscreen in the desktop build.
- Arrow up/down walk and arrow left/right turn as a keyboard alternative.

Follow the pale trail to the timber marker, then look east. Reaching the viewpoint leaves you in control. The pause panel offers sensitivity, sound, optional gentle head motion, and Balanced detail. Head motion defaults off. Leave the lower or middle trail toward the southeast to explore the open pasture. Steep slopes and the prototype boundary stop movement; there is no jumping or fall/death system.

## What is real

The broad landscape and peak elevations come from the Autonomous Province of Bolzano / South Tyrol **DTM 2.5 m**, under CC0. World units are metres; horizontal and vertical scale are 1:1. The terrain has not been replaced with a hand-drawn mountain silhouette.

The original walk collision is preserved at 2.5 m. The visual region now uses newly acquired native 2.5 m tiles, with coarser geometry selected only where its screen error is small. These are view/detail regions of the same terrain, not selectable mountains. See **docs/TERRAIN.md** and the retained GeoTIFFs and exact request metadata in **assets/terrain**.

## What is authored

The route placement, surface materials, exposed strata, protruding cliff-face meshes, loose rocks, grass, flowers, timber markers, rope posts, sunlight, clouds, haze, and synthesized audio are art direction. This is not a survey of the actual trail or a geological reconstruction. Poly Haven's CC0 surface textures are used as material ingredients, desaturated/tinted and scaled for this scene. No reference photograph is used as scenery, a skybox, or a billboard.

## Validation and limitations

Validation for the current milestone is recorded in **docs/VALIDATION_V015.md** and **artifacts/surface-v015**. The repeatable walk harness uses real W-key input at normal speed in the portable executable, with automated steering. It does not teleport or accelerate the controller during that traversal. Earlier milestone evidence remains in its original folders.

This is a playable visual study, not a finished photorealistic environment. Close vegetation remains procedural, some inherited grassy cliff shelves remain too regular, and generic rock texture ingredients do not reproduce every local formation. Texture repetition is reduced but not eliminated. The trail is authored surface wear blended into the unchanged terrain, without surveyed construction detail. Clouds and sun are static. Broad forest and scree areas follow a historical provincial land-use map; individual trees, plants and surface details remain authored. Buildings are not reconstructed. Walking includes the original ridge and a connected 0.60 km² pasture envelope, with local steep areas excluded. Detailed plants follow the player and terrain rendering uses distance levels; network terrain streaming, valley traversal, saves, controller support and settings persistence remain absent. Audio was exercised but not critically assessed by listening. Performance on other Windows hardware is unverified.

## Development

Stack: Three.js / WebGL2 with an Electron Windows desktop shell. ES modules, no backend and no runtime network requests. Node 22+ and pnpm are sufficient after the runtime assets above have been downloaded. Legacy local commands:

```text
pnpm install
node node_modules/electron/install.js
pnpm start
pnpm dev
pnpm test
pnpm package
```

`pnpm dev` serves the scene on http://127.0.0.1:4173. The portable release includes its own runtime. Browser and desktop visual-check scripts use Playwright from the development machine's bundled runtime; their path must be configured on another machine.

## Layout

```text
src/                 renderer, materials, terrain, details, walker, audio
assets/terrain/      original GeoTIFFs, Float32 height rasters, CRS metadata
assets/materials/    CC0 textures and source download manifests
docs/                provenance, architecture, validation
scripts/             download/conversion, local server, checks, packaging
artifacts/           actual runtime screenshots and test evidence
release/             self-contained Windows portable build
```

Application source licensing has not been selected. Third-party license notices are retained with their dependencies and documented in docs/ASSETS.md.

Regional ground colour uses **Ortofoto 2023 RGB, Provincia Autonoma di Bolzano / Alto Adige (with AgEA)**, licensed **CC BY 4.0**: https://data.civis.bz.it/it/dataset/ortofoto-2023 and https://creativecommons.org/licenses/by/4.0/ . Resampled to 2 m, assembled into georeferenced tiles, colour/exposure adjusted and blended on distant ground. Attribution, modifications and exact requests are retained in docs/ASSETS.md and assets/terrain-v14/orthophoto/license-and-manifest.json. This is public licensed aerial imagery; the user's private reference photos are not distributed.
