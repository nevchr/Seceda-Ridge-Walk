"""Archive the verified portable without overwriting earlier releases."""
import hashlib
import json
import zipfile
from pathlib import Path

root = Path('release/Seceda-Windows-v0.15')
output = Path(str(root) + '.zip')
if output.exists():
    raise RuntimeError('Release archive already exists; preserve it.')
files = sorted(p for p in root.rglob('*') if p.is_file())
with zipfile.ZipFile(output, 'x', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for file in files:
        archive.write(file, file.relative_to(root.parent).as_posix())
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None, 'ZIP CRC check failed'
    assert len(archive.infolist()) == len(files)
    for file in files:
        archived = archive.read(file.relative_to(root.parent).as_posix())
        assert hashlib.sha256(archived).digest() == hashlib.sha256(file.read_bytes()).digest(), file
report = {'file': output.as_posix(), 'bytes': output.stat().st_size,
          'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
          'files': len(files), 'allCRCsPassed': True, 'allFilesMatchPortable': True}
Path('artifacts/surface-v015/release.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
