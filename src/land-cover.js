import {inWalkingArea} from './exploration.js';
import {groundMaterial} from './materials.js';
import {chipGeometry} from './jointed-rock.js';
import * as THREE from 'three';
import {noise2,shadowBounds,landscapeMaps} from './landscape.js';
import {routeDistance} from './terrain.js';

// V0.8 original, terrain-conditioned art direction. This is not a vegetation
// survey. Reference 02 supports conifer stands beneath open alpine pasture.
export const coverUniforms={coverMap:{value:null},coverBounds:{value:shadowBounds},landscapeStrength:{value:1}};
const smooth=(x,a,b)=>THREE.MathUtils.smoothstep(x,a,b);
let mappedCover=null;
export function mappedCoverAt(x,z){
 if(!mappedCover)return [0,0,0,0];
 const u=THREE.MathUtils.clamp((x+6700)/5-.5,0,2798.999),v=THREE.MathUtils.clamp((z+7700)/5-.5,0,2398.999),i=Math.floor(u),j=Math.floor(v),a=u-i,b=v-j;
 return [0,1,2,3].map(c=>{const k=(j*2800+i)*4+c;return ((mappedCover[k]*(1-a)+mappedCover[k+4]*a)*(1-b)+(mappedCover[k+11200]*(1-a)+mappedCover[k+11204]*a)*b)/255;});
}
export function coverAt(terrain,x,z){
 if(mappedCover&&!inWalkingArea(x,z,30)){
  const c=mappedCoverAt(x,z),s=terrain.slope(x,z),h=terrain.height(x,z);
  return [c[0]*(1-smooth(s,1.2,2.0))*(.72+noise2(x*.031,z*.031)*.28),c[1],c[2],c[3]];
 }

 const h=terrain.height(x,z),dx=(terrain.height(x+12,z)-terrain.height(x-12,z))/24,dz=(terrain.height(x,z+12)-terrain.height(x,z-12))/24,slope=Math.hypot(dx,dz);
 const curve=(terrain.height(x-36,z)+terrain.height(x+36,z)+terrain.height(x,z-36)+terrain.height(x,z+36)-4*h)/36;
 const patch=.66*noise2(x*.004+38,z*.004-17)+.34*noise2(x*.015,z*.015);
 const timberline=-340+(noise2(x*.0017+5,z*.0017)-.5)*150;
 const forest=(1-smooth(h,timberline-100,timberline+55))*(1-smooth(slope,.60,1.12))*smooth(patch,.39,.65);
 let debris=0;const len=slope||1;
 for(const d of [55,125,240])debris=Math.max(debris,smooth(terrain.slope(x+dx/len*d,z+dz/len*d),.8,1.65)*(1-d/410));
 return [forest,1-1/Math.sqrt(1+slope*slope),THREE.MathUtils.clamp(.5+curve*.32,0,1),debris];
}
export async function prepareLandCover(terrain){
 const w=2800,h=2400; mappedCover=new Uint8Array(await(await fetch('./assets/terrain-v14/landuse.rgba')).arrayBuffer());
 const tex=new THREE.DataTexture(mappedCover,w,h);tex.magFilter=THREE.LinearFilter;tex.minFilter=THREE.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;coverUniforms.coverMap.value=tex;
 return {width:w,height:h,bytes:mappedCover.byteLength,metresPerTexel:[5,5],source:'CC0 provincial real land use map 2001/2005',channels:['forest','rock','scree','shrub']};
}

