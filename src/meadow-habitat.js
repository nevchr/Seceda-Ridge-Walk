import * as THREE from 'three';
import {ORIGIN} from './terrain.js';
import {noise2} from './landscape.js';

// An authored habitat interpretation of surveyed slope, aspect and curvature.
// Shared by ground, short blades and streamed plants; it never changes heights.
export const habitatUniforms={habitatMap:{value:null},habitatBounds:{value:new THREE.Vector4()}};
let bytes,w,h,b;
const smooth=THREE.MathUtils.smoothstep,clamp=THREE.MathUtils.clamp;
export function prepareMeadowHabitat(terrain){
 const l=terrain.layers[0];w=720;h=520;b=habitatUniforms.habitatBounds.value;
 b.set(l.bbox[0]-ORIGIN.east,ORIGIN.north-l.bbox[3],l.bbox[2]-l.bbox[0],l.bbox[3]-l.bbox[1]);bytes=new Uint8Array(w*h*4);
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){
  const x=b.x+(i+.5)/w*b.z,z=b.y+(j+.5)/h*b.w,y=terrain.height(x,z);
  const dx=(terrain.height(x+6,z)-terrain.height(x-6,z))/12,dz=(terrain.height(x,z+6)-terrain.height(x,z-6))/12,slope=Math.hypot(dx,dz);
  const curve=(terrain.height(x+14,z)+terrain.height(x-14,z)+terrain.height(x,z+14)+terrain.height(x,z-14)-y*4)/28;
  const sheltered=clamp(.52+curve*.70-(dx*-.65+dz*.57)*.22,0,1);
  const patch=noise2(x*.028+87,z*.028-23)*.64+noise2(x*.12,z*.12)*.36;
  const thin=smooth(slope,.48,1.03)*smooth(patch+(1-sheltered)*.24,.35,.72);
  const lush=clamp(.27+sheltered*.56+patch*.29-slope*.12,0,1);
  const flowers=smooth(noise2(x*.081+17,z*.081-38)*.7+noise2(x*.27,z*.27)*.3,.32,.74);
  const k=(j*w+i)*4;for(const [c,v]of [lush,thin,sheltered,flowers].entries())bytes[k+c]=Math.round(v*255);
 }
 const map=new THREE.DataTexture(bytes,w,h);map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;map.generateMipmaps=true;map.needsUpdate=true;habitatUniforms.habitatMap.value=map;
 return {dimensions:[w,h],texelMetres:[b.z/w,b.w/h],channels:['lushness','thin rocky turf','shelter','flower colonies'],provenance:'Original terrain-conditioned art rules, not a botanical survey'};
}
export function meadowHabitatAt(x,z){
 if(!bytes)return [.65,0,.5,.3];
 const fx=clamp((x-b.x)/b.z*w-.5,0,w-1.001),fz=clamp((z-b.y)/b.w*h-.5,0,h-1.001),ix=Math.floor(fx),iz=Math.floor(fz),u=fx-ix,v=fz-iz;
 const a=(iz*w+ix)*4,c=((iz+1)*w+ix)*4;
 return [0,1,2,3].map(k=>((bytes[a+k]*(1-u)+bytes[a+4+k]*u)*(1-v)+(bytes[c+k]*(1-u)+bytes[c+4+k]*u)*v)/255);
}
export const habitatGLSL=`
uniform sampler2D habitatMap;uniform vec4 habitatBounds;
vec4 meadowHabitat(vec2 p){
 vec2 uv=(p-habitatBounds.xy)/habitatBounds.zw;
 float inside=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
 return mix(vec4(.65,0.,.5,.3),texture2D(habitatMap,clamp(uv,0.,1.)),inside);
}
`;
