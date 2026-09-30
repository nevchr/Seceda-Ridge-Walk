import * as THREE from 'three';
import {groundMaterial} from './materials.js';
import {noise2} from './landscape.js';

// Original connected cliff/bench geometry. Contour fits keep the massif in the
// real metric frame; paired rows make genuine horizontal turf shelves.
export function addRidgeBenches(scene,terrain){
 const positions=[],indices=[],groups=[];
 const rock=groundMaterial(true),turf=groundMaterial(false,false,true);
 for(const [cz,xmin,xmax,width] of [[-211,310,525,122],[-300,830,1140,115],[-315,1190,1430,96]]){
  const cols=[],rows=[[0,1],[3,13],[19,5],[19.2,18],[37,6],[37.2,20],[59,6],[59.2,19],[85,4],[85.2,15],[116,1]];
  for(let k=0;k<=72;k++){
   const z=cz-width/2+k/72*width;let peak=-999,peakX=xmax;
   for(let x=xmin;x<=xmax;x+=2){const y=terrain.height(x,z);if(y>peak){peak=y;peakX=x;}}
   const col=[];const edge=Math.pow(Math.max(0,Math.sin(k/72*Math.PI)),.5);
   for(let j=0;j<rows.length;j++){
    const [depth,out]=rows[j],y=peak-2-depth+(noise2(z*.048,Math.floor(j/2)*47+cz)-.5)*5.0;
    let hit=peakX;for(let x=peakX;x>=xmin-100;x-=1)if(terrain.height(x,z)<y){hit=x+1;break;}
    const flute=noise2(z*.18+cz,y*.008),x=hit+14-(out+25+(flute-.5)*12)*edge;
    col.push(positions.length/3);positions.push(x,y,z);
   }
   cols.push(col);
  }
  for(let j=0;j<rows.length-1;j++){
   const begin=indices.length;
   for(let k=1;k<cols.length;k++){
    const a=cols[k-1][j],b=cols[k][j],c=cols[k-1][j+1],d=cols[k][j+1];
    const length=(u,v)=>Math.hypot(positions[u*3]-positions[v*3],positions[u*3+2]-positions[v*3+2]);
    if(length(a,b)>15||length(c,d)>15)continue;
    indices.push(a,c,b,b,c,d);
   }
   groups.push({start:begin,count:indices.length-begin,materialIndex:rows[j+1][0]-rows[j][0]<1?1:0});
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
 const ordered=[];for(let m=0;m<2;m++){const start=ordered.length;for(const group of groups)if(group.materialIndex===m)ordered.push(...indices.slice(group.start,group.start+group.count));g.addGroup(start,ordered.length-start,m);}g.setIndex(ordered);
 rock.side=turf.side=THREE.DoubleSide;
 const m=new THREE.Mesh(g,[rock,turf]);m.name='Connected limestone risers and turf benches';m.receiveShadow=true;scene.add(m);return m;
}
