import * as THREE from 'three';
import {ORIGIN} from './terrain.js';
import {sculptSurveyGeometry} from './landform.js';

// Survey chunks retain native resolution around the player and on rocky faces.
// Distant gentle ground drops redundant vertices; skirts close LOD seams.
// Collision always reads the original raster, independent of render LOD.
export function addSurveyChunks(scene,terrain,material){
 const chunks=[],info={chunks:0,fullTriangles:0,activeTriangles:0,sculptedVertices:0,maxReliefMetres:0};
 for(let li=terrain.layers.length-1;li>=0;li--){
  const l=terrain.layers[li],inner=li?terrain.layers[li-1]:null,span=li===2?1280:320;
  const x0=l.bbox[0]-ORIGIN.east,z0=ORIGIN.north-l.bbox[3],xEnd=x0+l.width*l.step,zEnd=z0+l.height*l.step;
  for(let z=z0;z<zEnd;z+=span)for(let x=x0;x<xEnd;x+=span){
   const width=Math.min(span,xEnd-x),depth=Math.min(span,zEnd-z);
   if(inner&&x>=inner.bbox[0]-ORIGIN.east&&x+width<=inner.bbox[2]-ORIGIN.east&&z>=ORIGIN.north-inner.bbox[3]&&z+depth<=ORIGIN.north-inner.bbox[1])continue;
   const geometries=[];let rocky=false;
   for(let dz=0;dz<=depth;dz+=40)for(let dx=0;dx<=width;dx+=40)if(terrain.slope(x+dx,z+dz)>.8)rocky=true;
   for(const factor of (li===2||rocky?[1]:[1,2,4])){
    const step=l.step*factor,w=Math.ceil(width/step),h=Math.ceil(depth/step),p=[],ix=[];
    for(let j=0;j<=h;j++)for(let i=0;i<=w;i++){const xx=x+Math.min(i*step,width),zz=z+Math.min(j*step,depth);p.push(xx,terrain.height(xx,zz),zz);}
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){
     const xx=x+(i+.5)*step,zz=z+(j+.5)*step;
     if(inner&&xx>inner.bbox[0]-ORIGIN.east&&xx<inner.bbox[2]-ORIGIN.east&&zz>ORIGIN.north-inner.bbox[3]&&zz<ORIGIN.north-inner.bbox[1])continue;
     const a=j*(w+1)+i,b=a+1,c=a+w+1,d=c+1;ix.push(a,c,b,b,c,d);
    }
    if(!ix.length)continue;
    const edge=[];for(let i=0;i<=w;i++)edge.push(i);for(let j=1;j<=h;j++)edge.push(j*(w+1)+w);for(let i=w-1;i>=0;i--)edge.push(h*(w+1)+i);for(let j=h-1;j>0;j--)edge.push(j*(w+1));
    const skirt=li===2?80:12;
    for(let k=0;k<edge.length;k++){const a=edge[k],b=edge[(k+1)%edge.length],c=p.length/3;p.push(p[a*3],p[a*3+1]-skirt,p[a*3+2],p[b*3],p[b*3+1]-skirt,p[b*3+2]);ix.push(a,b,c,b,c+1,c);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();
    const sculpt=sculptSurveyGeometry(g,terrain);info.sculptedVertices+=sculpt.moved;info.maxReliefMetres=Math.max(info.maxReliefMetres,sculpt.maxReliefMetres);geometries.push(g);
   }
   if(!geometries.length)continue;
   const m=new THREE.Mesh(geometries[0],material);m.name=`Survey ${l.name} ${x},${z}`;m.userData.massifCaster=true;m.receiveShadow=true;scene.add(m);chunks.push({mesh:m,geometries,x:x+width/2,z:z+depth/2,radius:Math.hypot(width,depth)/2});info.fullTriangles+=m.geometry.index.count/3;
  }
 }
 info.chunks=chunks.length;let key='';
 return {info,chunks,update(camera){const k=`${Math.floor(camera.position.x/32)},${Math.floor(camera.position.z/32)}`;if(k===key)return;key=k;let count=0;for(const c of chunks){const d=Math.hypot(c.x-camera.position.x,c.z-camera.position.z)-c.radius,level=d<220?0:d<800?1:2;c.mesh.geometry=c.geometries[Math.min(level,c.geometries.length-1)];count+=c.mesh.geometry.index.count/3;}info.activeTriangles=count;}};
}
