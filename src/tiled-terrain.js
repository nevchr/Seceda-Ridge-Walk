import {scenicRelief} from './regional-relief.js';
import * as THREE from 'three';

// Screen-error selection over real source levels. Only the selected geometry
// is resident; native height tiles are requested for visible fine chunks.
export async function addTiledTerrain(scene,terrain,material,camera){
 const chunks=[],lookup=new Map(),steps=[2.5,5,10,20,40],rootX=-6700,rootZ=-7700,span=320;
 const info={chunks:0,pending:0,activeTriangles:0,geometryBytes:0,peakGeometryBytes:0,builds:0,levels:[0,0,0,0,0],source:terrain.info};
 for(const n of terrain.nodes.nodes){const c={...n,spacing:10,target:10,edgeSteps:[10,10,10,10],revision:'',mesh:new THREE.Mesh(new THREE.BufferGeometry(),material)};c.mesh.name='Survey native tile '+n.id;c.mesh.receiveShadow=true;c.mesh.userData.massifCaster=true;c.bounds=new THREE.Box3(new THREE.Vector3(n.x,n.min-25,n.z),new THREE.Vector3(n.x+n.width,n.max+25,n.z+n.depth));chunks.push(c);lookup.set(`${Math.round((n.x-rootX)/span)},${Math.round((n.z-rootZ)/span)}`,c);}
 const normalAt=(x,z)=>{const dx=terrain.height(x+2.5,z)-terrain.height(x-2.5,z),dz=terrain.height(x,z+2.5)-terrain.height(x,z-2.5),len=Math.hypot(dx,5,dz);return[-dx/len,5/len,-dz/len];};
 function* geometry(c,spacing,edges){
  const w=Math.ceil(c.width/spacing),h=Math.ceil(c.depth/spacing),p=new Float32Array((w+1)*(h+1)*3),normal=new Float32Array(p.length),indices=new Uint16Array(w*h*6);
  function boundary(xx,zz,coarse,horizontal){const origin=horizontal?rootX:rootZ,v=horizontal?xx:zz,a=Math.floor((v-origin)/coarse)*coarse+origin,u=(v-a)/coarse;const first=horizontal?terrain.heightAt(a,zz,coarse):terrain.heightAt(xx,a,coarse),second=horizontal?terrain.heightAt(a+coarse,zz,coarse):terrain.heightAt(xx,a+coarse,coarse);return first+(second-first)*u;}
  for(let j=0;j<=h;j++){
   for(let i=0;i<=w;i++){const x=c.x+Math.min(i*spacing,c.width),z=c.z+Math.min(j*spacing,c.depth),k=(j*(w+1)+i)*3;let y=terrain.heightAt(x,z,spacing);
    if(j===0&&edges[0]>spacing)y=boundary(x,z,edges[0],true);else if(j===h&&edges[2]>spacing)y=boundary(x,z,edges[2],true);
    if(i===0&&edges[3]>spacing)y=boundary(x,z,edges[3],false);else if(i===w&&edges[1]>spacing)y=boundary(x,z,edges[1],false);
    const n=normalAt(x,z),relief=scenicRelief(x,y,z,n);
    p[k]=x+n[0]*relief;p[k+1]=y+n[1]*relief*.35;p[k+2]=z+n[2]*relief;normal.set(n,k);
   }if(j%8===7)yield;
  }
  let k=0;for(let j=0;j<h;j++)for(let i=0;i<w;i++){const a=j*(w+1)+i,b=a+1,d=a+w+2,e=a+w+1;indices.set([a,e,b,b,e,d],k);k+=6;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('normal',new THREE.BufferAttribute(normal,3));g.setIndex(new THREE.BufferAttribute(indices,1));
  // Geometry supplies the lighting on actual fractures. Keep common world
  // normals only on chunk edges, where independent smoothing would make seams.
  g.computeVertexNormals();const normals=g.attributes.normal.array;
  for(let j=0;j<=h;j++)for(let i=0;i<=w;i++)if(i===0||j===0||i===w||j===h){const k=(j*(w+1)+i)*3;normals.set(normal.subarray(k,k+3),k);}
  g.computeBoundingBox();g.computeBoundingSphere();return g;
 }
 const bytes=g=>g.attributes.position.array.byteLength+g.attributes.normal.array.byteLength+g.index.array.byteLength;
 function neighbors(c){const ix=Math.round((c.x-rootX)/span),iz=Math.round((c.z-rootZ)/span);return [[ix,iz-1],[ix+1,iz],[ix,iz+1],[ix-1,iz]].map(([x,z])=>lookup.get(`${x},${z}`));}
 function sourcePoint(x,z,spacing){const y=terrain.heightAt(x,z,spacing),n=normalAt(x,z),r=scenicRelief(x,y,z,n);return [x+n[0]*r,y+n[1]*r*.35,z+n[2]*r];}
 function stitch(c){
  const g=c.mesh.geometry;if(!g.attributes.position)return;
  const s=c.spacing,w=Math.ceil(c.width/s),h=Math.ceil(c.depth/s),p=g.attributes.position,n=g.attributes.normal,adj=neighbors(c);
  const edges=adj.map(a=>Math.max(s,a?.mesh.geometry.attributes.position?a.spacing:s));
  for(let j=0;j<=h;j++)for(let i=0;i<=w;i++){
   if(i!==0&&j!==0&&i!==w&&j!==h)continue;
   const x=c.x+Math.min(i*s,c.width),z=c.z+Math.min(j*s,c.depth),k=j*(w+1)+i;
   let coarse=s,horizontal=true;
   if(j===0&&edges[0]>coarse)coarse=edges[0];if(j===h&&edges[2]>coarse)coarse=edges[2];
   if(i===0&&edges[3]>coarse){coarse=edges[3];horizontal=false;}if(i===w&&edges[1]>coarse){coarse=edges[1];horizontal=false;}
   let point,normal;
   if(coarse>s){
    const origin=horizontal?rootX:rootZ,v=horizontal?x:z,a=Math.floor((v-origin)/coarse)*coarse+origin,u=(v-a)/coarse;
    const ax=horizontal?a:x,az=horizontal?z:a,bx=horizontal?a+coarse:x,bz=horizontal?z:a+coarse;
    const first=sourcePoint(ax,az,coarse),second=sourcePoint(bx,bz,coarse),na=normalAt(ax,az),nb=normalAt(bx,bz);
    point=first.map((v,k)=>v+(second[k]-v)*u);normal=na.map((v,k)=>v+(nb[k]-v)*u);
   }else{point=sourcePoint(x,z,s);normal=normalAt(x,z);}
   p.setXYZ(k,...point);n.setXYZ(k,...normal);
  }
  p.needsUpdate=true;n.needsUpdate=true;g.boundingBox=c.bounds.clone();g.boundingSphere=c.bounds.getBoundingSphere(new THREE.Sphere());c.actualEdges=edges;
 }
 function install(c,g,spacing,key){if(c.mesh.geometry?.attributes.position){info.geometryBytes-=bytes(c.mesh.geometry);c.mesh.geometry.dispose();}c.mesh.geometry=g;c.spacing=spacing;c.revision=String(spacing);info.geometryBytes+=bytes(g);info.peakGeometryBytes=Math.max(info.peakGeometryBytes,info.geometryBytes);info.builds++;if(!c.mesh.parent)scene.add(c.mesh);stitch(c);for(const adjacent of neighbors(c))if(adjacent)stitch(adjacent);}
 // Initial common 10 m surface is already four times finer linearly than the
 // previous far raster. It also supplies stable shadow geometry during loads.
 for(const c of chunks){const build=geometry(c,10,[10,10,10,10]);let r;do{r=build.next();}while(!r.done);install(c,r.value,10,'10:10,10,10,10');}
 const frustum=new THREE.Frustum(),matrix=new THREE.Matrix4();let jobs=[],active=null,lastKey='',lastPlan=0;
 function plan(force=false){
  camera.updateMatrixWorld();const key=`${Math.floor(camera.position.x/24)},${Math.floor(camera.position.z/24)},${Math.round(camera.rotation.y*9)},${Math.round(camera.rotation.x*9)},${camera.aspect}`;
  const now=performance.now();if(!force&&(key===lastKey||now-lastPlan<350))return;lastKey=key;lastPlan=now;
  frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));const focal=innerHeight/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
  for(const c of chunks){const distance=Math.max(1,c.bounds.distanceToPoint(camera.position));c.distance=distance;let level=0;
   for(let i=4;i>=0;i--)if(c.errors[i]*focal/distance<1.1){level=i;break;}
   if(distance<240)level=0;else if(!frustum.intersectsBox(c.bounds))level=Math.max(level,3);
   c.target=steps[level];
  }
  for(const c of chunks){const ix=Math.round((c.x-rootX)/span),iz=Math.round((c.z-rootZ)/span);c.edgeSteps=[[ix,iz-1],[ix+1,iz],[ix,iz+1],[ix-1,iz]].map(([x,z])=>Math.max(c.target,lookup.get(`${x},${z}`)?.target||c.target));c.key=String(c.target);}
  jobs=chunks.filter(c=>c.key!==c.revision).sort((a,b)=>a.distance-b.distance);terrain.retain(chunks.map(c=>({...c,spacing:Math.min(c.target,c.spacing)})));info.pending=jobs.length+(active?1:0);info.levels=steps.map(s=>chunks.filter(c=>c.target===s).length);
 }
 function pump(budget=5){const end=performance.now()+budget;while(performance.now()<end){
  if(!active){const c=jobs.shift();if(!c)break;const spacing=c.target,key=c.key,edges=neighbors(c).map(a=>Math.max(spacing,a?.spacing||spacing));active={c,spacing,key,ready:false};const job=active;terrain.ensureArea(c.x,c.z,c.width,c.depth,spacing).then(()=>{job.build=geometry(c,spacing,edges);job.ready=true;}).catch(e=>{console.error(e);job.failed=true;});}
  if(active.failed){active=null;continue;}if(!active.ready)break;const r=active.build.next();if(r.done){install(active.c,r.value,active.spacing,active.key);active=null;}
 }info.pending=jobs.length+(active?1:0);info.activeTriangles=chunks.reduce((s,c)=>s+c.mesh.geometry.index.count/3,0);}
 plan(true);while(info.pending){pump(16);await new Promise(r=>setTimeout(r,0));}
 info.chunks=chunks.length;return {info,chunks,update(){plan();pump();},async settle(){plan(true);while(info.pending){pump(16);await new Promise(r=>setTimeout(r,0));}}};
}
