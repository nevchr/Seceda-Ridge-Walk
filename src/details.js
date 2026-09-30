import {chipGeometry} from './jointed-rock.js';
import * as THREE from 'three';
import {groundMaterial} from './materials.js';
import {routeDistance} from './terrain.js';
import {noise2,meadowPatch,trailWidth,landscapeMaps,shadowBounds,SUN_DIRECTION} from './landscape.js';
let seed=28940;
export function rand(){seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;}
const normalAt=(t,x,z)=>new THREE.Vector3(t.height(x-1,z)-t.height(x+1,z),2,t.height(x,z-1)-t.height(x,z+1)).normalize();

// The trail is now a worn material blended into the survey surface, not a ribbon.
export function addTrail(){}

export function addRocks(scene,terrain,route){
 const mat=groundMaterial(true),o=new THREE.Object3D(),colliders=[];
 const geo=chipGeometry(29);const rocks=new THREE.InstancedMesh(geo,mat,1500);
 // A few half-buried outcrops, each with a downslope apron of small fragments.
 const centres=[[22,159,.65],[80,9,.8],[-4,146,1.1],[38,105,.85],[42,68,1.25],[92,30,.7],[63,-5,1.05],[113,-44,.7],[128,-84,1.3],[172,-109,.7]];
 let n=0;
 for(const [cx,cz,size] of centres){
  for(let j=0;j<58;j++){
   const leader=j<3,angle=rand()*6.28,r=leader?rand()*1.5:Math.pow(rand(),.6)*5.8;
   let x=cx+Math.cos(angle)*r,z=cz+Math.sin(angle)*r+(leader?0:r*.48);
   const s=leader?size*(.75+rand()*.6):.045+Math.pow(rand(),3)*.40,d=routeDistance(route,x,z);
   if(d.distance<trailWidth(d.index)+s+.42)continue;
   o.position.set(x,terrain.height(x,z)-s*.15,z);o.rotation.set(.1+rand()*.28,1.9+rand()*.4,(rand()-.5)*.35);o.scale.set(s*1.25,s*.62,s*.75);o.updateMatrix();rocks.setMatrixAt(n++,o.matrix);
   if(s>.38)colliders.push({x,z,r:s*1.1});
  }
 }
 // A small quantity of exposed gravel actually embedded in the path margins.
 for(let i=0;i<850;i++){
  const index=Math.floor(rand()*route.points.length),p=route.points[index],x=p.x+(rand()-.5)*2.2,z=p.z+(rand()-.5)*2.2,d=routeDistance(route,x,z);
  if(d.distance<trailWidth(index)*.8||d.distance>trailWidth(index)+.6)continue;
  const s=.015+rand()*.043;o.position.set(x,terrain.height(x,z)+s*.08,z);o.rotation.set(0,rand()*6,0);o.scale.set(s*1.6,s*.35,s);o.updateMatrix();rocks.setMatrixAt(n++,o.matrix);
 }
 rocks.count=n;rocks.castShadow=rocks.receiveShadow=true;scene.add(rocks);return colliders;
}

