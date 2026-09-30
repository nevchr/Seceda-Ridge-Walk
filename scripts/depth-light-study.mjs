import {createRequire} from 'node:module';import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir='artifacts/depth-v06/lighting-study';await fs.mkdir(dir,{recursive:true});
const app=await _electron.launch({executablePath:'release/Seceda-Windows-v0.6/Seceda.exe',args:[]});
try{
 const p=await app.firstWindow();await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});await p.setViewportSize({width:1600,height:1000});const report=[];
 for(const test of [{name:'01-dtm-only',enabled:0,size:2048,authored:true},{name:'02-survey-depth-only',enabled:1,size:2048,authored:false},{name:'03-all-geometry-1024',enabled:1,size:1024,authored:true},{name:'04-all-geometry-2048',enabled:1,size:2048,authored:true}]){
  const info=await p.evaluate(async test=>{const q=window.__seceda;q.hideUI();q.setPose(150,-120,-1.14,-.04);const mod=await import('./src/massif-light.js');q.testBake?.target.dispose();const start=performance.now();q.testBake=mod.bakeMassifLight(q.renderer,q.scene,test.size,test.authored);mod.massifUniforms.massifEnabled.value=test.enabled;return {...q.testBake.info,cpuBakeMs:performance.now()-start};},test);await p.waitForTimeout(1200);await p.screenshot({path:`${dir}/${test.name}.png`});report.push({...test,...info});
 }
 await fs.writeFile(`${dir}/report.json`,JSON.stringify({method:'Same packaged V0.6 camera, materials, sky and vegetation. Only sun visibility source/caster set/resolution changes. Near shadow map remains 4096 with a 360m footprint.',report},null,2));console.log(report);
}finally{await app.close();}
