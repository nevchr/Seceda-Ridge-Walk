"""Pack unchanged CC0 channels into RGBA to fit WebGL fragment sampler slots.
R/G = OpenGL tangent normal X/Y, B = roughness, A = height. No resampling.
Original downloads and their source/license/checksum manifests remain alongside.
"""
from PIL import Image
from pathlib import Path
import hashlib,json
root=Path('assets/materials/v09');records=[]
for name in ['marble_cliff_04','marble_rock_01']:
 n=Image.open(root/(name+'-nor_gl.jpg')).convert('RGB')
 r=Image.open(root/(name+'-Rough.jpg')).convert('L')
 h=Image.open(root/(name+'-Displacement.jpg')).convert('L')
 assert n.size==r.size==h.size
 x,y,_=n.split();out=root/(name+'-NRH.png')
 Image.merge('RGBA',(x,y,r,h)).save(out,compress_level=6)
 records.append({'file':out.name,'size':n.size,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'source':name+'-source.json','license':'CC0-1.0','channels':'R normal X; G normal Y; B roughness; A height','processing':'Unchanged channel copy, same resolution; normal Z is unnecessary for surface gradients'})
(root/'packed-channels.json').write_text(json.dumps(records,indent=2))
