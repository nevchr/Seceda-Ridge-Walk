import * as THREE from 'three';
import {noise2} from './landscape.js';
import {groundMaterial} from './materials.js';
import {chipGeometry} from './jointed-rock.js';

export async function addCliffDebris(scene){
 const response=await fetch('./assets/geology/v09-talus.bin');if(!response.ok)throw Error('Could not load preserved cliff debris');
 const matrices=new Float32Array(await response.arrayBuffer());
 const m=new THREE.InstancedMesh(chipGeometry(817),groundMaterial(true),matrices.length/16);m.instanceMatrix.array.set(matrices);m.instanceMatrix.needsUpdate=true;m.name='Fracture talus aprons';m.receiveShadow=true;scene.add(m);
}

// Original erosion study applied INSIDE the V0.8 surface. No added block volumes.
// Existing borders, turf groups and their shared vertices stay fixed. Midpoints
// subdivide the original planes before recesses are carved into the rock faces.
export function refineCliff(mesh,rounds=2,applyRelief=true){
 const original=mesh.geometry,attrs={};
 for(const [name,a]of Object.entries(original.attributes))attrs[name==='normal'?'baseNormal':name]={size:a.itemSize,data:Array.from(a.array)};
 let faces=[];const idx=original.index.array;
 for(let i=0;i<idx.length;i+=3){const group=original.groups.find(g=>i>=g.start&&i<g.start+g.count);faces.push([idx[i],idx[i+1],idx[i+2],group?.materialIndex??0]);}
 const edgeKey=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`,counts=new Map(),locked=new Set();
 for(const [a,b,c,mat]of faces){for(const [u,v]of [[a,b],[b,c],[c,a]]){const k=edgeKey(u,v);counts.set(k,(counts.get(k)||0)+1);}if(mat===1){locked.add(a);locked.add(b);locked.add(c);}}
 let boundary=new Set();for(const [key,n]of counts)if(n===1){boundary.add(key);for(const v of key.split(':'))locked.add(Number(v));}
 for(const [a,b,c,m]of faces)if(m===1)for(const [u,v]of [[a,b],[b,c],[c,a]])boundary.add(edgeKey(u,v));
 const pin=new Array(original.attributes.position.count).fill(0);for(const v of locked)pin[v]=1;
 for(let pass=0;pass<rounds;pass++){
  const mids=new Map(),out=[],nextBoundary=new Set();
  const midpoint=(a,b)=>{const key=edgeKey(a,b);if(mids.has(key))return mids.get(key);const v=attrs.position.data.length/3;for(const {size,data}of Object.values(attrs))for(let j=0;j<size;j++)data.push((data[a*size+j]+data[b*size+j])*.5);const fixed=boundary.has(key);pin.push(fixed?1:(pin[a]+pin[b])*.15);if(fixed){nextBoundary.add(edgeKey(a,v));nextBoundary.add(edgeKey(v,b));}mids.set(key,v);return v;};
  for(const [a,b,c,m]of faces){const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);out.push([a,ab,ca,m],[ab,b,bc,m],[ca,bc,c,m],[ab,bc,ca,m]);}faces=out;boundary=nextBoundary;
 }
 for(const [a,b,c,m]of faces)if(m===1){pin[a]=1;pin[b]=1;pin[c]=1;}
 const g=new THREE.BufferGeometry();for(const [name,{data,size}]of Object.entries(attrs))g.setAttribute(name,new THREE.Float32BufferAttribute(data,size));
 const ordered=[];for(const m of [0,1]){const start=ordered.length;for(const f of faces)if(f[3]===m)ordered.push(f[0],f[1],f[2]);if(ordered.length>start)g.addGroup(start,ordered.length-start,m);}g.setIndex(ordered);g.computeVertexNormals();
 const pos=g.attributes.position,norm=g.attributes.normal,originalNormals=new Float32Array(norm.array),relief=[],base=new Float32Array(pos.array),smooth=THREE.MathUtils.smoothstep;
 let maxRecess=0,pinned=0;
 for(let i=0;i<pos.count;i++){
  const x=base[i*3],y=base[i*3+1],z=base[i*3+2],nx=norm.getX(i),ny=norm.getY(i),nz=norm.getZ(i);
  // Inclined, locally warped bedding intersected by two oblique joint families.
  // Unequal band intervals and finite joints avoid a repeating rectangular grid.
  const along=x*.32+z*.94,warp=(noise2(along*.017,y*.011)-.5)*13;
  const bed=y+along*.43+warp,band=bed/6.7+noise2(along*.012,y*.022)*1.7,phase=band-Math.floor(band);
  const bedCut=Math.pow(1-phase,11)*(.15+noise2(along*.08,Math.floor(band)*3.1)*.75);
  const jCoord=(along-y*.23+noise2(y*.013,along*.007)*23)/15.2;
  const joint=Math.exp(-Math.pow((jCoord-Math.round(jCoord))/.075,2))*smooth(noise2(along*.023,y*.044),.18,.62);
  const diagonal=(along*.73+y*.48+noise2(along*.019,y*.021)*11)/29.3;
  const cross=Math.exp(-Math.pow((diagonal-Math.round(diagonal))/.085,2))*smooth(noise2(along*.031+14,y*.022),.24,.65);
  const angular=Math.abs(noise2(along*.42,y*.33)*2-1),weather=noise2(along*.057,y*.038);
  const fade=(1-smooth(pin[i],0,.85))*(1-smooth(Math.abs(ny),.6,.92));
  const plane=Math.abs(noise2(along*.044+y*.008,y*.027)*2-1);
  const depth=applyRelief?(bedCut*.95+joint*3.1+cross*1.85+plane*.85+angular*.19)*fade:0;
  // Inward-only relief preserves the large envelope; untouched crests/bench
  // boundaries retain the exact V0.8 silhouette anchors.
  pos.setXYZ(i,x-nx*depth,y-ny*depth,z-nz*depth);
  maxRecess=Math.max(maxRecess,depth);if(fade===0)pinned++;
  relief.push(applyRelief?Math.min(1,(bedCut*.3+joint*.7+cross*.35)*fade):0,weather,0);
 }
 g.setAttribute('cliffRelief',new THREE.Float32BufferAttribute(relief,3));g.computeVertexNormals();
 // Subdivision alone must not turn the inherited smooth normals into hard dark
 // polygons. Add only the sculpt's normal delta to the V0.8 normal field.
 const v=new THREE.Vector3();for(let i=0;i<pos.count;i++){const n=g.attributes.normal,b=g.attributes.baseNormal;v.set(b.getX(i)+n.getX(i)-originalNormals[i*3],b.getY(i)+n.getY(i)-originalNormals[i*3+1],b.getZ(i)+n.getZ(i)-originalNormals[i*3+2]).normalize();n.setXYZ(i,v.x,v.y,v.z);}g.deleteAttribute('baseNormal');
 g.computeBoundingBox();g.computeBoundingSphere();
 mesh.geometry=g;
 const skin=mesh.name==='Survey-aligned fractured ridge';
 const rock=groundMaterial(!skin,skin,false,true);rock.vertexColors=!!g.attributes.color;rock.side=THREE.DoubleSide;
 if(Array.isArray(mesh.material))mesh.material=[rock,mesh.material[1]];else mesh.material=rock;
 mesh.userData.cliffRefinement={originalTriangles:idx.length/3,triangles:ordered.length/3,vertices:pos.count,pinnedVertices:pinned,maxRecessMetres:maxRecess,subdivisionRounds:rounds,bytes:Object.values(g.attributes).reduce((s,a)=>s+a.array.byteLength,0)+g.index.array.byteLength,bounds:{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()}};
 mesh.userData.v08Geometry=original;
 return mesh;
}
