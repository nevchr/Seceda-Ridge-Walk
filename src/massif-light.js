import * as THREE from 'three';
import {SUN_DIRECTION} from './landscape.js';

// One immutable sun-space depth capture includes surveyed ground AND the
// authored ridge. It is separate from the unchanged near 4096 shadow map.
export const massifUniforms={massifDepth:{value:null},massifMatrix:{value:new THREE.Matrix4()},massifTexel:{value:1/2048},massifEnabled:{value:1},massifBias:{value:new THREE.Vector2(0,4)}};
export function bakeMassifLight(renderer,scene,size=2048,authored=true){
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,1,12000);
 const center=new THREE.Vector3(1660,-50,-650);camera.position.copy(center).addScaledVector(SUN_DIRECTION,5500);camera.lookAt(center);camera.updateMatrixWorld(true);
 const bounds=new THREE.Box3();
 for(const x of [-750,5600])for(const y of [-800,800])for(const z of [-2400,3100])bounds.expandByPoint(new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse));
 camera.left=bounds.min.x;camera.right=bounds.max.x;camera.bottom=bounds.min.y;camera.top=bounds.max.y;camera.near=-bounds.max.z-500;camera.far=-bounds.min.z+500;camera.updateProjectionMatrix();
 const bakeScene=new THREE.Scene(),material=new THREE.MeshDepthMaterial({side:THREE.DoubleSide}),temporaryGeometry=[];let skippedSkirtTriangles=0;
 for(const m of scene.children){if(!m.visible||!m.isMesh||m.isInstancedMesh||!m.geometry?.attributes.position||m.geometry.attributes.position.count<500)continue;
  // Only terrain and major authored stone; no vegetation or sky.
  if(m.name&&!m.userData.massifCaster&&!['Survey-aligned fractured ridge','Contour-fitted limestone prows','Nine authored summit blades','Connected limestone risers and turf benches'].includes(m.name))continue;
  if(!authored&&m.name)continue;
  if(m.geometry.type==='SphereGeometry')continue;
  let geometry=m.geometry;
  if(m.name?.startsWith('Survey ')&&geometry.index){
   // Vertical seam skirts hide LOD joins; they are not real escarpments and
   // must not cast long razor-thin shadows onto finer adjoining terrain.
   const p=geometry.attributes.position,indices=geometry.index.array,faces=[];
   for(let i=0;i<indices.length;i+=3){const a=indices[i],b=indices[i+1],c=indices[i+2];const area=(p.getX(b)-p.getX(a))*(p.getZ(c)-p.getZ(a))-(p.getZ(b)-p.getZ(a))*(p.getX(c)-p.getX(a));if(Math.abs(area)<.001){skippedSkirtTriangles++;continue;}faces.push(a,b,c);}
   geometry=geometry.clone();geometry.setIndex(faces);temporaryGeometry.push(geometry);
  }
  const copy=new THREE.Mesh(geometry,material);copy.name=m.name||'Surveyed terrain';copy.matrixAutoUpdate=false;copy.matrix.copy(m.matrix);copy.frustumCulled=false;bakeScene.add(copy);
 }
 const target=new THREE.WebGLRenderTarget(size,size,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:true});target.depthTexture=new THREE.DepthTexture(size,size,THREE.UnsignedIntType);
 const old=renderer.getRenderTarget(),auto=renderer.shadowMap.autoUpdate;renderer.shadowMap.autoUpdate=false;renderer.setRenderTarget(target);renderer.clear();renderer.render(bakeScene,camera);renderer.setRenderTarget(old);renderer.shadowMap.autoUpdate=auto;material.dispose();
 massifUniforms.massifDepth.value=target.depthTexture;massifUniforms.massifMatrix.value.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);massifUniforms.massifTexel.value=1/size;
 const info={size,authored,metresPerTexel:[(camera.right-camera.left)/size,(camera.top-camera.bottom)/size],depthRange:camera.far-camera.near,casters:bakeScene.children.length,triangles:bakeScene.children.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),skippedSkirtTriangles};
 info.casterNames=bakeScene.children.map(m=>m.name);for(const g of temporaryGeometry)g.dispose();scene.userData.massifLight=info;return{target,camera,info};
}
export const massifGLSL=`
uniform sampler2D massifDepth;uniform mat4 massifMatrix;uniform float massifTexel,massifEnabled;uniform vec2 massifBias;
float massifVisibility(vec3 world,vec3 faceNormal,float fallback){
 if(world.x<=230.||massifEnabled<.5)return fallback;
 vec3 sun=normalize(vec3(-.65,.50,.57));
 // Sunward receiver bias in metres. Normal offset is exposed for diagnostics;
 // keeping it zero avoids artifacts from smooth normals across sharp ledges.
 // Coarser surrounding survey faces need a larger receiver tolerance than
 // the preserved close massif. Matched 4/8/12/20 m tests found 12 m removes
 // spurious raster-join self-shadowing; keep the main ridge at 4 m.
 float regional=max(max(smoothstep(2820.,3000.,world.x),smoothstep(160.,280.,world.z)),1.-smoothstep(-1500.,-1370.,world.z));
 vec4 clip=massifMatrix*vec4(world+faceNormal*massifBias.x+sun*(massifBias.y+regional*8.),1.);
 vec3 p=clip.xyz/clip.w*.5+.5;
 float edge=min(min(p.x,1.-p.x),min(p.y,1.-p.y));
 if(edge<=0.||p.z<=0.||p.z>=1.)return fallback;
 float lit=0.;
 vec3 dx=dFdx(p),dy=dFdy(p);float det=dx.x*dy.y-dx.y*dy.x;
 vec2 receiverSlope=abs(det)>.00000000001?vec2(dx.z*dy.y-dy.z*dx.y,dy.z*dx.x-dx.z*dy.x)/det:vec2(0.);
 receiverSlope=clamp(receiverSlope,vec2(-2.),vec2(2.));
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
  vec2 offset=vec2(float(x),float(y))*massifTexel;
  lit+=step(p.z+dot(receiverSlope,offset)-.00010,texture2D(massifDepth,p.xy+offset).r);
 }
 return mix(fallback,mix(.10,1.,lit/9.),smoothstep(0.,.025,edge)*massifEnabled*smoothstep(230.,320.,world.x)*(1.-regional));
}`;