// Opaque, layered conifer crowns: no alpha overdraw, shadow maps, leaf cards,
// or close grass instances across the valley. Tile bounds permit CPU culling.
function coniferGeometry(tiers=8,sides=8){
 const p=[],c=[];
 const triangle=(a,b,d,shade)=>{p.push(...a,...b,...d);for(const v of [a,b,d]){const tip=.84+v[1]*.22;c.push(.053*shade*tip,.094*shade*tip,.046*shade*tip);}};
 if(tiers<=3){
  // At kilometres distance only the broken tapered crown remains resolvable.
  for(let tier=0;tier<tiers;tier++)for(let side=0;side<sides;side++){
   const t=tier/(tiers-1),a=side/sides*Math.PI*2+tier*1.23,b=(side+1)/sides*Math.PI*2+tier*1.23;
   const r=.24*(1-t*.8),ra=r*(.72+noise2(side*5,tier*8)*.48),rb=r*(.72+noise2((side+1)*5,tier*8)*.48),y=.08+t*.65;
   triangle([Math.cos(a)*ra,y,Math.sin(a)*ra],[Math.cos(b)*rb,y+.015,Math.sin(b)*rb],[.018*Math.sin(tier*4),Math.min(1,y+.35),0],.85+t*.28);
  }
 }else{
  // Original subalpine spruce study: a narrow leader, uneven drooping branch
  // whorls, open gaps and asymmetric foliage sprays instead of stacked cones.
  for(let tier=0;tier<tiers;tier++)for(let side=0;side<sides;side++){
   const t=tier/(tiers-1),a=side/sides*Math.PI*2+tier*2.399+(noise2(side*3.3,tier*11)-.5)*.45;
   const y=.13+t*.76+(noise2(side*7.1,tier*3)-.5)*.042,r=(.205*(1-t*.86))*(.70+noise2(side*5.7,tier*17)*.55),wide=r*(.42+noise2(side*7,tier)*.25);
   const point=(d,h,w=0)=>[Math.cos(a)*d-Math.sin(a)*w,y+h,Math.sin(a)*d+Math.cos(a)*w];
   const root=point(.012,.035),tip=point(r,-.035*(1-t)),left=point(r*.47,.025,-wide),right=point(r*.59,.018,wide),top=point(r*.35,.115*(1-t*.65));
   const shade=.76+noise2(side*3,tier*11)*.42;
   triangle(root,left,top,shade*.91);triangle(left,tip,top,shade);triangle(tip,right,top,shade*1.03);triangle(right,root,top,shade*.86);
  }
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2,b=(k+1)/6*Math.PI*2;triangle([Math.cos(a)*.009,0,Math.sin(a)*.009],[Math.cos(b)*.009,0,Math.sin(b)*.009],[.009,1,0],.49);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();return g;
}
export function addValleyWoodland(scene,terrain){
 const geometries=[coniferGeometry(),coniferGeometry(4,6),coniferGeometry(3,4)],material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});
 material.onBeforeCompile=s=>{
  Object.assign(s.uniforms,{forestHorizon:{value:landscapeMaps.shadow},forestCloud:{value:landscapeMaps.cloud},forestBounds:{value:shadowBounds}});
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 forestWorld;');
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n forestWorld=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 forestWorld;uniform sampler2D forestHorizon,forestCloud;uniform vec4 forestBounds;');
  s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n vec2 uv=(forestWorld.xz-forestBounds.xy)/forestBounds.zw;reflectedLight.directDiffuse*=texture2D(forestHorizon,uv).r*texture2D(forestCloud,uv).r;');
 };
 const tiles=new Map(),matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),color=new THREE.Color();let count=0;
 for(let z=-6100;z<3200;z+=8.5)for(let x=-3900;x<6900;x+=8.5){
  const xx=x+(noise2(x*7.91,z*7.13)-.5)*25,zz=z+(noise2(x*4.53+77,z*4.87)-.5)*25,h=terrain.height(xx,zz);
  if(h>-170)continue;
  const f=coverAt(terrain,xx,zz)[0];if(noise2(x*9.12+9,z*7.84)>f*.80||f<.10)continue;
  const height=(7+noise2(x*.81,z*.79)*16)*(1-smooth(h,-450,-250)*.55),size=height*(1.03+noise2(x,z)*.68);
  const key=`${Math.floor(xx/640)},${Math.floor(zz/640)}`;if(!tiles.has(key))tiles.set(key,[]);
  q.setFromAxisAngle(up,noise2(x+81,z-11)*Math.PI*2);matrix.compose(new THREE.Vector3(xx,h-.55,zz),q,new THREE.Vector3(size,height,size));
  const hue=noise2(xx*.03,zz*.03);color.setRGB(.88+hue*.46,.96+hue*.32,.86+hue*.29);
  tiles.get(key).push({matrix:matrix.clone(),color:color.clone()});count++;
 }
 const meshes=[],colliders=[];
 for(const items of tiles.values())for(const item of items){const e=item.matrix.elements;if(inWalkingArea(e[12],e[14],3))colliders.push({x:e[12],z:e[14],r:Math.max(.18,Math.hypot(e[4],e[5],e[6])*.024)});}
 let triangles=0;const levels=[0,0,0];
 for(const [key,items] of tiles){const [tx,tz]=key.split(',').map(Number),d=Math.hypot(tx*640+320-74,tz*640+320-15),level=d<1700?0:d<3500?1:2,geometry=geometries[level];levels[level]+=items.length;triangles+=items.length*geometry.attributes.position.count/3;const m=new THREE.InstancedMesh(geometry,material,items.length);m.name=`Authored subalpine conifers ${key}`;items.forEach((t,i)=>{m.setMatrixAt(i,t.matrix);m.setColorAt(i,t.color);});m.computeBoundingSphere();scene.add(m);meshes.push(m);}
 const info={instances:count,trianglesPerLevel:geometries.map(g=>g.attributes.position.count/3),instancesPerLevel:levels,totalTriangles:triangles,tiles:tiles.size,instanceBytes:count*76,geometryBytes:geometries.reduce((n,g)=>n+Object.values(g.attributes).reduce((b,a)=>b+a.array.byteLength,0),0)};
 info.walkableTreeColliders=colliders.length;scene.userData.woodland=info;return {meshes,info,colliders};
}

