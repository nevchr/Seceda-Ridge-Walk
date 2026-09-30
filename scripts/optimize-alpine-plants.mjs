import fs from 'node:fs/promises';
import * as THREE from 'three';
import {SimplifyModifier} from 'three/addons/modifiers/SimplifyModifier.js';
const dir='assets/models/dandelion_01',src=JSON.parse(await fs.readFile(`${dir}/model.gltf`)),bin=await fs.readFile(`${dir}/dandelion_01.bin`);
const result={...src,nodes:[],meshes:[],accessors:[],bufferViews:[],buffers:[],scenes:[{nodes:[]}],scene:0},chunks=[],report=[];let offset=0;
function read(i){const a=src.accessors[i],b=src.bufferViews[a.bufferView],n={VEC3:3,VEC2:2,SCALAR:1}[a.type],T={5126:Float32Array,5123:Uint16Array,5125:Uint32Array}[a.componentType];return {array:new T(bin.buffer.slice(bin.byteOffset+(b.byteOffset||0)+(a.byteOffset||0),bin.byteOffset+(b.byteOffset||0)+(a.byteOffset||0)+a.count*n*T.BYTES_PER_ELEMENT)),n};}
function write(attr,type){let a=attr.array;const buffer=Buffer.from(a.buffer,a.byteOffset,a.byteLength),pad=(4-buffer.length%4)%4;result.bufferViews.push({buffer:0,byteOffset:offset,byteLength:buffer.length});chunks.push(buffer,Buffer.alloc(pad));offset+=buffer.length+pad;result.accessors.push({bufferView:result.bufferViews.length-1,componentType:a instanceof Float32Array?5126:a instanceof Uint16Array?5123:5125,count:attr.count,type});return result.accessors.length-1;}
for(const i of [2,3,4]){
 const primitive=src.meshes[i].primitives[0],g=new THREE.BufferGeometry();
 for(const [key,name] of [['POSITION','position'],['NORMAL','normal'],['TEXCOORD_0','uv']]){const a=read(primitive.attributes[key]);g.setAttribute(name,new THREE.BufferAttribute(a.array,a.n));}
 g.setIndex(new THREE.BufferAttribute(read(primitive.indices).array,1));
 const reduced=new SimplifyModifier().modify(g,Math.floor(g.attributes.position.count*.72));reduced.computeVertexNormals();
 const attributes={POSITION:write(reduced.attributes.position,'VEC3'),NORMAL:write(reduced.attributes.normal,'VEC3'),TEXCOORD_0:write(reduced.attributes.uv,'VEC2')};
 const name=`Dandelion rosette ${i-2}`;result.nodes.push({mesh:result.meshes.length,name});result.scenes[0].nodes.push(result.nodes.length-1);result.meshes.push({name,primitives:[{attributes,indices:write(reduced.index,'SCALAR'),material:0}]});report.push({name,sourceTriangles:g.index.count/3,triangles:reduced.index.count/3,vertices:reduced.attributes.position.count});
}
result.buffers=[{uri:'optimized.bin',byteLength:offset}];
await fs.writeFile(`${dir}/optimized.bin`,Buffer.concat(chunks));await fs.writeFile(`${dir}/optimized.gltf`,JSON.stringify(result));await fs.writeFile(`${dir}/optimization.json`,JSON.stringify({source:'model.gltf',method:'Three.js SimplifyModifier 72% vertex reduction, preserve UVs, recompute normals; CC0 derivative',report,bytes:offset},null,2));console.log(report);
