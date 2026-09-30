import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const stage='cost-diagnostics';
execFileSync('powershell.exe',['-NoProfile','-File','scripts/terrain-conditions.ps1','-Stage',stage+'-before']);
const app=await _electron.launch({executablePath:'release/Seceda-Windows-v0.14/Seceda.exe',args:['--force-device-scale-factor=1']});
const results=[],errors=[];
try{
 const page=await app.firstWindow();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.waitForFunction(()=>window.__seceda?.ready,null,{timeout:180000});await page.setViewportSize({width:1600,height:1000});
 for(const pose of [{name:'viewpoint',pitch:-.04,fov:66},{name:'cliff-close',pitch:-.27,fov:38}])for(const mode of ['full','woodland-hidden','regional-ground-disabled']){
  await page.evaluate(({pose,mode})=>{const q=window.__seceda;q.hideUI();q.camera.fov=pose.fov;q.camera.updateProjectionMatrix();q.setPose(150,-120,pose.name==='viewpoint'?-1.14:-1.12,pose.pitch);q.scene.traverse(o=>{if(o.name.startsWith('Authored subalpine conifers'))o.visible=mode!=='woodland-hidden';for(const m of (Array.isArray(o.material)?o.material:[o.material])){const u=m?.userData.shader?.uniforms?.landscapeStrength;if(u)u.value=mode==='regional-ground-disabled'?0:1;}});},{pose,mode});
  await page.waitForTimeout(1600);await page.waitForFunction(()=>!window.__seceda.grass.info.pending&&!window.__seceda.survey.info.pending,null,{timeout:180000});await page.waitForTimeout(1000);
  const data=await page.evaluate(()=>new Promise(resolve=>{
   const q=window.__seceda,r=q.renderer,gl=r.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2'),original=r.render,pending=[],times=[];let start,collect=false,disjoint=false;
   if(!ext)throw Error('GPU timer unavailable');
   r.render=function(...args){if(!collect)return original.apply(this,args);const query=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,query);const result=original.apply(this,args);gl.endQuery(ext.TIME_ELAPSED_EXT);pending.push(query);return result;};
   function tick(t){start??=t;const elapsed=t-start;collect=elapsed>1000&&elapsed<5000;disjoint ||= !!gl.getParameter(ext.GPU_DISJOINT_EXT);while(pending.length&&gl.getQueryParameter(pending[0],gl.QUERY_RESULT_AVAILABLE)){const query=pending.shift();times.push(gl.getQueryParameter(query,gl.QUERY_RESULT)/1e6);gl.deleteQuery(query);}if(elapsed<5100)requestAnimationFrame(tick);else{r.render=original;pending.forEach(p=>gl.deleteQuery(p));times.sort((a,b)=>a-b);resolve({mean:times.reduce((a,b)=>a+b,0)/times.length,p95:times[Math.floor(times.length*.95)],samples:times.length,disjoint,...q.stats()});}}
   requestAnimationFrame(tick);
  }));
  results.push({pose,mode,...data});console.log(pose.name,mode,data.mean.toFixed(2)+' ms');
 }
}finally{await app.close();}
execFileSync('powershell.exe',['-NoProfile','-File','scripts/terrain-conditions.ps1','-Stage',stage+'-after']);
await fs.writeFile('artifacts/terrain-v014/cost-diagnostics.json',JSON.stringify({method:'Transient diagnostic toggles in an isolated final portable process at 1600x1000 DPR1. No source/package edits. Hidden woodland isolates all forest meshes. Regional-ground-disabled sets landscapeStrength=0, skipping the whole distant land-cover/material branch, not just aerial sampling. All content remains enabled in the delivered build.',results,errors},null,2));
if(errors.length||results.some(r=>r.disjoint))throw Error('Diagnostic errors');
