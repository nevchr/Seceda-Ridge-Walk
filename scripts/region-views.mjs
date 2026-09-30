import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const version=process.argv.find(x=>x.startsWith('--version='))?.split('=')[1]||(process.argv.includes('--source')?'0.13-study':'0.12');
const stage=process.argv.find(x=>x.startsWith('--stage='))?.split('=')[1]||`v${version}`;
const source=process.argv.includes('--source'),filter=process.argv.find(x=>x.startsWith('--only='))?.slice(7)?.split(',');
const dir=`artifacts/region-v013/${stage}`;await fs.mkdir(dir,{recursive:true});
const sites=[
 ['start',15,165,-.65,.025],['midpoint',74,15,-.7,.04],['viewpoint',150,-120,-1.14,-.04],
 ['cliff-edge',178,-108,-1.12,-.19],['south-meadow',450,180,-1.05,-.06],
 ['east-pasture',800,380,-1.35,-.04],['south-return',320,430,-.7,.035],
];
const views=sites.flatMap(([site,x,z,yaw,pitch])=>[
 {name:site+'-peaks',x,z,yaw,pitch},
 {name:site+'-away',x,z,yaw:yaw+Math.PI,pitch:-.10},
 {name:site+'-across',x,z,yaw:yaw+Math.PI/2,pitch:-.06},
]);
if(process.argv.includes('--regional'))views.push({name:'southern-faces',x:73,z:44,yaw:-1.89,pitch:-.035},{name:'pasture-faces',x:404,z:150,yaw:Math.atan2(-46,-30),pitch:-.035},{name:'east-turn',x:856,z:442,yaw:Math.atan2(156,-14),pitch:-.035});
views.push({name:'cliff-close',x:150,z:-120,yaw:-1.12,pitch:-.27,fov:38},
 {name:'path-close',x:31,z:108,yaw:-.35,pitch:-.52});
const app=await _electron.launch({executablePath:source?'node_modules/electron/dist/electron.exe':`release/Seceda-Windows-v${version}/Seceda.exe`,args:source?['.','--force-device-scale-factor=1']:['--force-device-scale-factor=1']});
const report={version,source,stage,views:[],errors:[]};
try{
 const page=await app.firstWindow();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.waitForFunction(()=>window.__seceda?.ready,null,{timeout:180000});await page.setViewportSize({width:1600,height:1000});
 for(const v of views){if(filter&&!filter.includes(v.name))continue;
  await page.evaluate(v=>{const q=window.__seceda;q.hideUI();q.camera.fov=v.fov||66;q.camera.updateProjectionMatrix();q.setPose(v.x,v.z,v.yaw,v.pitch);},v);
  await page.waitForTimeout(900);await page.waitForFunction(()=>!window.__seceda.grass.info.pending,null,{timeout:90000});await page.waitForTimeout(800);
  const data=await page.evaluate(()=>{const q=window.__seceda;q.renderer.render(q.scene,q.camera);return q.renderer.domElement.toDataURL('image/png');});
  await fs.writeFile(`${dir}/${v.name}.png`,Buffer.from(data.split(',')[1],'base64'));
  report.views.push({...v,...await page.evaluate(()=>window.__seceda.stats())});console.log(v.name);
 }
 report.scene=await page.evaluate(()=>{const q=window.__seceda;return {metadata:q.scene.userData,turf:q.turf.info,grass:q.grass.info,cliffs:q.scene.children.filter(m=>m.userData.cliffRefinement).map(m=>({name:m.name,...m.userData.cliffRefinement,ledge:m.userData.ledgeStudy})),canvas:[q.renderer.domElement.width,q.renderer.domElement.height]};});
 await fs.writeFile(`${dir}/report.json`,JSON.stringify(report,null,2));if(report.errors.length)throw Error(report.errors.join('\n'));
}finally{await app.close();}
