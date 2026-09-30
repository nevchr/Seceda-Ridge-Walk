import fs from 'node:fs/promises';
const root='artifacts/surface-v015',read=async f=>JSON.parse(await fs.readFile(root+'/'+f,'utf8'));
const [controlled,native,walk,free,motion,oldMotion,frames,assets,audit,frozen]=await Promise.all(['final-controlled.json','final-native.json','final-walk/packaged-walk.json','final-walk/free-walk.json','final-walk/motion-performance.json','baseline-walk/motion-performance.json','final/report.json','assets.json','data-audit.json','final-runtime.json'].map(read));
const after=native.results.filter(r=>r.version==='v0.15'),before=native.results.filter(r=>r.version==='v0.14');
const rows=after.map(r=>{const a=before.find(a=>a.pose.name===r.pose.name),c=controlled.results.find(a=>a.version==='v0.15'&&a.pose.name===r.pose.name),b=controlled.results.find(a=>a.version==='v0.14'&&a.pose.name===r.pose.name);return `| ${r.pose.name} | ${b.gpuMs.mean.toFixed(2)} → ${c.gpuMs.mean.toFixed(2)} | ${a.gpuMs.mean.toFixed(2)} → ${r.gpuMs.mean.toFixed(2)} | ${r.gpuMs.p95.toFixed(2)} | ${r.stats.triangles.toLocaleString('en')} | ${r.stats.drawCalls} |`;});
const s=frames.scene.metadata;
const text=`# V0.15 validation

Portable: release/Seceda-Windows-v0.15/Seceda.exe. Baseline: V0.14 e3c27b6, checkpointed before editing as 3b9f606. All ${frozen.files.length} runtime hashes were frozen before final captures/traversal and rechecked by the package audit. Later delivery edits are documentation/artifacts only.

## Rendered comparison

31 matched 1600 × 1000 portable views: seven sites in three directions, three regional views, two inherited close poses, four additional off-trail angles and the outward pasture rim. Eye height 1.72 m, normal FOV 66°; cliff-close retains 38°. Camera position/orientation/FOV equality is checked. The rim baseline used a separate portable launch. These are actual game captures, not composited scene art. Packaged studies and critiques remain in WORKLOG.md.

The strongest gains are fuller modeled canopy across both valleys, continuous middle vegetation, naturalised image artifacts and terrain-conditioned mineral detail. Broad far pasture still relies on texture; rock ingredients and plant crowns repeat. Corrected geographic colour can retain residual photographed light or tracks. It is not calibrated reflectance, photogrammetry or a current building/vegetation survey.

## Packaged movement

421/421 route samples and 68/68 pasture waypoints completed in ${(walk.seconds/60).toFixed(2)} minutes, including a ${free.seconds.toFixed(2)} s continuous pasture leg. Zero blocked steps, ${walk.errors.length} rendering errors, ${walk.focusResumes} focus resumes. Maximum eye-height smoothing error: ${(walk.result.maxGroundError*100).toFixed(2)} cm on the route and ${(free.result.maxGroundError*100).toFixed(2)} cm in pasture. Mouse look, pointer capture, pause, keyboard reset and stale-arrival clearing passed.

This uses real-time held W / W+Shift with automated steering through the production controller, not a human playtest. No teleports occur within either leg; the endpoint is set once before the separate pasture leg. New rocks and shrubs stay outside the playable area; the middle meadow remains cosmetic, and woodland reports ${s.woodland.walkableTreeColliders} walkable tree colliders.

Moving frame intervals at 1600 × 1000: V14 mean/p95 ${oldMotion.all.mean.toFixed(2)} / ${oldMotion.all.p95.toFixed(2)} ms; V15 ${motion.all.mean.toFixed(2)} / ${motion.all.p95.toFixed(2)} ms, p99 ${motion.all.p99.toFixed(2)} ms. ${motion.all.over50ms} of ${motion.all.frames.toLocaleString('en')} active frames exceed 50 ms; maximum ${motion.all.max.toFixed(2)} ms. These include display pacing, capture and automation stalls, and are not GPU durations.

## Paired rendering cost

Both versions: plugged in, battery saver off, same Windows power scheme (${after[0].conditionsBefore.scheme}), High detail, shadows on, head motion off. RTX 4070 Laptop GPU / ANGLE Direct3D11. Controlled buffer 1600 × 1000; native primary display 2560 × 1080 at 75 Hz, DPR 1. No power/display settings were changed. Actual before/after conditions, clocks and temperatures are in the raw reports; thermal state is not claimed identical.

Sequential runs, five-second samples, first second discarded. GPU queries use EXT_disjoint_timer_query_webgl2 and must be supported/non-disjoint. Counts include submitted instances/passes, not unique assets. No visual quality was removed to meet a performance target.

Time to scene-ready on these native launches: V14 ${(before[0].readyMs/1000).toFixed(1)} s; V15 ${(after[0].readyMs/1000).toFixed(1)} s. This includes startup generation/loading on this machine; it is not a cold-disk benchmark.

| View | Controlled GPU mean V14 → V15, ms | Native GPU mean V14 → V15, ms | V15 native p95, ms | Native triangles | Draw calls |
|---|---:|---:|---:|---:|---:|
${rows.join('\n')}

## Preservation and assets

${audit.unchanged.length} baseline assets/invariant source files match V14. ${audit.nativeSamplesChecked.toLocaleString('en')} valid native samples; all lower levels equal source nodes; ${audit.sharedEdgeSamples.toLocaleString('en')} exact shared-source edge samples; ${audit.unchangedWalkingHeightSamples.toLocaleString('en')} unchanged walking heights. Route ${audit.routeMetres.toFixed(2)} m, EPSG:25832, 1 m/unit, no vertical exaggeration. Native mesh/stitching and principal ridge generators are unchanged.

The twelve 2048², 2 m/texel derivatives and manifest total ${(assets.v15DerivativeBytes/1e6).toFixed(2)} MB. The same 14-layer array remains about 298.7 MiB with mipmaps; other texture dimensions are unchanged. Middle-sward height apron: 941 × 765 R32F nodes at 2.5 m, 2,879,460 bytes.

Full-region generated totals: ${s.regionalDebris.instances.toLocaleString('en')} fragments / ${s.regionalDebris.triangles.toLocaleString('en')} triangles; ${s.regionalShrubs.instances.toLocaleString('en')} low shrubs at ${s.regionalShrubs.trianglesPerInstance} triangles each; ${s.groundOutcrops.exposures.toLocaleString('en')} shallow outcrop groups / ${s.groundOutcrops.triangles.toLocaleString('en')} triangles; ${s.woodland.instances.toLocaleString('en')} conifers / ${s.woodland.totalTriangles.toLocaleString('en')} triangles across three detail levels. Frustum culling limits visible submissions; these totals are not rendered at every camera.

DTM and historical land use: provincial CC0. Ortofoto 2023 RGB: Provincia Autonoma di Bolzano / Alto Adige, with AgEA, CC BY 4.0. Derivative modifications and attribution remain in ASSETS.md and the image manifest. Individual detail is original authored work. Five private reference images remain excluded. Package/ZIP audits verify parity, licenses and older archives.

Walking remains the original ridge route and 0.602 km² southeast pasture envelope, with existing steep-bank/prop limits. Northern cliffs, western escarpment, high massif and outer terrain are scenic. Other PCs, long unattended sessions and subjective audio quality remain unverified.
`;
await fs.writeFile('docs/VALIDATION_V015.md',text);console.log('V0.15 validation generated from final evidence');
