import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {noise2} from './landscape.js';
import {surfaceHeight} from './trail-details.js';

// Original timber/metal/rope models at the existing marker coordinates.
// The Seceda photographs informed scale and weathering only, not texture pixels.
export async function addLandmarks(scene,terrain,route){
 const loader=new THREE.TextureLoader(),textures={};
 for(const key of ['Diffuse','nor_gl','Rough']){const t=await loader.loadAsync(`./assets/materials/v09/weathered_planks-${key}.jpg`);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=12;if(key==='Diffuse')t.colorSpace=THREE.SRGBColorSpace;textures[key]=t;}
 const timber=new THREE.MeshStandardMaterial({map:textures.Diffuse,normalMap:textures.nor_gl,normalScale:new THREE.Vector2(.52,.52),roughnessMap:textures.Rough,roughness:.93});
 timber.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 float woodLuma=dot(diffuseColor.rgb,vec3(.299,.587,.114));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(woodLuma)*vec3(1.035,1.015,.96),.72)*1.05+vec3(.055,.056,.052);`);};
 const endgrain=makeEndgrain(),iron=new THREE.MeshStandardMaterial({color:0x5c6260,metalness:.72,roughness:.70}),oldIron=new THREE.MeshStandardMaterial({color:0x534939,metalness:.42,roughness:.87}),cord=new THREE.MeshStandardMaterial({color:0x9c957f,roughness:1}),dark=new THREE.MeshStandardMaterial({color:0x302d27,roughness:1});
 const group=new THREE.Group();group.name='Weathered ridge landmarks';scene.add(group);const colliders=[];let serial=0;
 function mesh(g,m,x,y,z){const obj=new THREE.Mesh(g,m);obj.position.set(x,y,z);obj.castShadow=obj.receiveShadow=true;group.add(obj);return obj;}
 function beam(x,y,z,w,h,d,id=0){
  const g=new RoundedBoxGeometry(w,h,d,3,Math.min(w,d)*.07),p=g.attributes.position,uv=g.attributes.uv,n=g.attributes.normal;
  for(let i=0;i<p.count;i++){
   const yy=p.getY(i),xx=p.getX(i),zz=p.getZ(i),edge=noise2(yy*22+id*13,xx*21+zz*33);
   p.setXYZ(i,xx*(.985+edge*.028)+Math.sin(yy*2+id)*.0015,yy,zz*(.985+edge*.023));
   // Sample within a single weathered plank, with real 2 m source scale.
   uv.setXY(i,.031+(id%9)*.099+(Math.abs(n.getX(i))>.5?zz:xx)*.32,yy/2+id*.137);
  }
  g.computeVertexNormals();return mesh(g,timber,x,y,z);
 }
 function bolt(x,y,z,r=.012){
  const washer=mesh(new THREE.CylinderGeometry(r*1.75,r*1.75,.003,20),iron,x,y,z);washer.rotation.x=Math.PI/2;
  const head=mesh(new THREE.CylinderGeometry(r,r,.009,6),oldIron,x,y,z+.006);head.rotation.x=Math.PI/2;
 }
 function post(x,z,h=1.15,w=.13){
  const y=surfaceHeight(terrain,x,z),id=serial++;
  beam(x,y+h/2-.018,z,w,h+.036,w*.91,id);
  // Rough cut end grain and a slight slant shed water off the top.
  const cap=mesh(new THREE.BoxGeometry(w*.91,.009,w*.82),endgrain,x,y+h-.006,z);cap.rotation.z=.028;
  // A longitudinal drying check is an actual narrow recessed dark strip.
  const split=mesh(new THREE.BoxGeometry(.0018,.18+noise2(id,9)*.29,.002),dark,x+w*.16,y+h*.58,z+w*.46);split.rotation.z=.01;
  colliders.push({x,z,r:.14});
  return new THREE.Vector3(x,y+h*.78,z+w*.52);
 }
 const end=route.points.at(-1),cx=end.x-4.8,cz=end.z+1.8,cy=surfaceHeight(terrain,cx,cz);
 post(cx,cz,3.8,.205);
 const arm=beam(cx,cy+2.9,cz+.042,.184,1.68,.105,3);arm.rotation.z=Math.PI/2;
 // Half-lap join has a back strap and four through bolts, plus a forged shoe.
 mesh(new THREE.BoxGeometry(.25,.27,.008),iron,cx,cy+2.9,cz-.100);
 for(const xx of [-.059,.059])for(const yy of [-.049,.049])bolt(cx+xx,cy+2.9+yy,cz+.102,.009);
 for(const side of [-1,1]){
  mesh(new THREE.BoxGeometry(.225,.30,.009),oldIron,cx,cy+.11,cz+side*.10);
  if(side===1)for(const yy of [.03,.19])bolt(cx,cy+yy,cz+.11,.012);
 }
 const footing=mesh(new THREE.CylinderGeometry(.145,.17,.08,9),new THREE.MeshStandardMaterial({color:0x777469,roughness:1}),cx,cy-.025,cz);
 footing.rotation.y=.4;
 // Preserve the existing trailhead sign, now fixed to a weathered timber board.
 const p=route.points[12],sy=surfaceHeight(terrain,p.x+2.5,p.z);post(p.x+2.5,p.z,1.7,.12);
 beam(p.x+2.5,sy+1.4,p.z+.091,.35,1.1,.045,6).rotation.z=Math.PI/2;
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=320;const ctx=canvas.getContext('2d');ctx.fillStyle='#c2b898';ctx.fillRect(0,0,1024,320);ctx.fillStyle='#394039';ctx.font='bold 62px Segoe UI';ctx.fillText('SECEDA  /  ODLE',56,124);ctx.font='46px Segoe UI';ctx.fillText('RIDGE VIEWPOINT     ↗',56,226);
 const sign=mesh(new THREE.PlaneGeometry(1.01,.28),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(canvas),roughness:1}),p.x+2.5,sy+1.4,p.z+.119);
 for(const x of [-.48,.48])bolt(p.x+2.5+x,sy+1.4,p.z+.121,.007);
 const railing=[];
 for(let i=300;i<420;i+=12){const p=route.points[i],a=post(p.x-2.3,p.z-1.4);railing.push(a);
  const eye=mesh(new THREE.TorusGeometry(.023,.004,8,20),iron,a.x,a.y,a.z+.012);eye.rotation.y=.25;bolt(a.x,a.y-.05,a.z,.008);
 }
 for(let i=1;i<railing.length;i++){
  const a=railing[i-1],b=railing[i],length=a.distanceTo(b),points=[];
  for(let j=0;j<=16;j++){const t=j/16,p=a.clone().lerp(b,t);p.y-=Math.sin(t*Math.PI)*(.12+length*.009);points.push(p);}
  const centre=new THREE.CatmullRomCurve3(points),segments=Math.ceil(length*60),frame=centre.computeFrenetFrames(segments,false);
  for(let strand=0;strand<3;strand++){
   const helix=[];for(let j=0;j<=segments;j++){const t=j/segments,angle=t*length/.115*Math.PI*2+strand*2.094,p=centre.getPointAt(t);p.addScaledVector(frame.normals[j],Math.cos(angle)*.0068).addScaledVector(frame.binormals[j],Math.sin(angle)*.0068);helix.push(p);}
   mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix),segments,.0061,6,false),cord,0,0,0);
  }
  // Short wrapped bindings secure the three-strand line to the end eyes.
  for(const a of [railing[i-1],railing[i]])for(let j=0;j<4;j++){const wrap=mesh(new THREE.TorusGeometry(.017,.0022,6,12),cord,a.x+j*.004,a.y,a.z);wrap.rotation.y=Math.PI/2;}
 }
 group.updateMatrixWorld(true);let triangles=0,draws=0;group.traverse(m=>{if(m.isMesh){triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;draws++;}});
 scene.userData.landmarks={posts:12,colliders:colliders.length,triangles,meshes:draws,rope:'three helical strands, 11.5 cm lay, sagged span',timber:'original beveled beams, lap joint, split checks, end grain; Poly Haven weathered_planks CC0'};
 return colliders;
}
function makeEndgrain(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#79766a';c.fillRect(0,0,256,256);
 for(let r=5;r<180;r+=3+noise2(r,8)*7){c.strokeStyle=`rgba(40,36,28,${.10+noise2(r,17)*.22})`;c.lineWidth=.8+noise2(r,1)*1.4;c.beginPath();c.ellipse(104,130,r,r*.85,.3,0,Math.PI*2);c.stroke();}
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map:t,roughness:1});
}
