import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{const p=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.url()+': '+r.status());});
 await p.goto('http://127.0.0.1:4173/artifacts/exploration-v012/index.html');const options=await p.locator('#pose option').evaluateAll(es=>es.map(e=>e.value));
 for(const value of options){await p.locator('#pose').selectOption(value);await p.waitForFunction(()=>['old','new'].every(id=>{const i=document.getElementById(id);return i.complete&&i.naturalWidth===1600&&i.naturalHeight===1000;}));}
 await p.locator('#large').click();assert.ok(await p.locator('#pair').evaluate(e=>e.classList.contains('single')));await p.locator('#side').click();await p.locator('#pose').selectOption('03-viewpoint');await p.waitForTimeout(500);assert.equal(await p.locator('#metrics tr').count(),8);assert.equal(await p.locator('.walks img').count(),5);await p.waitForFunction(()=>[...document.querySelectorAll('.walks img')].every(i=>i.complete&&i.naturalWidth>0));
 await p.screenshot({path:'artifacts/exploration-v012/gallery-check.png'});assert.deepEqual(errors,[]);const report={passed:true,pairedViews:options.length,nativeImages:options.length*2,dimensions:[1600,1000],performanceRows:8,errors};await fs.writeFile('artifacts/exploration-v012/gallery-check.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close();}
