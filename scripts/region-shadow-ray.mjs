import {createRequire} from 'node:module';import fs from 'node:fs/promises';
const {_electron}=createRequire(import.meta.url)('C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const app=await _electron.launch({executablePath:'node_modules/electron/dist/electron.exe',args:['.','--force-device-scale-factor=1']});
try{const p=await app.firstWindow();await p.waitForFunction(()=>window.__seceda?.ready,null,{timeout:180000});await p.setViewportSize({width:1600,height:1000});
 await p.evaluate(()=>window.__seceda.setPose(404,150,Math.atan2(-46,-30),-.035));await p.waitForTimeout(1000);
 const data=await p.evaluate(async()=>{const T=await import('three'),q=window.__seceda,objects=q.scene.children.filter(m=>m.isMesh&&m.userData.massifCaster),sun=new T.Vector3(-.65,.50,.57).normalize(),out=[];
 for(const [x,y]of [[617,500],[634,516],[642,528],[647,536],[653,544]]){const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(x/800-1,1-y/500),q.camera);const hit=ray.intersectObjects(objects,false)[0];if(!hit){out.push({x,y,none:true});continue;}ray.set(hit.point.clone().addScaledVector(sun,4),sun);const shadows=ray.intersectObjects(objects,false).slice(0,4).map(h=>({name:h.object.name,p:h.point.toArray(),distance:h.distance,face:h.faceIndex}));out.push({x,y,surface:hit.object.name,p:hit.point.toArray(),shadows});}return out;});await fs.writeFile('artifacts/region-v013/shadow-rays.json',JSON.stringify(data,null,2));console.log(JSON.stringify(data,null,2));
}finally{await app.close();}
