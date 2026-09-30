import {createRequire} from 'node:module';import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const app=await _electron.launch({executablePath:'release/Seceda-Windows-v0.6/Seceda.exe',args:[]});
try{const p=await app.firstWindow();await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});await p.setViewportSize({width:1600,height:1000});await p.evaluate(()=>{const q=window.__seceda;q.hideUI();q.setPose(15.5,158,-.12,-.68);});await p.waitForTimeout(1200);
console.log(await p.evaluate(()=>{const q=window.__seceda;return {info:q.turf.info,meshes:q.turf.meshes.map(m=>({count:m.count,vertices:m.geometry.attributes.position.count,triangles:m.geometry.index.count/3,instances:Array.from(m.instanceMatrix.array.slice(0,32))})),bake:q.scene.userData.massifLight};}));
await p.evaluate(()=>{for(const m of window.__seceda.turf.materials){m.emissive.setRGB(.1,.8,.04);m.emissiveIntensity=1;}});await p.waitForTimeout(500);await p.screenshot({path:'artifacts/depth-v06/iterations/turf-debug-emission.png'});
await p.evaluate(()=>{window.__seceda.turf.enabled=false;});await p.waitForTimeout(500);await p.screenshot({path:'artifacts/depth-v06/iterations/turf-ground-only.png'});
}finally{await app.close();}
