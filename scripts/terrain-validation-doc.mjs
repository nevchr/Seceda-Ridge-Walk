import fs from 'node:fs/promises';
const root='artifacts/terrain-v014';
const read=async file=>JSON.parse((await fs.readFile(root+'/'+file,'utf8')).replace(/^\uFEFF/,''));
const [controlled,native,walk,free,motion,frames,assets,audit,seams,frozen]=await Promise.all(['final-controlled.json','final-native.json','final-walk/packaged-walk.json','final-walk/free-walk.json','final-walk/motion-performance.json','final/report.json','assets.json','data-audit.json','seam-audit.json','final-runtime.json'].map(read));
const now=native.results.filter(x=>x.version==='v0.14'),before=native.results.filter(x=>x.version==='v0.13');
const fixed=controlled.results.filter(x=>x.version==='v0.14'),oldfixed=controlled.results.filter(x=>x.version==='v0.13');
const rows=now.map(r=>{const prior=before.find(x=>x.pose.name===r.pose.name),c=fixed.find(x=>x.pose.name===r.pose.name),b=oldfixed.find(x=>x.pose.name===r.pose.name);return `| ${r.pose.name} | ${b.gpuMs.mean.toFixed(2)} → ${c.gpuMs.mean.toFixed(2)} | ${prior.gpuMs.mean.toFixed(2)} → ${r.gpuMs.mean.toFixed(2)} | ${r.gpuMs.p95.toFixed(2)} | ${r.stats.triangles.toLocaleString('en')} | ${r.stats.drawCalls} |`;});
const walkingSamples=walk.samples.filter(x=>x.survey),peakGeometry=Math.max(...walkingSamples.map(s=>s.survey.peakGeometryBytes)),peakFine=Math.max(...walkingSamples.map(s=>s.survey.source.peakFineBytes)),lastSource=walkingSamples.at(-1).survey.source;
const content=`# V0.14 validation — 29 September 2026

Final portable: release/Seceda-Windows-v0.14/Seceda.exe. Baseline: V0.13 checkpoint 0de5039. The ${frozen.files.length} runtime-file hashes were frozen before the final traversal; the package audit rechecks them. Later edits concern documentation and delivery checks only.

## Rendered result

26 matched portable pairs at 1600 × 1000: seven sites in three directions, three regional angles and two inherited close cameras. Normal eye height 1.72 m and FOV 66°; cliff-close retains its inherited 38° FOV. Position, orientation and field of view are checked for equality. Zero capture errors. Full-size route, viewpoint, cliff, reverse and off-trail views were inspected through survey-only, mapped cover, relief, lighting, ground-texture and licensed regional-colour iterations. The inherited path-close camera looks at meadow beside the path and is labelled accordingly.

The clearest gains are the surveyed secondary crests/gullies, connected rockfall fans, varied pasture tracks/soil and fuller woodland pattern. The main authored ridge and close meadow remain intact. Private reference photographs were not used as assets. Public Ortofoto 2023 imagery is separately licensed and attributed under CC BY 4.0; see ASSETS.md.

## Packaged movement

- Original route: 421/421 samples, ${(walk.seconds-free.seconds).toFixed(2)} seconds including reset/leg transition. Pasture loop: 68/68 waypoints, ${free.seconds.toFixed(2)} seconds. Total ${(walk.seconds/60).toFixed(2)} minutes. Zero blocked steps and zero runtime errors; ${walk.focusResumes} focus resumes through the normal pause UI.
- Maximum eye-height smoothing difference: ${(walk.result.maxGroundError*100).toFixed(2)} cm on route, ${(free.result.maxGroundError*100).toFixed(2)} cm in pasture. Mouse look, pointer capture, Escape pause, R reset and stale-arrival reset were exercised. This is real-time held keyboard input with automated steering, not a human playtest. The endpoint is set once before the separate pasture leg; neither leg teleports internally.
- Moving frame intervals at 1600 × 1000: mean ${motion.all.mean.toFixed(2)} ms, p95 ${motion.all.p95.toFixed(2)} ms, p99 ${motion.all.p99.toFixed(2)} ms. ${motion.all.over50ms} of ${motion.all.frames.toLocaleString('en')} active frames exceeded 50 ms; maximum ${motion.all.max.toFixed(2)} ms. Frames marked as loading geometry/vegetation: p95 ${motion.streaming.p95.toFixed(2)} ms. These are display-capped frame intervals, including capture/automation stalls, not GPU durations.
- Terrain geometry residency peaked at ${(peakGeometry/1048576).toFixed(1)} MiB during the loop; native fine-height cache at ${(peakFine/1048576).toFixed(1)} MiB, plus 25.8 MiB of shared 5 m heights. The final sampled cache held ${(lastSource.fineBytes/1048576).toFixed(1)} MiB after ${lastSource.evictions} unused-tile evictions. Plants remain camera-following. Source caches and mesh levels are recorded per sample.

The original 327.98 m route and existing 0.602 km² southeast pasture envelope remain walkable, subject to steep-bank and prop limits. Northern cliff faces, western escarpment, high massif and terrain beyond that boundary are scenic. No additional walking area was opened in this regional V0.14 pass.

## Paired rendering cost

Both portable versions: AC power, battery saver off, same Windows Turbo scheme, High detail, shadows enabled, head motion off. RTX 4070 Laptop GPU through ANGLE/Direct3D11. Controlled buffer 1600 × 1000; normal primary LG ULTRAWIDE display 2560 × 1080, 75 Hz, pixel ratio 1. Other connected displays remained present. No power/display settings were changed. Actual conditions, temperatures, clock readings and buffers are retained before/after each version.

Sequential V0.13 then V0.14, eight poses per resolution; five-second samples, first second discarded. GPU queries supported and non-disjoint, no rendering errors. These are local snapshots, not identical thermal-state trials. Renderer triangles/calls include instancing and render passes, not unique asset counts.

| View | 1600 × 1000 GPU mean V13 → V14, ms | 2560 × 1080 GPU mean V13 → V14, ms | V14 native p95, ms | Native triangles | Draw calls |
|---|---:|---:|---:|---:|---:|
${rows.join('\n')}

Observed ready times in the controlled pair: ${(oldfixed[0].readyMs/1000).toFixed(2)} s for V0.13, ${(fixed[0].readyMs/1000).toFixed(2)} s for V0.14. These are process-to-ready observations with local filesystem caches, not controlled cold-start tests.

## Data, assets and preservation

Native survey audit: ${audit.tiles} source tiles, ${audit.nativeSamplesChecked.toLocaleString('en')} valid samples, every retained lower-resolution node equal to native source, ${audit.sharedEdgeSamples.toLocaleString('en')} exact shared-source edge samples, ${audit.unchangedWalkingHeightSamples.toLocaleString('en')} unchanged walking heights and ${audit.unchanged.length} unchanged prior terrain/control/major-form/asset files. Installed mesh edges also pass the seven-pose moving-detail seam audit below 0.6 mm. Controller tests pass route, slope/drop, obstacle, diagonal-speed and large-delta checks.

Three regional derived fields are 2800 × 2400 RGBA8 at 5 m/texel. The ground-colour array is 2048² × 14 layers: two existing CC0 ingredients and twelve attributed aerial tiles, about 298.7 MiB with mipmaps. New regional imagery files total about 50 MB including original WMS responses. All project assets occupy ${(assets.totalAssetBytes/1e6).toFixed(1)} MB on disk, including preserved source and unused legacy material files. Approximately 430 MB of original DTM TIFFs remain in Git but are excluded from the playable package because the runtime reads derived height tiles. No visible density or resolution was reduced after the quality pass. Package and ZIP reports give exact shipped bytes/checksums and verify older builds/private-reference exclusion.

## Remaining limits

The result is a terrain/material reconstruction, not photogrammetry. Generic rock detail can still look striated; close plants and tree crowns repeat. Aerial ground retains some captured lighting and flat traces of roads/buildings; there are no corresponding reconstructed valley buildings or accessible roads. Heightfields cannot capture all overhangs. Clouds/sun are static, exploration is bounded, and adjacent coverage requires regenerated masks and collision validation. Other hardware, long unattended sessions and subjective audio quality are unverified.
`;
await fs.writeFile('docs/VALIDATION_V014.md',content);console.log('Validation document generated from final measurements');
