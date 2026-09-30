import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const app=await _electron.launch({executablePath:'release/Seceda-Windows-v0.12/Seceda.exe',args:['--force-device-scale-factor=1']});
try{
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.waitForFunction(()=>window.__seceda?.ready,null,{timeout:180000});await page.setViewportSize({width:1600,height:1000});
 // Exercise arrival -> QA reset -> keyboard reset, with UI visible.
 await page.evaluate(()=>window.__seceda.setPose(150,-120,-1.14,-.04));await page.waitForTimeout(150);
 assert.equal(await page.locator('#arrival').isVisible(),true);
 await page.evaluate(()=>window.__seceda.reset());await page.waitForTimeout(150);assert.equal(await page.locator('#arrival').isVisible(),false);
 await app.evaluate(({BrowserWindow})=>{const win=BrowserWindow.getAllWindows()[0];win.show();win.focus();});await page.bringToFront();await page.waitForTimeout(700);
 await page.getByRole('button',{name:'Begin walk'}).click();await page.waitForFunction(()=>window.__seceda.stats().active,null,{timeout:5000});
 assert.equal(await page.evaluate(()=>window.__seceda.stats().active),true);
 await page.keyboard.down('KeyW');await page.waitForTimeout(1500);await page.keyboard.up('KeyW');
 const lookBefore=await page.evaluate(()=>[window.__seceda.player.yaw,window.__seceda.player.pitch]);
 await page.mouse.move(300,200);await page.mouse.move(600,350);const lookAfter=await page.evaluate(()=>[window.__seceda.player.yaw,window.__seceda.player.pitch]);assert.notDeepEqual(lookAfter,lookBefore,'Actual mouse movement must change the view');await page.keyboard.press('Escape');await page.waitForTimeout(150);
 assert.equal(await page.locator('#pause').isVisible(),true);const paused=await page.evaluate(()=>window.__seceda.stats().position);await page.waitForTimeout(300);assert.deepEqual(paused,await page.evaluate(()=>window.__seceda.stats().position));
 await page.keyboard.press('KeyR');await page.getByRole('button',{name:'Continue walk'}).click();await page.waitForTimeout(250);
 await page.evaluate(()=>{const q=window.__seceda;q.reset();q.hideUI();const original=q.player.step;q.walkAudit={blocked:0,maxGroundError:0,frames:0,index:1};q.player.step=function(...args){const r=original.apply(this,args);q.walkAudit.blocked+=r.blocked?1:0;q.walkAudit.frames++;q.walkAudit.maxGroundError=Math.max(q.walkAudit.maxGroundError,Math.abs(this.position.y-q.terrain.height(this.position.x,this.position.z)-1.72));return r;};});
 const start=Date.now(),samples=[];let lastLog=-1,nextShot=0,focusResumes=0;
 await page.keyboard.down('KeyW');
 while(Date.now()-start<250000){
  const sample=await page.evaluate(()=>{
   const q=window.__seceda,a=q.walkAudit,p=q.player.position;
   while(a.index<q.route.points.length&&Math.hypot(q.route.points[a.index].x-p.x,q.route.points[a.index].z-p.z)<.85)a.index++;
   const target=q.route.points[Math.min(a.index,420)];q.player.yaw=Math.atan2(-(target.x-p.x),-(target.z-p.z));q.player.pitch=.02;
   return {...a,...q.stats(),ground:q.terrain.height(p.x,p.z)};
  });
  if(!sample.active){focusResumes++;assert.ok(focusResumes<=6,'Repeated focus loss prevents the walk test');await page.keyboard.up('KeyW');await page.bringToFront();await page.getByRole('button',{name:'Continue walk'}).click();await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.__seceda.stats().active),true,'Could not resume pointer capture');await page.keyboard.down('KeyW');continue;}
  const seconds=(Date.now()-start)/1000;
  if(Math.floor(seconds/30)!==lastLog){lastLog=Math.floor(seconds/30);samples.push({seconds,...sample});console.log(JSON.stringify({seconds,index:sample.index,blocked:sample.blocked,groundError:sample.maxGroundError}));}
  if(sample.index/420>=nextShot/3){await page.screenshot({path:`artifacts/exploration-v012/walk-${nextShot}.png`});nextShot++;}
  if(sample.index>=421)break;
  await page.waitForTimeout(200);
 }
 await page.keyboard.up('KeyW');await page.waitForTimeout(200);const result=await page.evaluate(()=>({...window.__seceda.walkAudit,...window.__seceda.stats()}));
 assert.equal(result.index,421,'Actual-time W-input traversal did not complete');assert.ok(result.maxGroundError<.08);assert.equal(result.blocked,0);assert.equal(result.reached,true);
 await page.keyboard.press('KeyR');await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.__seceda.stats().reached),false);assert.equal(await page.locator('#arrival').evaluate(e=>e.classList.contains('hidden')),true);
 // Continue from the viewpoint into the connected pasture and back to start.
 // The reset above is checked, then we resume from the endpoint for this separate leg.
 const tour=JSON.parse(await fs.readFile('artifacts/exploration-v012/controller.json')).tour;
 await page.evaluate(tour=>{const q=window.__seceda;q.setPose(150,-120,0,.02);q.walkAudit={blocked:0,maxGroundError:0,frames:0,index:1};q.freeTour=tour;q.streamAudit={maxTiles:0,maxPending:0};},tour);
 await page.keyboard.down('ShiftLeft');await page.keyboard.down('KeyW');
 const freeStart=Date.now();let nextFreeShot=0,lastFreeLog=-1;
 while(Date.now()-freeStart<960000){
  const sample=await page.evaluate(()=>{const q=window.__seceda,a=q.walkAudit,p=q.player.position;
   while(a.index<q.freeTour.length&&Math.hypot(q.freeTour[a.index][0]-p.x,q.freeTour[a.index][1]-p.z)<1.1)a.index++;
   const target=q.freeTour[Math.min(a.index,q.freeTour.length-1)];q.player.yaw=Math.atan2(-(target[0]-p.x),-(target[1]-p.z));q.player.pitch=-.035;
   q.streamAudit.maxTiles=Math.max(q.streamAudit.maxTiles,q.grass.info.residentTiles);q.streamAudit.maxPending=Math.max(q.streamAudit.maxPending,q.grass.info.pending);
   return {...a,...q.stats(),grass:{...q.grass.info}};
  });
  if(!sample.active){focusResumes++;await page.keyboard.up('KeyW');await page.keyboard.up('ShiftLeft');await page.bringToFront();await page.getByRole('button',{name:'Continue walk'}).click();await page.waitForTimeout(250);await page.keyboard.down('ShiftLeft');await page.keyboard.down('KeyW');continue;}
  const seconds=(Date.now()-freeStart)/1000;
  if(Math.floor(seconds/30)!==lastFreeLog){lastFreeLog=Math.floor(seconds/30);samples.push({leg:'pasture',seconds,...sample});console.log(JSON.stringify({leg:'pasture',seconds,index:sample.index,position:sample.position,blocked:sample.blocked,tiles:sample.grass.residentTiles}));}
  if(seconds>=nextFreeShot*70){await page.screenshot({path:'artifacts/exploration-v012/explore-'+nextFreeShot+'.png'});nextFreeShot++;}
  if(sample.index>=tour.length)break;
  await page.waitForTimeout(200);
 }
 await page.keyboard.up('KeyW');await page.keyboard.up('ShiftLeft');const freeResult=await page.evaluate(()=>({...window.__seceda.walkAudit,...window.__seceda.stats(),stream:window.__seceda.streamAudit}));
 await fs.writeFile('artifacts/exploration-v012/free-walk.json',JSON.stringify({seconds:(Date.now()-freeStart)/1000,result:freeResult,tour,errors,method:'Real-time held W+Shift input around the connected pasture; automated heading changes. Endpoint set once before this separate leg; no teleports during the tour.'},null,2));
 assert.equal(freeResult.index,tour.length,'Connected pasture loop did not complete');assert.ok(freeResult.maxGroundError<.10);assert.equal(freeResult.blocked,0);
 assert.equal(errors.length,0);const report={method:'Portable executable, actual normal-speed KeyW held throughout the route. Automation adjusts heading toward successive route samples every 200ms; no position teleport or direct controller stepping during the traversal. External focus loss, if any, is resumed through the normal Continue walk button and recorded. This is guided real-time input, not a human playtest.',freeResult,focusResumes,seconds:(Date.now()-start)/1000,result,samples,errors,passed:['Offline startup','Mouse/pointer capture','Escape pause fixed position','QA reset clears arrival','Keyboard R clears arrival','Whole normal-speed route with real W input','Zero blocked controller steps','Grounding within 8cm']};
 await fs.writeFile('artifacts/exploration-v012/packaged-walk.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await app.close();}