export const coverGLSL=`
uniform sampler2D coverMap;uniform vec4 coverBounds;uniform float landscapeStrength;
vec4 landCover(vec3 p){return texture2D(coverMap,clamp((p.xz-coverBounds.xy)/coverBounds.zw,0.,1.));}
vec3 pastureColour(vec3 p,vec4 cover,vec4 geology,vec3 nearColour){
 // Photo-derived turf texture remains fine at middle distance. Survey
 // concavity/aspect controls moist hollows, dry shoulders and broken ribs.
 float broad=fbm(vec3(p.x*.008,p.y*.019,p.z*.008));
 float sward=groundCoverSample(p.xz/6.3).g;
 float contour=noise3(vec3(p.x*.027,p.y*.071,p.z*.027));
 float shelter=smoothstep(.43,.67,geology.g);
 float shoulder=(1.-smoothstep(.29,.54,geology.g))*smoothstep(.075,.27,geology.r);
 vec3 meadow=mix(vec3(.083,.134,.034),vec3(.127,.170,.052),broad);
 meadow=mix(meadow,vec3(.061,.119,.033),shelter*.53);
 meadow=mix(meadow,vec3(.156,.171,.074),shoulder*.62);
 vec3 fine=texture2D(meadowPhoto,p.xz/1.4).rgb*vec3(.74,.87,.66);
 float fleck=groundCoverSample((p.xz+vec2(p.y*.13,-p.y*.11))/17.3).g;
 float swathe=groundCoverSample(p.xz/47.7+vec2(.31,.67)).g;
 meadow*=.66+sward*.62+fleck*.72+swathe*.33;
 meadow=mix(meadow,fine*(.85+swathe),.23);
 // Coarser meadow grass has a little dried seed litter on exposed shoulders.
 float dry=smoothstep(.52,.70,contour)*shoulder;
 meadow=mix(meadow,meadow*vec3(1.19,1.07,.77),dry*.4);
 // Existing licensed aerial grass/rock at its 15 m footprint adds visible
 // thin-soil grain on middle slopes; no close meadow or photo backdrop swap.
 vec3 soilSurface=regionalGroundSample((p.xz+vec2(p.y*.13,-p.y*.08))/15.).rgb;
 float soilLuma=dot(soilSurface,vec3(.299,.587,.114));
 float mineral=1.-smoothstep(.023,.080,soilSurface.g-soilSurface.b);
 meadow*=mix(.77,1.22,smoothstep(.035,.27,soilLuma));
 float thinSoil=(.10+shoulder*.72+smoothstep(.07,.22,geology.r)*.38)*(1.-cover.r);
 meadow=mix(meadow,soilSurface*vec3(.84,.87,.80),mineral*thinSoil);
 // Closed canopy substrate is deliberately lighter than the tree silhouettes.
 vec3 forest=mix(vec3(.055,.091,.043),vec3(.097,.129,.068),broad)*(.85+sward*.25);
 meadow=mix(meadow,forest,smoothstep(.12,.68,cover.r)*.88);
 // V15: colour ratios retain real geographic variation. The derivative compresses
 // photographed illumination; material texture and current sun shape the surface.
 vec3 mapped=mappedGroundColour(p);
 float summerVariation=.84+swathe*.65;
 mapped*=summerVariation;
 float pastureRib=smoothstep(.26,.67,geology.g+noise3(vec3(p.x*.018,p.y*.06,p.z*.018))*.14-.07);
 mapped=mix(mapped*vec3(1.06,1.045,.97),mapped*vec3(.78,.88,.74),pastureRib*.35);
 mapped=mix(mapped,mapped*vec3(.82,.94,.81),shelter*.4);
 mapped=mix(mapped,mapped*vec3(1.17,1.075,.92),shoulder*.46);
 float grainCover=mix(.78,1.18,smoothstep(.025,.25,soilLuma));
 mapped*=grainCover;
 float distanceBlend=smoothstep(75.,400.,distance(p.xz,cameraPosition.xz));
 float photoWeight=distanceBlend*(1.-smoothstep(.20,.43,geology.r));
 return mix(meadow,mapped,photoWeight*.88);
}
`;

