import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root='assets/terrain-v14/orthophoto';await fs.mkdir(root,{recursive:true});
const metadata={title:'South Tyrol Ortofoto 2023 RGB',provider:'Autonomous Province of Bolzano / South Tyrol',catalog:'https://data.civis.bz.it/it/dataset/ortofoto-2023',license:'CC BY 4.0',licenseURL:'https://creativecommons.org/licenses/by/4.0/',licenseNote:'Catalog metadata says CC0, but the explicit data-use condition in notes requires CC BY 4.0; this project applies that attribution license to imagery.',originalResolution:.2,runtimeResolution:2,crs:'EPSG:25832',coreMetres:4000,gutterMetres:48,size:2048,grid:[4,3],northWest:[702000,5172000],retrieved:new Date().toISOString(),tiles:[]};
for(let row=0;row<3;row++)for(let col=0;col<4;col++){
 const e=702000+col*4000,n=5172000-row*4000,bbox=[e-48,n-4048,e+4048,n+48];
 const url='https://geoservices.buergernetz.bz.it/mapproxy/ows?'+new URLSearchParams({service:'WMS',version:'1.1.1',request:'GetMap',layers:'p_bz-Orthoimagery:Aerial-2023-RGB',styles:'',srs:'EPSG:25832',bbox:bbox.join(','),width:'2048',height:'2048',format:'image/jpeg'});
 const file=`ortho-${row}-${col}.jpg`,parts=[];await fs.mkdir(root+'/source',{recursive:true});
 for(let y=0;y<2;y++)for(let x=0;x<2;x++){
  const partBBox=[bbox[0]+x*2048,bbox[3]-(y+1)*2048,bbox[0]+(x+1)*2048,bbox[3]-y*2048];
  const partURL=new URL(url);partURL.searchParams.set('bbox',partBBox.join(','));partURL.searchParams.set('width','1024');partURL.searchParams.set('height','1024');
  const partFile=`source/ortho-${row}-${col}-${y}-${x}.jpg`;let bytes=await fs.readFile(root+'/'+partFile).catch(()=>null);
  if(!bytes){const response=await fetch(partURL);if(!response.ok)throw Error(response.status);bytes=Buffer.from(await response.arrayBuffer());if(bytes[0]!==255||bytes[1]!==216)throw Error(bytes.toString().slice(0,1000));await fs.writeFile(root+'/'+partFile,bytes);}
  parts.push({x,y,bbox:partBBox,file:partFile,url:partURL.href,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 }
 metadata.tiles.push({row,col,bbox,file,parts});console.log(file);
}
await fs.writeFile(root+'/license-and-manifest.json',JSON.stringify(metadata,null,2));
