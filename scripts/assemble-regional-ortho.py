"""Assemble georeferenced WMS quadrants, with no photo retouching or reference images."""
from pathlib import Path
import json,hashlib
from PIL import Image
root=Path('assets/terrain-v14/orthophoto')
manifest=json.loads((root/'license-and-manifest.json').read_text())
for t in manifest['tiles']:
    out=Image.new('RGB',(2048,2048))
    for p in t['parts']:
        with Image.open(root/p['file']) as im:
            assert im.size==(1024,1024)
            out.paste(im,(p['x']*1024,p['y']*1024))
    out.save(root/t['file'],quality=96,subsampling=0)
    raw=(root/t['file']).read_bytes()
    t['bytes']=len(raw);t['sha256']=hashlib.sha256(raw).hexdigest()
manifest['modifications']='WMS resampling to 2 m/texel, four quadrants assembled per tile and JPEG re-encoded; runtime masked by slope, land cover and distance, with restrained colour/exposure adjustment. 48 m gutters. No private reference photo pixels.'
(root/'license-and-manifest.json').write_text(json.dumps(manifest,indent=2))
