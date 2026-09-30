import * as THREE from 'three';
import {landscapeMaps,trailBounds,shadowBounds} from './landscape.js';
import {massifUniforms,massifGLSL} from './massif-light.js';
import {ORIGIN} from './terrain.js';
import {habitatUniforms,habitatGLSL} from './meadow-habitat.js';

export const turfGLSL=`
float turfHash(vec2 p){p=fract(p*vec2(.1031,.11369));p+=dot(p,p.yx+19.19);return fract(p.x*p.y);}
float turfNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(turfHash(i),turfHash(i+vec2(1,0)),f.x),mix(turfHash(i+vec2(0,1)),turfHash(i+vec2(1,1)),f.x),f.y);}
float turfPatch(vec2 p){return .55*turfNoise(p*.055)+.30*turfNoise(p*.28+73.)+.15*turfNoise(p*1.1);}
vec3 turfColour(vec2 p){
 float f=smoothstep(.26,.74,.64*turfNoise(p*.045)+.36*turfNoise(p*.13+73.));
 vec3 lush=mix(vec3(.043,.092,.025),vec3(.101,.159,.045),f);
 float dry=smoothstep(.43,.77,turfNoise(p*.023+103.))*smoothstep(.28,.75,turfNoise(p*.11));
 float fine=.82+.40*turfNoise(p*.73)+.16*turfNoise(p*3.8);
 return mix(lush,vec3(.154,.173,.080),dry*.64)*fine;
}
`;
let turfTexture;
export function shortTurfTexture(){
 if(turfTexture)return turfTexture;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d');
 let seed=74421;const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 c.fillStyle='#929292';c.fillRect(0,0,1024,1024);
 // Original seamlessly wrapped, overlapping fine leaf strokes. No photographs.
 for(let i=0;i<19000;i++){
  const x=rnd()*1024,y=rnd()*1024,a=rnd()*Math.PI*2,len=22+rnd()*70,g=Math.round(75+rnd()*140),dx=Math.cos(a)*len,dy=Math.sin(a)*len;
  c.strokeStyle=`rgb(${g},${g},${g})`;c.lineWidth=.7+rnd()*1.3;
  for(const ox of [-1024,0,1024])for(const oy of [-1024,0,1024]){c.beginPath();c.moveTo(x+ox,y+oy);c.quadraticCurveTo(x+dx*.6+ox,y+dy*.3+oy,x+dx+ox,y+dy+oy);c.stroke();}
 }
 turfTexture=new THREE.CanvasTexture(canvas);turfTexture.wrapS=turfTexture.wrapT=THREE.RepeatWrapping;turfTexture.anisotropy=12;return turfTexture;
}

