import {addNearClumps,nearCoverScale} from './near-meadow.js';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {routeDistance} from './terrain.js';
import {noise2,trailWidth,landscapeMaps,shadowBounds} from './landscape.js';

// Authored botanical meshes. No reference photograph contributes pixels.
let seed=72109;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
const obj=new THREE.Object3D(),colour=new THREE.Color();
function plantMaterial(){
 const m=new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:1});
 m.onBeforeCompile=s=>{
  s.uniforms.windTime={value:0};s.uniforms.horizonMap={value:landscapeMaps.shadow};s.uniforms.cloudMap={value:landscapeMaps.cloud};s.uniforms.shadowBounds={value:shadowBounds};
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float windTime;varying vec3 plantWorld;varying float plantHeight;');
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float phase=instanceMatrix[3].x*.29+instanceMatrix[3].z*.21;
   transformed.x+=sin(windTime*1.35+phase)*position.y*position.y*.11;
   transformed.z+=cos(windTime*.9+phase)*position.y*position.y*.08;
   plantHeight=position.y;plantWorld=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;`);
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 plantWorld;varying float plantHeight;uniform sampler2D horizonMap,cloudMap;uniform vec4 shadowBounds;');
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   diffuseColor.rgb*=mix(.72,1.,smoothstep(0.,.23,plantHeight));`);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 vec3 leafUp=normalize(mat3(viewMatrix)*vec3(0.,1.,0.));normal=normalize(normal*.35+leafUp*.85);`);
  s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
   vec2 landUV=clamp((plantWorld.xz-shadowBounds.xy)/shadowBounds.zw,0.,1.);
   float exposure=texture2D(horizonMap,landUV).r*texture2D(cloudMap,landUV).r;
   reflectedLight.directDiffuse*=exposure;
   reflectedLight.indirectDiffuse*=.88;
   // A small transmitted component keeps thin leaves legible in back light.
   reflectedLight.indirectDiffuse+=diffuseColor.rgb*.14*exposure;`);
  m.userData.shader=s;
 };return m;
}
function blades(type){
 const p=[],uv=[],idx=[];
 const blades=type===2?5:7;
 for(let b=0;b<blades;b++){
  const a=b*2.399+random(),x=Math.cos(a)*.09,z=Math.sin(a)*.09;
  const h=type===0?.17+random()*.20:type===1?.24+random()*.27:.11+random()*.18;
  const width=type===2?.010+random()*.012:.003+random()*.008;
  const bend=(type===1?.24:.12)*(random()+.4),base=p.length/3;
  for(let j=0;j<4;j++){
   const t=j/3,w=width*(1-t)*(.75+Math.sin(t*Math.PI)*.8),lean=bend*t*t;
   for(const side of [-1,1]){p.push(x+Math.cos(a)*lean+Math.cos(a+Math.PI/2)*w*side,h*t,z+Math.sin(a)*lean+Math.sin(a+Math.PI/2)*w*side);uv.push((side+1)/2,t);}
  }
  for(let j=0;j<3;j++){const i=base+j*2;idx.push(i,i+1,i+2,i+1,i+3,i+2);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
function flower(type){
 const parts=[],h=type===0?.42:type===1?.25:.30;
 const stem=new THREE.CylinderGeometry(.0018,.0026,h,3).translate(0,h/2,0);parts.push(stem);
 const petals=type===0?12:type===1?9:7;
 for(let i=0;i<petals;i++){
  const a=i/petals*Math.PI*2,r=type===1?.013:.022;
  const petal=new THREE.SphereGeometry(1,4,2).scale(type===1?.010:.011,type===1?.018:.005,type===1?.012:.026);
  petal.rotateY(a).translate(Math.sin(a)*r,h+(type===1?.008:0),Math.cos(a)*r);parts.push(petal);
 }
 // Distinct silhouettes: radial yellow hawkweed, upright pink clover, white daisies.
 const centre=new THREE.SphereGeometry(type===0?.014:.009,6,3).scale(1,.6,1).translate(0,h+.005,0);parts.push(centre);
 const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());
 const colours=[];const pos=g.attributes.position;
 for(let i=0;i<pos.count;i++){
  const y=pos.getY(i),stem=y<h-.024;
  const c=stem?new THREE.Color(.038,.095,.016):type===0?new THREE.Color(.77,.51,.017):type===1?new THREE.Color(.55,.22,.32):new THREE.Color(.83,.80,.66);
  if(!stem&&Math.hypot(pos.getX(i),pos.getZ(i))<.012&&type!==1)c.setRGB(.66,.36,.02);
  colours.push(c.r,c.g,c.b);
 }
 g.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));return g;
}
export function addMeadow(scene,terrain,route){
 const mat=plantMaterial(),meshes=[],patches=[];
 for(let i=0;i<95;i++){
  const p=route.points[Math.floor(random()*421)];
  patches.push({x:p.x+(random()-.5)*26,z:p.z+(random()-.5)*16,r:1.3+random()*3.8,type:random()});
 }
 // Loose flower banks visible at walking height; longitudinal patches avoid polka dots.
 patches.push(...[[17.6,163,1.5],[19,159,2],[12,160,2],[23,151,3],[34,95,3],[76,14,2],[80,8,2.5],[86,-4,3],[119,-70,3],[153,-115,2.5]].map(([x,z,r])=>({x,z,r,type:.4})));
 const placement=(i,flowerType=-1)=>{
  let x,z,patch;
  if(random()<.68||flowerType>=0){patch=patches[Math.floor(random()*patches.length)];x=patch.x+(random()+random()-1)*patch.r*2;z=patch.z+(random()+random()-1)*patch.r*2;}
  else {const p=route.points[Math.floor(random()*421)];x=p.x+(random()-.5)*18;z=p.z+(random()-.5)*13;}
  const d=routeDistance(route,x,z),edge=trailWidth(d.index);
  if(d.distance<edge-.04+noise2(x*3,z*3)*.17||terrain.slope(x,z)>.85)return null;
  const cover=noise2(x*.31,z*.31)*.45+noise2(x*.084,z*.084)*.55;
  if(random()>Math.min(.98,.32+cover*.9))return null;
  if(flowerType>=0&&noise2(x*.21+flowerType*19,z*.19)<.35)return null;
  return {x,z,cover,type:patch?.type??cover};
 };
 for(let type=0;type<3;type++){
  const count=[43000,36000,13000][type],mesh=new THREE.InstancedMesh(blades(type),mat,count);let n=0;
  for(let a=0;n<count&&a<count*6;a++){
   const p=placement(a);if(!p)continue;
   const scale=.65+random()*.7;
   obj.position.set(p.x,terrain.height(p.x,p.z)-.018,p.z);obj.rotation.set(0,random()*6.28,0);const localCover=nearCoverScale(p.x,p.z);obj.scale.set(scale*Math.sqrt(localCover),scale*(.75+p.cover*.5)*localCover,scale*Math.sqrt(localCover));obj.updateMatrix();mesh.setMatrixAt(n,obj.matrix);
   const dry=p.type>.94,shade=.8+random()*.45;
   colour.setRGB(dry?.14:.032+p.cover*.035,dry?.125:.073+p.cover*.065,dry?.051:.012+p.cover*.017).multiplyScalar(shade);mesh.setColorAt(n++,colour);
  }
  mesh.count=n;mesh.userData.fullCount=n;mesh.receiveShadow=true;mesh.castShadow=true;mesh.computeBoundingSphere();scene.add(mesh);meshes.push(mesh);
 }
 for(let type=0;type<3;type++){
  const count=[4200,1500,1600][type],fm=plantMaterial();fm.vertexColors=true;const mesh=new THREE.InstancedMesh(flower(type),fm,count);let n=0;
  for(let a=0;n<count&&a<count*10;a++){
   const p=placement(a,type);if(!p)continue;
   const s=.72+random()*.6;obj.position.set(p.x,terrain.height(p.x,p.z)-.012,p.z);obj.rotation.set((random()-.5)*.20,random()*6.28,(random()-.5)*.20);obj.scale.set(s,s,s);obj.updateMatrix();mesh.setMatrixAt(n++,obj.matrix);
  }
  mesh.count=n;mesh.userData.fullCount=n;mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);meshes.push(mesh);
 }
 meshes.push(...addNearClumps(scene,terrain,route,plantMaterial));
 return {meshes,update(t){for(const m of meshes)if(m.material.userData.shader)m.material.userData.shader.uniforms.windTime.value=t;},setQuality(high){for(const m of meshes)m.count=high?(m.userData.fullCount??m.count):Math.floor((m.userData.fullCount??m.count)*.65);}};
}
