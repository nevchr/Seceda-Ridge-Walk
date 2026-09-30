import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const pin = JSON.parse(fs.readFileSync(path.join(root, 'runtime-assets.json'), 'utf8'));
const full = process.argv.includes('--hash');
for (const item of pin.files) {
  const file = path.join(root, item.path);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile() || fs.statSync(file).size !== item.bytes) throw new Error('Runtime assets missing or incomplete. Run pnpm assets:fetch before starting. Missing: ' + item.path);
  if (full && crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') !== item.sha256) throw new Error('Runtime asset changed: ' + item.path);
}
console.log('Runtime assets verified: ' + pin.files.length + ' files, version ' + pin.version);
