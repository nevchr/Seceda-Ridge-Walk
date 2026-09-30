from pathlib import Path
import zipfile, hashlib, json

root = Path('release/Seceda-Windows-v0.9')
destination = Path('release/Seceda-Windows-v0.9.zip')
files = sorted(p for p in root.rglob('*') if p.is_file())
with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for file in files:
        archive.write(file, file.relative_to(root.parent))
with zipfile.ZipFile(destination) as archive:
    assert archive.testzip() is None
    assert len(archive.infolist()) == len(files)
    assert not any('/references/' in name for name in archive.namelist())
digest = hashlib.file_digest(destination.open('rb'), 'sha256').hexdigest()
report = {'archive': str(destination), 'bytes': destination.stat().st_size, 'sha256': digest,
          'files': len(files), 'crcIntegrityPassed': True,
          'note': 'The folder executable was play-tested; the archive has matching entries and passed ZIP CRC checks.'}
destination.with_suffix('.sha256').write_text(f'{digest}  {destination.name}\n')
Path('artifacts/stone-v09/archive.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
