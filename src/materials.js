import {landformGLSL} from './landform.js';
import {coverUniforms,coverGLSL} from './land-cover.js';
import {turfGLSL} from './turf.js';
import {massifUniforms,massifGLSL} from './massif-light.js';
import * as THREE from 'three';
import {landscapeMaps,trailBounds,shadowBounds,geologyBounds} from './landscape.js';

export const noiseGLSL=`
float hash31(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return .52*noise3(p)+.27*noise3(p*2.03)+.14*noise3(p*4.07)+.07*noise3(p*8.13);}
`;
const maps={};
export async function prepareMaterials(){
 const loader=new THREE.TextureLoader();
 for(const [key,file] of [['rock_face','v09/marble_cliff_04-Diffuse.jpg'],['beddedStone','marble_cliff_05.jpg']]){
  const t=await loader.loadAsync('./assets/materials/'+file);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=12;t.colorSpace=THREE.SRGBColorSpace;maps[key]=t;
 }

 for(const [key,file,srgb] of [['stonePacked','v09/marble_cliff_04-NRH.png',false],['smallStone','v09/marble_rock_01-Diffuse.jpg',true],['smallPacked','v09/marble_rock_01-NRH.png',false],['gravel','gravelly_sand.jpg',true],['gravelPacked','v13/gravelly_sand-HR.png',false],['meadowPhoto','v13/grass005-Color.jpg',true],['meadowPacked','v13/grass005-NA.png',false]]){
 const t=await loader.loadAsync('./assets/materials/'+file);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=12;if(srgb)t.colorSpace=THREE.SRGBColorSpace;maps[key]=t;
 }
 // Two existing CC0 ingredients in an array preserve the original meadow
 // pixels/UVs without consuming a seventeenth fragment texture unit.
 const sources=await Promise.all(['./assets/materials/v13/grass_ground-diff.jpg','./assets/materials/aerial_grass_rock.jpg',...Array.from({length:12},(_,i)=>`./assets/terrain-v15/ortho-${Math.floor(i/4)}-${i%4}.jpg`)].map(f=>new THREE.ImageLoader().loadAsync(f)));
 const width=2048,bytes=new Uint8Array(width*width*4*sources.length),canvas=document.createElement('canvas');canvas.width=canvas.height=width;const context=canvas.getContext('2d',{willReadFrequently:true});
 sources.forEach((image,i)=>{context.clearRect(0,0,width,width);context.drawImage(image,0,0);const pixels=context.getImageData(0,0,width,width).data;for(let row=0;row<width;row++)bytes.set(pixels.subarray(row*width*4,(row+1)*width*4),(i*width*width+(width-1-row)*width)*4);});
 const array=new THREE.DataArrayTexture(bytes,width,width,sources.length);array.colorSpace=THREE.SRGBColorSpace;array.wrapS=array.wrapT=THREE.RepeatWrapping;array.minFilter=THREE.LinearMipmapLinearFilter;array.magFilter=THREE.LinearFilter;array.generateMipmaps=true;array.anisotropy=12;array.needsUpdate=true;maps.meadowBroad=array;

}
export function groundMaterial(rockOnly=false,cliffSkin=false,turfOnly=false,cliffArt=false,massifGround=false){
 const mat=new THREE.MeshStandardMaterial({roughness:1,color:0xffffff});
 mat.customProgramCacheKey=()=>`seceda-material-v015-${rockOnly}-${cliffSkin}-${turfOnly}-${cliffArt}-${massifGround}`;
 mat.onBeforeCompile=s=>{
  Object.assign(s.uniforms,massifUniforms,coverUniforms,{meadowPhoto:{value:maps.meadowPhoto},meadowPacked:{value:maps.meadowPacked},bumpStrength:{value:1},stonePacked:{value:maps.stonePacked},smallStone:{value:maps.smallStone},smallPacked:{value:maps.smallPacked},grassMap:{value:maps.meadowBroad},cliffMap:{value:maps.rock_face},gravelMap:{value:maps.gravel},gravelPacked:{value:maps.gravelPacked},geologyMap:{value:landscapeMaps.geology},geologyBounds:{value:geologyBounds},trailMap:{value:landscapeMaps.trail},cloudMap:{value:landscapeMaps.cloud},horizonMap:{value:landscapeMaps.shadow},trailBounds:{value:trailBounds},shadowBounds:{value:shadowBounds}});
  mat.userData.shader=s;
  if(cliffArt)s.uniforms.smallStone.value=maps.beddedStone;
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWorld;varying vec3 vNormalW;varying vec3 vActualWorld;');
  if(cliffSkin)s.vertexShader='attribute vec3 surveyPosition;\n'+s.vertexShader;
  if(cliffArt){s.vertexShader='attribute vec3 cliffRelief;varying vec3 vCliffRelief;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCliffRelief=cliffRelief;');s.fragmentShader='varying vec3 vCliffRelief;\n'+s.fragmentShader;}
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  vec4 localP=vec4(position,1.);vec3 localN=normal;
  #ifdef USE_INSTANCING
  localP=instanceMatrix*localP;
  mat3 localInstance=mat3(instanceMatrix);
  localN/=vec3(dot(localInstance[0],localInstance[0]),dot(localInstance[1],localInstance[1]),dot(localInstance[2],localInstance[2]));
  localN=localInstance*localN;
  #endif
  vActualWorld=(modelMatrix*localP).xyz;vWorld=vActualWorld;${cliffSkin?'vWorld=(modelMatrix*vec4(surveyPosition,1.)).xyz;':''}vNormalW=normalize(mat3(modelMatrix)*localN);`);
  s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
  varying vec3 vWorld;varying vec3 vNormalW;varying vec3 vActualWorld;
  uniform sampler2D stonePacked,smallStone,smallPacked,meadowPhoto,meadowPacked;
  uniform highp sampler2DArray grassMap;
  uniform sampler2D cliffMap,gravelMap,trailMap,horizonMap,cloudMap,gravelPacked,geologyMap;
  uniform vec4 trailBounds,shadowBounds,geologyBounds;uniform float bumpStrength;
  ${noiseGLSL}${landformGLSL}${massifGLSL}${turfGLSL}
  vec4 groundCoverSample(vec2 uv){return texture(grassMap,vec3(uv,0.));}
  vec3 mappedGroundColour(vec3 p){
   vec2 metres=p.xz+vec2(6700.,7700.);
   vec2 tile=clamp(floor(metres/4000.),vec2(0.),vec2(3.,2.));
   vec2 uv=(metres-tile*4000.+48.)/4096.;uv.y=1.-uv.y;
   vec2 continuousUV=metres/4096.*vec2(1.,-1.);
   return textureGrad(grassMap,vec3(uv,2.+tile.y*4.+tile.x),dFdx(continuousUV),dFdy(continuousUV)).rgb;
  }
  vec4 regionalGroundSample(vec2 uv){
   float n=noise3(vec3(uv*.097,71.))*7.;float i=floor(n),f=fract(n);
   vec2 a=vec2(hash31(vec3(i,4.,9.)),hash31(vec3(i,11.,3.)))*7.;
   vec2 b=vec2(hash31(vec3(i+1.,4.,9.)),hash31(vec3(i+1.,11.,3.)))*7.;
   return mix(texture(grassMap,vec3(uv+a,1.)),texture(grassMap,vec3(uv+b,1.)),smoothstep(.18,.82,f));
  }
  ${coverGLSL}
  vec4 sampleStone(sampler2D tex,vec2 uv){
   float n=noise3(vec3(uv*.085,19.))*7.;float i=floor(n),f=fract(n);
   vec2 a=vec2(hash31(vec3(i,2.,4.)),hash31(vec3(i,7.,8.)))*9.;
   vec2 b=vec2(hash31(vec3(i+1.,2.,4.)),hash31(vec3(i+1.,7.,8.)))*9.;
   return mix(texture2D(tex,uv+a),texture2D(tex,uv+b),smoothstep(.15,.85,f));
  }
  // Irregular bedding and narrow cross joints act as surface relief, not
  // painted horizontal contour stripes. Keep the surveyed peak positions.
  float regionalFaceRelief(vec3 p){
   float angle=.62+(noise3(vec3(p.xz*.0007,51.))-.5)*.65;
   float along=dot(p.xz,vec2(cos(angle),sin(angle)));
   float warp=(noise3(vec3(along*.009,p.y*.007,21.))-.5)*18.;
   float bed=p.y+along*(.18+noise3(vec3(p.xz*.001,19.))*.24)+warp;
   float sheets=noise3(vec3(bed*.17,along*.016,3.));
   float fracture=pow(1.-abs(noise3(vec3(along*.084-p.y*.027,p.y*.047,9.))*2.-1.),16.);
   float split=pow(1.-abs(noise3(vec3(along*.039+p.y*.043,p.y*.071,31.))*2.-1.),20.);
   return (sheets-.5)*1.4-fracture*1.5-split*.7;
  }
  float fissure(vec2 uv){
   vec2 cell=floor(uv),f=fract(uv);float nearest=8.,second=8.;
   for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
    vec2 g=vec2(float(x),float(y));vec2 r=g+vec2(hash31(vec3(cell+g,13.)),hash31(vec3(cell+g,21.)))-f;
    float d=dot(r,r);if(d<nearest){second=nearest;nearest=d;}else second=min(second,d);
   }
   return 1.-smoothstep(.008,.075,second-nearest);
  }
  float worn=0.,trailRough=1.,rockRough=1.,rockWeight=0.;vec3 stoneNormalW;vec3 meadowNormalW;`);
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
  vec3 p=vWorld;float macro=fbm(p*.007),detail=fbm(p*.32),grain=noise3(p*11.);
  vec3 tri=pow(abs(normalize(vNormalW)),vec3(5.));tri/=tri.x+tri.y+tri.z;
  // Two documented physical footprints: 12.656 m weathered cliff and 2.002 m
  // fine rock. Actual world-space triplanar projection avoids UV stretching.
  vec3 rc=sampleStone(cliffMap,p.zy/12.656).rgb*tri.x+sampleStone(cliffMap,p.xz/12.656).rgb*tri.y+sampleStone(cliffMap,p.xy/12.656).rgb*tri.z;
  float closeStone=1.-smoothstep(24.,95.,distance(p,cameraPosition));
  vec3 micro=sampleStone(smallStone,p.zy/${cliffArt?'20.002':'2.002'}).rgb*tri.x+sampleStone(smallStone,p.xz/${cliffArt?'20.002':'2.002'}).rgb*tri.y+sampleStone(smallStone,p.xy/${cliffArt?'20.002':'2.002'}).rgb*tri.z;
  float tone=dot(rc,vec3(.299,.587,.114));
  vec3 stone=mix(rc,vec3(tone)*vec3(1.045,1.022,.978),.76);
  ${cliffArt?`stone=stone*.87;
  float bedding=p.y+(p.x*.32+p.z*.94)*.34+(noise3(p*.019)-.5)*12.;
  float strata=noise3(vec3(bedding*.21,p.x*.027,p.z*.027));
  float ochre=smoothstep(.45,.70,noise3(vec3(p.x*.027,p.y*.049,p.z*.033)));
  stone*=mix(vec3(.84,.90,.96),vec3(1.10,1.025,.91),ochre);
  stone*=mix(.85,1.12,smoothstep(.20,.78,strata));
  stone*=1.-vCliffRelief.x*.22;
  `:'stone=stone*.71;'}
  float microTone=dot(micro,vec3(.299,.587,.114));
  ${cliffArt?`stone=mix(stone,micro*vec3(.83,.82,.79),.24);
  `:'stone*=mix(1.,.70+microTone*1.2,closeStone*.62);'}
  float patina=fbm(vec3(p.x*.019,p.y*.005,p.z*.019));
  ${massifGround?`// Grade only the exposed stone beside the authored massif. The walking
  // meadow, trail and lower valley retain their existing material treatment.
  float massifZone=1.;
  vec3 coherentStone=mix(rc,vec3(tone)*vec3(1.045,1.022,.978),.76)*.61;
  float weather=smoothstep(.32,.73,noise3(vec3(p.x*.027,p.y*.049,p.z*.033)));
  coherentStone*=mix(vec3(.81,.87,.95),vec3(1.10,1.025,.91),weather);
  stone=mix(stone,coherentStone,massifZone*.88);
  `:''}
  float faceRelief=landscapeRelief(p);
  float weatherRun=noise3(vec3(p.x*.037+p.y*.005,p.y*.009,p.z*.037));
  stone*=mix(.76,1.18,smoothstep(.20,.76,patina));
  stone*=mix(.86,1.12,smoothstep(-1.8,2.1,faceRelief));
  stone=mix(stone,stone*vec3(.73,.78,.81),smoothstep(.55,.80,weatherRun)*.30);
  stone=mix(stone,stone*vec3(1.09,1.035,.90),smoothstep(.57,.77,patina)*.44);
  float chips=sampleStone(stonePacked,p.zy/12.656).a*tri.x+sampleStone(stonePacked,p.xz/12.656).a*tri.y+sampleStone(stonePacked,p.xy/12.656).a*tri.z;
  float fineChips=texture2D(smallPacked,p.zy/2.002).a*tri.x+texture2D(smallPacked,p.xz/2.002).a*tri.y+texture2D(smallPacked,p.xy/2.002).a*tri.z;
  rockRough=sampleStone(stonePacked,p.zy/12.656).b*tri.x+sampleStone(stonePacked,p.xz/12.656).b*tri.y+sampleStone(stonePacked,p.xy/12.656).b*tri.z;
  rockRough=mix(.76,.98,rockRough);
  vec3 nx=sampleStone(stonePacked,p.zy/12.656).xyz*2.-1.,ny=sampleStone(stonePacked,p.xz/12.656).xyz*2.-1.,nz=sampleStone(stonePacked,p.xy/12.656).xyz*2.-1.;
  nx.xy+= (texture2D(smallPacked,p.zy/2.002).xy*2.-1.)*closeStone*.38;
  ny.xy+= (texture2D(smallPacked,p.xz/2.002).xy*2.-1.)*closeStone*.38;
  nz.xy+= (texture2D(smallPacked,p.xy/2.002).xy*2.-1.)*closeStone*.38;
  vec3 stoneGradient=vec3(0.,nx.y,nx.x)*tri.x+vec3(ny.x,0.,ny.y)*tri.y+vec3(nz.x,nz.y,0.)*tri.z;
  stoneNormalW=normalize(normalize(vNormalW)+stoneGradient*${cliffArt?'.62':'.76'});
  vec3 gt=groundCoverSample(p.xz/4.).rgb;float grassPhoto=dot(gt,vec3(.299,.587,.114));
  float coverVariation=fbm(vec3(p.x*.09,3.,p.z*.09));
  vec3 grass=mix(vec3(.034,.067,.016),vec3(.080,.125,.030),macro);
  grass=mix(grass,vec3(.125,.133,.046),smoothstep(.56,.76,coverVariation)*.56);
  grass*=.65+grassPhoto*2.1+detail*.23;grass*=.87+grain*.24;
  float steep=1.-abs(normalize(vNormalW).y);
  vec2 geologyUV=(p.xz-geologyBounds.xy)/geologyBounds.zw;
  vec4 geology=vec4(steep,.5,0.,.5);
  if(all(greaterThan(geologyUV,vec2(0.)))&&all(lessThan(geologyUV,vec2(1.))))geology=texture2D(geologyMap,geologyUV);
  steep=geology.r;
  // Exposure follows slope and convex ribs; scree collects below steep rock
  // in concave hollows, while thin dry turf occupies wind-exposed shoulders.
  float convex=1.-smoothstep(.30,.57,geology.g);
  float exposure=steep+convex*.07+(noise3(p*.18)-.5)*.05;
  float rock=smoothstep(.17,.32,exposure);
  // Bed geometry supplies the ledges. Avoid painting repeated altitude stripes
  // across the meadows; these transitions come from slope and curvature.
  rock=max(rock,smoothstep(110.,285.,p.y)*.98);
  float hollow=smoothstep(.50,.72,geology.g);
  float talus=geology.b*smoothstep(.045,.14,steep)*(1.-smoothstep(.26,.43,steep));
  talus*=.5+hollow*.8;talus=clamp(talus*1.9,0.,.94);
  float thin=clamp(convex*.55+geology.a*.30+steep*.65,0.,1.);
  vec3 lush=grass*vec3(1.22,1.30,1.02);
  vec3 dryTurf=vec3(.127,.147,.055)*(.68+grassPhoto*1.3+detail*.22);
  grass=mix(lush,dryTurf,smoothstep(.25,.85,thin)*.72);
  vec4 cover=landCover(p);
  float distanceCover=smoothstep(65.,155.,distance(p.xz,cameraPosition.xz))*landscapeStrength;
  
  vec2 meadowUV=p.xz/1.4;
  vec3 grassDetail=texture2D(meadowPhoto,meadowUV).rgb;
  vec4 grassPacked=texture2D(meadowPacked,meadowUV);
  float grassAO=grassPacked.b;
  vec3 grassNormal=vec3(grassPacked.rg*2.-1.,1.);
  vec3 meadowBase=normalize(vNormalW);
  vec3 meadowTangent=normalize(vec3(meadowBase.y,-meadowBase.x,0.));
  vec3 meadowBitangent=normalize(cross(meadowTangent,meadowBase));
  meadowNormalW=normalize(meadowBase+(.18*grassNormal.x*meadowTangent+.18*grassNormal.y*meadowBitangent));
  float broadGrass=dot(groundCoverSample(p.xz/25.1).rgb,vec3(.299,.587,.114));
  grass=grassDetail*vec3(.74,.87,.66)*(.60+grassAO*.40);
  grass*=turfColour(p.xz)/vec3(.078,.153,.031);
  grass*=.75+broadGrass*3.0;
  grass=mix(grass,grass*vec3(1.2,1.04,.76),thin*.38);
  vec3 distantTurf=mix(vec3(.070,.129,.032),vec3(.141,.174,.060),smoothstep(.22,.78,turfNoise(p.xz*.013+15.)));
  grass=mix(grass,distantTurf,smoothstep(180.,700.,distance(p,cameraPosition))*.36);
  if(distanceCover>0.){
  grass=mix(grass,pastureColour(p,cover,geology,grass),distanceCover*.88);
  float coverSteep=steep;
  // Historical mapped rock and debris zones establish the regional cover.
  // Actual survey slope/curvature breaks those polygons into exposed ribs,
  // rockfall channels, dry shoulders and sheltered vegetated hollows.
  float ribs=noise3(vec3(p.x*.074,p.y*.14,p.z*.074));
  float fractured=smoothstep(.19,.38,coverSteep+(ribs-.5)*.065+convex*.022);
  float rockMap=cover.g*smoothstep(.10,.28,coverSteep+convex*.06);
  float turfIslands=noise3(vec3(p.x*.052+p.y*.008,p.y*.097,p.z*.052));
  rockMap*=smoothstep(.25,.64,turfIslands+coverSteep*1.5);
  float brokenRock=max(fractured,rockMap);
  // Thin convex soil reveals weathered limestone ribs below the main cliffs.
  // The same rules apply to secondary mountains and reverse-view shoulders.
  float thinRib=noise3(vec3(p.x*.031+p.y*.006,p.y*.083,p.z*.031));
  float shoulderRock=smoothstep(.075,.22,steep)*convex*(.28+geology.b*.72);
  shoulderRock*=smoothstep(.48,.74,thinRib)*(1.-cover.r*.98)*(1.-cover.b*.85);
  brokenRock=max(brokenRock,shoulderRock*.82);
  brokenRock=max(brokenRock,smoothstep(150.,360.,p.y)*smoothstep(.075,.18,steep));
  ${rockOnly||turfOnly?'':`rock=mix(rock,brokenRock,distanceCover);`}
  float belowRock=geology.b*smoothstep(.035,.12,steep)*(1.-smoothstep(.25,.40,steep));
  float fans=max(cover.b,belowRock*(.18+hollow*.62));
  float debrisRills=noise3(vec3(p.x*.13,p.y*.021,p.z*.13));
  float screeCover=clamp(fans*(.70+debrisRills*.42),0.,.98);
  float colonisation=noise3(vec3(p.x*.061,p.y*.021,p.z*.061));
  screeCover*=mix(.48,1.,smoothstep(.27,.63,colonisation+fans*.28));
  talus=mix(talus,screeCover,distanceCover);
  grass=mix(grass,grass*vec3(.65,.78,.66),cover.a*.5*distanceCover);
  }
  grass*=mix(1.,.83,smoothstep(.12,.28,steep));
  grass=mix(grass,grass*vec3(.54,.63,.68),1.-smoothstep(-650.,-410.,p.y));
  vec3 scree=mix(vec3(.155,.152,.138),vec3(.255,.249,.226),detail)*(.78+microTone*.8+grain*.15);
  float deposit=noise3(vec3(p.x*.011,p.y*.009,p.z*.011));
  scree*=.88+deposit*.25;
  // Separate dust, weathered chips and embedded fragments. Metre-space grain
  // follows the surface, while coherent slope fans retain their mapped outline.
  float screeGrain=regionalGroundSample(p.xz/9.7+vec2(p.y*.017,-p.y*.012)).g;
  scree*=mix(1.,mix(.65,1.26,smoothstep(.015,.31,screeGrain)),distanceCover);
  scree=mix(scree,scree*vec3(1.065,1.02,.91),smoothstep(.38,.7,deposit)*.55*distanceCover);
  grass=mix(grass,scree,${turfOnly?'0.':'talus'});
  ${rockOnly?'rock=1.;':turfOnly?'rock=smoothstep(.44,.72,noise3(p*.45))*.30;':''}
  ${cliffArt? turfOnly?`rock=max(rock,(1.-smoothstep(.30,.67,vCliffRelief.y+noise3(p*.37)*.24-.12))*.99);
  grass*=.87;`: `rock*=1.-smoothstep(.14,.82,vCliffRelief.z)*.93;`:''}
  vec3 surface=mix(grass,stone,rock);
  rockWeight=max(rock,talus*.58);
  float rockRelief=chips*.065+fineChips*closeStone*.008+faceRelief*.65;
  // Differentiate each physical surface before blending. Differentiating the
  // height discontinuity between rock and turf produced a checker pattern.
  vec2 reliefGradient=vec2(dFdx(rockRelief),dFdy(rockRelief))*rock;
  ${massifGround?`// Differentiate the face field before applying its blend. Differentiating
  // the slope mask itself drew false bright shelves and fragment-quad stipple.
  float regionalRelief=regionalFaceRelief(p);
  float regionalWeight=smoothstep(.12,.32,steep)*smoothstep(110.,300.,distance(p.xz,cameraPosition.xz));
  reliefGradient+=vec2(dFdx(regionalRelief),dFdy(regionalRelief))*regionalWeight*.38*rock;`:''}
  float talusRelief=fineChips*.027;
  reliefGradient+=vec2(dFdx(talusRelief),dFdy(talusRelief))*talus*(1.-rock);
  // Keep the close meadow's established fine surface. Regional grain fades
  // in beyond it; a large near-camera derivative made visible 2x2 quads.
  reliefGradient+=vec2(dFdx(screeGrain),dFdy(screeGrain))*.36*distanceCover*talus*(1.-rock);

  if(distanceCover>0.){float pastureRelief=regionalGroundSample((p.xz+vec2(p.y*.13,-p.y*.08))/15.).g*2.2+groundCoverSample(p.xz/6.3).g*.85+noise3(vec3(p.x*.21,p.y*.46,p.z*.21))*.16;
  reliefGradient+=vec2(dFdx(pastureRelief),dFdy(pastureRelief))*(1.-rock)*(1.-cover.r)*distanceCover*.8;}
  ${rockOnly?'':`
  vec2 pathUV=(p.xz-trailBounds.xy)/trailBounds.zw;vec2 path=texture2D(trailMap,clamp(pathUV,0.,1.)).rg;
  float dist=path.r*5.;float width=path.g;
  float edgeNoise=(noise3(p*6.6)-.5)*.09;
  worn=1.-smoothstep(width-.06,width+.055,dist+edgeNoise);
  float shoulder=1.-smoothstep(width+.015,width+.30,dist+edgeNoise);
  float inside=step(0.,pathUV.x)*step(pathUV.x,1.)*step(0.,pathUV.y)*step(pathUV.y,1.);worn*=inside;shoulder*=inside;
  if(shoulder>.001){
  vec2 soilUV=p.xz/2.48;
  vec3 grit=texture2D(gravelMap,soilUV).rgb;
  float gritLuma=dot(grit,vec3(.299,.587,.114));
  vec3 soil=mix(grit,vec3(gritLuma)*vec3(1.08,1.04,.96),.62)*1.18;
  float wear=(1.-smoothstep(width*.12,width*.78,dist))*smoothstep(.28,.72,noise3(p*.41));
  soil=mix(soil,soil*.91,wear*.5);
  trailRough=mix(.88,1.,texture2D(gravelPacked,soilUV).g);
  surface=mix(surface,mix(surface,soil,.24),shoulder);surface=mix(surface,soil,worn);
  float soilRelief=texture2D(gravelPacked,soilUV).r*.011*(1.-wear*.55);
  reliefGradient=mix(reliefGradient,vec2(dFdx(soilRelief),dFdy(soilRelief)),worn);
  }
  `}
  diffuseColor.rgb=surface;
  `);
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>\n roughnessFactor=mix(roughnessFactor,rockRough,rockWeight);roughnessFactor=mix(roughnessFactor,trailRough,worn);`);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
  normal=normalize(mix(normal,normalize(mat3(viewMatrix)*meadowNormalW),(1.-rockWeight)*(1.-worn)*.75));
  normal=normalize(mix(normal,normalize(mat3(viewMatrix)*stoneNormalW)${cliffArt?'*faceDirection':''},rockWeight*${cliffArt?'.45':'.65'}));
  vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition);vec3 r1=cross(sy,normal),r2=cross(normal,sx);float det=dot(sx,r1);
  vec3 gradient=sign(det)*(reliefGradient.x*r1+reliefGradient.y*r2);vec3 bump=gradient/max(abs(det),.00000001);normal=normalize(normal-clamp(bump,vec3(-.65),vec3(.65))*bumpStrength*mix(.85,1.,worn));
  `);
  s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
  float terrainSun=texture2D(horizonMap,clamp((vWorld.xz-shadowBounds.xy)/shadowBounds.zw,0.,1.)).r;
  terrainSun=massifVisibility(vActualWorld,normalize(vNormalW),terrainSun);
  terrainSun*=texture2D(cloudMap,clamp((vWorld.xz-shadowBounds.xy)/shadowBounds.zw,0.,1.)).r;
  reflectedLight.directDiffuse*=terrainSun;
  reflectedLight.indirectDiffuse*=.94+terrainSun*.06;
  reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(.026,.037,.052)*rock*(1.-terrainSun);
  `);
 };
 return mat;
}
