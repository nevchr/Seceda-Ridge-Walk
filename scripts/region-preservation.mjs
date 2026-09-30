import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {Terrain,createRoute} from '../src/terrain.js';
import {inWalkingArea} from '../src/exploration.js';
import {sculptSurveyGeometry} from '../src/landform.js';
import {addRegionalRock} from '../src/regional-rock.js';
import * as THREE from 'three';
const base='release/Seceda-Windows-v0.12/resources/app/';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function files(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;out.push(...e.isDirectory()?await files(p):[p]);}return out;}
const unchanged=[];
for(const f of [...(await files(base+'assets')).map(p=>p.slice(base.length)),'src/terrain.js','src/player.js','src/exploration.js','src/details.js','src/trail-details.js','src/landmarks.js','src/audio.js','src/ridge.js','src/ridge-walls.js','src/ridge-benches.js','src/summit-fins.js']){
 const a=await fs.readFile(f),b=await fs.readFile(base+f);assert.equal(sha(a),sha(b),f);unchanged.push({file:f,bytes:a.length,sha256:sha(a)});
}
const terrain=new Terrain(),meta=JSON.parse(await fs.readFile('assets/terrain/manifest.json'));
terrain.layers=await Promise.all(meta.layers.map(async l=>{const b=await fs.readFile('assets/terrain/'+l.name+'.f32');return {...l,data:new Float32Array(b.buffer,b.byteOffset,b.byteLength/4)};}));
const positions=[];for(let z=-150;z<=575;z+=9)for(let x=-60;x<=1010;x+=11)if(inWalkingArea(x,z,30))positions.push(x,terrain.height(x,z),z);
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const before=new Float32Array(g.attributes.position.array);
sculptSurveyGeometry(g,terrain);assert.deepEqual(g.attributes.position.array,before,'Walkable survey geometry displaced');
const route=createRoute(terrain);assert.equal(route.points.length,421);assert.equal(route.length,327.9799188900702);
const regional=addRegionalRock(new THREE.Scene(),terrain);let regionalSamples=0;
for(const m of regional.tiles){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){regionalSamples++;assert.ok(!inWalkingArea(p.getX(i),p.getZ(i),30),'Regional face entered protected walking buffer');}}
const report={passed:true,base:'6ccdbf500aed6eb08956fd0b33ba0997eae1fcff',unchanged,walkableGeometrySamples:positions.length/3,regionalGeometrySamples:regionalSamples,regional:regional.info,routePoints:route.points.length,routeMetres:route.length,note:'All prior asset bytes, full controller/bounds and original major ridge generators preserved. Scenic survey sculpture is outside the walking area plus a 45 m margin. Every regional face vertex was also checked outside a 30 m walking buffer.'};
await fs.writeFile('artifacts/region-v013/preservation.json',JSON.stringify(report,null,2));console.log({passed:true,unchangedFiles:unchanged.length,walkableGeometrySamples:positions.length/3});
