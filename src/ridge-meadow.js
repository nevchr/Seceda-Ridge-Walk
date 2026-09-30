import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import {plantMaterial} from './botanical-material.js';
import {alpinePlant} from './alpine-plants.js';
import {ORIGIN} from './terrain.js';
import {noise2,visualTrailWidth,trailEdge} from './landscape.js';
import {meadowHabitatAt} from './meadow-habitat.js';

let seed=860341;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
const c=new THREE.Color(),o=new THREE.Object3D();
export async function addMeadow(scene,terrain,route){
 const loaded=await new GLTFLoader().loadAsync('./assets/models/grass_medium_01/model.gltf');
 const originals=['grass_medium_01_tiny_a_LOD0','grass_medium_01_tall_b_LOD0'].map(name=>loaded.scene.getObjectByName(name));
 const naturalMaterial=plantMaterial(originals[0].material,1.1,135);
 naturalMaterial.side=THREE.DoubleSide;naturalMaterial.roughness=1;naturalMaterial.normalScale.set(.5,.5);naturalMaterial.transparent=false;naturalMaterial.depthWrite=true;naturalMaterial.alphaTest=.38;naturalMaterial.alphaToCoverage=true;
 naturalMaterial.alphaMap=await new THREE.TextureLoader().loadAsync('./assets/models/grass_medium_01/textures/grass_medium_01_alpha_1k.jpg');naturalMaterial.alphaMap.flipY=false;
 const naturalGeo=originals.map((m,i)=>m.geometry.clone().scale(i?1.05:1.8,i?.82:1.45,i?1.05:1.8));
 const naturalFar=['grass_medium_01_tiny_d_LOD0','grass_medium_01_tiny_c_LOD0'].map((name,i)=>loaded.scene.getObjectByName(name).geometry.clone().scale(i?3.4:2.0,i?2.8:3.5,i?3.4:2.0));
 const rosettes=await new GLTFLoader().loadAsync('./assets/models/dandelion_01/optimized.gltf');
 const rosetteGeo=rosettes.scene.children.map(m=>m.geometry.clone().scale(1.05,.90,1.05));
 const rosetteMaterial=plantMaterial(rosettes.scene.children[0].material,.95,135);
 rosetteMaterial.alphaMap=await new THREE.TextureLoader().loadAsync('./assets/models/dandelion_01/textures/dandelion_01_alpha_1k.jpg');rosetteMaterial.alphaMap.flipY=false;rosetteMaterial.alphaTest=.42;rosetteMaterial.alphaToCoverage=true;rosetteMaterial.normalScale.set(.65,.65);rosetteMaterial.side=THREE.DoubleSide;
 const dandelionGeo=alpinePlant(0,false,0,true),dandelionFar=alpinePlant(0,true,0,true);
 const dandelionMaterial=plantMaterial(rosettes.scene.children[0].material,1,120,true);dandelionMaterial.alphaMap=rosetteMaterial.alphaMap;dandelionMaterial.alphaTest=.4;dandelionMaterial.alphaToCoverage=true;dandelionMaterial.normalScale.set(.5,.5);dandelionMaterial.side=THREE.DoubleSide;
 const material=plantMaterial(null,1,120);material.vertexColors=true;
 const flowers=Array.from({length:5},(_,t)=>[alpinePlant(t),alpinePlant(t,true)]);
 const tiles=[],meshes=[],cell=24,cache=new Map();
 const survey=terrain.layers[0],bounds={x0:survey.bbox[0]-ORIGIN.east,z0:ORIGIN.north-survey.bbox[3],x1:survey.bbox[2]-ORIGIN.east,z1:ORIGIN.north-survey.bbox[1]};
 const nearRoute=(x,z)=>{let min=Infinity,index=0;for(let i=0;i<route.points.length;i+=7){const p=route.points[i],d=(p.x-x)**2+(p.z-z)**2;if(d<min){min=d;index=i;}}const center=index;for(let i=Math.max(0,center-7);i<=Math.min(route.points.length-1,center+7);i++){const p=route.points[i],d=(p.x-x)**2+(p.z-z)**2;if(d<min){min=d;index=i;}}return {distance:Math.sqrt(min),index};};
 function buildTile(x,z){
  seed=(Math.imul(x,73856093)^Math.imul(z,19349663)^860341)>>>0;
  const tile={x:x+12,z:z+12,near:[],mid:[],level:-1};
  const matrices=Array.from({length:9},()=>[]),colours=Array.from({length:9},()=>[]);
  for(let i=0;i<4800;i++){
   const xx=x+random()*cell,zz=z+random()*cell,d=nearRoute(xx,zz),slope=terrain.slope(xx,zz);
   const margin=d.distance+trailEdge(xx,zz)-visualTrailWidth(d.index,xx,zz);
   if(slope>1.0||margin<.06)continue;
   const [lush,thin,shelter,colony]=meadowHabitatAt(xx,zz);
   if(random()<thin*.84)continue;
   const bank=noise2(xx*.31+5,zz*.31-8)*.58+noise2(xx*.11-11,zz*.11+21)*.42;
   const flowering=random()<(.07+Math.pow(colony,1.45)*.76)*(margin<.6?.42:1);
   let species;
   if(flowering){
    // Mixed colonies: no threshold chooses one species for an entire broad band.
    const r=random(),yellow=.51+bank*.15,pink=yellow+.14;
    species=r<yellow?0:r<pink?1:r<.975?2:3;
   }else{
    if(random()>.32+lush*.30)continue;
    const r=random();species=r<.62?5:r<.90?6:r<.965?4:7+i%2;
   }
   let scale=flowering?.83+random()*.64: .68+random()*.48+lush*.20;
   if(species===3)scale*=.65;
   const dx=(terrain.height(xx+.3,zz)-terrain.height(xx-.3,zz))/.6,dz=(terrain.height(xx,zz+.3)-terrain.height(xx,zz-.3))/.6;
   o.position.set(xx,terrain.height(xx,zz)+.004,zz);
   o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-dx*.30,1,-dz*.30).normalize());o.rotateY(random()*6.283);o.scale.set(scale,scale*(.78+random()*.3),scale);o.updateMatrix();matrices[species].push(o.matrix.clone());
   const tone=.78+random()*.38; c.setRGB(tone*(1.03+(1-shelter)*.12),tone,tone*(.88+random()*.13));colours[species].push(c.clone());
  }
  function instance(g,ms,colors,level,name,mat){
   if(!ms.length)return;const m=new THREE.InstancedMesh(g,mat,ms.length);
   ms.forEach((matrix,i)=>{m.setMatrixAt(i,matrix);m.setColorAt(i,colors[i]);});
   m.name=name;m.receiveShadow=true;m.castShadow=false;m.computeBoundingSphere();m.visible=false;m.userData.fullCount=m.count;scene.add(m);meshes.push(m);tile[level===0?'near':'mid'].push(m);
  }
  for(let level=0;level<2;level++)for(let t=0;t<9;t++){
   const geometry=t===0?(level?dandelionFar:dandelionGeo):t===4&&!level?rosetteGeo[0]:t>=7?(level?flowers[4][1]:rosetteGeo[t-6]):t<5?flowers[t][level]:(level?naturalFar[t-5]:naturalGeo[t-5]);
   const mat=t===0?dandelionMaterial:(t===4&&!level||t>=7&&!level)?rosetteMaterial:t<5||t>=7?material:naturalMaterial;
   instance(geometry,matrices[t],colours[t],level,`Alpine bank ${x},${z} species ${t} LOD${level}`,mat);
  }
  if(tile.near.length)tiles.push(tile);cache.set(`${x},${z}`,tile);return tile;
 }
 let high=true,oldCell='',queue=[];
 const info={cellMetres:24,residentTiles:0,pending:0,streamRadius:148,evictRadius:205};
 return {enabled:true,meshes,tiles,info,update(t,camera){
  for(const mat of [material,naturalMaterial,rosetteMaterial,dandelionMaterial])if(mat.userData.shader){mat.userData.shader.uniforms.windTime.value=t;if(camera)mat.userData.shader.uniforms.eyePosition.value.copy(camera.position);}
  if(!camera)return false;let changed=false;
  const cx=Math.floor(camera.position.x/cell),cz=Math.floor(camera.position.z/cell),key=cx+','+cz;
  if(key!==oldCell){oldCell=key;queue=[];
   for(let x=cx-7;x<=cx+7;x++)for(let z=cz-7;z<=cz+7;z++){
    const xx=x*cell,zz=z*cell,d=Math.hypot(xx+12-camera.position.x,zz+12-camera.position.z);
    if(d>148||xx<bounds.x0+cell||xx>bounds.x1-cell*1.5||zz<bounds.z0+cell||zz>bounds.z1-cell*1.5||cache.has(xx+','+zz))continue;
    if(terrain.slope(xx+12,zz+12)>1.0)continue;queue.push({x:xx,z:zz,d});
   }queue.sort((a,b)=>a.d-b.d);
   for(let i=tiles.length-1;i>=0;i--){const tile=tiles[i];if(Math.hypot(tile.x-camera.position.x,tile.z-camera.position.z)<205)continue;
    for(const m of [...tile.near,...tile.mid]){scene.remove(m);m.dispose();const k=meshes.indexOf(m);if(k>=0)meshes.splice(k,1);}cache.delete((tile.x-12)+','+(tile.z-12));tiles.splice(i,1);}
  }
  // At most one new tile per frame. Placement is deterministic in world metres.
  if(queue.length){const tile=queue.shift();buildTile(tile.x,tile.z);changed=true;}
  info.residentTiles=tiles.length;info.pending=queue.length;
  for(const tile of tiles){const d=Math.hypot(camera.position.x-tile.x,camera.position.z-tile.z),near=high?28:21;
   const level=this.enabled?(d<(tile.level===0?near+4:near)?0:d<132?1:2):2;
   if(tile.level!==level){changed=true;tile.level=level;for(const m of tile.near)m.visible=level===0;for(const m of tile.mid)m.visible=level===1;}
  }
  return changed;
 },setQuality(value){high=value;}};
}
