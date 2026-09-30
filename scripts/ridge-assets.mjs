import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const hash=(b,alg)=>crypto.createHash(alg).update(b).digest('hex');
function sources(o,out=[]){if(!o||typeof o!=='object')return out;if(o.url&&o.md5)out.push(o);for(const v of Object.values(o))if(v&&typeof v==='object')sources(v,out);return out;}
for(const asset of [
 {id:'marble_cliff_05',name:'Marble Cliff 05',authors:{'Amal Kumar':'All'},dir:'assets/materials',metadata:'assets/materials/marble_cliff_05-source.json',files:['marble_cliff_05.jpg','marble_cliff_05-height.png'],dimensions:[4096,2048],footprintMetres:20.002,usage:'Art-directed cliff ingredient, 20 m primary / 80 m macro triplanar sampling. This is a marble scan, not a geological survey of Seceda. Original files unchanged.'},
 {id:'grass_medium_01',name:'Grass Medium 01',authors:{'Rico Cilliers':'Modeling','Rob Tuytel':'Photography'},dir:'assets/models/grass_medium_01',metadata:'assets/models/grass_medium_01/source.json',files:['model.gltf','grass_medium_01.bin','textures/grass_medium_01_diff_1k.jpg','textures/grass_medium_01_nor_gl_1k.jpg','textures/grass_medium_01_arm_1k.jpg','textures/grass_medium_01_alpha_1k.jpg'],dimensions:[null,null,1024,1024,1024,1024],usage:'Four source clumps instanced near the camera, resized and tinted at runtime; original folded-leaf geometry supplies shorter cover beneath them. glTF image URIs changed to local JPEGs; explicit alpha map assigned by runtime. No user-reference pixels.'}
]){
 const upstream=sources(JSON.parse(await fs.readFile(asset.metadata,'utf8'))),files=[];
 for(const [i,name]of asset.files.entries()){
  const b=await fs.readFile(`${asset.dir}/${name}`),md5=hash(b,'md5'),match=upstream.find(x=>x.md5===md5);
  if(name!=='model.gltf')assert.ok(match,`No upstream MD5 match for ${name}`);
  files.push({name,bytes:b.length,width:asset.dimensions[i],height:asset.dimensions[i],md5,sha256:hash(b,'sha256'),source:match?.url??'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/grass_medium_01/grass_medium_01_1k.gltf',upstreamVerified:!!match,modified:name==='model.gltf'});
 }
 const result={name:asset.name,authors:asset.authors,assetURL:`https://polyhaven.com/a/${asset.id}`,license:'CC0 1.0',licenseURL:'https://polyhaven.com/license',retrieved:'2026-09-27',sourceFootprintMetres:asset.footprintMetres,usage:asset.usage,files,totalBytes:files.reduce((n,f)=>n+f.bytes,0)};
 await fs.writeFile(`${asset.dir}/${asset.id}-license.json`,JSON.stringify(result,null,2));console.log(asset.id,result.totalBytes);
}

