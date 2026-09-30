import fs from'node:fs/promises';import path from'node:path';
// A version/source mismatch must fail before copying over any preserved build.
const version=JSON.parse(await fs.readFile('package.json','utf8')).version;
if(version!=='0.15.0')throw new Error('Package target is V0.15; update both the project version and target together.');
const label=process.argv.find(x=>x.startsWith('--label='))?.slice(8)||'';
if(label&&!/^[a-z0-9-]+$/.test(label))throw Error('Invalid build label');
const out=path.resolve('release/Seceda-Windows-v0.15'+(label?'-'+label:''));
if(await fs.stat(out).catch(()=>null))throw Error('Build already exists; use a new label to preserve it.');
await fs.mkdir(out,{recursive:true});await fs.cp('node_modules/electron/dist',out,{recursive:true});await fs.rename(path.join(out,'electron.exe'),path.join(out,'Seceda.exe'));const app=path.join(out,'resources/app');await fs.mkdir(app,{recursive:true});for(const f of ['index.html','desktop.cjs','package.json','README.md'])await fs.copyFile(f,path.join(app,f));for(const dir of ['src','assets','docs'])await fs.cp(dir,path.join(app,dir),{recursive:true,filter:p=>!(/terrain-v14[\\/]source[\\/].*\.tif$/i.test(p))});await fs.mkdir(path.join(app,'node_modules'),{recursive:true});await fs.cp('node_modules/three',path.join(app,'node_modules/three'),{recursive:true,dereference:true});await fs.copyFile('README.md',path.join(out,'READ ME.txt'));console.log('Windows portable: '+out+'\\Seceda.exe');
