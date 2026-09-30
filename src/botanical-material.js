import * as THREE from 'three';
import {landscapeMaps,shadowBounds} from './landscape.js';
export function plantMaterial(source,gain=1.45,fadeEnd=0,preserveColor=false){
 const m=source?source.clone():new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:1});
 m.roughness=1;m.metalness=0;
 m.customProgramCacheKey=()=>`botanical-v07-${!!source}-${gain}-${fadeEnd}-${preserveColor}`;
 m.onBeforeCompile=s=>{
  s.uniforms.eyePosition={value:new THREE.Vector3()};s.uniforms.windTime={value:0};s.uniforms.horizonMap={value:landscapeMaps.shadow};s.uniforms.cloudMap={value:landscapeMaps.cloud};s.uniforms.shadowBounds={value:shadowBounds};
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform vec3 eyePosition;uniform float windTime;varying vec3 plantWorld;varying float plantHeight;');
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float phase=instanceMatrix[3].x*.29+instanceMatrix[3].z*.21;
   transformed.x+=sin(windTime*1.35+phase)*position.y*position.y*.11;
   transformed.z+=cos(windTime*.9+phase)*position.y*position.y*.08;
   ${fadeEnd?`transformed.y*=1.-smoothstep(${(fadeEnd<50?28:88).toFixed(1)},${fadeEnd.toFixed(1)},distance(instanceMatrix[3].xz,eyePosition.xz));`:''}
   plantHeight=position.y;plantWorld=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;`);
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 plantWorld;varying float plantHeight;uniform sampler2D horizonMap,cloudMap;uniform vec4 shadowBounds;');
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   diffuseColor.rgb*=mix(.72,1.,smoothstep(0.,.23,plantHeight));`);
  if(source&&!preserveColor)s.fragmentShader=s.fragmentShader.replace('diffuseColor.rgb*=mix(.72', `float leafTone=sqrt(clamp(dot(diffuseColor.rgb,vec3(.22,.70,.08))*4.,0.,1.));diffuseColor.rgb=mix(vec3(.031,.079,.018),vec3(.14,.22,.052),leafTone)*${gain.toFixed(2)};diffuseColor.rgb*=mix(.72`);
  if(preserveColor)s.fragmentShader=s.fragmentShader.replace('diffuseColor.rgb*=mix(.72','diffuseColor.rgb*=1.30;diffuseColor.rgb*=mix(.72');
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 vec3 leafUp=normalize(mat3(viewMatrix)*vec3(0.,1.,0.));normal=normalize(normal*.65+leafUp*.45);`);
  s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
   vec2 landUV=clamp((plantWorld.xz-shadowBounds.xy)/shadowBounds.zw,0.,1.);
   float exposure=texture2D(horizonMap,landUV).r*texture2D(cloudMap,landUV).r;
   reflectedLight.directDiffuse*=exposure;
   reflectedLight.indirectDiffuse*=.88;
   // A small transmitted component keeps thin leaves legible in back light.
   reflectedLight.indirectDiffuse+=diffuseColor.rgb*.14*exposure;`);
  m.userData.shader=s;
 };return m;
}
