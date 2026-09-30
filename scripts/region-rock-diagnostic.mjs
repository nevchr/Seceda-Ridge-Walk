import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const pasture=process.argv.includes('--pasture');const dir='artifacts/region-v013/'+(pasture?'regional-join-isolation':'regional-isolation');await fs.mkdir(dir,{recursive:true});
const app=await _electron.launch({executablePath:'node_modules/electron/dist/electron.exe',args:['.','--force-device-scale-factor=1']});
try{
 const page=await app.firstWindow();await page.waitForFunction(()=>window.__seceda?.ready,null,{timeout:180000});await page.setViewportSize({width:1600,height:1000});
 await page.evaluate(pasture=>{const q=window.__seceda;q.hideUI();q.setPose(...(pasture?[404,150,Math.atan2(-46,-30),-.035]:[73,44,-1.89,-.035]));},pasture);
 await page.waitForFunction(()=>!window.__seceda.grass.info.pending);await page.waitForTimeout(1500);
 const results=[];
 for(const state of ['complete','complete-dtm','no-regional-surface','dtm-shadow-only']){
  await page.evaluate(async state=>{const q=window.__seceda;for(const m of q.regionalRock.tiles)m.visible=state.startsWith('complete');const {massifUniforms,bakeMassifLight}=await import('./src/massif-light.js');if(state==='no-regional-surface')bakeMassifLight(q.renderer,q.scene,3072);massifUniforms.massifEnabled.value=state==='dtm-shadow-only'||state==='complete-dtm'?0:1;},state);
  await page.waitForTimeout(300);
  const data=await page.evaluate(()=>{const q=window.__seceda;q.renderer.render(q.scene,q.camera);return q.renderer.domElement.toDataURL('image/png');});await fs.writeFile(`${dir}/${state}.png`,Buffer.from(data.split(',')[1],'base64'));
  results.push({state,...await page.evaluate(()=>window.__seceda.stats())});
 }
 const validation=await page.evaluate(async()=>{const q=window.__seceda,{inWalkingArea}=await import('./src/exploration.js');let intrusion=0,samples=0;for(const m of q.regionalRock.tiles){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){samples++;if(inWalkingArea(p.getX(i),p.getZ(i),30))intrusion++;}}return {regional:q.regionalRock.info,shadow:q.scene.userData.massifLight,samples,intrusion};});
 await fs.writeFile(`${dir}/report.json`,JSON.stringify({results,validation,note:'Same source camera. Second view hides the regional surface and recaptures the shadow without it. Third view also disables the complete sun-space depth capture and uses the original survey horizon map. Diagnostic toggles only, not alternative builds.'},null,2));
 if(validation.intrusion)throw Error('Regional rock intrudes on walking buffer');console.log(validation);
}finally{await app.close();}
