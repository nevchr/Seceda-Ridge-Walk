import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir='artifacts/surface-v015/reverse-diagnostic2';await fs.mkdir(dir,{recursive:true});
const app=await _electron.launch({executablePath:'release/Seceda-Windows-v0.15-surface8/Seceda.exe',args:['--force-device-scale-factor=1']});
try{
 const page=await app.firstWindow();await page.waitForFunction(()=>window.__seceda?.ready,null,{timeout:180000});await page.setViewportSize({width:1600,height:1000});
 await page.evaluate(()=>{const q=window.__seceda;q.hideUI();q.setPose(150,-120,-1.14+Math.PI,-.10);});
 await page.waitForTimeout(1800);await page.waitForFunction(()=>!window.__seceda.grass.info.pending&&!window.__seceda.survey.info.pending,null,{timeout:180000});
 const shots=[];
 for(const mode of ['normal','no-sward','no-detail-meshes','no-regional-relief','no-bump']){
  const details=await page.evaluate(mode=>{const q=window.__seceda,changed=[];q.scene.traverse(o=>{
   if((mode==='no-sward'&&o.name.includes('Middle pasture'))||(mode==='no-detail-meshes'&&(/Survey-fitted thin-soil|Regional|limestone debris|evergreen/i.test(o.name)))){o.visible=false;changed.push(o.name);}
   const m=o.material;
   if(mode==='no-regional-relief'&&m?.userData?.shader?.uniforms.bumpStrength&&!m.userData.noRegional){const original=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=s=>{original(s);s.fragmentShader=s.fragmentShader.replace('rockRelief+=regionalFaceRelief(p)*smoothstep(.12,.32,steep)*.90;','rockRelief+=0.;');};m.customProgramCacheKey=()=>key+'-no-regional-relief';m.userData.noRegional=true;m.needsUpdate=true;changed.push(o.name);}
   if(mode==='no-bump'&&m?.userData?.shader?.uniforms.bumpStrength){m.userData.shader.uniforms.bumpStrength.value=0;changed.push(o.name);}
  });return changed;},mode);
  await page.waitForTimeout(600);const data=await page.evaluate(()=>{const q=window.__seceda;q.renderer.render(q.scene,q.camera);return q.renderer.domElement.toDataURL('image/png');});await fs.writeFile(`${dir}/${mode}.png`,Buffer.from(data.split(',')[1],'base64'));shots.push({mode,changed:details});await fs.writeFile(dir+'/report.json',JSON.stringify({method:'Cumulative toggles at fixed reverse viewpoint in surface8 portable; diagnostic only, not altered game assets.',shots},null,2));console.log(mode);
 }
 await fs.writeFile(dir+'/report.json',JSON.stringify({method:'Cumulative toggles at fixed reverse viewpoint in surface8 portable; diagnostic only, not altered game assets.',shots},null,2));
}finally{await app.close();}
