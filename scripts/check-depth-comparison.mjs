import {createRequire} from 'node:module';import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{const p=await browser.newPage({viewport:{width:1440,height:1200}});await p.goto('http://127.0.0.1:4173/artifacts/depth-v06/index.html');let pairs=0;
for(let category=0;category<4;category++){
 await p.locator('#category').selectOption({index:category});
 const count=await p.locator('nav button').count();
 for(let i=0;i<count;i++){await p.locator('nav button').nth(i).click();await p.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));assert.ok(await p.evaluate(()=>[...document.images].every(im=>im.naturalWidth===1600&&im.naturalHeight===1000)));pairs++;}
}
await p.locator('#category').selectOption({index:0});await p.getByRole('button',{name:'Viewpoint',exact:true}).click();await p.locator('#split').evaluate(e=>{e.value='50';e.dispatchEvent(new Event('input'));});await p.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));assert.ok(await p.locator('#after').evaluate(el=>el.style.clipPath.includes('50%')));await p.screenshot({path:'artifacts/depth-v06/comparison-preview.png'});
console.log(`${pairs} full-resolution comparison pairs, all four categories and slider passed.`);
}finally{await browser.close();}
