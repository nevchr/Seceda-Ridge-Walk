import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const results=[];
const targetVersion=process.argv.find(x=>x.startsWith('--version='))?.split('=')[1]||'0.13';
const stage=process.argv.find(x=>x.startsWith('--stage='))?.split('=')[1]||'performance';
const mode=process.argv.includes('--native')?'native':'controlled',source=process.argv.includes('--source');
const selected=process.argv.find(x=>x.startsWith('--only='))?.slice(7)?.split(',');
await fs.mkdir('artifacts/region-v013',{recursive:true});
async function conditions(label){
 const name=`${stage}-${mode}-${label}`;
 execFileSync('powershell.exe',['-NoProfile','-File','scripts/region-conditions.ps1','-Stage',name],{encoding:'utf8'});
 return JSON.parse((await fs.readFile(`artifacts/region-v013/conditions-${name}.json`,'utf8')).replace(/^\uFEFF/,''));
}
const summary=a=>{const s=[...a].sort((a,b)=>a-b);return {samples:a.length,mean:a.reduce((x,y)=>x+y,0)/a.length,p50:s[Math.floor(s.length*.5)],p95:s[Math.floor(s.length*.95)],max:s.at(-1)};};
for(const [version,exe] of [['v0.12','release/Seceda-Windows-v0.12/Seceda.exe'],[source?'source':'v'+targetVersion,source?'node_modules/electron/dist/electron.exe':`release/Seceda-Windows-v${targetVersion}/Seceda.exe`]]){
 const conditionsBefore=await conditions(version+'-before');
 const gpuTelemetryBefore=execFileSync('nvidia-smi',['--query-gpu=name,temperature.gpu,power.draw,pstate,clocks.gr,clocks.mem','--format=csv'],{encoding:'utf8'}).trim();
 const start=Date.now(),app=await _electron.launch({executablePath:exe,args:[...(exe.startsWith('node_modules')?['.']:[]),...(mode==='controlled'?['--force-device-scale-factor=1']:[])]});
 try{
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.waitForFunction(()=>window.__seceda?.ready,null,{timeout:180000});const readyMs=Date.now()-start;
  if(mode==='controlled')await page.setViewportSize({width:1600,height:1000});
  else await app.evaluate(({screen,BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0],d=screen.getPrimaryDisplay();w.setBounds({x:d.bounds.x,y:d.bounds.y,width:d.bounds.width,height:d.bounds.height});w.setFullScreen(true);});await page.evaluate(()=>window.__seceda.hideUI());await page.waitForTimeout(1800);
  for(const pose of [{name:'start',x:15,z:165,yaw:-.65,pitch:.025},{name:'midpoint',x:74,z:15,yaw:-.7,pitch:.04},{name:'viewpoint',x:150,z:-120,yaw:-1.14,pitch:-.04},{name:'start-away',x:15,z:165,yaw:2.55,pitch:-.08},{name:'pasture-east',x:800,z:380,yaw:-1.35,pitch:-.04},{name:'pasture-away',x:450,z:180,yaw:2.7,pitch:-.12},{name:'cliff-edge',x:178,z:-108,yaw:-1.12,pitch:-.19},{name:'cliff-close',x:150,z:-120,yaw:-1.12,pitch:-.27,fov:38}]){
  if(selected&&!selected.includes(pose.name))continue;
  await page.evaluate(v=>{const q=window.__seceda;q.camera.fov=v.fov||66;q.camera.updateProjectionMatrix();q.setPose(v.x,v.z,v.yaw,v.pitch);},pose);await page.waitForTimeout(1800);await page.waitForFunction(()=>!window.__seceda.grass.info?.pending,null,{timeout:60000});await page.waitForTimeout(1500);
  const display=await app.evaluate(({screen,BrowserWindow})=>({displays:screen.getAllDisplays(),window:BrowserWindow.getAllWindows()[0].getBounds()}));
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
    if(elapsed<5000)requestAnimationFrame(tick);else{r.render=original;for(const p of pending)gl.deleteQuery(p);resolve({frames,gpu:disjoint?[]:gpu,cpu,disjoint,gpuTimerSupported:!!ext,counts,renderer:gl.getExtension('WEBGL_debug_renderer_info')?gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),renderTarget:{width:gl.drawingBufferWidth,height:gl.drawingBufferHeight,pixelRatio:r.getPixelRatio()},stats:q.stats()});}
   }requestAnimationFrame(tick);
  }));
  results.push({version,pose,display,conditionsBefore,gpuTelemetryBefore,readyMs,frameMs:summary(data.frames),framesOver25ms:data.frames.filter(x=>x>25).length,gpuMs:data.gpu.length?summary(data.gpu):null,cpuSubmissionMs:summary(data.cpu),gpuTimerSupported:data.gpuTimerSupported,disjoint:data.disjoint,counts:data.counts,renderer:data.renderer,renderTarget:data.renderTarget,stats:data.stats,errors});
  console.log(version+' '+pose.name+' GPU '+(results.at(-1).gpuMs?.mean.toFixed(2)??'unavailable')+' ms');
 }
 }finally{await app.close();}
 const conditionsAfter=await conditions(version+'-after');for(const r of results)if(r.version===version)r.conditionsAfter=conditionsAfter;
}
const report={mode,stage,method:'Controlled mode is forced DPR1 at 1600x1000; native mode uses the primary display in full screen with normal OS scaling. Same viewport within each pair and 5-second fixed-pose sample at the selected matched poses (normal 66-degree FOV except the inherited 38-degree cliff-close camera), first second discarded. Frame intervals are display-capped; GPU times use EXT_disjoint_timer_query_webgl2 if supported and non-disjoint. CPU submission is wall time around renderer.render, not total simulation cost. Sequential runs on this machine only. High setting. Actual render buffers, AC, power scheme and display conditions recorded before and after each version.',results};
await fs.writeFile(`artifacts/region-v013/${stage}-${mode}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(results.map(r=>({version:r.version,pose:r.pose.name,gpu:r.gpuMs?.mean,p95:r.gpuMs?.p95,frame:r.frameMs.mean,triangles:r.stats.triangles,calls:r.stats.drawCalls,res:r.renderTarget})),null,2));
