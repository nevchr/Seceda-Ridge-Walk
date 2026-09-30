import * as THREE from 'three';
import {mappedCoverAt} from './land-cover.js';
import {inWalkingArea} from './exploration.js';
import {noise2,landscapeMaps,shadowBounds} from './landscape.js';

// Original prostrate evergreen sprays, placed only in mapped dwarf shrub /
// wooded-pasture regions. Species/individual positions are an art interpretation.
function shrubGeometry(){
 const p=[],c=[];
 for(let branch=0;branch<7;branch++){
  const a=branch*2.399,r=.65+noise2(branch*17,71)*.65;
  for(let leaf=0;leaf<5;leaf++){
   const t=(leaf+1)/5,d=r*t,y=.12+Math.sin(t*2.15)*(.36+noise2(branch,19)*.27);
   const center=[Math.cos(a)*d,y,Math.sin(a)*d];
   const width=.13+(1-t)*.2,front=.26*(.8+t*.4);
   const transform=(u,v,h)=>[center[0]+Math.cos(a)*u-Math.sin(a)*v,center[1]+h,center[2]+Math.sin(a)*u+Math.cos(a)*v];
   const vertices=[transform(-front,0,-.03),transform(0,-width,0),transform(front,.02,-.09),transform(0,width,.02),transform(-front*.15,0,.16)];
   for(let side=0;side<4;side++)for(const vertex of [vertices[side],vertices[(side+1)%4],vertices[4]]){
    p.push(...vertex);const shade=.67+t*.27+noise2(branch*7,leaf*9)*.19;
    c.push(.054*shade,.098*shade,.031*shade);
   }
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();return g;
}
export async function addRegionalShrubs(scene,terrain){
 const geometry=shrubGeometry(),material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});
 material.onBeforeCompile=s=>{
  Object.assign(s.uniforms,{shrubHorizon:{value:landscapeMaps.shadow},shrubCloud:{value:landscapeMaps.cloud},shrubBounds:{value:shadowBounds}});
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 shrubWorld;');
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n shrubWorld=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 shrubWorld;uniform sampler2D shrubHorizon,shrubCloud;uniform vec4 shrubBounds;');
  s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n vec2 uv=(shrubWorld.xz-shrubBounds.xy)/shrubBounds.zw;reflectedLight.directDiffuse*=texture2D(shrubHorizon,uv).r*texture2D(shrubCloud,uv).r;');
 };
 const tiles=new Map(),o=new THREE.Object3D();let count=0;
 for(let z=-7500;z<4000;z+=7)for(let x=-6400;x<7100;x+=7){
  const xx=x+(noise2(x*3.17,z*4.79)-.5)*10,zz=z+(noise2(x*4.83,z*3.61)-.5)*10;
  const cover=mappedCoverAt(xx,zz);if(cover[3]<.18||noise2(xx*1.37,zz*1.29)>cover[3]*.82||inWalkingArea(xx,zz,25))continue;
  const h=terrain.height(xx,zz),s=terrain.slope(xx,zz);if(h<-600||h>130||s>1.05)continue;
  const patch=noise2(xx*.018,zz*.018);if(patch<.28)continue;
  const size=1.2+noise2(xx*.87,zz*.63)*2.1;
  o.position.set(xx,h-.10,zz);o.rotation.set(0,noise2(xx*3,zz*7)*6.28,0);o.scale.set(size,size*(.5+patch*.55),size);o.updateMatrix();
  const key=`${Math.floor(xx/384)},${Math.floor(zz/384)}`;if(!tiles.has(key))tiles.set(key,[]);tiles.get(key).push(o.matrix.clone());count++;
 }
 for(const [key,items]of tiles){const m=new THREE.InstancedMesh(geometry,material,items.length);m.name='Mapped dwarf shrub study '+key;items.forEach((a,i)=>m.setMatrixAt(i,a));m.computeBoundingSphere();scene.add(m);}
 const info={instances:count,trianglesPerInstance:geometry.attributes.position.count/3,tiles:tiles.size,instanceBytes:count*64,source:'Original low evergreen sprays in provincial historical dwarf-shrub / wooded-pasture classes; individual plants authored',walkingAreaExcludedMetres:25};
 scene.userData.regionalShrubs=info;return {info};
}