export function addTurf(scene,terrain){
 const l=terrain.layers[0],w=l.width+1,h=l.height+1,values=new Float32Array(w*h);
 const x0=l.bbox[0]-ORIGIN.east,z0=ORIGIN.north-l.bbox[3];
 for(let j=0;j<h;j++)for(let i=0;i<w;i++)values[j*w+i]=terrain.height(x0+i*l.step,z0+j*l.step);
 const heightMap=new THREE.DataTexture(values,w,h,THREE.RedFormat,THREE.FloatType);heightMap.needsUpdate=true;
 const heightGLSL=`
 uniform sampler2D turfHeight,trailMap;uniform vec4 trailBounds;uniform vec3 turfEye;uniform float turfTime;
 float gridH(vec2 cell){return texture2D(turfHeight,(cell+.5)/vec2(${w}.,${h}.)).r;}
 float groundH(vec2 p){vec2 g=(p-vec2(${x0}.,${z0}.))/${l.step},c=floor(g),f=fract(g);float a=gridH(c),b=gridH(c+vec2(1,0)),d=gridH(c+vec2(0,1)),e=gridH(c+vec2(1,1));return f.x+f.y<1.?a+(b-a)*f.x+(d-a)*f.y:e+(d-e)*(1.-f.x)+(b-e)*(1.-f.y);}
 float hashT(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 `;
 const meshes=[],materials=[];let seed=76443;const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 for(let lod=0;lod<3;lod++){
 seed=76443;
 const count=lod===2?3072:24576,positions=[],roots=[],colors=[],indices=[];
  for(let i=0;i<count;i++){
   const broad=rnd()<.09,root=[rnd()*8,rnd()*8],a=rnd()*Math.PI*2,height=broad?.055+rnd()*.075:.08+rnd()*.20,width=broad?.007+rnd()*.009:.0018+rnd()*.0042,bend=height*(.35+rnd()*.85),base=positions.length/3;
   const shade=.68+rnd()*.65,dry=rnd()<.08;
   const rows=lod===0?5:lod===1?3:2;
   for(let row=0;row<rows;row++){
    const t=row/(rows-1),w=width*(1-Math.pow(t,1.5))+.0001,curve=bend*t*t,y=height*Math.sin(t*1.55),twist=t*.65;
    for(const side of [-1,1]){
     const x=curve+side*w*Math.cos(twist),z=side*w*Math.sin(twist);
     positions.push(x*Math.cos(a)-z*Math.sin(a),y,x*Math.sin(a)+z*Math.cos(a));roots.push(...root);
     const v=shade*(.62+.47*t);colors.push(v*(dry?1.42:1),v*(dry?1.18:1),v*(dry?1.12:1));
    }
    if(row){const k=base+row*2;indices.push(k-2,k-1,k,k-1,k+1,k);}
   }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('turfRoot',new THREE.Float32BufferAttribute(roots,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,side:THREE.DoubleSide,roughness:1});materials.push(mat);
  mat.customProgramCacheKey=()=>`continuous-turf-v13-${lod}`;
  mat.onBeforeCompile=s=>{
   Object.assign(s.uniforms,massifUniforms,habitatUniforms,{turfHeight:{value:heightMap},trailMap:{value:landscapeMaps.trail},trailBounds:{value:trailBounds},turfEye:{value:new THREE.Vector3()},turfTime:{value:0},horizonMap:{value:landscapeMaps.shadow},cloudMap:{value:landscapeMaps.cloud},shadowBounds:{value:shadowBounds}});
   s.vertexShader=s.vertexShader.replace('#include <common>',`#include <common>\nattribute vec2 turfRoot;varying vec3 turfWorld,turfNormal;${heightGLSL}${turfGLSL}${habitatGLSL}`);
   s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vec2 tile=instanceMatrix[3].xz;
    vec2 root=mod(turfRoot+vec2(hashT(tile),hashT(tile+43.))*8.,8.);
    vec2 world=tile+root;
    vec2 grad=vec2(groundH(world+vec2(.18,0))-groundH(world-vec2(.18,0)),groundH(world+vec2(0,.18))-groundH(world-vec2(0,.18)))/.36;
    turfNormal=normalize(vec3(-grad.x,1.,-grad.y));
    float d=distance(world,turfEye.xz);
    float fade=${lod===0?'1.-step(17.,d)':lod===1?'step(17.,d)*(1.-smoothstep(22.,33.,d))':'smoothstep(22.,33.,d)*(1.-smoothstep(58.,90.,d))'};
    vec2 uv=(world-trailBounds.xy)/trailBounds.zw;vec2 path=texture2D(trailMap,clamp(uv,0.,1.)).rg;
    float inMap=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
    float mask=mix(1.,smoothstep(path.g-.015,path.g+.15,path.r*5.+(hashT(world)-.5)*.07),inMap);
    vec4 habitat=meadowHabitat(world);
    mask*=(1.-smoothstep(.86,1.23,length(grad)))*(1.-habitat.g*.78);
    float size=fade*mask*(.70+.76*habitat.r+.32*smoothstep(.23,.77,turfPatch(world)));
    transformed.xz*=size;transformed.y*=size;
    transformed.xz+=sin(turfTime*1.1+world.x*.8+world.y*.7)*position.y*.06*size;
    transformed.xz+=root;transformed.y+=groundH(world)+.003;
    turfWorld=vec3(world,0.).xzy; turfWorld.y=transformed.y;
   `);
   s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 turfWorld,turfNormal;uniform sampler2D horizonMap,cloudMap;uniform vec4 shadowBounds;${turfGLSL}${massifGLSL}`);
   s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\ndiffuseColor.rgb*=turfColour(turfWorld.xz);`);
   s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>\nnormal=normalize(normal*.52+mat3(viewMatrix)*turfNormal*.70);`);
   s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
    vec2 uv=clamp((turfWorld.xz-shadowBounds.xy)/shadowBounds.zw,0.,1.);
    float visibility=massifVisibility(turfWorld,turfNormal,texture2D(horizonMap,uv).r)*texture2D(cloudMap,uv).r;
    reflectedLight.directDiffuse*=visibility;reflectedLight.indirectDiffuse*=.86+visibility*.14;reflectedLight.indirectDiffuse+=diffuseColor.rgb*.18*visibility;
   `);mat.userData.shader=s;
  };
  const mesh=new THREE.InstancedMesh(g,mat,600);mesh.name=`Continuous individual turf LOD${lod}`;mesh.frustumCulled=false;mesh.receiveShadow=true;mesh.castShadow=false;mesh.count=0;scene.add(mesh);meshes.push(mesh);
 }
 const matrix=new THREE.Matrix4();let oldKey='';
 const state={enabled:true,meshes,materials,update(time,camera){
  for(const m of materials)if(m.userData.shader){m.userData.shader.uniforms.turfEye.value.copy(camera.position);m.userData.shader.uniforms.turfTime.value=time;}
  const cx=Math.floor(camera.position.x/8),cz=Math.floor(camera.position.z/8),heading=Math.round(camera.rotation.y*8),key=`${cx},${cz},${heading}`;
  for(const m of meshes)m.visible=state.enabled;
  if(key===oldKey)return;oldKey=key;
  const forward=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  for(let lod=0;lod<3;lod++){const mesh=meshes[lod],radius=lod===0?23:lod===1?39:96;let n=0;
   for(let x=cx-12;x<=cx+12;x++)for(let z=cz-12;z<=cz+12;z++){
    const xx=x*8+4,zz=z*8+4,dx=xx-camera.position.x,dz=zz-camera.position.z,d=Math.hypot(dx,dz);
    if(d>radius||lod===1&&d<11||lod===2&&d<16||xx<x0+8||xx>x0+l.width*l.step-8||zz<z0+8||zz>z0+l.height*l.step-8)continue;
    if(d>13&&(dx*forward.x+dz*forward.z)/d<.2-10/d)continue;
    matrix.makeTranslation(x*8,0,z*8);mesh.setMatrixAt(n++,matrix);
   }mesh.count=n;mesh.instanceMatrix.needsUpdate=true;
  }
 },setQuality(){},info:{nearBladesPerSquareMetre:384,midBladesPerSquareMetre:48,curveRows:[5,3,2],fineCurveUntilMetres:17,nearFade:[22,33],midFade:[58,90],tileMetres:8,heightTexture:[w,h],heightBytes:values.byteLength}};
 return state;
}

