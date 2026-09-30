import {landformField} from './landform.js';
import * as THREE from 'three';
import {noise2} from './landscape.js';
import {groundMaterial} from './materials.js';

const tops=[];

// Original surface sculpture, in metres. This is a connected erosion of the
// inherited ledge, not a collection of replacement blocks or a photo mesh.
export function prepareLedgeCoordinates(mesh){
 const a=[],depths=[0,3,19,19.2,37,37.2,59,59.2,85,85.2,116];
 for(const [f,width]of [122,115,96].entries())for(let k=0;k<=72;k++)for(const d of depths)a.push(k/72*width,d,f);
 if(a.length!==mesh.geometry.attributes.position.count*3)throw Error('Ledge coordinate topology changed');
 for(let form=0;form<3;form++){tops[form]=[];for(let k=0;k<=72;k++)tops[form].push(mesh.geometry.attributes.position.getY((form*73+k)*11));}
 // Break the inherited even shelf spacing before subdivision; keep top/foot anchors.
 const p=mesh.geometry.attributes.position;
 for(let f=0;f<3;f++)for(let k=0;k<=72;k++){
  const u=k/72*[122,115,96][f],edge=Math.pow(Math.sin(k/72*Math.PI),.65);
  for(let j=1;j<10;j++){
   const i=(f*73+k)*11+j,band=Math.floor(j/2),shift=(noise2(u*.019+band*17,f*41+band*3)-.5)*22*edge;
   p.setY(i,p.getY(i)+shift);
   if(j===3||j===5||j===7||j===9){
    const prev=i-1,keep=.025+Math.pow(noise2(u*.047,band*41+f),2.3)*.88;
    p.setX(i,p.getX(prev)+(p.getX(i)-p.getX(prev))*keep);
   }
  }
 }
 mesh.geometry.computeVertexNormals();mesh.geometry.setAttribute('ledgeCoord',new THREE.Float32BufferAttribute(a,3));return mesh;
}

const bedSets=[0,1,2].map(form=>{
 const beds=[-400];for(let i=0;beds.at(-1)<450;i++)beds.push(beds.at(-1)+1.1+noise2(i*13.71,form*79+14)*4.8);return beds;
});
function fractureField(u,d,form,worldY){
 // Unequal inclined bedding, interrupted by finite shear joints. Each bed has
 // its own thickness and projecting lip; no closed rectangular fracture cells.
 let t=-worldY-u*(.88+form*.14)-(noise2(u*.018,form+9)-.5)*9;
 // Bedding offsets across a shear are local, not a new stack of solid blocks.
 const shear=u-[122,115,96][form]*.35+d*.25;
 t+=THREE.MathUtils.smoothstep(shear,-.7,.7)*2.3;
 const beds=bedSets[form];let k=0;while(k<beds.length-2&&beds[k+1]<t)k++;
 const h=beds[k+1]-beds[k],phase=(t-beds[k])/h;
 const jag=(noise2(u*.33,k*17+form)-.5)*.06;
 const p=THREE.MathUtils.clamp(phase+jag,0,1),edge=Math.min(p,1-p)*h;
 const bedCut=Math.exp(-edge/(.24+noise2(k*11,form+8)*.34));
 const bedStrength=.18+.82*THREE.MathUtils.smoothstep(noise2(u*.047,k*31+form),.32,.73);
 let recess=bedCut*(.42+noise2(k*19,form+3)*.85)*bedStrength,joint=bedCut*.36*bedStrength;
 const wedge=THREE.MathUtils.smoothstep(p,0,Math.min(.30,.65/h))*(1-p);
 let plane=(wedge-.42)*(.40+h*.25)*bedStrength;
 const faults=[[.11,.19,0,79,1.2],[.35,-.25,3,112,2.7],[.67,.11,0,94,2.0],[.85,-.36,28,116,1.5]];
 for(const [u0,dip,start,end,depth]of faults){
  const center=u0*[122,115,96][form]+d*dip+(noise2(d*.052,form+u0*13)-.5)*1.6;
  const dist=u-center,gate=THREE.MathUtils.smoothstep(d,start,start+4)*(1-THREE.MathUtils.smoothstep(d,end-9,end));
  const crack=Math.exp(-Math.abs(dist)/(.22+depth*.15))*gate;
  recess+=crack*depth; joint=Math.max(joint,crack);
  // One inclined face exposed beside a recess, with a broad asymmetric shoulder.
  plane+=Math.max(0,1-Math.abs(dist-3.1)/8.5)*gate*depth*.65;
 }
 // Finite angular spall recesses interrupt the beds. Unequal oblique facets
 // form weathered scars in this same connected sheet, never separate boxes.
 for(const [cu,cd,w,h,amount]of [[28,12,7,6,1.9],[76,32,12,8,2.3],[50,51,9,11,1.6],[95,75,8,6,1.8]]){
  const a=u-cu-form*2+(d-cd)*.32,b=d-cd;
  const edge=Math.max((a+b*.24)/w,(-a+b*.12)/(w*.82),(b-a*.14)/h,(-b-a*.22)/(h*.78));
  const scar=(1-THREE.MathUtils.smoothstep(edge,.46,1))*amount;
  recess+=scar;plane+=scar*a/w*.24;joint=Math.max(joint,scar/amount*.25);
 }
 // A broad connected face tilts through each bed, with shallow broken flakes.
 plane+=(Math.abs((u*.065+d*.019)%2-1)-.5)*2.0;
 plane+=(noise2(u*.18,d*.23)-.5)*.48;
 return {recess,plane,joint,cell:noise2(u*.041,worldY*.047+form)};
}

