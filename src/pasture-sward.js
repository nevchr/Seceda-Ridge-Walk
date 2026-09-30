import * as THREE from 'three';
import {turfGLSL} from './turf.js';
import {landscapeMaps,shadowBounds,trailBounds} from './landscape.js';
import {coverUniforms} from './land-cover.js';

// Low uneven crowns bridge fine near blades and the regional material. This
// bounded middle layer follows the player; it is not valley-wide close grass.
export function addPastureSward(scene,terrain){
 // A visual apron wider than every reachable camera's 458 m detail radius.
 // Heights still sample the unchanged collision survey inside the walk and
 // native regional data outside it. No rectangular meadow cutoff near the rim.
 const xmin=-750,zmin=-780,step=2.5,w=941,h=765,data=new Float32Array(w*h);
 for(let j=0;j<h;j++)for(let i=0;i<w;i++)data[j*w+i]=terrain.height(xmin+i*step,zmin+j*step);
 const height=new THREE.DataTexture(data,w,h,THREE.RedFormat,THREE.FloatType);height.needsUpdate=true;
 let seed=5832;const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 const p=[],roots=[],col=[];
 // Broad, low living clumps make a fine three-dimensional carpet in the
 // transition, rather than a repeated set of isolated upright triangle strips.
 for(let i=0;i<320;i++){
  const x=rnd()*16,z=rnd()*16,a=rnd()*Math.PI*2,r=.18+rnd()*.36,y=.11+rnd()*.22;
  const ring=Array.from({length:7},(_,j)=>{const t=j/7*Math.PI*2+a,rr=r*(.65+rnd()*.6);return [Math.cos(t)*rr,.005,Math.sin(t)*rr];});
  const center=[r*.18,y,r*.12];
  for(let k=0;k<7;k++)for(const v of [ring[k],ring[(k+1)%7],center]){
   p.push(...v);roots.push(x,z);const shade=.71+v[1]/y*.49;col.push(shade,shade,shade);
  }
 }

 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('swardRoot',new THREE.Float32BufferAttribute(roots,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});
 const eye={value:new THREE.Vector3()};
 material.onBeforeCompile=s=>{
  Object.assign(s.uniforms,{swardCover:coverUniforms.coverMap,swardHeight:{value:height},swardEye:eye,swardTrail:{value:landscapeMaps.trail},swardTrailBounds:{value:trailBounds},swardHorizon:{value:landscapeMaps.shadow},swardCloud:{value:landscapeMaps.cloud},swardBounds:{value:shadowBounds}});
  s.vertexShader=s.vertexShader.replace('#include <common>',`#include <common>
  attribute vec2 swardRoot;varying vec3 swardWorld,swardNormal;uniform sampler2D swardHeight,swardTrail,swardCover;uniform vec4 swardTrailBounds;uniform vec3 swardEye;${turfGLSL}
  float gridS(vec2 c){return texture2D(swardHeight,(c+.5)/vec2(${w}.,${h}.)).r;}
  float heightS(vec2 p){vec2 g=(p-vec2(${xmin}.,${zmin}.))/${step},c=floor(g),f=fract(g);float a=gridS(c),b=gridS(c+vec2(1,0)),d=gridS(c+vec2(0,1)),e=gridS(c+vec2(1,1));return f.x+f.y<1.?a+(b-a)*f.x+(d-a)*f.y:e+(d-e)*(1.-f.x)+(b-e)*(1.-f.y);}
  `);
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec2 tile=instanceMatrix[3].xz,root=mod(swardRoot+vec2(turfHash(tile),turfHash(tile+73.))*16.,16.),world=tile+root;
   vec2 gradient=vec2(heightS(world+vec2(1,0))-heightS(world-vec2(1,0)),heightS(world+vec2(0,1))-heightS(world-vec2(0,1)))*.5;
   swardNormal=normalize(vec3(-gradient.x,1.,-gradient.y));
   float d=distance(world,swardEye.xz),fade=smoothstep(60.,110.,d)*(1.-smoothstep(310.,440.,d));
   vec2 uv=(world-swardTrailBounds.xy)/swardTrailBounds.zw;vec2 path=texture2D(swardTrail,clamp(uv,0.,1.)).rg;
   float inMap=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
   float mask=mix(1.,smoothstep(path.g,path.g+.2,path.r*5.),inMap)*(1.-smoothstep(.60,.85,length(gradient)));
   vec4 cover=texture2D(swardCover,(world+vec2(6700.,7700.))/vec2(14000.,12000.));
   mask*=(1.-cover.r*.95)*(1.-cover.g*.95)*(1.-cover.b*.9);
   float clump=.25+1.25*smoothstep(.3,.74,turfPatch(world));transformed*=fade*mask*clump;
   transformed.y+=dot(gradient,transformed.xz);
   transformed.xz+=root;transformed.y+=heightS(world);swardWorld=vec3(world.x,transformed.y,world.y);
  `);
  s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
  varying vec3 swardWorld,swardNormal;uniform sampler2D swardHorizon,swardCloud;uniform vec4 swardBounds;${turfGLSL}`);
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb*=turfColour(swardWorld.xz)*.95;');
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n normal=normalize(normal*.20+mat3(viewMatrix)*swardNormal*.80);');
  s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n vec2 uv=(swardWorld.xz-swardBounds.xy)/swardBounds.zw;reflectedLight.directDiffuse*=texture2D(swardHorizon,uv).r*texture2D(swardCloud,uv).r;');
 };
 const mesh=new THREE.InstancedMesh(g,material,3400);mesh.name='Middle pasture sward 60-440 m';mesh.frustumCulled=false;mesh.count=0;scene.add(mesh);
 const matrix=new THREE.Matrix4();let oldKey='';
 return {info:{trianglesPerTile:2240,tileMetres:16,densityPerSquareMetre:1.25,fadeMetres:[60,110,310,440],heightBytes:data.byteLength,geometryBytes:p.length*4+roots.length*4+col.length*4+p.length*4},update(camera){
  eye.value.copy(camera.position);const cx=Math.floor(camera.position.x/16),cz=Math.floor(camera.position.z/16),key=`${cx},${cz},${Math.round(camera.rotation.y*8)}`;if(key===oldKey)return;oldKey=key;
  const f=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);let n=0;
  for(let x=cx-29;x<=cx+29;x++)for(let z=cz-29;z<=cz+29;z++){
   const xx=x*16+8,zz=z*16+8,dx=xx-camera.position.x,dz=zz-camera.position.z,d=Math.hypot(dx,dz);
   if(d<48||d>458||xx<xmin+16||xx>xmin+(w-1)*step-16||zz<zmin+16||zz>zmin+(h-1)*step-16||(dx*f.x+dz*f.z)/d<.12-18/d)continue;
   matrix.makeTranslation(x*16,0,z*16);mesh.setMatrixAt(n++,matrix);
  }mesh.count=n;mesh.instanceMatrix.needsUpdate=true;
 }};
}
