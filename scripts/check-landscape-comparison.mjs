import {createRequire} from 'node:module';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const p=await browser.newPage({viewport:{width:1440,height:1180}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173/artifacts/landscape-v08/index.html');
 for(let i=0;i<9;i++){
  await p.locator('#views').selectOption(String(i));
  for(const button of ['old','new']){await p.locator('#'+button).click();await p.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));assert.ok(await p.evaluate(()=>[...document.images].every(im=>im.naturalWidth===1600&&im.naturalHeight===1000)));assert.equal(await p.locator('#'+button).getAttribute('aria-pressed'),'true');}
 }
 await p.locator('#views').selectOption('3');await p.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));await p.screenshot({path:'artifacts/landscape-v08/comparison-preview.png'});assert.deepEqual(errors,[]);
 await fs.writeFile('artifacts/landscape-v08/gallery-check.json',JSON.stringify({passed:true,fullResolutionCameraPairs:9,beforeAfterButtonsPassed:true,errors},null,2));console.log('All nine full-resolution image pairs and before/after controls passed.');
}finally{await browser.close();}
