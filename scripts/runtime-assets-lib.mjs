import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Unzip, UnzipInflate } from 'fflate';

export const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
export function safeAssetPath(name) {
  if (typeof name !== 'string' || name.includes('\\') || name.includes(':') || name.split('/').some(p => !p || p === '.' || p === '..') || !(name.startsWith('assets/') || name === 'docs/ASSETS.md' || name === 'ASSET-LICENSES.md')) throw new Error('Unsafe asset path');
  return name;
}
function safeTarget(root, name) {
  safeAssetPath(name);
  const target = path.resolve(root, name);
  if (!target.startsWith(root + path.sep)) throw new Error('Asset escaped checkout');
  let current = root;
  for (const part of name.split('/')) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error('Asset destination contains a link');
  }
  return target;
}
export async function installBundle(archive, checkout, pin) {
  const root = fs.realpathSync(checkout), wanted = new Map();
  for (const item of pin.files) {
    safeAssetPath(item.path);
    if (wanted.has(item.path) || !Number.isSafeInteger(item.bytes) || item.bytes < 0 || !/^[a-f0-9]{64}$/.test(item.sha256)) throw new Error('Invalid asset manifest');
    wanted.set(item.path, item);
  }
  const hash = crypto.createHash('sha256');
  for await (const data of fs.createReadStream(archive)) hash.update(data);
  if (hash.digest('hex') !== pin.archiveSha256 || fs.statSync(archive).size !== pin.archiveBytes) throw new Error('Bundle checksum/size mismatch');
  const stage = fs.mkdtempSync(path.join(root, '.runtime-stage-')), seen = new Set(), completed = new Set();
  const unzip = new Unzip(file => {
    const item = wanted.get(file.name);
    if (!item || seen.has(file.name)) throw new Error('Unexpected or duplicate archive entry');
    safeAssetPath(file.name); seen.add(file.name);
    const target = path.join(stage, file.name); fs.mkdirSync(path.dirname(target), { recursive: true });
    const fd = fs.openSync(target, 'wx'), digest = crypto.createHash('sha256'); let bytes = 0;
    file.ondata = (error, data, final) => {
      if (error) { fs.closeSync(fd); throw error; }
      bytes += data.length;
      if (bytes > item.bytes) { fs.closeSync(fd); throw new Error('Asset exceeds reviewed size'); }
      digest.update(data); fs.writeSync(fd, data);
      if (final) {
        fs.closeSync(fd);
        if (bytes !== item.bytes || digest.digest('hex') !== item.sha256) throw new Error('Asset checksum mismatch: ' + file.name);
        completed.add(file.name);
      }
    };
    file.start();
  });
  unzip.register(UnzipInflate);
  for await (const data of fs.createReadStream(archive, { highWaterMark: 512 * 1024 })) unzip.push(data, false);
  unzip.push(new Uint8Array(), true);
  if (completed.size !== wanted.size) throw new Error('Incomplete asset bundle');
  // Check every destination before installing anything. Existing different files stay intact.
  for (const item of pin.files) {
    const target = safeTarget(root, item.path);
    if (fs.existsSync(target) && (!fs.statSync(target).isFile() || sha256(fs.readFileSync(target)) !== item.sha256)) throw new Error('Existing file differs; preserved without replacement: ' + item.path);
  }
  let added = 0;
  for (const item of pin.files) {
    const target = safeTarget(root, item.path);
    if (!fs.existsSync(target)) { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.renameSync(path.join(stage, item.path), target); added++; }
  }
  fs.writeFileSync(path.join(root, 'assets/.runtime-origin.json'), JSON.stringify({ version: pin.version, sha256: pin.archiveSha256, source: pin.url }, null, 2));
  return { verified: completed.size, added, stagePreserved: stage };
}
