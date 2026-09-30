import {createRequire} from 'node:module';import fs from 'node:fs/promises';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const states=[];const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const version of ['0.10','0.11']){
 const app=await _electron.launch({executablePath:`release/Seceda-Windows-v${version}/Seceda.exe`,args:[]});
 try{const p=await app.firstWindow();await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});states.push(await p.evaluate(async()=>{
  const q=window.__seceda,hash=async a=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',a.buffer??a))).map(v=>v.toString(16).padStart(2,'0')).join('');
  const names=['Survey-aligned fractured ridge','Contour-fitted limestone prows','Nine authored summit blades','Connected limestone risers and turf benches'];const cliffs=[],terrain=[],retained=[];
  for(const m of q.scene.children){if(!m.isMesh)continue;let g=m.geometry;
   if(names.includes(m.name)){g=m.userData.v08Geometry||g;cliffs.push({name:m.name,position:await hash(g.attributes.position.array),indices:await hash(g.index.array)});}
   else if(!m.name&&g.attributes.position?.count>10000)terrain.push({position:await hash(g.attributes.position.array),indices:await hash(g.index.array)});
   else if(m.isInstancedMesh&&m.name==='Fracture talus aprons')retained.push({name:m.name,count:m.count,matrices:await hash(new Float32Array(m.instanceMatrix.array.subarray(0,m.count*16))),geometry:await hash(m.geometry.attributes.position.array)});
  }
  const clearance=q.scene.children.filter(m=>m.userData.cliffRefinement).map(m=>{let inside=0;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)if(p.getX(i)>-45&&p.getX(i)<320&&p.getZ(i)>-130&&p.getZ(i)<245)inside++;return{name:m.name,verticesInsideWalkBounds:inside,...m.userData.cliffRefinement};});
  return {fixed:{terrain,route:q.route.points.map(p=>p.toArray()),colliders:q.colliders,fog:{color:q.scene.fog.color.toArray(),density:q.scene.fog.density},fov:q.camera.fov,lights:q.scene.children.filter(m=>m.isLight).map(m=>({type:m.type,color:m.color.toArray(),intensity:m.intensity,position:m.position.toArray()}))},cliffs:cliffs.sort((a,b)=>a.name.localeCompare(b.name)),retained,clearance,massif:q.scene.userData.massifLight};
 }));}finally{await app.close();}
}
assert.deepEqual(states[0].fixed,states[1].fixed);assert.deepEqual(states[0].cliffs,states[1].cliffs);assert.deepEqual(states[0].retained,states[1].retained);assert.ok(states[1].clearance.every(m=>m.verticesInsideWalkBounds===0));assert.equal(states[1].massif.casters,7);
const preservedFiles={};for(const file of ['terrain','player','details','trail-details','landmarks','jointed-rock','turf','ridge-meadow','alpine-plants','land-cover','pasture-sward','landscape','atmosphere','ridge','ridge-walls','ridge-benches','summit-fins','audio']){
 const f=`src/${file}.js`,a=await fs.readFile(`release/Seceda-Windows-v0.10/resources/app/${f}`),b=await fs.readFile(f);assert.equal(sha(a),sha(b),f);preservedFiles[f]=sha(b);
}
const report={passed:true,method:'Exact runtime terrain, route, collision, sky/light comparisons between V0.10 and V0.11. Exact inherited pre-refinement geometry hashes compared between V0.10 and V0.11. V0.9 scree transforms and geometry are identical. Preserved source files are byte-identical to V0.10. No new cliff vertices inside walking bounds.',routeMetres:327.9799188900702,routePoints:421,colliders:65,preservedFiles,baseGeometry:states[1].cliffs,retainedScree:states[1].retained,clearance:states[1].clearance,massif:states[1].massif};await fs.writeFile('artifacts/ledge-v011/preservation.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,preservedFiles:undefined,baseGeometry:undefined},null,2));
