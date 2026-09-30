import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const states=[],inventory=[];
for(const version of ['0.6','0.7']){
 const app=await _electron.launch({executablePath:`release/Seceda-Windows-v${version}/Seceda.exe`,args:[]});
 try{
  const p=await app.firstWindow();await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});
  const state=await p.evaluate(async()=>{
   const q=window.__seceda,hash=async a=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',a.buffer??a))).map(v=>v.toString(16).padStart(2,'0')).join('');
   const terrainMeshes=q.scene.children.filter(m=>m.isMesh&&!m.isInstancedMesh&&m.geometry.attributes.position.count>10000).slice(0,3),geometry=[];
   for(const m of terrainMeshes)geometry.push({vertices:m.geometry.attributes.position.count,positions:await hash(m.geometry.attributes.position.array),indices:await hash(m.geometry.index.array)});
   return {geometry,route:q.route.points.map(p=>p.toArray()),colliders:q.colliders,fog:{color:q.scene.fog.color.toArray(),density:q.scene.fog.density},fov:q.camera.fov};
  });states.push(state);
  if(version==='0.7')inventory.push(...await p.evaluate(()=>{
   const names=['Survey-aligned fractured ridge','Contour-fitted limestone prows','Nine authored summit blades','Connected limestone risers and turf benches'];
   return window.__seceda.scene.children.filter(m=>names.includes(m.name)).map(m=>{const g=m.geometry,a=g.attributes.position.array;let inside=0;for(let i=0;i<a.length;i+=3)if(a[i]>-45&&a[i]<320&&a[i+2]>-130&&a[i+2]<245)inside++;g.computeBoundingBox();return{name:m.name,triangles:g.index.count/3,vertices:a.length/3,bytes:Object.values(g.attributes).reduce((n,a)=>n+a.array.byteLength,0)+g.index.array.byteLength,bounds:{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()},verticesInsideWalkBounds:inside};});
  }));
 }finally{await app.close();}
}
assert.deepEqual(states[0],states[1],'Survey geometry, route, collision, fog or FOV changed');assert.equal(inventory.length,4);assert.ok(inventory.every(m=>m.verticesInsideWalkBounds===0));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),files={};
for(const f of ['src/terrain.js','src/player.js','src/atmosphere.js','src/ridge.js','src/ridge-walls.js','src/ridge-benches.js','src/summit-fins.js','src/trail-details.js','src/details.js',...(await fs.readdir('assets/terrain')).map(f=>'assets/terrain/'+f)]){
 const a=await fs.readFile('release/Seceda-Windows-v0.6/resources/app/'+f),b=await fs.readFile('release/Seceda-Windows-v0.7/resources/app/'+f);assert.equal(sha(a),sha(b),f);files[f]=sha(b);
}
const report={passed:true,method:'Exact runtime comparison of three DTM terrain meshes, route points, collision volumes, fog and FOV; byte hashes of terrain source/data, controller and sky. New authored cliff vertices checked outside the walk bounds. V0.6 authored silhouette generators and trail detail geometry source are byte-identical. Materials, vegetation, path wear boundaries and lighting intentionally changed.',files,geometry:states[1].geometry,routePoints:states[1].route.length,colliders:states[1].colliders.length,authoredGeometry:inventory};
await fs.writeFile('artifacts/alpine-v07/preservation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

