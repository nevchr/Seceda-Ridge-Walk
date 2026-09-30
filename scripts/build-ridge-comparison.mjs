import fs from 'node:fs/promises';
let page=await fs.readFile('artifacts/materials-v04/index.html','utf8');
page=page.replace('Trail, grass and limestone','Ridge formations and meadow').replace('v0.3 CHECKPOINT: bb91b88','v0.4 CHECKPOINT: 2ed02db').replace('<span class="badge left">v0.3</span><span class="badge right">v0.4</span>','<span class="badge left">v0.4</span><span class="badge right">v0.5</span>');
page=page.replace('Sky, lighting, mountain geometry, route, survey and controls are unchanged.','Sky, lighting, route, survey terrain and controls are unchanged. The new cliff formations are authored geometry aligned to the survey.');
page=page.replace('../../docs/MATERIALS_V04.md','../../docs/RIDGE_V05.md');
const notes=[
 'The existing gravel route passes through short, slope-aligned cover and near-camera CC0 grass clumps. Summit blades now break the background silhouette.',
 'The route and walking terrain are unchanged. Lower cover tapers with distance; detailed leaves stay nearby. Flower heads are smaller and less geometric.',
 'The main view: vertical prows, fractured relief and connected rock/turf shelves sit over the survey. Meadow, thin turf, exposed rock and scree follow terrain shape.',
 'Licensed grass meshes and original folded-leaf tufts replace broad strips. Individual leaves are detailed only near the camera; some clump repetition remains.',
 'The nearest cliff has new contour-fitted geometry. Smooth DTM faces remain the foundation; the authored prows still have some sculpted-looking edges.'
];
let i=0;
const lines=page.split('\n');
for(let n=0;n<lines.length;n++)if(/^\['(?:01-start|02-midpoint|03-viewpoint|05-path-close|06-cliff-close)'/.test(lines[n])){
 const parts=lines[n].split("','");parts[2]=notes[i++];lines[n]=parts.join("','");
}
page=lines.join('\n').replace('select(0);','select(2);');
page=page.replace('Original scene at the start','v0.4 scene').replace('Redesigned scene at the same start camera','v0.5 scene');
await fs.writeFile('artifacts/ridge-v05/index.html',page);
let check=await fs.readFile('scripts/check-material-comparison.mjs','utf8');check=check.replaceAll('materials-v04','ridge-v05');await fs.writeFile('scripts/check-ridge-comparison.mjs',check);

