import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Terrain} from '../src/terrain.js';
import {SurveyTiles} from '../src/survey-tiles.js';
import {addTiledTerrain} from '../src/tiled-terrain.js';
globalThis.innerHeight=1000;
globalThis.fetch=async url=>{const b=await fs.readFile(String(url).replace(/^\.\//,''));return {ok:true,json:async()=>JSON.parse(b),arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};};
const collision=await new Terrain().load(),terrain=await new SurveyTiles(collision).load();
const camera=new THREE.PerspectiveCamera(66,1.6,.08,22000);camera.rotation.order='YXZ';camera.position.set(15,collision.height(15,165)+1.72,165);camera.rotation.set(.025,-.65,0);
const survey=await addTiledTerrain(new THREE.Scene(),terrain,new THREE.MeshBasicMaterial(),camera);
function audit(){
 const lookup=new Map(survey.chunks.map(c=>[c.x+','+c.z,c]));let samples=0,maxGap=0,worst=null;
 for(const c of survey.chunks)for(const horizontal of [true,false]){
  const other=lookup.get((c.x+(horizontal?c.width:0))+','+(c.z+(horizontal?0:c.depth)));if(!other)continue;
  const span=horizontal?c.depth:c.width,step=Math.min(c.spacing,other.spacing);
  function at(chunk,t,end){const w=Math.ceil(chunk.width/chunk.spacing),h=Math.ceil(chunk.depth/chunk.spacing),index=t/chunk.spacing,a=Math.min(Math.floor(index),(horizontal?h:w)-1),u=index-a,p=chunk.mesh.geometry.attributes.position;
   const k=horizontal?a*(w+1)+(end?w:0):(end?h*(w+1):0)+a, next=k+(horizontal?w+1:1);
   return [0,1,2].map(j=>p.array[k*3+j]*(1-u)+p.array[next*3+j]*u);
  }
  for(let t=0;t<=span;t+=step){const a=at(c,t,true),b=at(other,t,false),gap=Math.hypot(...a.map((v,i)=>v-b[i]));if(gap>maxGap){maxGap=gap;worst={a:c.id,b:other.id,spacing:[c.spacing,other.spacing],t};}samples++;}
 }
 return {samples,maxGapMetres:maxGap,worst};
}
const stages=[];
for(const [x,z,yaw]of [[15,165,-.65],[150,-120,-1.14],[450,180,2.7],[800,380,-1.35],[320,430,.9],[800,380,2.1],[15,165,-.65]]){
 camera.position.set(x,collision.height(x,z)+1.72,z);camera.rotation.set(-.04,yaw,0);
 // Audit installed neighbor edges both during regeneration and after settling.
 for(let i=0;i<4;i++){survey.update();await new Promise(r=>setTimeout(r,20));const a=audit();assert.ok(a.maxGapMetres<.003,JSON.stringify(a));}
 await survey.settle();const a=audit();assert.ok(a.maxGapMetres<.003,JSON.stringify(a));stages.push({position:[x,z],yaw,...a,levels:[...survey.info.levels],triangles:survey.info.activeTriangles,cache:{...terrain.info}});console.log({x,z,gap:a.maxGapMetres,triangles:survey.info.activeTriangles});
}
await fs.writeFile('artifacts/terrain-v014/seam-audit.json',JSON.stringify({passed:true,method:'Production terrain generator and source files; all adjoining edge segments compared in 3D during installed-level transitions and after seven camera moves/turns. Includes lateral authored relief. Float32 tolerance 3 mm.',stages,info:survey.info},null,2));
