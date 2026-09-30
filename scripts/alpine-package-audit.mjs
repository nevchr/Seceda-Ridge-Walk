import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function walk(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
const root='release/Seceda-Windows-v0.7',app=root+'/resources/app',sourceFiles=['index.html','desktop.cjs','package.json','README.md',...await walk('src'),...await walk('assets'),...await walk('docs')],manifest=[];
for(const file of sourceFiles){const original=await fs.readFile(file),copy=await fs.readFile(path.join(app,file));assert.equal(sha(original),sha(copy),file);manifest.push({file,bytes:copy.length,sha256:sha(copy)});}
const references=await Promise.all((await walk('artifacts/references/user')).map(async p=>{const b=await fs.readFile(p);return {bytes:b.length,hash:sha(b)};}));
const packageFiles=await walk(root);let bytes=0;
for(const file of packageFiles){assert.ok(!/references|coastal_cliff|ridge-v05[\\/](before|after)/i.test(file),'Private or rejected asset in package');const stat=await fs.stat(file);bytes+=stat.size;const matches=references.filter(r=>r.bytes===stat.size);if(matches.length){const hash=sha(await fs.readFile(file));assert.ok(matches.every(r=>r.hash!==hash),'Reference pixels packaged');}}
assert.ok(packageFiles.some(f=>f.endsWith('LICENSES.chromium.html')));assert.ok(packageFiles.some(f=>f.endsWith(path.join('three','LICENSE'))));
const before=JSON.parse(await fs.readFile('artifacts/alpine-v07/before/report.json','utf8')),after=JSON.parse(await fs.readFile('artifacts/alpine-v07/after/report.json','utf8'));
assert.equal(before.packaged,true);assert.equal(after.packaged,true);assert.deepEqual(before.viewport,after.viewport);assert.equal(after.views.length,8);
const poses=r=>r.views.map(v=>({name:v.name,position:v.position,x:v.x,z:v.z,yaw:v.yaw,pitch:v.pitch,fov:v.fov||66}));assert.deepEqual(poses(before),poses(after));
const report={passed:true,package:root,totalBytes:bytes,files:packageFiles.length,sourceAssetDocFilesMatched:manifest.length,privateReferenceImagesChecked:references.length,matchedPortableCameraPairs:8,rejectedCoastalAssetExcluded:true,licensesPresent:true,manifest};
await fs.writeFile('artifacts/alpine-v07/package-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,manifest:undefined},null,2));

