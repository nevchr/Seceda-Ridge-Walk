import {execFileSync} from 'node:child_process';
for(const args of [['ledge-views.mjs','0.10'],['ledge-views.mjs','0.11'],['ledge-preservation.mjs'],['ledge-walk.mjs']]){
 console.log('Starting '+args.join(' '));execFileSync(process.execPath,['scripts/'+args[0],...args.slice(1)],{stdio:'inherit'});
}
