import {toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import {groundMaterial} from './materials.js';
import {chipGeometry} from './jointed-rock.js';
import {visualTrailWidth,noise2} from './landscape.js';

// Match the rendered survey triangles; cosmetic stones never change collision.
export function surfaceHeight(t,x,z){
 const l=t.layers[0],x0=l.bbox[0]-708700,z0=5164300-l.bbox[3],step=l.step;
 const ix=Math.floor((x-x0)/step),iz=Math.floor((z-z0)/step),xx=x0+ix*step,zz=z0+iz*step,u=(x-xx)/step,v=(z-zz)/step;
 const a=t.height(xx,zz),b=t.height(xx+step,zz),c=t.height(xx,zz+step),d=t.height(xx+step,zz+step);
 return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);
}
export function addEmbeddedStones(scene,terrain,route){
 const material=groundMaterial(true),o=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),normal=new THREE.Vector3();
 const variants=Array.from({length:8},(_,i)=>new THREE.InstancedMesh(toCreasedNormals(chipGeometry(400+i*19),.90),material,4500));
 const counts=Array(8).fill(0);let seed=60293;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,3,32,32,32);gradient.addColorStop(0,'rgba(31,26,19,.55)');gradient.addColorStop(.5,'rgba(31,26,19,.28)');gradient.addColorStop(1,'rgba(31,26,19,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 const contact=new THREE.InstancedMesh(new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}),30000);
 let n=0,maxTop=0;
 for(let i=0;i<27000;i++){
  const u=rnd()*419,index=Math.floor(u),p=route.points[index],q=route.points[index+1],f=u-index,dx=q.x-p.x,dz=q.z-p.z,len=Math.hypot(dx,dz);
  const side=(rnd()*2-1)*(visualTrailWidth(index,p.x,p.z)+.13);
  const x=p.x+dx*f+dz/len*side,z=p.z+dz*f-dx/len*side,width=visualTrailWidth(index,x,z);
  const pocket=noise2(x*.63+31,z*.63),edge=Math.abs(side)/width;
  if(rnd()>(.30+edge*.38+pocket*.47)||edge>1.18)continue;
  const r=.008+Math.pow(rnd(),3.0)*(.038+edge*.010),h=r*(.40+rnd()*.24),yaw=rnd()*6.28,variant=i%8,y=surfaceHeight(terrain,x,z);
  normal.set(surfaceHeight(terrain,x-.015,z)-surfaceHeight(terrain,x+.015,z),.03,surfaceHeight(terrain,x,z-.015)-surfaceHeight(terrain,x,z+.015)).normalize();
  o.position.set(x,y-h*.24,z);o.quaternion.setFromUnitVectors(up,normal);o.rotateY(yaw);o.rotateX((rnd()-.5)*.24);o.scale.set(r*(1.0+rnd()*.5),h,r*(.70+rnd()*.32));o.updateMatrix();variants[variant].setMatrixAt(counts[variant]++,o.matrix);
  const shade=.57+rnd()*.38;variants[variant].setColorAt(counts[variant]-1,new THREE.Color(shade,shade*.98,shade*.93));
  o.position.set(x,y+.0015,z);o.quaternion.setFromUnitVectors(up,normal);o.rotateY(yaw);o.scale.set(r*1.5,1,r*1.3);o.updateMatrix();contact.setMatrixAt(n++,o.matrix);maxTop=Math.max(maxTop,h*.7);
 }
 let triangles=0;
 for(const [i,mesh] of variants.entries()){mesh.count=counts[i];mesh.name=`Embedded limestone gravel ${i+1}`;mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);triangles+=mesh.geometry.attributes.position.count/3*mesh.count;}
 contact.count=n;contact.name='Pebble ground contact';scene.add(contact);
 scene.userData.trailStones={count:n,variants:8,triangles,maximumProtrusionMetres:maxTop,contactTriangles:n*2,collision:'unchanged DTM; cosmetic embedded stones'};
}
