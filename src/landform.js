import * as THREE from 'three';
import {noise2} from './landscape.js';
import {inWalkingArea} from './exploration.js';

// Shared metre-scale geological field: unequal dipping seams, shear lines and
// broad weathered ribs. Used on scenic survey rock and the inherited benches.
export function landformField(x,y,z){
 const along=x*.47+z*.88,warp=(noise2(along*.012,y*.009)-.5)*22;
 const bed=y*.13+along*.046+warp*.12;
 const bedding=noise2(bed,along*.018);
 const rib=noise2(along*.043+noise2(y*.017,along*.004)*1.7,y*.011);
 const joint=Math.pow(1-Math.abs(noise2(along*.055-y*.015,y*.018)*2-1),16);
 const facet=Math.abs(noise2(along*.026+y*.009,y*.041)*2-1);
 return {bedding,rib,joint,cut:(bedding-.5)*2.8+(rib-.5)*5.4+(facet-.5)*2.6-joint*3.5};
}
export function sculptSurveyGeometry(g,terrain){
 const p=g.attributes.position,base=new Float32Array(p.array),normal=new Float32Array(p.array.length);
 let moved=0,max=0;
 function offset(x,z){
  if(inWalkingArea(x,z,45))return 0;
  const slope=terrain.slope(x,z),steep=1-1/Math.sqrt(1+slope*slope),w=THREE.MathUtils.smoothstep(steep,.20,.52);
  return w?landformField(x,terrain.height(x,z),z).cut*w:0;
 }
 const height=(x,z)=>terrain.height(x,z)+offset(x,z);
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),d=offset(x,z);
  p.setY(i,y+d);if(d){moved++;max=Math.max(max,Math.abs(d));}
  // World-derived normals stay identical at chunk edges. Skirt normals must
  // never pollute the surface normal or displace a seam sideways.
  const dx=(height(x+1,z)-height(x-1,z))*.5,dz=(height(x,z+1)-height(x,z-1))*.5,len=Math.hypot(dx,1,dz);
  normal[i*3]=-dx/len;normal[i*3+1]=1/len;normal[i*3+2]=-dz/len;
 }
 g.setAttribute('surveyPosition',new THREE.BufferAttribute(base,3));g.setAttribute('normal',new THREE.BufferAttribute(normal,3));g.computeBoundingBox();g.computeBoundingSphere();return {moved,maxReliefMetres:max};
}
export const landformGLSL=`
float landscapeRelief(vec3 p){
 float along=p.x*.47+p.z*.88;
 float warp=(noise3(vec3(along*.012,p.y*.009,17.))-.5)*22.;
 float bed=p.y*.13+along*.046+warp*.12;
 float bedding=noise3(vec3(bed,along*.018,11.));
 float rib=noise3(vec3(along*.043+noise3(p*.017)*1.7,p.y*.011,3.));
 float joint=pow(1.-abs(noise3(vec3(along*.055-p.y*.015,p.y*.018,9.))*2.-1.),16.);
 float facet=abs(noise3(vec3(along*.026+p.y*.009,p.y*.041,7.))*2.-1.);
 return (bedding-.5)*2.8+(rib-.5)*5.4+(facet-.5)*2.6-joint*3.5;
}
`;
