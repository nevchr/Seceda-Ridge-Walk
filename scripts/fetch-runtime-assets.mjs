import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { installBundle } from './runtime-assets-lib.mjs';
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const pin = JSON.parse(fs.readFileSync(path.join(root, 'runtime-assets.json'), 'utf8'));
const local = process.argv.find(a => a.startsWith('--from-file='))?.slice(12);
let archive;
if (local) archive = path.resolve(local);
else {
  fs.mkdirSync(path.join(root, '.downloads'), { recursive: true });
  archive = path.join(root, '.downloads', pin.archive);
  if (!fs.existsSync(archive)) {
    const response = await fetch(pin.url);
    if (!response.ok) throw new Error('Asset download failed: HTTP ' + response.status);
    const partial = archive + '.part-' + Date.now();
    await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(partial, { flags: 'wx' }));
    if (fs.statSync(partial).size !== pin.archiveBytes) throw new Error('Unexpected download size; partial retained for inspection');
    fs.renameSync(partial, archive);
  }
}
console.log(JSON.stringify(await installBundle(archive, root, pin)));
