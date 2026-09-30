from pathlib import Path
import zipfile,hashlib,json
root=Path('release/Seceda-Windows-v0.11')
archive=Path('release/Seceda-Windows-v0.11.zip')
digest=hashlib.file_digest(archive.open('rb'),'sha256').hexdigest()
assert digest=='ac4b56f072a96cda2f96039b0811c0ce760beb17f7cc7b65cd73a63c6293ca1b'
with zipfile.ZipFile(archive) as z:
 entries=[i for i in z.infolist() if not i.is_dir()]
 for i in entries:
  assert hashlib.sha256(z.read(i)).digest()==hashlib.sha256((Path('release')/i.filename).read_bytes()).digest(),i.filename
 assert len(entries)==len([p for p in root.rglob('*')if p.is_file()])
Path('artifacts/exploration-v012/baseline-integrity.json').write_text(json.dumps({'passed':True,'sha256':digest,'matchedFiles':len(entries),'note':'The V0.11 folder matches every file in the retained original archive, with no extra files.'},indent=2))
print('V0.11 folder and retained archive match:',len(entries),'files')
