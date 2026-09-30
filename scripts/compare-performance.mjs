import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {_electron:electron}=require('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const results=[];
for(const [version,exe] of [['before','release/Seceda-Windows/Seceda.exe'],['after','release/Seceda-Windows-Redesign/Seceda.exe']]){
 const start=Date.now(),app=await electron.launch({executablePath:exe,args:[]}),page=await app.firstWindow(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});
  await page.setViewportSize({width:1600,height:1000});
  const readyMs=Date.now()-start;
  await page.evaluate(()=>window.__seceda.hideUI());
  await page.waitForTimeout(1500);
  const frames=await page.evaluate(()=>new Promise(resolve=>{
   const times=[],q=window.__seceda;let first,last;
   function sample(t){first??=t;const elapsed=t-first;
    if(last&&elapsed>1000)times.push(t-last);last=t;
    const i=Math.min(q.route.points.length-1,Math.floor(elapsed/11000*(q.route.points.length-1))),p=q.route.points[i];
    q.setPose(p.x,p.z,-.7,.025);
    if(elapsed<11000)requestAnimationFrame(sample);else resolve(times);
   }requestAnimationFrame(sample);
  }));
  const sorted=[...frames].sort((a,b)=>a-b),mean=frames.reduce((a,b)=>a+b,0)/frames.length;
  results.push({version,readyMs,viewport:'1600x1000',frameCount:frames.length,meanMs:mean,p50Ms:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:sorted.at(-1),framesOver25ms:frames.filter(x=>x>25).length,stats:await page.evaluate(()=>window.__seceda.stats()),errors});
 }finally{await app.close();}
}
await fs.writeFile('artifacts/redesign/performance.json',JSON.stringify({method:'Identical 11-second scripted camera sweep of existing route in each portable executable; discard first second. This measures rendered movement, not controller traversal or general hardware capability.',results},null,2));console.log(JSON.stringify(results,null,2));
