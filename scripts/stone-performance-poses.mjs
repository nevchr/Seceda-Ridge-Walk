import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const art=process.argv.includes('--art');const results=[];
const summary=a=>{const s=[...a].sort((a,b)=>a-b);return {samples:a.length,mean:a.reduce((x,y)=>x+y,0)/a.length,p50:s[Math.floor(s.length*.5)],p95:s[Math.floor(s.length*.95)],max:s.at(-1)};};
for(const [version,exe] of [['v0.8','release/Seceda-Windows-v0.8/Seceda.exe'],['v0.9','release/Seceda-Windows-v0.9/Seceda.exe']]){
 const start=Date.now(),app=await _electron.launch({executablePath:art&&version==='v0.9'?exe.replace('v0.9/','v0.9-art/'):exe,args:[]});
 try{
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});const readyMs=Date.now()-start;
  await page.setViewportSize({width:1600,height:1000});await page.evaluate(()=>window.__seceda.hideUI());await page.waitForTimeout(1800);
  for(const pose of [{name:'start',x:15,z:165,yaw:-.65,pitch:.025},{name:'midpoint',x:74,z:15,yaw:-.7,pitch:.04},{name:'viewpoint',x:150,z:-120,yaw:-1.14,pitch:-.04},{name:'valley',x:150,z:-120,yaw:-1.88,pitch:-.14}]){
  await page.evaluate(v=>window.__seceda.setPose(v.x,v.z,v.yaw,v.pitch),pose);await page.waitForTimeout(1500);
  const data=await page.evaluate(()=>new Promise(resolve=>{
   const q=window.__seceda,r=q.renderer,gl=r.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2'),original=r.render;
   const frames=[],gpu=[],cpu=[],pending=[],counts=[];let first,last,collect=false,disjoint=false;
   r.render=function(...args){
    if(!collect)return original.apply(this,args);
    let query;if(ext&&pending.length<10){query=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,query);}
    const t=performance.now();const result=original.apply(this,args);cpu.push(performance.now()-t);
    if(query){gl.endQuery(ext.TIME_ELAPSED_EXT);pending.push(query);}return result;
   };
   function tick(t){first??=t;const elapsed=t-first;collect=elapsed>1000&&elapsed<5000;
    if(last&&elapsed>1000)frames.push(t-last);last=t;
    if(ext){disjoint ||= !!gl.getParameter(ext.GPU_DISJOINT_EXT);while(pending.length&&gl.getQueryParameter(pending[0],gl.QUERY_RESULT_AVAILABLE)){const query=pending.shift();gpu.push(gl.getQueryParameter(query,gl.QUERY_RESULT)/1e6);gl.deleteQuery(query);}}
    
    if(collect&&frames.length%60===0)counts.push({triangles:r.info.render.triangles,calls:r.info.render.calls,geometries:r.info.memory.geometries,textures:r.info.memory.textures});
    if(elapsed<5000)requestAnimationFrame(tick);else{r.render=original;for(const p of pending)gl.deleteQuery(p);resolve({frames,gpu:disjoint?[]:gpu,cpu,disjoint,gpuTimerSupported:!!ext,counts,renderer:gl.getExtension('WEBGL_debug_renderer_info')?gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),stats:q.stats()});}
   }requestAnimationFrame(tick);
  }));
  results.push({version,pose,readyMs,frameMs:summary(data.frames),framesOver25ms:data.frames.filter(x=>x>25).length,gpuMs:data.gpu.length?summary(data.gpu):null,cpuSubmissionMs:summary(data.cpu),gpuTimerSupported:data.gpuTimerSupported,disjoint:data.disjoint,counts:data.counts,renderer:data.renderer,stats:data.stats,errors});
 }
 }finally{await app.close();}
}
const report={method:'Same 1600x1000 viewport and 5-second fixed-pose sample, at each of four matched eye-level poses in each preserved portable executable, first second discarded. Frame intervals are display-capped; GPU times use EXT_disjoint_timer_query_webgl2 if supported and non-disjoint. CPU submission is wall time around renderer.render, not total simulation cost. Sequential runs on this machine only.',results};
await fs.writeFile(`artifacts/stone-v09/performance-poses${art?'-art':''}.json`,JSON.stringify({...report,artBuild:art},null,2));console.log(JSON.stringify(results,null,2));

