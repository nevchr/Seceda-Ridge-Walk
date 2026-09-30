import * as THREE from 'three';
import {noise2} from './landscape.js';
import {mappedCoverAt} from './land-cover.js';
import {inWalkingArea} from './exploration.js';
import {groundMaterial} from './materials.js';

// Low, fractured limestone exposures in thin-soil shoulders. Every basal
// vertex follows the native terrain; these are shallow surface details, not
// new mountain volumes. Walking ground and the established massif are clear.
export async function addGroundOutcrops(scene,terrain){
 const geo=new Uint8Array(await(await fetch('./assets/terrain-v14/geology.rgba')).arrayBuffer());
 const field=(x,z)=>{const i=THREE.MathUtils.clamp(Math.floor((x+6700)/5),0,2799),j=THREE.MathUtils.clamp(Math.floor((z+7700)/5),0,2399),k=(j*2800+i)*4;return [geo[k]/255,geo[k+1]/255,geo[k+2]/255];};
 const tiles=new Map();let exposures=0,plates=0;
 for(let z=-7450;z<4000;z+=37)for(let x=-6450;x<7050;x+=37){
  const xx=x+(noise2(x*.73,z*.57)-.5)*34,zz=z+(noise2(x*.83,z*.97)-.5)*34;
  if(inWalkingArea(xx,zz,55)||xx>-600&&xx<2960&&zz>-1470&&zz<260)continue;
  const f=field(xx,zz),cover=mappedCoverAt(xx,zz);
  if(f[0]<.075||f[0]>.40||cover[0]>.55||cover[2]>.62||f[1]>.62)continue;
  const weight=(cover[1]*.6+f[2]*.26+.05)*(1-cover[0]);
  if(noise2(x*2.33,z*3.37)>weight)continue;
  const h=terrain.height(xx,zz);if(h<-450||h>180)continue;
  const dx=(terrain.height(xx+3,zz)-terrain.height(xx-3,zz))/6,dz=(terrain.height(xx,zz+3)-terrain.height(xx,zz-3))/6;
  const a=Math.atan2(dx,-dz),ac=Math.cos(a),as=Math.sin(a),cluster=2+Math.floor(noise2(xx,zz)*4);
  const key=`${Math.floor(xx/384)},${Math.floor(zz/384)}`;if(!tiles.has(key))tiles.set(key,{p:[],c:[]});const buffer=tiles.get(key);
  const emit=(a,b,c,shade)=>{buffer.p.push(...a,...b,...c);for(const _ of [a,b,c])buffer.c.push(shade,shade*.99,shade*.96);};
  for(let k=0;k<cluster;k++){
   const seed=x+k*29.1,size=3.5+noise2(seed,z+21)*5.5,depth=2.2+noise2(seed+10,z)*3.4;
   const cx=xx+ac*(k-cluster*.5)*size*1.1+as*(noise2(seed,z+54)-.5)*5,cz=zz+as*(k-cluster*.5)*size*1.1-ac*(noise2(seed,z+54)-.5)*5;
   const top=[],base=[];
   for(let j=0;j<9;j++){
    const angle=j/9*Math.PI*2,r=.76+noise2(seed+j*11,z+5)*.35;
    const u=Math.cos(angle)*size*r,v=Math.sin(angle)*depth*r,px=cx+ac*u-as*v,pz=cz+as*u+ac*v;
    const ground=terrain.height(px,pz),edge=.04+noise2(seed+j*3,z+2)*.20;
    top.push([px,ground+edge,pz]);base.push([px,ground-2.5,pz]);
   }
   const center=[cx+ac*size*.17,terrain.height(cx+ac*size*.17,cz+as*size*.17)+.27+noise2(seed,z+35)*.58,cz+as*size*.17];
   // The offset arris and unequal perimeter produce intersecting sheets.
   // Chipped perimeter planes close below the sampled ground, hiding seams.
   for(let j=0;j<9;j++){
    const n=(j+1)%9;emit(top[n],top[j],center,.92+noise2(seed+j,z)*.12);
    emit(base[j],top[j],top[n],.72);emit(base[j],top[n],base[n],.75);
   }
   plates++;
  }
  exposures++;
 }
 let triangles=0;const material=groundMaterial(true,false,false,false,true);material.vertexColors=true;
 for(const [key,b]of tiles){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,material);m.name='Survey-fitted thin-soil limestone '+key;m.receiveShadow=true;scene.add(m);triangles+=b.p.length/9;
 }
 const info={exposures,plates,triangles,tiles:tiles.size,maxAuthoredVertexLiftMetres:.85,walkingAreaExcludedMetres:55,principalMassifExcluded:true,source:'Original shallow fractured exposures guided by mapped rock, native convexity and slope; no terrain or collision vertex is changed'};
 scene.userData.groundOutcrops=info;return {info};
}
