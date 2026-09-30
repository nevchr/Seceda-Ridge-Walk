import {createRequire} from 'node:module';import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir='artifacts/region-v013/shadow-bias';await fs.mkdir(dir,{recursive:true});
const app=await _electron.launch({executablePath:'node_modules/electron/dist/electron.exe',args:['.','--force-device-scale-factor=1']});
try{const p=await app.firstWindow();await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:180000});await p.setViewportSize({width:1600,height:1000});await p.evaluate(()=>{const q=window.__seceda;q.hideUI();q.setPose(404,150,Math.atan2(-46,-30),-.035);});await p.waitForTimeout(1500);await p.waitForFunction(()=>!window.__seceda.grass.info.pending);
 for(const bias of [4,8,12,20]){await p.evaluate(async b=>{const {massifUniforms}=await import('./src/massif-light.js');massifUniforms.massifBias.value.y=b;},bias);await p.waitForTimeout(300);const data=await p.evaluate(()=>{const q=window.__seceda;q.renderer.render(q.scene,q.camera);return q.renderer.domElement.toDataURL('image/png');});await fs.writeFile(`${dir}/${bias}.png`,Buffer.from(data.split(',')[1],'base64'));}console.log('Four matched receiver-bias diagnostics captured');
}finally{await app.close();}
