import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {Terrain,createRoute} from '../src/terrain.js';
import {SurveyTiles} from '../src/survey-tiles.js';
import {inWalkingArea} from '../src/exploration.js';
const root='assets/terrain-v14',meta=JSON.parse(await fs.readFile(root+'/manifest.json'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const base='release/Seceda-Windows-v0.14/resources/app/';
const unchanged=[];
async function files(dir){const a=[];for(const e of await fs.readdir(dir,{withFileTypes:true}))a.push(...e.isDirectory()?await files(dir+'/'+e.name):[dir+'/'+e.name]);return a;}
for(const file of [...(await files(base+'assets')).map(p=>p.slice(base.length)),'src/terrain.js','src/survey-tiles.js','src/tiled-terrain.js','src/regional-relief.js','src/player.js','src/exploration.js','src/details.js','src/trail-details.js','src/landmarks.js','src/ridge.js','src/ridge-walls.js','src/ridge-benches.js','src/summit-fins.js','src/ledge-study.js','src/cliff-surface.js','src/near-meadow.js','src/meadow.js','src/alpine-plants.js','src/atmosphere.js']){
 const a=await fs.readFile(file),b=await fs.readFile(base+file);assert.equal(sha(a),sha(b),file);unchanged.push({file,sha256:sha(a),bytes:a.length});
}
const tiles=new Map();let samples=0,sourceBytes=0;
for(const t of meta.tiles){
 const source=await fs.readFile(root+'/'+t.source);assert.equal(sha(source),t.sourceSHA256,t.id+' source checksum');sourceBytes+=source.length;
 const b=await fs.readFile(root+'/'+t.levels[0].file),data=new Float32Array(b.buffer,b.byteOffset,b.length/4);assert.equal(data.length,801*801);
 for(const v of data){assert.ok(Number.isFinite(v)&&v>0&&v<4000);samples++;}tiles.set(t.e+','+t.n,{...t,data});
 for(const l of t.levels.slice(1)){const b=await fs.readFile(root+'/'+l.file),d=new Float32Array(b.buffer,b.byteOffset,b.length/4),stride=l.spacing/2.5;for(let j=0;j<l.width;j++)for(let i=0;i<l.width;i++)assert.equal(d[j*l.width+i],data[j*stride*801+i*stride]);}
}
let seamSamples=0,maxSeamDifference=0;
for(const t of tiles.values())for(const [key,horizontal]of [[(t.e+2000)+','+t.n,true],[t.e+','+(t.n+2000),false]]){const n=tiles.get(key);if(!n)continue;for(let k=0;k<801;k++){const a=horizontal?t.data[k*801+800]:t.data[k],b=horizontal?n.data[k*801]:n.data[800*801+k];maxSeamDifference=Math.max(maxSeamDifference,Math.abs(a-b));seamSamples++;}}
assert.equal(maxSeamDifference,0,'Native shared tile edge');
globalThis.fetch=async url=>{const b=await fs.readFile(String(url).replace(/^\.\//,''));return {ok:true,json:async()=>JSON.parse(b),arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};};
const collision=await new Terrain().load(),visual=await new SurveyTiles(collision).load();
let walkSamples=0;
for(let z=-150;z<=575;z+=5)for(let x=-60;x<=1010;x+=5)if(inWalkingArea(x,z,20)){assert.equal(visual.height(x,z),collision.height(x,z));walkSamples++;}
const route=createRoute(collision);assert.equal(route.length,327.9799188900702);assert.equal(route.points.length,421);
const report={passed:true,baseline:'e3c27b6adf120a813393fd85686a667113029de6',unchanged,tiles:tiles.size,nativeSamplesChecked:samples,lowerLevels:'Every retained node checked equal to native 2.5 m source',sourceBytes,sharedEdgeSamples:seamSamples,maxSeamDifferenceMetres:maxSeamDifference,unchangedWalkingHeightSamples:walkSamples,routeMetres:route.length,crs:'EPSG:25832',scale:1};
await fs.writeFile('artifacts/surface-v015/data-audit.json',JSON.stringify(report,null,2));console.log({passed:true,tiles:tiles.size,samples,seamSamples,maxSeamDifference,walkSamples,unchanged:unchanged.length});
