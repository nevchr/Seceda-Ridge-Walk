import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const p=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.url()+': '+r.status());});
 await p.goto('http://127.0.0.1:4173/artifacts/surface-v015/index.html');const options=await p.locator('#pose option').evaluateAll(es=>es.map(e=>e.value));
 for(const value of options){await p.locator('#pose').selectOption(value);await p.waitForFunction(()=>['beforeImage','afterImage'].every(id=>{const i=document.getElementById(id);return i.complete&&i.naturalWidth===1600&&i.naturalHeight===1000;}));}
 await p.locator('#large').click();assert.ok(await p.locator('#pair').evaluate(e=>e.classList.contains('large')));
 await p.locator('#blink').click();await p.locator('#flip').click();assert.ok(await p.locator('#before').evaluate(e=>e.classList.contains('shown')));await p.locator('#flip').click();assert.ok(await p.locator('#after').evaluate(e=>e.classList.contains('shown')));
 for(const mode of ['native','controlled']){await p.locator('#perfMode').selectOption(mode);const report=JSON.parse(await fs.readFile('artifacts/surface-v015/final-'+mode+'.json'));const expected=report.results.find(r=>r.version==='v0.15').gpuMs.mean.toFixed(2);await p.waitForFunction(value=>document.querySelectorAll('#metrics tr').length===8&&document.querySelector('#metrics tr td:nth-child(3)').textContent.startsWith(value),expected);}
 await p.locator('#side').click();await p.locator('#pose').selectOption('viewpoint-peaks');await p.waitForTimeout(600);
 await p.locator('#walk').scrollIntoViewIfNeeded();await p.locator('#coverage').scrollIntoViewIfNeeded();await p.waitForFunction(()=>[...document.querySelectorAll('.walks img')].every(i=>i.complete&&i.naturalWidth>0));
 const hrefs=await p.locator('a[href]').evaluateAll(es=>es.map(e=>e.href));for(const href of hrefs){const u=new URL(href);if(u.origin==='http://127.0.0.1:4173'&&u.pathname!=='/artifacts/surface-v015/index.html')assert.ok((await fs.stat(path.resolve('.','.'+decodeURIComponent(u.pathname)))).isFile(),href);}
 await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:'artifacts/surface-v015/gallery-check.png'});assert.deepEqual(errors,[]);
 const report={passed:true,pairedViews:options.length,nativeImages:options.length*2,dimensions:[1600,1000],performanceRowsPerSetting:8,walkImages:await p.locator('.walks img').count(),checkedLinks:hrefs.length,errors};await fs.writeFile('artifacts/surface-v015/gallery-check.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close();}
