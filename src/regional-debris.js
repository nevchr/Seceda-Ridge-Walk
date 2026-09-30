import * as THREE from 'three';
import {chipGeometry} from './jointed-rock.js';
import {groundMaterial} from './materials.js';
import {mappedCoverAt} from './land-cover.js';
import {noise2} from './landscape.js';
import {inWalkingArea} from './exploration.js';

// Original cosmetic limestone fragments across the same surveyed region.
// Mapped debris + survey hollows guide deposits; these are not measured rocks.
// Never replace the DTM or modify walking collision / principal cliff forms.
export async function addRegionalDebris(scene,terrain){
 const geology=new Uint8Array(await(await fetch('./assets/terrain-v14/geology.rgba')).arrayBuffer());
 const field=(x,z)=>{const i=THREE.MathUtils.clamp(Math.floor((x+6700)/5),0,2799),j=THREE.MathUtils.clamp(Math.floor((z+7700)/5),0,2399),k=(j*2800+i)*4;return [geology[k]/255,geology[k+1]/255,geology[k+2]/255,geology[k+3]/255];};
 const geometries=[chipGeometry(9173),chipGeometry(3846),chipGeometry(6453)];
 for(const [v,g]of geometries.entries()){
  const a=g.attributes.position,c=[];
  for(let i=0;i<a.count;i++){
   const x=a.getX(i),y=a.getY(i),z=a.getZ(i);
   a.setXYZ(i,x*(1.15+v*.15),y*.49,z*(.75+v*.14));
   const shade=.73+(y+.6)*.26;c.push(shade,shade*.993,shade*.97);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();g.computeBoundingSphere();
 }
 const material=groundMaterial(true,false,false,false,true);material.vertexColors=true;
 const tiles=new Map(),o=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),normal=new THREE.Vector3(),spin=new THREE.Quaternion();
 const info={instances:0,triangles:0,tiles:0,instanceBytes:0,source:'Original chipped limestone, terrain-conditioned placement from provincial CC0 survey and historical land cover',walkingAreaExcludedMetres:28};
 // Fine aprons around the entire explorable region; larger residual fragments
 // continue across the full native survey. No distant close-grass carpet.
 for(let row=0,z=-7650;z<4250;z+=12,row++){
  for(let x=-6650;x<7250;x+=12){
   const seed=noise2(x*.417,z*.573),xx=x+(noise2(x*2.173,z*1.737)-.5)*15,zz=z+(noise2(x*1.771,z*2.931)-.5)*15;
   if(inWalkingArea(xx,zz,28))continue;
   const f=field(xx,zz),cover=mappedCoverAt(xx,zz);
   const apron=Math.max(cover[2],f[2]*Math.max(0,(f[1]-.38)*1.8));
   const thin=THREE.MathUtils.smoothstep(f[0],.09,.21)*(1-THREE.MathUtils.smoothstep(f[0],.29,.45));
   const grouping=noise2(xx*.023,zz*.023);
   const density=(apron*.64+thin*.09)*(1-cover[0]*.93);
   if(seed>density*(.18+grouping*1.25)||f[0]<.025||f[0]>.51)continue;
   const h=terrain.height(xx,zz);if(h<-750)continue;
   const principal=xx>160&&xx<2960&&zz>-1470&&zz<260;
   // Keep exposed main faces clean: only surveyed foot-slopes receive rubble.
   if(principal&&(f[0]>.25||h>50))continue;
   const cluster=apron>.25?3+Math.floor(noise2(x*.27,z*.91)*6):1;
   for(let k=0;k<cluster;k++){
    const angle=noise2(x+k*9,z+3)*Math.PI*2,spread=k?1+noise2(x+k*17,z)*8:0;
    const px=xx+Math.cos(angle)*spread,pz=zz+Math.sin(angle)*spread;
    if(inWalkingArea(px,pz,24))continue;
    const size=.40+Math.pow(noise2(px*3.9+81,pz*3.7),2.7)*(apron>.4?3.5:2.2);
    const dx=(terrain.height(px+2,pz)-terrain.height(px-2,pz))*.25,dz=(terrain.height(px,pz+2)-terrain.height(px,pz-2))*.25;
    normal.set(-dx,1,-dz).normalize();o.quaternion.setFromUnitVectors(up,normal);spin.setFromAxisAngle(up,angle);o.quaternion.multiply(spin);
    // Lower halves lie inside the actual surface; tiny facet self shading gives
    // contact even beyond the moving near shadow map.
    o.position.set(px,terrain.height(px,pz)-size*.14,pz);o.scale.set(size,size*(.70+noise2(px,pz)*.5),size);o.updateMatrix();
    const variant=Math.floor(noise2(px*.89,pz*.83)*2.999),key=`${Math.floor(px/384)},${Math.floor(pz/384)},${variant}`;
    if(!tiles.has(key))tiles.set(key,[]);tiles.get(key).push(o.matrix.clone());info.instances++;
   }
  }
  if(row%60===0)await new Promise(r=>setTimeout(r,0));
 }
 const meshes=[];
 for(const [key,items]of tiles){
  const variant=Number(key.split(',')[2]),g=geometries[variant],m=new THREE.InstancedMesh(g,material,items.length);
  m.name='Survey-shaped limestone debris '+key;items.forEach((t,i)=>m.setMatrixAt(i,t));m.computeBoundingSphere();m.receiveShadow=true;scene.add(m);meshes.push(m);
  info.triangles+=items.length*g.attributes.position.count/3;
 }
 info.tiles=tiles.size;info.instanceBytes=info.instances*64;scene.userData.regionalDebris=info;
 return {meshes,info};
}
