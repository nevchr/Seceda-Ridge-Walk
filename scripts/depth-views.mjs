import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const stage=process.argv[2]||'after',diagnostics=process.argv.includes('--diagnostics');
const root='artifacts/depth-v06',dir=`${root}/${stage}`;await fs.mkdir(dir,{recursive:true});
const app=await _electron.launch({executablePath:`release/Seceda-Windows-v0.${stage==='before'?5:6}/Seceda.exe`,args:[]});
export const views=[{name:'01-start',x:15,z:165,yaw:-.65,pitch:.025},{name:'02-midpoint',x:74,z:15,yaw:-.7,pitch:.04},{name:'03-viewpoint',x:150,z:-120,yaw:-1.14,pitch:-.04},{name:'05-path-close',x:15.5,z:158,yaw:-.12,pitch:-.68},{name:'06-cliff-close',x:150,z:-120,yaw:-1.12,pitch:-.27,fov:38},{name:'07-lower-bend',x:30,z:88,yaw:-.65,pitch:-.07},{name:'08-upper-meadow',x:91,z:-25,yaw:-.9,pitch:-.05},{name:'09-ridge-approach',x:113,z:-61,yaw:-1.05,pitch:-.07}];
try{
 const p=await app.firstWindow(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});await p.setViewportSize({width:1600,height:1000});
 const results=[];
 for(const v of views.filter(v=>!process.argv.includes('--quick')||['03-viewpoint','05-path-close'].includes(v.name))){
  await p.evaluate(v=>{const q=window.__seceda;q.hideUI();q.camera.fov=v.fov||66;q.camera.updateProjectionMatrix();q.setPose(v.x,v.z,v.yaw,v.pitch);},v);await p.waitForTimeout(1800);await p.screenshot({path:`${dir}/${v.name}.png`});results.push({...v,...await p.evaluate(()=>window.__seceda.stats())});
 }
 if(diagnostics){
  const dd=`${root}/diagnostics-${stage}`;await fs.mkdir(dd,{recursive:true});
  await p.evaluate(async()=>{const q=window.__seceda;const T=await import('./node_modules/three/build/three.module.js');q.white=new T.DataTexture(new Uint8Array([255,255,255,255]),1,1);q.white.needsUpdate=true;q.groundMats=[...new Set(q.scene.children.flatMap(m=>Array.isArray(m.material)?m.material:[m.material]).filter(m=>m?.userData?.shader?.uniforms.bumpStrength))];q.groundMats.forEach(m=>{m.userData.oldHorizon=m.userData.shader.uniforms.horizonMap.value;});q.rockMeshes=q.scene.children.filter(m=>['Survey-aligned fractured ridge','Contour-fitted limestone prows','Nine authored summit blades','Connected limestone risers and turf benches'].includes(m.name));});
  for(const pose of [views[0],views[2],views[4]])for(const mode of stage==='before'?['baseline','live-shadow-off','dtm-shadow-off','authored-cast-on','bump-off']:['baseline','massif-shadow-off','fine-turf-off','accents-off']){
   await p.evaluate(({pose,mode})=>{const q=window.__seceda;q.setPose(pose.x,pose.z,pose.yaw,pose.pitch);q.camera.fov=pose.fov||66;q.camera.updateProjectionMatrix();q.renderer.shadowMap.enabled=mode!=='live-shadow-off';q.renderer.shadowMap.needsUpdate=true;
    q.groundMats.forEach(m=>{const u=m.userData.shader.uniforms;u.horizonMap.value=mode==='dtm-shadow-off'?q.white:m.userData.oldHorizon;u.bumpStrength.value=mode==='bump-off'?0:1;if(u.massifEnabled)u.massifEnabled.value=mode==='massif-shadow-off'?0:1;});
    if(q.scene.userData.version==='0.5')q.rockMeshes.forEach(m=>m.castShadow=mode==='authored-cast-on');
    if(q.turf)q.turf.enabled=mode!=='fine-turf-off';if(q.grass)q.grass.enabled=mode!=='accents-off';
   },{pose,mode});await p.waitForTimeout(1300);await p.screenshot({path:`${dd}/${pose.name}-${mode}.png`});
  }
 }
 await fs.writeFile(`${dir}/report.json`,JSON.stringify({stage,packaged:true,viewport:{width:1600,height:1000},views:results,errors},null,2));console.log(JSON.stringify({stage,views:results,errors}));
}finally{await app.close();}


