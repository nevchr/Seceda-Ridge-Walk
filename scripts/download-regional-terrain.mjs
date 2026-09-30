import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {fromFile} from 'geotiff';
const root='assets/terrain-v14',span=2000,step=2.5,pad=5,size=805;
await fs.mkdir(root+'/source',{recursive:true});await fs.mkdir(root+'/tiles',{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const tiles=[];for(let n=5160000;n<5172000;n+=span)for(let e=702000;e<716000;e+=span)tiles.push({id:`${e}-${n}`,e,n});
// Cache the exact native probe rather than downloading its identical WCS request.
const cached=root+'/source/710000-5164000.tif';if(!await fs.stat(cached).catch(()=>null))await fs.copyFile('artifacts/terrain-v014/source-research/native-2_5m.tif',cached);
const manifest={version:1,source:'Autonomous Province of Bolzano / South Tyrol DTM 2.5 m',license:'CC0-1.0',catalog:'https://data.civis.bz.it/it/dataset/modello-digitale-del-terreno-dtm-25m',technical:'https://natura-territorio.provincia.bz.it/it/modelli-digitali-di-elevazione',coverage:'p_bz-Elevation:DigitalTerrainModel-2.5m',crs:'EPSG:25832',worldOrigin:[708700,5164300,2500],unit:'metre',verticalScale:1,bbox:[702000,5160000,716000,5172000],nativeSpacing:step,tileSpan:span,gridConvention:'Cell centres aligned with native grid nodes; five metre halo. Runtime mip grids include both core boundaries. Lower levels retain surveyed node heights, not procedural interpolation of the old 40 m raster.',tiles:[]};
async function acquire(t){
 const bbox=[t.e-pad-step/2,t.n-pad-step/2,t.e+span+pad+step/2,t.n+span+pad+step/2];
 const url='https://geoservices9.civis.bz.it/geoserver/ows?'+new URLSearchParams({service:'WCS',version:'1.0.0',request:'GetCoverage',coverage:manifest.coverage,crs:manifest.crs,response_crs:manifest.crs,bbox:bbox.join(','),width:String(size),height:String(size),format:'GeoTIFF',interpolation:'nearest neighbor'});
 const source='source/'+t.id+'.tif',file=root+'/'+source;
 if(!await fs.stat(file).catch(()=>null)){
  const r=await fetch(url,{signal:AbortSignal.timeout(180000)});if(!r.ok)throw Error(t.id+' HTTP '+r.status);const b=Buffer.from(await r.arrayBuffer());if(![73,77].includes(b[0]))throw Error(t.id+' '+b.toString().slice(0,1200));await fs.writeFile(file,b);
 }
 const tif=await fromFile(file),im=await tif.getImage(),r=await im.readRasters(),a=Float32Array.from(r[0]);
 if(im.getWidth()!==size||im.getHeight()!==size||im.getGeoKeys().ProjectedCSTypeGeoKey!==25832)throw Error('Unexpected raster geometry '+t.id);
 let min=Infinity,max=-Infinity,bad=0;for(const h of a){if(!Number.isFinite(h)||h<0||h>5000)bad++;else{min=Math.min(min,h);max=Math.max(max,h);}}
 const record={...t,coreBbox:[t.e,t.n,t.e+span,t.n+span],requestBbox:bbox,url,retrieved:new Date().toISOString(),source,sourceBytes:(await fs.stat(file)).size,sourceSHA256:sha(await fs.readFile(file)),origin:im.getOrigin(),resolution:im.getResolution(),geoKeys:im.getGeoKeys(),nativeWidth:size,nativeHeight:size,noData:im.getGDALNoData(),missing:bad,range:[min,max],levels:[]};
 if(bad)throw Error(t.id+' contains '+bad+' missing samples; inspect before using');
 for(const spacing of [2.5,5,10,20,40]){
  const width=span/spacing+1,grid=new Float32Array(width*width),factor=spacing/step;
  for(let z=0;z<width;z++)for(let x=0;x<width;x++)grid[z*width+x]=a[(z*factor+2)*size+x*factor+2];
  const data=Buffer.from(grid.buffer),name=`tiles/${t.id}-${spacing}m.f32`;await fs.writeFile(root+'/'+name,data);record.levels.push({spacing,width,height:width,file:name,bytes:data.length,sha256:sha(data)});
 }
 await tif.close();await fs.writeFile(root+'/source/'+t.id+'.json',JSON.stringify(record,null,2));console.log(t.id,record.range,record.sourceBytes);return record;
}
// Two independent requests in flight; all results are inspected and retained.
for(let i=0;i<tiles.length;i+=2){const batch=await Promise.allSettled(tiles.slice(i,i+2).map(acquire));for(const r of batch){if(r.status==='rejected')throw r.reason;manifest.tiles.push(r.value);}await fs.writeFile(root+'/manifest.partial.json',JSON.stringify(manifest,null,2));}
manifest.retrieved=new Date().toISOString();manifest.tiles.sort((a,b)=>a.n-b.n||a.e-b.e);await fs.writeFile(root+'/manifest.json',JSON.stringify(manifest,null,2));console.log('Complete',manifest.tiles.length,'native survey tiles');
