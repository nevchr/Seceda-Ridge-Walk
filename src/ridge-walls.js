import * as THREE from 'three';
import {groundMaterial} from './materials.js';
import {noise2} from './landscape.js';
// Original rock-wall studies fitted to surveyed horizontal cross sections.
// Each wall is parameterized vertically so flutes cannot fold over adjacent
// terrain-grid triangles. West-facing prows and north-facing walls interlock.
export function addRidgeWalls(scene,terrain){
 const positions=[],colors=[],indices=[];
 // axis: direction into the massif; across: tangential range. Peak search is
 // confined to each formation, so distant mountains cannot move an anchor.
 const formations=[
  {axis:'x',across:[-267,-164],into:[360,552],base:-172,relief:13},
  {axis:'z',across:[430,690],into:[-370,-175],base:-210,relief:5},
  {axis:'x',across:[-390,-240],into:[840,1050],base:-180,relief:9},
  {axis:'z',across:[1030,1400],into:[-530,-265],base:-220,relief:9},
  {axis:'x',across:[-550,-280],into:[1610,2070],base:-120,relief:14},
  {axis:'z',across:[1960,2240],into:[-660,-325],base:-140,relief:12}
 ];
 for(const [id,f]of formations.entries()){
  const sample=(a,b)=>f.axis==='x'?terrain.height(b,a):terrain.height(a,b);
  const columns=[];
  for(let a=f.across[0];a<=f.across[1];a+=2){
   let peak=-Infinity,peakB=f.into[0];
   for(let b=f.into[0];b<=f.into[1];b+=2){const y=sample(a,b);if(y>peak){peak=y;peakB=b;}}
   if(peak-f.base<30){columns.push(null);continue;}
   const col=[];
   for(let j=0;j<=70;j++){
    const t=j/70,foot=Math.max(f.base,sample(a,f.into[0])+2),y=foot+(peak-foot)*t;
    let b=peakB;
    // Follow the contiguous face outward from its summit, ignoring disconnected
    // foothills at the same elevation.
    for(let u=peakB;u>=f.into[0];u-=2){if(sample(a,u)<y){let lo=u,hi=u+2;for(let k=0;k<5;k++){const m=(lo+hi)/2;if(sample(a,m)<y)lo=m;else hi=m;}b=(lo+hi)/2;break;}}
    const rib=noise2(a*.17+id*14,y*.0035),fine=noise2(a*.41,y*.048);
    const bed=(y+a*.11+noise2(a*.024,id)*6)/13,phase=bed-Math.floor(bed);
    const ledge=Math.pow(1-phase,7);
    // Strong vertical faces, small broken ledges; fade back into survey at top/base.
    const edge=Math.min((a-f.across[0])/18,(f.across[1]-a)/18,1);
    const fade=Math.sin(Math.PI*t)*Math.max(0,edge);
    const offset=(7.0+f.relief*(.7+rib*1.5+ledge*.70)+fine*1.3)*fade;
    b-=offset;
    const x=f.axis==='x'?b:a,z=f.axis==='x'?a:b;
    const vertex=positions.length/3;positions.push(x,y,z);col.push(vertex);
    const shade=.65+rib*.32+fine*.03;colors.push(shade,shade,shade);
   }
   columns.push(col);
  }
  for(let i=1;i<columns.length;i++)if(columns[i]&&columns[i-1])for(let j=0;j<70;j++){
   const a=columns[i-1][j],b=columns[i][j],c=columns[i-1][j+1],d=columns[i][j+1];
   const dist=(u,v)=>Math.hypot(positions[u*3]-positions[v*3],positions[u*3+1]-positions[v*3+1],positions[u*3+2]-positions[v*3+2]);
   if(Math.max(dist(a,b),dist(c,d),dist(a,c),dist(b,d))>18)continue;
   if(f.axis==='x')indices.push(a,c,b,b,c,d);else indices.push(a,b,c,b,d,c);
  }
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
 const mat=groundMaterial(true);mat.vertexColors=true;mat.side=THREE.DoubleSide;
 const mesh=new THREE.Mesh(geo,mat);mesh.name='Contour-fitted limestone prows';mesh.receiveShadow=true;scene.add(mesh);
 return mesh;
}
