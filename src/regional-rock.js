import * as THREE from 'three';
import {noise2} from './landscape.js';
import {inWalkingArea} from './exploration.js';
import {groundMaterial} from './materials.js';
import {ORIGIN} from './terrain.js';

// Scenic face detail over the existing survey, including the coarser southern
// surroundings. This is original rock art, not additional measured elevation.
// World-coordinate fields join at tile edges and leave crests/foot slopes alone.
export function addRegionalRock(scene,terrain){
 const material=groundMaterial(false,true,false,true);material.vertexColors=true;material.side=THREE.DoubleSide;
 const tiles=[],step=8,span=256;let triangles=0,vertices=0,maxOffset=0;
 const smooth=THREE.MathUtils.smoothstep;
 function exposure(x,z){
  if(inWalkingArea(x,z,50))return 0;
  // Resampling joins are not geological fractures. A finite-difference slope
  // across a 5 m / 40 m raster boundary can create a false narrow rock fin.
  let surveyJoin=1;
  for(const l of terrain.layers.slice(0,-1)){
   const x0=l.bbox[0]-ORIGIN.east,x1=l.bbox[2]-ORIGIN.east,z0=ORIGIN.north-l.bbox[3],z1=ORIGIN.north-l.bbox[1];
   if(x<x0-80||x>x1+80||z<z0-80||z>z1+80)continue;
   const edge=Math.min(Math.abs(x-x0),Math.abs(x-x1),Math.abs(z-z0),Math.abs(z-z1));surveyJoin*=smooth(edge,20,80);
  }
  // The preserved principal massif already has a finer authored skin.
  const outside=Math.max(smooth(x,2820,2900),smooth(z,160,240),1-smooth(x,260,340),1-smooth(z,-1350,-1250));
  const slope=terrain.slope(x,z),h=terrain.height(x,z);
  return outside*surveyJoin*smooth(slope,.62,1.12)*smooth(h,-410,-230);
 }
 function vertex(x,z){
  const y=terrain.height(x,z),dx=(terrain.height(x+6,z)-terrain.height(x-6,z))/12,dz=(terrain.height(x,z+6)-terrain.height(x,z-6))/12;
  const n=new THREE.Vector3(-dx,1,-dz).normalize(),weight=exposure(x,z);
  const along=x*.47+z*.88,bend=(noise2(along*.008,y*.006)-.5)*22;
  const rib=Math.abs(noise2(along*.026+y*.005,y*.010)*2-1);
  const bed=noise2((y+along*.28+bend)*.080,along*.019);
  const joint=Math.pow(1-Math.abs(noise2(along*.039-y*.014,y*.017)*2-1),14);
  const relief=(2.5+rib*8.0+bed*3.5-joint*2.1)*weight+.025;
  maxOffset=Math.max(maxOffset,relief);
  // Sink the skirt into the original rock as exposure vanishes. A raised,
  // abruptly clipped patch leaves a visible saw edge against the survey.
  return {p:[x+n.x*relief,y+n.y*relief*.18-14*(1-weight)**2,z+n.z*relief],survey:[x,y,z],relief:[joint*.5,bed,0],shade:.79+rib*.17+bed*.04};
 }
 for(let z=-5888;z<3328;z+=span)for(let x=-3328;x<6912;x+=span){
  if(Math.hypot(x+128-450,z+128-180)>6500)continue;
  let candidate=false;for(let dz=0;dz<=span;dz+=64)for(let dx=0;dx<=span;dx+=64)if(exposure(x+dx,z+dz)>.12)candidate=true;
  if(!candidate)continue;
  const p=[],survey=[],relief=[],col=[],normals=[],ix=[],lookup=new Map();
  const add=(xx,zz)=>{const key=xx+','+zz;if(lookup.has(key))return lookup.get(key);const a=vertex(xx,zz),i=p.length/3;p.push(...a.p);survey.push(...a.survey);relief.push(...a.relief);col.push(a.shade,a.shade,a.shade);
   const px=new THREE.Vector3().fromArray(vertex(xx+4,zz).p).sub(new THREE.Vector3().fromArray(vertex(xx-4,zz).p));
   const pz=new THREE.Vector3().fromArray(vertex(xx,zz+4).p).sub(new THREE.Vector3().fromArray(vertex(xx,zz-4).p));
   normals.push(...pz.cross(px).normalize().toArray());lookup.set(key,i);return i;};
  for(let dz=0;dz<span;dz+=step)for(let dx=0;dx<span;dx+=step){
   const xx=x+dx,zz=z+dz;if(exposure(xx+step*.5,zz+step*.5)<.018)continue;
   const a=add(xx,zz),b=add(xx+step,zz),c=add(xx,zz+step),d=add(xx+step,zz+step);ix.push(a,c,b,b,c,d);
  }
  if(!ix.length)continue;
  const g=new THREE.BufferGeometry();for(const [name,data]of [['position',p],['surveyPosition',survey],['cliffRelief',relief],['color',col],['normal',normals]])g.setAttribute(name,new THREE.Float32BufferAttribute(data,3));g.setIndex(ix);g.computeBoundingSphere();
  const mesh=new THREE.Mesh(g,material);mesh.name=`Regional survey limestone ${x},${z}`;mesh.receiveShadow=true;mesh.userData.massifCaster=true;scene.add(mesh);tiles.push(mesh);triangles+=ix.length/3;vertices+=p.length/3;
 }
 const info={tiles:tiles.length,triangles,vertices,authoredSampleMetres:step,maxOffsetMetres:maxOffset,walkingClearanceMetres:50,source:'Existing survey only; interpolated scenic face art, no new elevation data or walking area'};scene.userData.regionalRock=info;
 return {tiles,info};
}
