import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {_electron:electron}=require('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const stage=process.argv[2]||'after';
const packaged=process.argv.includes('--packaged');
const dir=`artifacts/redesign/${stage}`;
await fs.mkdir(dir,{recursive:true});
const app=await electron.launch({executablePath:packaged?'release/Seceda-Windows-Redesign/Seceda.exe':'node_modules/electron/dist/electron.exe',args:packaged?[]:['.']});
const page=await app.firstWindow();const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});
await page.setViewportSize({width:1600,height:1000});
const views=[{name:'01-start',x:15,z:165,yaw:-.65,pitch:.025},{name:'02-midpoint',x:74,z:15,yaw:-.7,pitch:.04},{name:'03-viewpoint',x:150,z:-120,yaw:-1.14,pitch:-.04}];
const results=[];
try {
for(const v of views){await page.evaluate(v=>{const q=window.__seceda;q.hideUI();q.setPose(v.x,v.z,v.yaw,v.pitch);},v);await page.waitForTimeout(2800);await page.screenshot({path:`${dir}/${v.name}.png`});results.push({...v,...await page.evaluate(()=>window.__seceda.stats())});}
await page.evaluate(()=>{window.__seceda.reset();window.__seceda.showUI();document.getElementById('intro').classList.remove('hidden');});await page.waitForTimeout(500);await page.screenshot({path:`${dir}/04-default-start.png`});
await fs.writeFile(`${dir}/report.json`,JSON.stringify({stage,packaged,viewport:{width:1600,height:1000},views:results,errors},null,2));console.log(JSON.stringify({stage,views:results,errors},null,2));
}finally{await app.close();}
