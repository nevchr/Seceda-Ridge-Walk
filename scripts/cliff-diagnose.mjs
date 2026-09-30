import {createRequire} from 'node:module';import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir='artifacts/cliff-v010/diagnostics';await fs.mkdir(dir,{recursive:true});
const app=await _electron.launch({executablePath:'node_modules/electron/dist/electron.exe',args:['.']});
try{const p=await app.firstWindow();await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});await p.setViewportSize({width:1600,height:1000});
 await p.evaluate(()=>{const q=window.__seceda;q.hideUI();q.camera.fov=38;q.camera.updateProjectionMatrix();q.setPose(150,-120,-1.12,-.27);});
 for(const mode of ['current','no-massif','clay','original-geometry']){
  await p.evaluate(async mode=>{const q=window.__seceda,T=await import('three');const {massifUniforms,bakeMassifLight}=await import('./src/massif-light.js');
   if(mode==='no-massif')massifUniforms.massifEnabled.value=0;
   if(mode==='clay'){q.scene.traverse(m=>{if(m.userData.cliffRefinement){m.userData.savedMaterial=m.material;m.material=new T.MeshStandardMaterial({color:0x8a8175,roughness:1,side:T.DoubleSide});}});}
   if(mode==='original-geometry'){for(const m of q.scene.children)if(m.userData.cliffRefinement){m.geometry=m.userData.v08Geometry;m.geometry.setAttribute('cliffRelief',new T.Float32BufferAttribute(new Float32Array(m.geometry.attributes.position.count*3),3));m.material=m.userData.savedMaterial;}massifUniforms.massifEnabled.value=1;bakeMassifLight(q.renderer,q.scene);}
  },mode);await p.waitForTimeout(1400);await p.screenshot({path:`${dir}/${mode}.png`});
 }
}finally{await app.close();}
