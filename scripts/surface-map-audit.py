"""Read-only derivative provenance and geographic overlap checks."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
root=Path('assets/terrain-v15')
meta=json.loads((root/'surface-albedo.json').read_text())
for t in meta['tiles']:
    assert hashlib.sha256((root/t['file']).read_bytes()).hexdigest()==t['sha256']
    assert hashlib.sha256((Path('assets/terrain-v14/orthophoto')/t['file']).read_bytes()).hexdigest()==t['sourceSHA256']
arrays={(r,c):np.asarray(Image.open(root/f'ortho-{r}-{c}.jpg')).astype(np.int16) for r in range(3) for c in range(4)}
checks=[]
for (r,c),a in arrays.items():
    for axis,key in [('east',(r,c+1)),('south',(r+1,c))]:
        if key not in arrays:continue
        b=arrays[key]
        x=a[:,2020:2028] if axis=='east' else a[2020:2028]
        y=b[:,20:28] if axis=='east' else b[20:28]
        d=np.abs(x-y)
        checks.append({'tile':[r,c],'neighbor':key,'axis':axis,'mean8bitDifference':float(d.mean()),'p99':float(np.percentile(d,99)),'max':int(d.max())})
report={'provenanceHashesPassed':True,'method':'Same geographic 16 m strip, aligned 2 m texels in adjacent 48 m gutters. JPEG and derivative differences, not elevation seams.','checks':checks}
Path('artifacts/surface-v015/albedo-seams.json').write_text(json.dumps(report,indent=2))
print('Maximum overlap mean',max(x['mean8bitDifference'] for x in checks),'worst p99',max(x['p99'] for x in checks))
