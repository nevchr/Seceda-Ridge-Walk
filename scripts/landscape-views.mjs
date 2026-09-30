import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const stage=process.argv[2]||'after',source=process.argv.includes('--source');
const dir=`artifacts/landscape-v08/${stage}`;await fs.mkdir(dir,{recursive:true});
const app=await _electron.launch({executablePath:source?'node_modules/electron/dist/electron.exe':`release/Seceda-Windows-v0.${stage==='before'?7:8}/Seceda.exe`,args:source?['.']:[]});
const views=[{name:'10-valley',x:150,z:-120,yaw:-1.88,pitch:-.14},{name:'01-start',x:15,z:165,yaw:-.65,pitch:.025},{name:'02-midpoint',x:74,z:15,yaw:-.7,pitch:.04},{name:'03-viewpoint',x:150,z:-120,yaw:-1.14,pitch:-.04},{name:'05-path-close',x:15.5,z:158,yaw:-.12,pitch:-.68},{name:'06-cliff-close',x:150,z:-120,yaw:-1.12,pitch:-.27,fov:38},{name:'07-lower-bend',x:30,z:88,yaw:-.65,pitch:-.07},{name:'08-upper-meadow',x:91,z:-25,yaw:-.9,pitch:-.05},{name:'09-ridge-approach',x:113,z:-61,yaw:-1.05,pitch:-.07}];
try{
 const p=await app.firstWindow(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});await p.setViewportSize({width:1600,height:1000});
 if(process.argv.includes('--no-turf'))await p.evaluate(()=>window.__seceda.turf.enabled=false);
 if(process.argv.includes('--no-accents'))await p.evaluate(()=>window.__seceda.grass.enabled=false);
 if(process.argv.includes('--no-bump'))await p.evaluate(()=>window.__seceda.scene.traverse(m=>{for(const mat of Array.isArray(m.material)?m.material:[m.material])if(mat?.userData.shader?.uniforms.bumpStrength)mat.userData.shader.uniforms.bumpStrength.value=0;}));
 if(process.argv.includes('--no-shadow'))await p.evaluate(()=>{window.__seceda.renderer.shadowMap.enabled=false;});
 const results=[];
 for(const v of views.filter(v=>!process.argv.includes('--quick')||['01-start','03-viewpoint','05-path-close','06-cliff-close'].includes(v.name))){
  await p.evaluate(v=>{const q=window.__seceda;q.hideUI();q.camera.fov=v.fov||66;q.camera.updateProjectionMatrix();q.setPose(v.x,v.z,v.yaw,v.pitch);},v);await p.waitForTimeout(2000);await p.screenshot({path:`${dir}/${v.name}.png`});results.push({...v,...await p.evaluate(()=>window.__seceda.stats())});
 }
 await fs.writeFile(`${dir}/report.json`,JSON.stringify({stage,packaged:!source,viewport:{width:1600,height:1000},views:results,errors},null,2));console.log(JSON.stringify({stage,views:results,errors}));
}finally{await app.close();}
