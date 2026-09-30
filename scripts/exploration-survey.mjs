import fs from 'node:fs/promises';
import {Terrain,createRoute} from '../src/terrain.js';
export async function loadTerrain(){const t=new Terrain();t.meta=JSON.parse(await fs.readFile('assets/terrain/manifest.json'));t.layers=await Promise.all(t.meta.layers.map(async l=>{const b=await fs.readFile(`assets/terrain/${l.name}.f32`);return {...l,data:new Float32Array(b.buffer,b.byteOffset,b.byteLength/4)};}));return t;}
const t=await loadTerrain(),points=[];
for(let z=-680;z<=580;z+=10)for(let x=-680;x<=1080;x+=10)points.push([x,z,t.height(x,z),t.slope(x,z)]);
const route=createRoute(t);
await fs.writeFile('artifacts/exploration-v012/survey.json',JSON.stringify({bounds:[-700,-700,1100,600],points,route:route.points,origin:{east:708700,north:5164300,alt:2500}}));
console.log(JSON.stringify(points.filter(p=>p[0]%100===0&&p[1]%100===0)));
