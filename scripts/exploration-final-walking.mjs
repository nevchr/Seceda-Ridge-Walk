import fs from 'node:fs/promises';import {createRequire} from 'node:module';import assert from 'node:assert/strict';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const app=await _electron.launch({executablePath:'release/Seceda-Windows-v0.12/Seceda.exe',args:['--force-device-scale-factor=1']});
try{
 const p=await app.firstWindow(),errors=[],results=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:180000});await p.setViewportSize({width:1600,height:1000});
 await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].show();BrowserWindow.getAllWindows()[0].focus();});await p.bringToFront();await p.getByRole('button',{name:'Begin walk'}).click();await p.waitForFunction(()=>window.__seceda.stats().active);
 for(const [i,pose]of [[15,165,-.14,.025],[450,180,-1.97,-.06],[800,380,-2.31,-.06]].entries()){
  await p.evaluate(([x,z,yaw,pitch])=>{const q=window.__seceda;q.setPose(x,z,yaw,pitch);q.hideUI();q.finalAudit={blocked:0,error:0};if(!q.originalStep)q.originalStep=q.player.step;q.player.step=function(...args){const r=q.originalStep.apply(this,args);q.finalAudit.blocked+=r.blocked?1:0;q.finalAudit.error=Math.max(q.finalAudit.error,Math.abs(this.position.y-q.terrain.height(this.position.x,this.position.z)-1.72));return r;};},pose);
  await p.waitForTimeout(2000);await p.waitForFunction(()=>!window.__seceda.grass.info.pending,null,{timeout:60000});await p.keyboard.down('KeyW');
  for(let j=0;j<3;j++){await p.waitForTimeout(8000);assert.equal(await p.evaluate(()=>window.__seceda.stats().active),true,'Final walk lost focus');await p.screenshot({path:`artifacts/exploration-v012/final-walk-${i}-${j}.png`});}
  await p.keyboard.up('KeyW');results.push({start:pose,...await p.evaluate(()=>({...window.__seceda.stats(),audit:window.__seceda.finalAudit,grass:window.__seceda.grass.info}))});
 }
 assert.deepEqual(errors,[]);assert.ok(results.every(r=>r.audit.blocked===0&&r.audit.error<.10));
 await fs.writeFile('artifacts/exploration-v012/final-walking.json',JSON.stringify({passed:true,method:'Three actual-input 24-second walking checks in the final package after removing the aliased micro-bump. Original route, middle pasture, east pasture. Separate starting poses are placed before each continuous walk.',results,errors},null,2));
 console.log(JSON.stringify(results));
}finally{await app.close();}
