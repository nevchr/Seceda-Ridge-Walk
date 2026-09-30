import fs from 'node:fs/promises';
import {fromFile} from 'geotiff';
const root='artifacts/terrain-v014/source-research';
await fs.mkdir(root,{recursive:true});
const probes=[{name:'native-2_5m',coverage:'p_bz-Elevation:DigitalTerrainModel-2.5m',bbox:[709993.75,5163993.75,712006.25,5166006.25],size:805},{name:'seceda-0_5m',coverage:'p_bz-Elevation:DigitalTerrainModel-0.5m',bbox:[708650,5164250,708750,5164350],size:200}];
const result=[];
for(const p of probes){
 const url='https://geoservices9.civis.bz.it/geoserver/ows?'+new URLSearchParams({service:'WCS',version:'1.0.0',request:'GetCoverage',coverage:p.coverage,crs:'EPSG:25832',response_crs:'EPSG:25832',bbox:p.bbox.join(','),width:String(p.size),height:String(p.size),format:'GeoTIFF',interpolation:'nearest neighbor'});
 const r=await fetch(url),b=Buffer.from(await r.arrayBuffer());if(!r.ok)throw Error(r.status);const file=root+'/'+p.name+'.tif';await fs.writeFile(file,b);
 if(![73,77].includes(b[0])){result.push({...p,url,response:b.toString().slice(0,2000)});continue;}
 const t=await fromFile(file),im=await t.getImage(),a=(await im.readRasters())[0];let min=Infinity,max=-Infinity,bad=0;for(const h of a){if(!Number.isFinite(h)||h<0||h>5000)bad++;else{min=Math.min(min,h);max=Math.max(max,h);}}
 result.push({...p,url,bytes:b.length,width:im.getWidth(),height:im.getHeight(),origin:im.getOrigin(),resolution:im.getResolution(),geoKeys:im.getGeoKeys(),noData:im.getGDALNoData(),valid:a.length-bad,missing:bad,range:[min,max]});await t.close();
}
await fs.writeFile(root+'/probes.json',JSON.stringify({retrieved:new Date().toISOString(),results:result},null,2));console.log(JSON.stringify(result,null,2));
