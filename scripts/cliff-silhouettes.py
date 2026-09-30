from pathlib import Path
import json, sys
import numpy as np
from PIL import Image, ImageFilter

root=Path('artifacts/cliff-v010')
stage=sys.argv[1] if len(sys.argv)>1 else 'v0.10'
out=root/stage
report=[]
for name in ['01-start','02-midpoint','03-viewpoint','06-cliff-close','13-cliff-edge']:
    for kind in ['profile','cliff-mask']:
        masks=[np.asarray(Image.open(root/v/f'{name}-{kind}.png').convert('L'))>127 for v in ['v0.8','v0.9',stage]]
        a,b,c=masks
        edges=[]
        for mask in masks:
            im=Image.fromarray((mask*255).astype('uint8'))
            edges.append(np.asarray(im.filter(ImageFilter.MaxFilter(3)))!=np.asarray(im.filter(ImageFilter.MinFilter(3))))
        canvas=np.full((*a.shape,3),21,dtype='uint8')
        canvas[a]=[58,66,66]
        canvas[edges[0]]=[33,210,234]
        canvas[edges[1]]=[238,107,205]
        canvas[edges[2]]=[255,202,69]
        Image.fromarray(canvas).save(out/f'{name}-{kind}-overlay.png')
        delta=a^c
        # Both sides of a moved contour count; this is mask disagreement, not
        # a count of newly added triangles or a photo-similarity score.
        record={'view':name,'kind':kind,'v08Pixels':int(a.sum()),'v09DifferentPixels':int((a^b).sum()),'correctedDifferentPixels':int(delta.sum()),'correctedDifferencePercentOfV08Mask':float(delta.sum()/max(1,a.sum())*100)}
        if kind=='profile':
            # Skyline height per image column, where terrain is visible.
            ha=np.where(a.any(axis=0),a.argmax(axis=0),a.shape[0]); hc=np.where(c.any(axis=0),c.argmax(axis=0),a.shape[0]);d=np.abs(ha-hc)
            record.update(skylineMaxPixelChange=int(d.max()),skylineMeanPixelChange=float(d.mean()),skylineUnchangedColumns=int((d==0).sum()))
        report.append(record)
(out/'silhouette-report.json').write_text(json.dumps({'method':'Identical 1600x1000 cameras. Flat white terrain plus all major cliffs on black gives the skyline profile; a second mask renders cliffs white with terrain black as a depth occluder. No vegetation, fog or textures. Cyan = V0.8, magenta = V0.9, gold = corrected, with later lines drawn over earlier ones. Difference counts include inward recesses as well as boundary changes. Raw masks are provided.','comparisons':report},indent=2))
print(json.dumps(report,indent=2))
