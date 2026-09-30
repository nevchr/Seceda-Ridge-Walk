import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const states=[],inventory=[];let landscapeInfo;
for(const version of ['0.8','0.9']){
 const app=await _electron.launch({executablePath:`release/Seceda-Windows-v${version}/Seceda.exe`,args:[]});
 try{
  const p=await app.firstWindow();await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});
  const state=await p.evaluate(async()=>{
   const q=window.__seceda,hash=async a=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',a.buffer??a))).map(v=>v.toString(16).padStart(2,'0')).join('');
   const terrainMeshes=q.scene.children.filter(m=>m.isMesh&&!m.isInstancedMesh&&m.geometry.attributes.position.count>10000).slice(0,3),geometry=[];
   for(const m of terrainMeshes)geometry.push({vertices:m.geometry.attributes.position.count,positions:await hash(m.geometry.attributes.position.array),indices:await hash(m.geometry.index.array)});
   return {geometry,route:q.route.points.map(p=>p.toArray()),colliders:q.colliders,fog:{color:q.scene.fog.color.toArray(),density:q.scene.fog.density},fov:q.camera.fov};
  });states.push(state);
  if(version==='0.9'){landscapeInfo=await p.evaluate(()=>window.__seceda.scene.userData);}
  if(version==='0.9')inventory.push(...await p.evaluate(()=>{
   const names=['Survey-aligned fractured ridge','Nine authored summit blades','Jointed Seceda limestone formations'];
   return window.__seceda.scene.children.filter(m=>names.includes(m.name)).map(m=>{const g=m.geometry,a=g.attributes.position.array;let inside=0;for(let i=0;i<a.length;i+=3)if(a[i]>-45&&a[i]<320&&a[i+2]>-130&&a[i+2]<245)inside++;g.computeBoundingBox();return{name:m.name,triangles:(g.index?.count??g.attributes.position.count)/3,vertices:a.length/3,bytes:Object.values(g.attributes).reduce((n,a)=>n+a.array.byteLength,0)+(g.index?.array.byteLength??0),bounds:{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()},verticesInsideWalkBounds:inside};});
  }));
 }finally{await app.close();}
}
assert.deepEqual(states[0],states[1],'Survey geometry, route, collision, fog or FOV changed');assert.equal(inventory.length,3);assert.ok(inventory.every(m=>m.verticesInsideWalkBounds===0));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),files={};
for(const f of ['src/turf.js','src/ridge-meadow.js','src/alpine-plants.js','src/terrain.js','src/player.js','src/atmosphere.js','src/ridge.js','src/summit-fins.js',...(await fs.readdir('assets/terrain')).map(f=>'assets/terrain/'+f)]){
 const a=await fs.readFile('release/Seceda-Windows-v0.8/resources/app/'+f),b=await fs.readFile('release/Seceda-Windows-v0.9/resources/app/'+f);assert.equal(sha(a),sha(b),f);files[f]=sha(b);
}
const report={passed:true,landscapeInfo,method:'Exact runtime comparison of three DTM terrain meshes, all route points, all collision volumes, fog and FOV; byte hashes of terrain, controller, sky, vegetation, original broad ridge and summit fins. All new cliff vertices checked outside walk bounds. Rock, trail and landmark art intentionally differ',files,geometry:states[1].geometry,routePoints:states[1].route.length,colliders:states[1].colliders.length,authoredGeometry:inventory};
await fs.writeFile('artifacts/stone-v09/preservation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

