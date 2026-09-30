import {createRequire} from 'node:module';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const p=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await p.goto('http://127.0.0.1:4173/artifacts/ledge-v011/index.html');
 await p.getByText('Outline check',{exact:true}).click();
 for(let i=0;i<5;i++){
  await p.locator('#pose').selectOption({index:i});
  for(const side of ['before','after'])assert.equal(await p.locator('#image-'+side).evaluate(async e=>{await e.decode();return e.naturalWidth}),2000);
  for(const kind of ['profile','cliff-mask']){await p.locator('#mask').selectOption(kind);assert.equal(await p.locator('#outline').evaluate(async e=>{await e.decode();return e.naturalWidth}),2000);}
 }
 for(const mode of ['before','after','pair']){await p.locator('#layout').selectOption(mode);assert.equal(await p.locator('#before').isVisible(),mode!=='after');assert.equal(await p.locator('#after').isVisible(),mode!=='before');}
 await p.locator('#pose').selectOption('03-viewpoint');await p.locator('#mask').selectOption('profile');
 await p.getByText('Measured packaged performance and walk',{exact:true}).click();
 await p.waitForFunction(()=>document.querySelectorAll('#performance tr').length===6&&document.querySelector('#walk').textContent.includes('327.98'));
 await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:'artifacts/ledge-v011/gallery-check.png'});
 assert.deepEqual(errors,[]);const report={passed:true,cameraViews:5,versions:2,nativeImagesDecoded:10,outlineOverlaysDecoded:10,displayModes:3,errors};await fs.writeFile('artifacts/ledge-v011/gallery-check.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close();}
