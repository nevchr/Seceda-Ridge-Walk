import fs from 'node:fs/promises';
let s=await fs.readFile('scripts/depth-preservation.mjs','utf8');
s=s.replaceAll('0.6','0.7').replaceAll('0.5','0.6').replaceAll('depth-v06','alpine-v07');
s=s.replace("lights:q.scene.children.filter(x=>x.isLight).map(l=>({type:l.type,color:l.color.toArray(),intensity:l.intensity,position:l.position.toArray()})),",'');
s=s.replace("'src/landscape.js',",'');
s=s.replace('Survey geometry, route, collision or lighting changed','Survey geometry, route, collision, fog or FOV changed');
s=s.replace('route points, collision volumes, lights, fog and FOV','route points, collision volumes, fog and FOV');
s=s.replace('V0.6 authored silhouette generators, landscape maps and trail detail source are byte-identical.','V0.6 authored silhouette generators and trail detail geometry source are byte-identical. Materials, vegetation, path wear boundaries and lighting intentionally changed.');
await fs.writeFile('scripts/alpine-preservation.mjs',s);
