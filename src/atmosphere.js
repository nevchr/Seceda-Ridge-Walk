import * as THREE from 'three';
import {noiseGLSL} from './materials.js';
import {SUN_DIRECTION,landscapeMaps,shadowBounds} from './landscape.js';

// World-space cumulus density, in kilometres. Baked once into a sky cube and
// a sunlight-transmission map; no raymarching cost in ordinary walking frames.
const clouds=`${noiseGLSL}
float density(vec3 p){
 float vertical=smoothstep(.8,1.13,p.y)*(1.-smoothstep(1.7,3.0,p.y));
 float mass=fbm(vec3(p.x*.43+8.3,p.y*.55,p.z*.43+3.7));
 float billow=fbm(p*2.5+vec3(11.,0.,4.));
 return clamp((mass*.72+billow*.28-.565)*12.,0.,1.)*vertical;
}
float transmission(vec3 p,vec3 sun){float tau=0.;for(int j=0;j<5;j++){p+=sun*.19;tau+=density(p)*.19;}return exp(-tau*7.5);}
`;
export function makeAtmosphere(renderer){
 const skyScene=new THREE.Scene(),cube=new THREE.WebGLCubeRenderTarget(768,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
 const mat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{sun:{value:SUN_DIRECTION}},vertexShader:'varying vec3 dir;void main(){dir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 dir;uniform vec3 sun;${clouds}
 void main(){vec3 d=normalize(dir);float h=max(0.,d.y);vec3 sky=mix(vec3(.33,.52,.78),vec3(.012,.070,.235),pow(h,.36));float sd=max(dot(d,sun),0.);sky+=vec3(.38,.29,.17)*pow(sd,16.)*.35;sky+=vec3(3.,2.6,1.9)*pow(sd,2200.);
 vec3 col=vec3(0.);float trans=1.;
 if(d.y>.010){float a=.8/d.y,b=min(85.,3.1/d.y);float stepSize=max(0.,b-a)/144.;
 for(int i=0;i<144;i++){
  vec3 p=d*(a+(float(i)+hash31(d*113.))*stepSize);float den=density(p);float alpha=1.-exp(-den*stepSize*4.5);
  float light=transmission(p,sun);vec3 c=mix(vec3(.18,.235,.31),vec3(1.6,1.55,1.42),light);
  c+=vec3(.28,.24,.17)*pow(sd,8.)*light;
  // Distant cloud detail loses contrast into air light, avoiding a sharp
  // horizontal shelf where the bounded integration range reaches the horizon.
  c=mix(sky,c,exp(-length(p)*.075));
  col+=trans*alpha*c;trans*=1.-alpha;if(trans<.012)break;
 }}gl_FragColor=vec4(mix(sky,col+trans*sky,smoothstep(.010,.032,d.y)),1.);}`});
 skyScene.add(new THREE.Mesh(new THREE.SphereGeometry(40,24,16),mat));const camera=new THREE.CubeCamera(.1,100,cube);camera.update(renderer,skyScene);mat.dispose();skyScene.children[0].geometry.dispose();
 const sky=new THREE.Mesh(new THREE.SphereGeometry(18000,40,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{map:{value:cube.texture}},vertexShader:'varying vec3 dir;void main(){dir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 dir;uniform samplerCube map;void main(){gl_FragColor=textureCube(map,normalize(dir));
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}));sky.frustumCulled=false;
 const target=new THREE.WebGLRenderTarget(512,512),shadowScene=new THREE.Scene();
 const shadowMat=new THREE.ShaderMaterial({uniforms:{sun:{value:SUN_DIRECTION},bounds:{value:shadowBounds}},vertexShader:'varying vec2 coord;void main(){coord=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`varying vec2 coord;uniform vec3 sun;uniform vec4 bounds;${clouds}
 void main(){vec2 world=(bounds.xy+coord*bounds.zw)*.001;vec3 p=vec3(world.x,0.,world.y);float tau=0.;for(int i=0;i<12;i++){float dist=(.8+(float(i)+.5)/12.*1.8)/sun.y;tau+=density(p+sun*dist)*.15/sun.y;}float v=.65+.35*exp(-tau*3.1);gl_FragColor=vec4(vec3(v),1.);}`});
 shadowScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),shadowMat));const previous=renderer.getRenderTarget();renderer.setRenderTarget(target);renderer.render(shadowScene,new THREE.Camera());renderer.setRenderTarget(previous);landscapeMaps.cloud=target.texture;shadowMat.dispose();shadowScene.children[0].geometry.dispose();
 return sky;
}
