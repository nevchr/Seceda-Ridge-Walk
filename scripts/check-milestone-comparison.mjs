import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1200}});await page.goto('http://127.0.0.1:4173/artifacts/meadow-v03/index.html');
 for(const label of ['Start','Midpoint','Viewpoint']){
  await page.getByRole('button',{name:label,exact:true}).click();
  await page.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));
  assert.ok(await page.evaluate(()=>[...document.images].every(im=>im.naturalWidth===1600&&im.naturalHeight===1000)));
 }
 await page.locator('#split').evaluate(el=>{el.value='45';el.dispatchEvent(new Event('input'));});
 assert.ok(await page.locator('#after').evaluate(el=>el.style.clipPath.includes('45%')));
 await page.screenshot({path:'artifacts/meadow-v03/comparison-preview.png'});
 console.log('All six matched screenshots load; three location tabs and comparison divider work.');
}finally{await browser.close();}
