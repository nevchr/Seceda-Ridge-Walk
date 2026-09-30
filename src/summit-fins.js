import * as THREE from 'three';
import {groundMaterial} from './materials.js';
import {noise2} from './landscape.js';

// Original asymmetric limestone blade studies. DTM anchors and metric
// dimensions are explicit; summit additions are art, not elevation evidence.
export function addSummitFins(scene,terrain){
 const specs=[
  [2030,-380,52,30,178,23,-.32],[2080,-350,38,24,127,8,-.20],
  [2150,-480,32,19,141,18,.25],[1910,-360,28,18,108,14,-.20],
  [1760,-350,28,20,115,9,.18],[2350,-520,37,23,128,12,.12],
  [3180,-1160,65,44,260,43,-.2],[3120,-1170,31,38,220,30,.3],
  [3220,-1100,44,31,175,19,-.4]
 ];
 const p=[],co=[],ix=[];
 for(let id=0;id<specs.length;id++){
  const [cx,cz,w,d,drop,rise,angle]=specs[id],top=terrain.height(cx,cz)+rise,base=top-drop;
  const ring=[[-1,-.2],[-.65,-1],[.45,-.85],[1,.05],[.62,1],[-.63,.82]],rows=22,cols=ring.length,start=p.length/3;
  for(let j=0;j<=rows;j++){
   const t=j/rows,taper=.15+.85*Math.pow(1-t,.55),shear=t*.28;
   for(let k=0;k<cols;k++){
    const [u,v]=ring[k],r=(1+noise2(j*.45,id+k)*.10),x=(u*taper+shear)*w*r,z=v*d*taper*r;
    const crown=(k===1?0:k===2?-.08:-.18)*drop*Math.pow(t,5);
    p.push(cx+Math.cos(angle)*x-Math.sin(angle)*z,base+t*drop+crown,cz+Math.sin(angle)*x+Math.cos(angle)*z);
    const shade=.68+noise2(k*8+id,j*.15)*.29;co.push(shade,shade,shade);
    if(j<rows){let a=start+j*cols+k,b=start+j*cols+(k+1)%cols,c=a+cols,d=b+cols;ix.push(a,b,c,b,d,c);}
   }
  }
  // Close the small fractured crown.
  for(let k=1;k<cols-1;k++)ix.push(start+rows*cols,start+rows*cols+k,start+rows*cols+k+1);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(co,3));g.setIndex(ix);g.computeVertexNormals();
 const m=groundMaterial(true);m.vertexColors=true;m.side=THREE.DoubleSide;const mesh=new THREE.Mesh(g,m);mesh.name='Nine authored summit blades';scene.add(mesh);return mesh;
}
