import {fromFile} from 'geotiff';
import fs from 'node:fs/promises';
const manifest=JSON.parse(await fs.readFile('assets/terrain/downloads.json','utf8'));
for(const l of manifest.layers){
 const t=await fromFile(`assets/terrain/${l.name}.tif`); const im=await t.getImage(); const r=await im.readRasters();
 const a=Float32Array.from(r[0]); let min=Infinity,max=-Infinity,bad=0;
 for(const h of a){if(h<0||!Number.isFinite(h))bad++;else{min=Math.min(min,h);max=Math.max(max,h);}}
 if(bad)throw Error(`${l.name} has ${bad} missing cells`);
 l.width=im.getWidth();l.height=im.getHeight(); l.origin=im.getOrigin();l.resolution=im.getResolution();l.range=[min,max];
 await fs.writeFile(`assets/terrain/${l.name}.f32`,Buffer.from(a.buffer));await t.close();console.log(l.name,l.width,l.height,l.origin,l.resolution,l.range);
}
manifest.world={crs:'EPSG:25832',origin:[708700,5164300,2500],axes:'x east, y up, z south',unit:'metre',verticalScale:1};
await fs.writeFile('assets/terrain/manifest.json',JSON.stringify(manifest,null,2));
