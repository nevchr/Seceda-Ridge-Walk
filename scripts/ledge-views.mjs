import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const version=process.argv[2]||'0.11',source=process.argv.includes('--source');
const stage=process.argv.find(x=>x.startsWith('--stage='))?.split('=')[1]||`v${version}`;
const dir=`artifacts/ledge-v011/${stage}`;await fs.mkdir(dir,{recursive:true});
const app=await _electron.launch({executablePath:source?'node_modules/electron/dist/electron.exe':`release/Seceda-Windows-v${version}/Seceda.exe`,args:source?['.']:[]});
export const views=[
 {name:'01-start',x:15,z:165,yaw:-.65,pitch:.025},
 {name:'02-midpoint',x:74,z:15,yaw:-.7,pitch:.04},
 {name:'03-viewpoint',x:150,z:-120,yaw:-1.14,pitch:-.04},
 {name:'06-cliff-close',x:150,z:-120,yaw:-1.12,pitch:-.27,fov:38},
 {name:'13-cliff-edge',x:178,z:-108,yaw:-1.12,pitch:-.19},
];
try{
 const p=await app.firstWindow(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:120000});await p.setViewportSize({width:1600,height:1000});const results=[];
 for(const v of views){
  await p.evaluate(v=>{const q=window.__seceda;q.hideUI();q.camera.fov=v.fov||66;q.camera.updateProjectionMatrix();q.setPose(v.x,v.z,v.yaw,v.pitch);},v);await p.waitForTimeout(1800);await p.screenshot({path:`${dir}/${v.name}.png`});
  const native=await p.evaluate(()=>{const q=window.__seceda;q.renderer.render(q.scene,q.camera);return q.renderer.domElement.toDataURL('image/png');});
  await fs.writeFile(`${dir}/${v.name}-native.png`,Buffer.from(native.split(',')[1],'base64'));
  results.push({...v,...await p.evaluate(()=>window.__seceda.stats())});
  if(!process.argv.includes('--no-masks'))for(const mode of ['profile','cliff-mask']){
   const data=await p.evaluate(async mode=>{
    const T=await import('three'),q=window.__seceda,s=new T.Scene();s.background=new T.Color(0);
    const white=new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide,toneMapped:false}),black=new T.MeshBasicMaterial({color:0,side:T.DoubleSide,toneMapped:false});
    const names=['Survey-aligned fractured ridge','Contour-fitted limestone prows','Nine authored summit blades','Connected limestone risers and turf benches','Jointed Seceda limestone formations'];
    for(const m of q.scene.children){if(!m.isMesh||m.isInstancedMesh)continue;const cliff=names.includes(m.name),ground=!m.name&&m.geometry.attributes.position?.count>10000;if(!cliff&&!ground)continue;
     const copy=new T.Mesh(m.geometry,mode==='profile'||cliff?white:black);copy.matrix.copy(m.matrix);copy.matrixAutoUpdate=false;copy.frustumCulled=false;s.add(copy);
    }
    q.renderer.render(s,q.camera);const result=q.renderer.domElement.toDataURL('image/png');white.dispose();black.dispose();return result;
   },mode);
   await fs.writeFile(`${dir}/${v.name}-${mode}.png`,Buffer.from(data.split(',')[1],'base64'));
  }
 }
 const info=await p.evaluate(()=>({scene:window.__seceda.scene.userData,renderTarget:{width:window.__seceda.renderer.domElement.width,height:window.__seceda.renderer.domElement.height,pixelRatio:window.__seceda.renderer.getPixelRatio()},cliffs:window.__seceda.scene.children.filter(m=>m.userData.cliffRefinement).map(m=>({name:m.name,...m.userData.cliffRefinement,ledgeStudy:m.userData.ledgeStudy,ledgeSupport:m.userData.ledgeSupport}))}));
 await fs.writeFile(`${dir}/report.json`,JSON.stringify({version,packaged:!source,viewport:{width:1600,height:1000},views:results,info,errors},null,2));console.log(JSON.stringify({version,stage,errors,cliffs:info.cliffs,massif:info.scene.massifLight}));
 if(errors.length)throw Error(errors.join('\n'));
}finally{await app.close();}
