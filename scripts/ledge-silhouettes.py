from pathlib import Path
import json, sys
import numpy as np
from PIL import Image, ImageFilter

root = Path('artifacts/ledge-v011')
stage = sys.argv[1] if len(sys.argv) > 1 else 'v0.11'
out = root / stage
report = []
for name in ['01-start','02-midpoint','03-viewpoint','06-cliff-close','13-cliff-edge']:
    for kind in ['profile','cliff-mask']:
        masks = [np.asarray(Image.open(root/v/f'{name}-{kind}.png').convert('L'))>127 for v in ['v0.10',stage]]
        a, b = masks
        edges = []
        for mask in masks:
            im = Image.fromarray((mask*255).astype('uint8'))
            edges.append(np.asarray(im.filter(ImageFilter.MaxFilter(3))) != np.asarray(im.filter(ImageFilter.MinFilter(3))))
        canvas = np.full((*a.shape,3),21,dtype='uint8')
        canvas[a] = [58,66,66]
        canvas[edges[0]] = [33,210,234]
        canvas[edges[1]] = [255,202,69]
        Image.fromarray(canvas).save(out/f'{name}-{kind}-overlay.png')
        delta = a ^ b
        record = {'view':name,'kind':kind,'width':a.shape[1],'height':a.shape[0],'v010Pixels':int(a.sum()),'differentPixels':int(delta.sum()),'differencePercentOfV010Mask':float(delta.sum()/max(1,a.sum())*100)}
        if kind == 'profile':
            ha=np.where(a.any(axis=0),a.argmax(axis=0),a.shape[0]); hb=np.where(b.any(axis=0),b.argmax(axis=0),b.shape[0]); d=np.abs(ha-hb)
            record.update(skylineMaxPixelChange=int(d.max()),skylineMeanPixelChange=float(d.mean()),skylineUnchangedColumns=int((d==0).sum()))
        report.append(record)
(out/'silhouette-report.json').write_text(json.dumps({'method':'Identical 1600x1000 viewport cameras; masks use the native drawing buffer (dimensions recorded per view). Flat white terrain and major cliffs on black give the skyline profile; cliff-only mask uses terrain as a black depth occluder. Cyan = V0.10, gold = V0.11 drawn over cyan. Differences include local chips and internal occlusion boundaries. No vegetation, fog or textures. Not an image-quality score.','comparisons':report},indent=2))
print(json.dumps(report,indent=2))
