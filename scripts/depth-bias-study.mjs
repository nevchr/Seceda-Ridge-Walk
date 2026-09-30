import {createRequire} from 'node:module';import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir='artifacts/depth-v06/bias-study';await fs.mkdir(dir,{recursive:true});
const app=await _electron.launch({executablePath:'release/Seceda-Windows-v0.6/Seceda.exe',args:[]});
try{const p=await app.firstWindow();await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});await p.setViewportSize({width:1600,height:1000});
await p.evaluate(()=>{const q=window.__seceda;q.hideUI();q.setPose(150,-120,-1.12,-.27);q.camera.fov=38;q.camera.updateProjectionMatrix();});
for(const [name,n,sun] of [['01-normal-offset',1.5,2],['02-sun-offset-4m',0,4],['03-sun-offset-8m',0,8]]){await p.evaluate(async({n,sun})=>{const {massifUniforms}=await import('./src/massif-light.js');massifUniforms.massifBias.value.set(n,sun);},{n,sun});await p.waitForTimeout(600);await p.screenshot({path:`${dir}/${name}.png`});}
}finally{await app.close();}
