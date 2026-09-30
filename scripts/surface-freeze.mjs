import fs from 'node:fs/promises';
import crypto from 'node:crypto';
async function walk(dir){let out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;out.push(...e.isDirectory()?await walk(p):[p]);}return out;}
const files=[];for(const file of ['index.html','desktop.cjs','package.json',...await walk('src'),...await walk('assets')]){const b=await fs.readFile(file);files.push({file,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});}
await fs.writeFile('artifacts/surface-v015/final-runtime.json',JSON.stringify({created:new Date().toISOString(),files},null,2));console.log('Frozen runtime files:',files.length);
