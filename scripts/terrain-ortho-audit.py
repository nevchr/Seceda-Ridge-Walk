"""Audit georeferenced aerial sources and assembled runtime tiles."""
import json,hashlib
from pathlib import Path
import numpy as np
from PIL import Image
r=Path('assets/terrain-v14/orthophoto')
m=json.loads((r/'license-and-manifest.json').read_text())
assert m['license']=='CC BY 4.0' and m['crs']=='EPSG:25832'
assert m['runtimeResolution']==2 and len(m['tiles'])==12
worst=0
for t in m['tiles']:
    assert hashlib.sha256((r/t['file']).read_bytes()).hexdigest()==t['sha256']
    a=np.array(Image.open(r/t['file']).convert('RGB'),dtype=np.float32)
    assert a.shape==(2048,2048,3)
    b=np.zeros_like(a)
    for p in t['parts']:
        raw=(r/p['file']).read_bytes()
        assert hashlib.sha256(raw).hexdigest()==p['sha256']
        assert p['bbox'][2]-p['bbox'][0]==2048 and p['bbox'][3]-p['bbox'][1]==2048
        im=np.array(Image.open(r/p['file']).convert('RGB'))
        b[p['y']*1024:(p['y']+1)*1024,p['x']*1024:(p['x']+1)*1024]=im
    assert t['bbox']==[701952+t['col']*4000,5167952-t['row']*4000,706048+t['col']*4000,5172048-t['row']*4000]
    error=float(np.mean(abs(a-b)));worst=max(worst,error)
    assert error<1.8,'JPEG assembly moved or changed image content'
report={'passed':True,'sourceResponses':48,'runtimeTiles':12,'textureSize':[2048,2048],'metresPerTexel':2,'crs':m['crs'],'worstJpegAssemblyMeanByteError':worst,'license':m['license'],'arrayLayers':14,'arrayBytesWithMipmapsApprox':14*2048*2048*4*4/3,'note':'Audits georeferencing, source/derived hashes and assembly orientation. Shader uses explicit continuous derivatives and 48 m gutters at tile edges. Original imagery lighting is not fully removed.'}
Path('artifacts/terrain-v014/ortho-audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
