import * as THREE from 'three';
import {routeDistance} from './terrain.js';
import {trailWidth,noise2} from './landscape.js';

// A small botanical prototype, deliberately restricted to twelve inspection
// pockets. Their metre coordinates can be moved without changing the base meadow.
export const clumpPockets=[
 [17.4,163,1.25],[13.2,161,1.1],[17.2,157,1.35],[12.8,155,1.15],
 [20,151,1.3],[77,13,1.5],[72,11,1.1],[79,7,1.2],
 [150,-116,1.4],[153,-119,1.5],[157,-116,1.3],[147,-115,1.1]
];
export function nearCoverScale(x,z){
 let influence=0;for(const [a,b,r] of clumpPockets)influence=Math.max(influence,1-THREE.MathUtils.smoothstep(Math.hypot(x-a,z-b),r*.8,r*1.55));
 return 1-influence*.82;
}
let seed=43910;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;}
function clumpGeometry(type){
 const positions=[],colours=[],indices=[],uv=[];
 for(let blade=0;blade<22;blade++){
  const angle=rand()*Math.PI*2,spread=rand()*.034,rootX=Math.cos(angle)*spread,rootZ=Math.sin(angle)*spread;
  const height=(type===1?.15:.20)+rand()*(type===2?.19:.14),reach=.06+rand()*.14;
  const halfWidth=.0015+rand()*.0025,turn=(rand()-.5)*.6,base=positions.length/3;
  const shade=.78+rand()*.32,dry=rand()<.09;
  // Folded cross section, curved centreline, narrow natural base and one tip.
  for(let j=0;j<4;j++){
   const t=j/4,w=halfWidth*Math.sin((.22+t*.78)*Math.PI),a=angle+turn*t;
   const x=rootX+Math.cos(a)*reach*t*t,z=rootZ+Math.sin(a)*reach*t*t,y=height*(t-.14*t*t*t);
   for(let k=-1;k<=1;k++){
    positions.push(x-Math.sin(a)*w*k,y+(k===0?w*.4:0),z+Math.cos(a)*w*k);uv.push((k+1)/2,t);
    const tip=THREE.MathUtils.smoothstep(t,.45,1.);
    colours.push((dry?.13:.046+tip*.022)*shade,(dry?.125:.108+tip*.037)*shade,(dry?.045:.018+tip*.011)*shade);
   }
  }
  positions.push(rootX+Math.cos(angle+turn)*reach,height*.86,rootZ+Math.sin(angle+turn)*reach);uv.push(.5,1);colours.push(.094*shade,.145*shade,.035*shade);
  for(let j=0;j<3;j++)for(let k=0;k<2;k++){const i=base+j*3+k;indices.push(i,i+1,i+3,i+1,i+4,i+3);}
  indices.push(base+9,base+10,base+12,base+10,base+11,base+12);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function addNearClumps(scene,terrain,route,materialFactory){
 const meshes=[],obj=new THREE.Object3D();
 for(let type=0;type<3;type++){
  const material=materialFactory();material.vertexColors=true;
  const mesh=new THREE.InstancedMesh(clumpGeometry(type),material,320);let n=0;
  for(let tries=0;tries<2400&&n<320;tries++){
   const [cx,cz,r]=clumpPockets[Math.floor(rand()*clumpPockets.length)],a=rand()*6.283,d=Math.sqrt(rand())*r;
   const x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,trail=routeDistance(route,x,z);
   if(trail.distance<trailWidth(trail.index)+.04||terrain.slope(x,z)>.85||noise2(x*2,z*2)<.28)continue;
   const scale=.66+rand()*.62;obj.position.set(x,terrain.height(x,z)-.015,z);obj.rotation.set(0,rand()*6.28,0);obj.scale.set(scale,scale,scale);obj.updateMatrix();mesh.setMatrixAt(n++,obj.matrix);
  }
  mesh.count=n;mesh.userData={fullCount:n,prototype:true,trianglesPerClump:mesh.geometry.index.count/3};mesh.name='Near meadow clump '+type;mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);meshes.push(mesh);
 }
 return meshes;
}