export function sculptLedge(mesh){
 const g=mesh.geometry,p=g.attributes.position,c=g.attributes.ledgeCoord,r=g.attributes.cliffRelief;
 const before=new Float32Array(p.array),smooth=THREE.MathUtils.smoothstep,widths=[122,115,96];let maxChange=0;const colors=[];
 for(let i=0;i<p.count;i++){
  const u=c.getX(i),d=c.getY(i),form=Math.round(c.getZ(i)),width=widths[form];
  const border=smooth(u,0,9)*(1-smooth(u,width-9,width));
  const foot=1-smooth(d,100,116),f=fractureField(u,d,form,p.getY(i));
  const caps=[0,19.2,37.2,59.2,85.2];let below=200;
  for(const cap of caps)if(d>=cap-.4)below=Math.min(below,Math.max(0,d-cap));
  const capThickness=.7+noise2(u*.12,form*13+Math.floor(d/18)) *2.4;
  const rim=(1-smooth(below,capThickness*.25,capThickness))*(1-smooth(f.joint,.35,.93));
  const capId=Math.floor((d+1)/19),cover=smooth(noise2(u*.095,form*19+capId)*.7+noise2(u*.29,d*.31)*.3,.40,.70);
  let notch=0;for(const center of [24+capId*3,63-capId*5,96+capId*2])notch+=Math.max(0,1-Math.abs(u-center)/(1.7+noise2(center,form)*2.5))*2.1;
  const edgeBreak=(noise2(u*.23,form*11)-.5)*2.5-notch;
  const face=smooth(below,.2,3.3),change=(f.plane-f.recess+landformField(p.getX(i),p.getY(i),p.getZ(i)).cut*.32)*border*foot*face;
  p.setX(i,p.getX(i)-change+edgeBreak*border*(1-face)*.7);
  p.setY(i,p.getY(i)+edgeBreak*border*(1-face)*.65);
  r.setXYZ(i,Math.min(1,f.joint*.68+r.getX(i)*.25),cover,rim*border*cover);
  const patina=.56+f.cell*.44;colors.push(patina*1.045,patina,patina*.94);
  maxChange=Math.max(maxChange,Math.hypot(p.getX(i)-before[i*3],p.getY(i)-before[i*3+1]));
 }
 g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));mesh.material[0].vertexColors=true;
 g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
 // Local cap fragments share the same surface and fracture mask as the face.
 const cap=groundMaterial(false,false,true,true);cap.side=THREE.DoubleSide;mesh.material[1]=cap;
 mesh.userData.ledgeStudy={maxLocalChangeMetres:maxChange,triangles:g.index.count/3,bytes:Object.values(g.attributes).reduce((s,a)=>s+a.array.byteLength,0)+g.index.array.byteLength,bounds:{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()},method:'Connected surface with unequal dipping beds, finite oblique shear joints, exposed face planes and chipped turf lips; V0.10 broad form retained.'};
 mesh.userData.cliffRefinement.bytes=mesh.userData.ledgeStudy.bytes;mesh.userData.cliffRefinement.bounds=mesh.userData.ledgeStudy.bounds;
 return mesh;
}

// The inherited wall can project through the lower bench. Give that local
// supporting face the same bedding field without altering the other prows.
export function sculptLedgeSupport(mesh){
 const g=mesh.geometry,p=g.attributes.position,r=g.attributes.cliffRelief;
 const beforeNormals=new Float32Array(g.attributes.normal.array),weight=new Float32Array(p.count),smooth=THREE.MathUtils.smoothstep;
 let moved=0,max=0;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),u=z+272;
  const fade=smooth(u,5,16)*(1-smooth(u,106,120))*(1-smooth(x,505,560))*smooth(y,-120,-94)*(1-smooth(y,-5,15));
  if(fade<=0)continue;
  const at=Math.max(0,Math.min(71.999,u/122*72)),k=Math.floor(at),top=THREE.MathUtils.lerp(tops[0][k],tops[0][k+1],at-k);
  const f=fractureField(u,top-y,0,y),change=(f.plane-f.recess)*fade;
  p.setX(i,x-change);r.setX(i,Math.max(r.getX(i)*.4,f.joint*.65*fade));weight[i]=fade;moved++;max=Math.max(max,Math.abs(change));
 }
 g.computeVertexNormals();const n=g.attributes.normal,v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){const w=weight[i];v.set(beforeNormals[i*3]*(1-w)+n.getX(i)*w,beforeNormals[i*3+1]*(1-w)+n.getY(i)*w,beforeNormals[i*3+2]*(1-w)+n.getZ(i)*w).normalize();n.setXYZ(i,v.x,v.y,v.z);}
 g.computeBoundingBox();g.computeBoundingSphere();mesh.userData.ledgeSupport={vertices:moved,maxLocalChangeMetres:max};return mesh;
}
