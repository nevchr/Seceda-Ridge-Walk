import * as THREE from 'three';
import {groundMaterial} from './materials.js';
import {noise2} from './landscape.js';

// Original metric rock study. The DTM remains the foundation/collision surface.
// Survey anchors begin at x = 342 m; relief stays beyond the walking bounds.
export function addRidge(scene,terrain){
 const positions=[],colors=[],indices=[],anchors=[],lookup=new Map();
 const normal=new THREE.Vector3();
 function vertex(x,z){
  const key=x+','+z;if(lookup.has(key))return lookup.get(key);
  const y=terrain.height(x,z),slope=terrain.slope(x,z);
  normal.set(terrain.height(x-12,z)-terrain.height(x+12,z),24,terrain.height(x,z-12)-terrain.height(x,z+12)).normalize();
  // Long unequal ribs with recesses, cut by inclined bedding ledges. Each
  // octave corresponds to a geometric scale, not a displacement texture.
  const rib=noise2(x*.047+y*.003,z*.047),small=noise2(x*.21+y*.012,z*.21);
  const bed=(y+x*.065-z*.045+noise2(x*.012,z*.012)*11)/24;
  const phase=bed-Math.floor(bed),ledge=Math.pow(1-phase,5);
  const weight=.12+.88*THREE.MathUtils.smoothstep(slope,.62,1.45);
  const relief=(1.2+Math.pow(rib,1.7)*6+ledge*2+small*.6)*weight;
  const i=positions.length/3;positions.push(x+normal.x*relief,y+normal.y*relief*.15,z+normal.z*relief);anchors.push(x,y,z);
  const cavity=.72+rib*.24+small*.04;colors.push(cavity,cavity,cavity);
  lookup.set(key,i);return i;
 }
 const step=3;
 for(let x=342;x<2860;x+=step)for(let z=-1260;z<180;z+=step){
  const slope=terrain.slope(x+1.5,z+1.5),y=terrain.height(x,z);
  if(slope<.90||y< -320||(x<340&&z> -145))continue;
  const a=vertex(x,z),b=vertex(x+step,z),c=vertex(x,z+step),d=vertex(x+step,z+step);indices.push(a,c,b,b,c,d);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('surveyPosition',new THREE.Float32BufferAttribute(anchors,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();
 const material=groundMaterial(false,true);material.vertexColors=true;material.side=THREE.DoubleSide;
 const shell=new THREE.Mesh(g,material);shell.name='Survey-aligned fractured ridge';shell.receiveShadow=true;scene.add(shell);

 shell.userData={authoredTriangles:indices.length/3,anchorMinimumX:342};return shell;
}
