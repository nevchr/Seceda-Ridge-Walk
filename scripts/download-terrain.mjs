import fs from 'node:fs/promises';
const base='https://geoservices9.civis.bz.it/geoserver/ows';
const layers=[
 {name:'near',bbox:[708000,5163700,709800,5165000],step:2.5},
 {name:'middle',bbox:[708000,5163000,714000,5168000],step:5},
 {name:'far',bbox:[702000,5160000,716000,5172000],step:40}
];
await fs.mkdir('assets/terrain',{recursive:true});
for(const l of layers){
 const q=new URLSearchParams({service:'WCS',version:'1.0.0',request:'GetCoverage',coverage:'p_bz-Elevation:DigitalTerrainModel-2.5m',crs:'EPSG:25832',response_crs:'EPSG:25832',bbox:l.bbox.join(','),width:String((l.bbox[2]-l.bbox[0])/l.step),height:String((l.bbox[3]-l.bbox[1])/l.step),format:'GeoTIFF',interpolation:'bilinear'});
 l.url=base+'?'+q;
 const r=await fetch(l.url); if(!r.ok)throw Error(r.status);const b=Buffer.from(await r.arrayBuffer());
 if(b[0]!==73&&b[0]!==77)throw Error(b.toString().slice(0,1200));
 await fs.writeFile(`assets/terrain/${l.name}.tif`,b);console.log(l.name,b.length);
}
await fs.writeFile('assets/terrain/downloads.json',JSON.stringify({retrieved:new Date().toISOString(),source:'Autonomous Province of Bolzano - South Tyrol, DTM 2.5m',license:'CC0',catalog:'https://data.civis.bz.it/it/dataset/modello-digitale-del-terreno-dtm-25m',layers},null,2));