export function addPastureFragments(scene,terrain,route){
 // Embedded metre-scale limestone blocks: grouped in thin turf and below
 // steep ground, kept beyond the V0.7 close-plant corridor. Cosmetic only.
 const g=chipGeometry(4987),a=g.attributes.position;
 for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);a.setXYZ(i,x*(.83+noise2(y*7,z*8)*.3),y*.46,z);}
 g.computeVertexNormals();
 const material=groundMaterial(true);
 const tiles=new Map(),m=new THREE.Matrix4(),q=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0);let count=0;
 for(let z=-2200;z<850;z+=9)for(let x=-550;x<4100;x+=9){
  const xx=x+(noise2(x*3.71,z*4.19)-.5)*12,zz=z+(noise2(x*2.17,z*6.1)-.5)*12,h=terrain.height(xx,zz),slope=terrain.slope(xx,zz);
  // Keep cosmetic, non-colliding outcrops outside the entire playable area,
  // including off-trail exploration, plus clearance for their full radius.
  if(inWalkingArea(xx,zz,25))continue;
  if(h<-280||h>200||slope<.20||slope>1.1||routeDistance(route,xx,zz).distance<88)continue;
  const patch=noise2(xx*.024+h*.008,zz*.024-h*.005);if(patch<.62||noise2(x*4.39,z*7.37)>.27)continue;
  const size=.65+Math.pow(noise2(x*.77,z*.73),2)*3.2;
  q.setFromAxisAngle(up,noise2(x,z)*6.28);m.compose(new THREE.Vector3(xx,h-.20,zz),q,new THREE.Vector3(size,Math.max(.5,size*.65),size*.72));
  const key=`${Math.floor(xx/512)},${Math.floor(zz/512)}`;if(!tiles.has(key))tiles.set(key,[]);tiles.get(key).push(m.clone());count++;
 }
 for(const [key,items] of tiles){const mesh=new THREE.InstancedMesh(g,material,items.length);mesh.name=`Authored pasture limestone ${key}`;items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();scene.add(mesh);}
 scene.userData.pastureFragments={instances:count,trianglesPerInstance:g.attributes.position.count/3,instanceBytes:count*64,tiles:tiles.size};
}
