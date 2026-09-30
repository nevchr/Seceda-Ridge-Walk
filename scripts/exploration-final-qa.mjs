import {spawnSync} from 'node:child_process';
const run=(file,args)=>{const r=spawnSync(file,args,{stdio:'inherit'});if(r.status!==0)throw Error(`${file} ${args.join(' ')} failed (${r.status})`);};
run(process.execPath,['scripts/package.mjs']);
for(const v of ['0.11','0.12'])run(process.execPath,['scripts/exploration-views.mjs',v,'--no-masks']);
run(process.execPath,['scripts/exploration-final-walking.mjs']);
run('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File','scripts/exploration-conditions.ps1','-Stage','performance-before']);
run(process.execPath,['scripts/exploration-performance.mjs']);
run('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File','scripts/exploration-conditions.ps1','-Stage','performance-after']);
