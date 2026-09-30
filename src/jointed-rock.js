import * as THREE from 'three';
import {ConvexGeometry} from 'three/addons/geometries/ConvexGeometry.js';
import {mergeGeometries,toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {groundMaterial} from './materials.js';
import {noise2} from './landscape.js';

// Original authored joint systems. Every column follows an isoheight contour
// of the unchanged DTM. Intersecting cleavage planes, staggered bed thicknesses
// and variable buttress projections replace the old smooth terrace ribbons.
export function addJointedRock(scene,terrain){
 const material=groundMaterial(true),geometries=[],formations=[];
 const specs=[
  {axis:'x',across:[-277,-153],into:[306,555],base:-169,relief:29},
  {axis:'z',across:[435,735],into:[-379,-177],base:-214,relief:17},
  {axis:'x',across:[-399,-224],into:[800,1150],base:-205,relief:27},
  {axis:'x',across:[-362,-261],into:[1165,1445],base:-224,relief:24},
  {axis:'z',across:[1055,1430],into:[-562,-265],base:-232,relief:19},
  {axis:'x',across:[-563,-278],into:[1580,2080],base:-130,relief:34},
  {axis:'z',across:[1945,2265],into:[-684,-322],base:-147,relief:25},
  {axis:'z',across:[1690,2350],into:[-710,-170],base:110,relief:19,outward:1}
 ];
 let seed=9271,blocks=0;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
 for(const [id,f] of specs.entries()){
  const outward=f.outward??-1,far=outward<0?f.into[0]-95:f.into[1]+95;
  const sample=(a,b)=>f.axis==='x'?terrain.height(b,a):terrain.height(a,b);
  const peaks=new Map();
  function peakAt(a){const key=Math.round(a*4)/4;if(peaks.has(key))return peaks.get(key);let peak=-999,at=f.into[1];for(let b=f.into[0];b<=f.into[1];b+=2){const y=sample(key,b);if(y>peak){peak=y;at=b;}}const p={y:peak,b:at};peaks.set(key,p);return p;}
  function contour(a,y){const p=peakAt(a);for(let b=p.b;outward*(b-far)<=0;b+=outward*2){if(sample(a,b)<y){let outer=b,inner=b-outward*2;for(let j=0;j<5;j++){const m=(outer+inner)/2;if(sample(a,m)<y)outer=m;else inner=m;}return(outer+inner)/2;}}return far;}
  const world=(a,y,b)=>f.axis==='x'?new THREE.Vector3(b,y,a):new THREE.Vector3(a,y,b);
  let column=0;
  for(let a=f.across[0];a<f.across[1]-2;){
   const width=Math.min(4.5+random()*9+(random()>.84?9:0),f.across[1]-a),ac=a+width/2;
   const peak=peakAt(ac),foot=Math.max(f.base,sample(ac,far-outward*35)-10),edge=Math.max(.08,Math.sin((ac-f.across[0])/(f.across[1]-f.across[0])*Math.PI));
   const projection=(.55+random()*.75)*f.relief*Math.pow(edge,.5),lean=(random()-.5)*.14;
   let top=peak.y-.7,bed=0;
   while(top>foot+2){
    const thickness=Math.min(top-foot,3.5+random()*8+(random()>.73?random()*17:0)),bottom=top-thickness;
    const shear=lean*(peak.y-(top+bottom)/2),a0=a+shear+.10+random()*.16,a1=a+width+shear-.12;
    const tilt=(random()-.5)*.18,chip=Math.min(width,thickness)*(.06+random()*.15);
    const outline=[[a0+chip,top],[a1-chip*.6,top+width*tilt],[a1,top-chip+width*tilt],[a1-.15,bottom+chip],[a1-chip,bottom],[a0+chip*.8,bottom-width*tilt*.4],[a0,bottom+chip*.8],[a0,top-chip]];
    const bulge=projection*(.8+.25*Math.sin((top+id*13)*.053))+(random()-.5)*5;
    const points=[];
    for(let k=0;k<outline.length;k++){
     let [u,y]=outline[k];y=Math.min(y,peakAt(u).y-.22);
     const t=THREE.MathUtils.clamp((y-foot)/(peak.y-foot),0,1),fade=Math.pow(Math.sin(t*Math.PI),.40);
     const face=contour(u,y)+outward*(2+bulge*fade)+(random()-.5)*1.2;
     points.push(world(u,y,face));
     points.push(world(u,y,contour(u,y)-outward*12));
    }
    // The proud central arris separates two broad fracture planes. An off-centre
    // position and bed-dependent relief prevent a stack of identical shelves.
    const midA=a0+(a1-a0)*(.24+random()*.47),midY=bottom+thickness*(.30+random()*.4);
    if(outward>0&&(midY<115||terrain.slope(midA,contour(midA,midY))<1.05)){
     top=bottom+.20;if(thickness<3)break;continue;
    }
    if(random()>.42)points.push(world(midA,midY,contour(midA,midY)+outward*(bulge+1+random()*3)));
    const hull=new ConvexGeometry(points);
    const geometry=erodeFaces(hull,f.axis,id<2?1.15:2.1,outward);hull.dispose();
    geometries.push(geometry);blocks++;bed++;
    top=bottom+(.12+random()*.4);if(thickness<3)break;
   }
   a+=width;column++;
  }
  formations.push({axis:f.axis,across:f.across,into:f.into,base:f.base,columns:column});
 }
 const g=mergeGeometries(geometries);for(const geo of geometries)geo.dispose();
 const mesh=new THREE.Mesh(g,material);mesh.name='Jointed Seceda limestone formations';mesh.receiveShadow=true;mesh.userData.massifCaster=true;
 g.computeBoundingBox();scene.add(mesh);
 // Angular limestone aprons occupy surveyed talus below the authored faces.
 const debrisGeometry=chipGeometry(817),debris=new THREE.InstancedMesh(debrisGeometry,material,12000),o=new THREE.Object3D();let count=0;
 for(let i=0;i<18000;i++){
  const x=285+random()*2100,z=-745+random()*650,h=terrain.height(x,z),slope=terrain.slope(x,z);
  if(x<335&&z>-150||h>85||h<-320||slope<.24||slope>1.20||noise2(x*.013,z*.013)<.42)continue;
  const radius=.27+Math.pow(random(),3)*3.7;
  o.position.set(x,h-radius*.26,z);o.rotation.set(random()*.6,random()*6.28,random()*.3);o.scale.set(radius*1.3,radius*.66,radius*.91);o.updateMatrix();debris.setMatrixAt(count++,o.matrix);
 }
 debris.count=count;debris.name='Fracture talus aprons';debris.receiveShadow=true;scene.add(debris);
 scene.userData.jointedRock={blocks,formations,triangles:g.attributes.position.count/3,bounds:{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()},debris:count,debrisTriangles:debrisGeometry.attributes.position.count/3*count};
 return mesh;
}

function erodeFaces(geometry,axis,spacing,outward){
 const p=geometry.attributes.position,n=geometry.attributes.normal,out=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),q=new THREE.Vector3();
 function emit(u,v){
  q.copy(a).multiplyScalar(1-u-v).addScaledVector(b,u).addScaledVector(c,v);
  const across=axis==='x'?q.z:q.x;
  const erosion=(noise2(across*.38+37,q.y*.59)-.5)*.34+(noise2(across*.092,q.y*.48)-.5)*.70+(noise2(across*1.1,q.y*1.3)-.5)*.12;
  if(axis==='x')q.x+=outward*erosion;else q.z+=outward*erosion;
  out.push(q.x,q.y,q.z);
 }
 for(let i=0;i<p.count;i+=3){
  a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);
  const facing=axis==='x'?n.getX(i):n.getZ(i);
  if(facing*outward<.18){out.push(...a.toArray(),...b.toArray(),...c.toArray());continue;}
  const steps=Math.max(1,Math.ceil(Math.max(a.distanceTo(b),a.distanceTo(c),b.distanceTo(c))/spacing));
  for(let j=0;j<steps;j++)for(let k=0;k<steps-j;k++){
   emit(j/steps,k/steps);emit((j+1)/steps,k/steps);emit(j/steps,(k+1)/steps);
   if(j+k<steps-1){emit((j+1)/steps,k/steps);emit((j+1)/steps,(k+1)/steps);emit(j/steps,(k+1)/steps);}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(out,3));g.computeVertexNormals();return toCreasedNormals(g,.48);
}

// Chipped polyhedron used at different scales; the six variants are distinct
// authored cuts rather than instances of the previous faceted sphere.
export function chipGeometry(seed=1){
 const points=[];
 for(let ring=0;ring<3;ring++)for(let i=0;i<7;i++){
  const angle=(i/7+.023*ring)*Math.PI*2,r=(ring===1?1:.63)*( .78+noise2(seed+i*13,ring*71)*.35);
  points.push(new THREE.Vector3(Math.cos(angle)*r,(ring-1)*.58+(noise2(i*31,seed+ring)-.5)*.22,Math.sin(angle)*r));
 }
 return new ConvexGeometry(points);
}
