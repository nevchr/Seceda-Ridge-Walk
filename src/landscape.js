import * as THREE from 'three';

// Shared art fields tie surface cover and mesh clusters to the same places.
// These do not modify the survey, route centreline, or player collision.
export function noise2(x,z){
 const hash=(a,b)=>{let n=Math.imul(a,374761393)+Math.imul(b,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
 const i=Math.floor(x),j=Math.floor(z),u=x-i,v=z-j,a=u*u*(3-2*u),b=v*v*(3-2*v);
 return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(i,j),hash(i+1,j),a),THREE.MathUtils.lerp(hash(i,j+1),hash(i+1,j+1),a),b);
}
export function meadowPatch(x,z){return .68*noise2(x*.12,z*.12)+.32*noise2(x*.43+71,z*.43);}
export function trailWidth(i){return .39+.11*Math.sin(i*.047)+.07*Math.sin(i*.13+1.8);}
export function trailEdge(x,z){return (noise2(x*1.25,z*1.25)-.5)*.26+(noise2(x*4.4,z*4.4)-.5)*.09;}
export function visualTrailWidth(i,x,z){return trailWidth(i)+(noise2(x*.41+71,z*.41)-.5)*.24;}
export const SUN_DIRECTION=new THREE.Vector3(-.65,.50,.57).normalize();
export const trailBounds=new THREE.Vector4(-40,-145,265,355);
export const shadowBounds=new THREE.Vector4(-6700,-7700,14000,12000);
export const geologyBounds=new THREE.Vector4(-6700,-7700,14000,12000);
export const landscapeMaps={};

export async function prepareLandscape(terrain,route){
 const gw=2800,gh=2400,geology=new Uint8Array(await(await fetch('./assets/terrain-v14/geology.rgba')).arrayBuffer());
 landscapeMaps.geology=new THREE.DataTexture(geology,gw,gh);landscapeMaps.geology.magFilter=THREE.LinearFilter;landscapeMaps.geology.minFilter=THREE.LinearMipmapLinearFilter;landscapeMaps.geology.generateMipmaps=true;landscapeMaps.geology.needsUpdate=true;
 const size=2048,dist=new Float32Array(size*size).fill(5),width=new Float32Array(size*size).fill(.5);
 const [xmin,zmin,sx,sz]=trailBounds.toArray();
 for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i],dx=b.x-a.x,dz=b.z-a.z,len=dx*dx+dz*dz;
  const x0=Math.max(0,Math.floor((Math.min(a.x,b.x)-4-xmin)/sx*size)),x1=Math.min(size-1,Math.ceil((Math.max(a.x,b.x)+4-xmin)/sx*size));
  const z0=Math.max(0,Math.floor((Math.min(a.z,b.z)-4-zmin)/sz*size)),z1=Math.min(size-1,Math.ceil((Math.max(a.z,b.z)+4-zmin)/sz*size));
  for(let j=z0;j<=z1;j++)for(let k=x0;k<=x1;k++){
   const x=xmin+(k+.5)/size*sx,z=zmin+(j+.5)/size*sz,t=THREE.MathUtils.clamp(((x-a.x)*dx+(z-a.z)*dz)/len,0,1),d=Math.hypot(x-a.x-t*dx,z-a.z-t*dz),idx=j*size+k;
   if(d<dist[idx]){dist[idx]=d;width[idx]=visualTrailWidth(i,x,z);}
  }
 }
 const bytes=new Uint8Array(size*size*4);
 for(let i=0;i<dist.length;i++){
  const x=xmin+(i%size+.5)/size*sx,z=zmin+(Math.floor(i/size)+.5)/size*sz;
  bytes[i*4]=Math.min(255,Math.max(0,dist[i]+trailEdge(x,z))/5*255);bytes[i*4+1]=width[i]*255;bytes[i*4+3]=255;
 }
 const trail=new THREE.DataTexture(bytes,size,size);trail.magFilter=trail.minFilter=THREE.LinearFilter;trail.needsUpdate=true;landscapeMaps.trail=trail;

 // Complete 5 m survey-derived solar horizon. Authored cliffs receive their
 // own sun-space capture; this field lights the rest of the surveyed region.
 const light=new Uint8Array(await(await fetch('./assets/terrain-v14/sun-horizon.rgba')).arrayBuffer());
 const shadow=new THREE.DataTexture(light,2800,2400);shadow.magFilter=THREE.LinearFilter;shadow.minFilter=THREE.LinearMipmapLinearFilter;shadow.generateMipmaps=true;shadow.needsUpdate=true;landscapeMaps.shadow=shadow;
}
