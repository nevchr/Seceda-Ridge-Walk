import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const selections=[
 ['marble_cliff_04','4k',['Diffuse','nor_gl','Displacement','Rough']],
 ['marble_rock_01','2k',['Diffuse','nor_gl','Displacement','Rough']],
 ['weathered_planks','4k',['Diffuse','nor_gl','Rough']]
];
await fs.mkdir('assets/materials/v09',{recursive:true});
for(const [id,res,channels] of selections){
 const info=await(await fetch(`https://api.polyhaven.com/info/${id}`)).json();
 const files=await(await fetch(`https://api.polyhaven.com/files/${id}`)).json();
 const records=[];
 for(const channel of channels){
  const entry=files[channel][res].jpg??files[channel][res].png;
  const ext=new URL(entry.url).pathname.split('.').at(-1),file=`${id}-${channel}.${ext}`;
  const bytes=Buffer.from(await(await fetch(entry.url)).arrayBuffer());
  const md5=crypto.createHash('md5').update(bytes).digest('hex');if(md5!==entry.md5)throw Error(`Checksum ${id}/${channel}`);
  await fs.writeFile(`assets/materials/v09/${file}`,bytes);
  records.push({channel,resolution:res,file,url:entry.url,bytes:bytes.length,md5,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 }
 await fs.writeFile(`assets/materials/v09/${id}-source.json`,JSON.stringify({name:info.name,id,authors:info.authors,source:`https://polyhaven.com/a/${id}`,license:'CC0-1.0',licenseUrl:'https://polyhaven.com/license',dimensionsMillimetres:info.dimensions,downloadedAt:new Date().toISOString(),files:records},null,2));
 console.log(id,records.map(f=>({channel:f.channel,bytes:f.bytes})));
}
