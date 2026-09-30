import fs from 'node:fs/promises';
const report=JSON.parse(await fs.readFile('artifacts/depth-v06/after/report.json','utf8'));
const labels=['Start','Midpoint','Viewpoint','Path close-up','Cliff edge','Lower bend','Upper meadow','Ridge approach'];
const groups={
 'Matched V0.5 / V0.6':report.views.map((v,i)=>({label:labels[i],a:`before/${v.name}.png`,b:`after/${v.name}.png`,left:'V0.5',right:'V0.6',note:`Identical portable-game camera: x ${v.x} m, z ${v.z} m, yaw ${v.yaw}, pitch ${v.pitch}, FOV ${v.fov||66}°. Survey, silhouette geometry, trail and sky are preserved.`})),
 'V0.5 lighting diagnosis':[
  ['Near shadows off','live-shadow-off','The original 4096² live shadow camera covers 360 m. Disabling it changes no pixels in the sampled distant-ridge rectangle.'],
  ['DTM shadows off','dtm-shadow-off','The 512² solar-horizon map affects the distant image, but uses only the elevation field. It cannot represent the authored overhangs or cliff walls.'],
  ['Authored casting on','authored-cast-on','Making the cliff meshes cast into the unchanged near shadow camera has only a limited effect on the distant ridge.'],
  ['Bump detail off','bump-off','Fine material bump has almost no visible effect at this walking distance. Texture dimensions were not increased.']
 ].map(([label,mode,note])=>({label,a:'diagnostics-before/03-viewpoint-baseline.png',b:`diagnostics-before/03-viewpoint-${mode}.png`,left:'V0.5 baseline',right:label,note})),
 'V0.6 shadow solution':[
  {label:'DTM vs actual geometry',a:'lighting-study/01-dtm-only.png',b:'lighting-study/04-all-geometry-2048.png',left:'DTM horizon only',right:'Terrain + authored cliffs',note:'Only the distant sun-visibility source changes. The added map is rendered once at startup; the near shadow map is untouched.'},
  {label:'Survey vs authored casters',a:'lighting-study/02-survey-depth-only.png',b:'lighting-study/04-all-geometry-2048.png',left:'Survey geometry only',right:'Survey + authored cliffs',note:'Same 2048² sun-space depth camera. Including the actual rock meshes adds ledge and wall shadows missing from the survey surface.'},
  {label:'1024 vs 2048',a:'lighting-study/03-all-geometry-1024.png',b:'lighting-study/04-all-geometry-2048.png',left:'1024² depth',right:'2048² depth',note:'Identical map coverage and casters: about 4.7 × 3.8 m versus 2.35 × 1.90 m per texel. 2048 retains narrower ledge shadows with less coarse filtering.'},
  {label:'Rejected normal bias',a:'bias-study/01-normal-offset.png',b:'bias-study/02-sun-offset-4m.png',left:'Rejected normal offset',right:'Sunward offset',note:'Close diagnostic exposed striping from smooth-normal receiver offsets across sharp walls. A 4 m sunward bias reduces that artifact; some polygonal wall structure remains.'}
 ],
 'V0.6 vegetation layers':[
  ...['01-start','03-viewpoint'].flatMap((pose,i)=>[
   {label:`${i?'Viewpoint':'Start'}: fine turf`,a:`diagnostics-after/${pose}-fine-turf-off.png`,b:`diagnostics-after/${pose}-baseline.png`,left:'Surface + accents',right:'With individual short turf',note:'Same camera, lighting and underlying turf material. Fine blades use overlapping distance fades and follow the camera throughout the walking area.'},
   {label:`${i?'Viewpoint':'Start'}: accents`,a:`diagnostics-after/${pose}-accents-off.png`,b:`diagnostics-after/${pose}-baseline.png`,left:'Fine turf only',right:'With larger plants',note:'Larger CC0 clumps and original flowers are accents. The old repeated radial basal clumps have been removed.'}
  ])
 ]
};
let html=await fs.readFile('artifacts/ridge-v05/index.html','utf8');
const style=html.match(/<style>([\s\S]*?)<\/style>/)[1];
html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Seceda V0.6 — cliff depth and continuous turf</title><style>${style}select{font:inherit;padding:10px;color:inherit;background:#253736;border:1px solid #718077;max-width:100%}.frame:fullscreen{width:100vw;height:100vh;background:#000}.frame:fullscreen img{object-fit:contain}#category{margin-left:12px}</style></head><body><main>
<header><div><small>SECEDA · SAME 328 M WALK</small><h1>Cliff depth and continuous turf</h1><p>Matched, unretouched 1600 × 1000 captures from the Windows portable builds. Use the divider or open either full-resolution image.</p></div><small>V0.5 CHECKPOINT<br>f7c3fcaa97276994d4725540bc5452fe3eb9e732</small></header>
<label>Compare<select id="category" aria-label="Comparison category"></select></label><nav aria-label="Comparison view"></nav>
<div class="frame"><img id="before" alt="Before"><img id="after" alt="After"><div class="line"></div><span class="badge left"></span><span class="badge right"></span></div>
<label class="range">Before<input id="split" aria-label="Before and after divider" type="range" min="0" max="100" value="50">After</label>
<p id="note"></p><p><a id="beforeLink">Open before</a> · <a id="afterLink">Open after</a> · <button id="full">Fullscreen comparison</button></p>
<footer>All five V0.5 poses plus three intermediate walking views are paired. The four private reference photos are not included here or in the game. The meadow is more continuous and large cliff recesses read more clearly; close leaves, distant grass, polygonal shelves and some material repetition still look artificial. <a href="../../docs/DEPTH_V06.md">Implementation, measurements and licenses</a> · <a href="performance.json">GPU timing</a> · <a href="lighting-diagnosis.json">Isolated pixel measurements</a> · <a href="preservation.json">Preservation checks</a> · <a href="packaged-walk.json">Packaged walk</a> · <a href="package-audit.json">Package audit</a>.</footer>
</main><script>
const groups=${JSON.stringify(groups)};const cat=document.getElementById('category'),nav=document.querySelector('nav');
for(const name of Object.keys(groups)){const o=document.createElement('option');o.textContent=name;cat.append(o);}
function select(i){const v=groups[cat.value][i];nav.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));for(const [id,url]of [['before',v.a],['after',v.b]]){document.getElementById(id).src=url;document.getElementById(id).alt=(id==='before'?v.left:v.right)+': '+v.label;document.getElementById(id+'Link').href=url;}document.querySelector('.badge.left').textContent=v.left;document.querySelector('.badge.right').textContent=v.right;document.getElementById('note').textContent=v.note;}
function category(){nav.replaceChildren();groups[cat.value].forEach((v,i)=>{const b=document.createElement('button');b.textContent=v.label;b.onclick=()=>select(i);nav.append(b);});select(cat.selectedIndex===0?2:0);}
cat.onchange=category;document.getElementById('split').oninput=e=>{document.getElementById('after').style.clipPath='inset(0 0 0 '+e.target.value+'%)';document.querySelector('.line').style.left=e.target.value+'%';};document.getElementById('full').onclick=()=>document.querySelector('.frame').requestFullscreen();category();
</script></body></html>`;
await fs.writeFile('artifacts/depth-v06/index.html',html);
