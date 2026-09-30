import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { zipSync, strToU8 } from 'fflate';
import { safeAssetPath, installBundle, sha256 } from '../scripts/runtime-assets-lib.mjs';
test('rejects traversal, absolute paths, alternate separators and repo control files', () => {
  for (const value of ['../assets/a', 'assets/../README.md', '/assets/a', 'assets\\a', 'C:/assets/a', '.git/config', 'assets//a']) assert.throws(() => safeAssetPath(value));
});
function fixture() { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seceda-assets-test-')); const data = strToU8('reviewed asset'), zip = zipSync({ 'assets/test.bin': data }), file = path.join(root, 'bundle.zip'); fs.writeFileSync(file, zip); return { root, file, pin: { version: 'test', url: 'fixture', archiveBytes: zip.length, archiveSha256: sha256(zip), files: [{ path: 'assets/test.bin', bytes: data.length, sha256: sha256(data) }] } }; }
test('rejects altered archive before installation', async () => { const f = fixture(); fs.appendFileSync(f.file, 'altered'); await assert.rejects(installBundle(f.file, f.root, f.pin)); assert.equal(fs.existsSync(path.join(f.root, 'assets')), false); });
test('preserves a different existing user asset without replacement', async () => { const f = fixture(); fs.mkdirSync(path.join(f.root, 'assets')); fs.writeFileSync(path.join(f.root, 'assets/test.bin'), 'user data'); await assert.rejects(installBundle(f.file, f.root, f.pin)); assert.equal(fs.readFileSync(path.join(f.root, 'assets/test.bin'), 'utf8'), 'user data'); });
test('installs reviewed bytes and is repeatable without replacing them', async () => { const f = fixture(); assert.equal((await installBundle(f.file, f.root, f.pin)).added, 1); assert.equal((await installBundle(f.file, f.root, f.pin)).added, 0); });
