import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const states=[];
for(const version of ['0.3','0.4']){
 const app=await _electron.launch({executablePath:`release/Seceda-Windows-v${version}/Seceda.exe`,args:[]});
 try{
  const p=await app.firstWindow();await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});
  states.push(await p.evaluate(async()=>{
   const q=window.__seceda;
   const hash=async a=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',a.buffer??a))).map(v=>v.toString(16).padStart(2,'0')).join('');
   const geometry=[];
   for(const m of q.scene.children){if(!m.isMesh||m.isInstancedMesh||m.geometry.attributes.position.count<10000)continue;
    geometry.push({vertices:m.geometry.attributes.position.count,positions:await hash(m.geometry.attributes.position.array),indices:await hash(m.geometry.index.array)});
   }
   const buttresses=q.scene.children.filter(m=>m.isInstancedMesh&&m.geometry.attributes.position.count===60&&m.count<200);
   const rocks=[];for(const m of buttresses)rocks.push({count:m.count,matrix:await hash(m.instanceMatrix.array),positions:await hash(m.geometry.attributes.position.array)});
   return {geometry,rocks,route:q.route.points.map(p=>p.toArray()),colliders:q.colliders,lights:q.scene.children.filter(x=>x.isLight).map(l=>({type:l.type,color:l.color.toArray(),intensity:l.intensity,position:l.position.toArray()})),fog:{color:q.scene.fog.color.toArray(),density:q.scene.fog.density},fov:q.camera.fov};
  }));
 }finally{await app.close();}
}
assert.deepEqual(states[0],states[1],'Mountain geometry, route, collision or lighting changed');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),files={};
for(const f of ['src/terrain.js','src/player.js','src/atmosphere.js',...(await fs.readdir('assets/terrain')).map(f=>'assets/terrain/'+f)]){
 const a=await fs.readFile('release/Seceda-Windows-v0.3/resources/app/'+f),b=await fs.readFile('release/Seceda-Windows-v0.4/resources/app/'+f);assert.equal(sha(a),sha(b),f);files[f]=sha(b);
}
const report={passed:true,method:'SHA-256 of runtime terrain/cliff positions and indices, buttress positions/transforms; exact route/collider/light/fog/FOV comparison; byte hashes of terrain data, terrain sampler/controller and atmosphere source across both portable builds.',files,geometry:states[1].geometry,buttresses:states[1].rocks,routePoints:states[1].route.length,colliders:states[1].colliders.length};
await fs.writeFile('artifacts/materials-v04/preservation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
