import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const id='dandelion_01',dir=`assets/models/${id}`;
const source=await (await fetch(`https://api.polyhaven.com/files/${id}`)).json(),info=await (await fetch(`https://api.polyhaven.com/info/${id}`)).json();
await fs.mkdir(dir,{recursive:true});
await fs.writeFile(`${dir}/source.json`,JSON.stringify(source,null,2));await fs.writeFile(`${dir}/info.json`,JSON.stringify(info,null,2));
const spec=source.gltf['1k'].gltf,files=[];
for(const [name,data] of [['model.gltf',spec],...Object.entries(spec.include),[`textures/${id}_alpha_1k.jpg`,source.Alpha['1k'].jpg]]){
 const b=Buffer.from(await (await fetch(data.url)).arrayBuffer());
 const md5=crypto.createHash('md5').update(b).digest('hex');if(md5!==data.md5)throw Error(`MD5 mismatch ${name}`);
 await fs.mkdir(path.dirname(`${dir}/${name}`),{recursive:true});await fs.writeFile(`${dir}/${name}`,b);files.push({name,url:data.url,bytes:b.length,md5,sha256:crypto.createHash('sha256').update(b).digest('hex')});
}
await fs.writeFile(`${dir}/license.json`,JSON.stringify({asset:id,source:`https://polyhaven.com/a/${id}`,license:'CC0-1.0',licenseURL:'https://polyhaven.com/license',authors:info.authors,downloaded:'2026-09-28',files},null,2));
const gltf=JSON.parse(await fs.readFile(`${dir}/model.gltf`));console.log(JSON.stringify({nodes:gltf.nodes,materials:gltf.materials,files},null,2));