export function addCliffFaces(scene,terrain){
 // A continuous fracture skin sampled at 4 m; no independent rectangular panels.
 // Relief is authored, limited to 1.1–6.5 m, outside the walkable meadow.
 const positions=[],anchors=[],indices=[],norm=new THREE.Vector3(),vertices=new Map();
 function vertex(x,z){
  const key=x+','+z;if(vertices.has(key))return vertices.get(key);
  const y=terrain.height(x,z);norm.copy(normalAt(terrain,x,z));
  const bed=y*.18+x*.035+noise2(x*.013,z*.013)*1.6;
  const ledge=Math.pow(1-(bed-Math.floor(bed)),3)*2.6;
  const ribs=Math.pow(noise2(x*.20,z*.20),2)*2.2;
  const relief=1.1+ledge+ribs;
  const i=positions.length/3;anchors.push(x,y,z);positions.push(x+norm.x*relief,y+norm.y*relief,z+norm.z*relief);vertices.set(key,i);return i;
 }
 for(let x=210;x<3370;x+=4)for(let z=-1830;z<20;z+=4){
  if(terrain.slope(x+2,z+2)<1.02||terrain.height(x,z)<-420)continue;
  const a=vertex(x,z),b=vertex(x+4,z),c=vertex(x,z+4),d=vertex(x+4,z+4);indices.push(a,c,b,b,c,d);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('surveyPosition',new THREE.Float32BufferAttribute(anchors,3));g.setIndex(indices);g.computeVertexNormals();
 const m=groundMaterial(false,true);m.side=THREE.DoubleSide;const mesh=new THREE.Mesh(g,m);mesh.receiveShadow=true;scene.add(mesh);
 // Broken buttresses and talus at steep surveyed rock transitions. The anchors
 // use the same metric frame and DTM, and remain outside player collision bounds.
 const shardGeo=new THREE.IcosahedronGeometry(1,0),v=shardGeo.attributes.position;
 for(let i=0;i<v.count;i++){const y=v.getY(i);v.setY(i,y+(y>0?noise2(v.getX(i)*10,v.getZ(i)*10)*.22:0));}shardGeo.computeVertexNormals();
 const shards=new THREE.InstancedMesh(shardGeo,groundMaterial(true),1400),o=new THREE.Object3D();let n=0;
 for(let x=242;x<1650;x+=17)for(let z=-1000;z<0;z+=21){
  const xx=x+noise2(x,z)*12,zz=z+noise2(z,x)*15,slope=terrain.slope(xx,zz),h=terrain.height(xx,zz);
  if(slope<1.15||slope>3.4||h< -190||noise2(xx*.12,zz*.12)<.68||n>=1400)continue;
  const normal=normalAt(terrain,xx,zz),size=2+noise2(xx,zz)*4;
  o.position.set(xx-normal.x*size*.2,h-size*.3,zz-normal.z*size*.2);o.rotation.set(.12,noise2(xx*.5,zz*.5)*6.28,.12);o.scale.set(size*.85,size*(1.9+noise2(zz,xx)),size*.62);o.updateMatrix();shards.setMatrixAt(n++,o.matrix);
 }
 shards.count=n;shards.receiveShadow=true;scene.add(shards);mesh.userData.buttresses=n;return mesh;
}
export function addMarkers(scene,terrain,route){const timber=new THREE.MeshStandardMaterial({color:0x62513b,roughness:1});const ropeMat=new THREE.MeshStandardMaterial({color:0x9e9273,roughness:1});const colliders=[];
const post=(x,z,h=1.15)=>{const y=terrain.height(x,z);const m=new THREE.Mesh(new THREE.CylinderGeometry(.052,.075,h,7),timber);m.position.set(x,y+h/2,z);m.castShadow=true;scene.add(m);colliders.push({x,z,r:.14});return new THREE.Vector3(x,y+h*.78,z);};
// A modest timber destination marker, visible above the final meadow rise.
const end=route.points.at(-1);post(end.x-4.8,end.z+1.8,3.8);let beam=new THREE.Mesh(new THREE.BoxGeometry(1.5,.16,.15),timber);beam.position.set(end.x-4.8,terrain.height(end.x-4.8,end.z+1.8)+2.9,end.z+1.8);beam.castShadow=true;scene.add(beam);
const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle='#d4c7a7';ctx.fillRect(0,0,512,160);ctx.fillStyle='#394039';ctx.font='bold 31px Segoe UI';ctx.fillText('SECEDA  /  ODLE',28,62);ctx.font='23px Segoe UI';ctx.fillText('RIDGE VIEWPOINT     ↗',28,113);const sign=new THREE.Mesh(new THREE.BoxGeometry(1.1,.35,.045),[timber,timber,timber,timber,new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(canvas),roughness:1}),timber]);const p=route.points[12];sign.position.set(p.x+2.5,terrain.height(p.x+2.5,p.z)+1.4,p.z+.085);post(p.x+2.5,p.z,1.7);scene.add(sign);
const railing=[];for(let i=300;i<420;i+=12){const p=route.points[i];railing.push(post(p.x-2.3,p.z-1.4));}for(let i=1;i<railing.length;i++){const a=railing[i-1],b=railing[i],mid=a.clone().lerp(b,.5);mid.y-=.12;const curve=new THREE.CatmullRomCurve3([a,mid,b]);scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,8,.016,4,false),ropeMat));}return colliders;}
