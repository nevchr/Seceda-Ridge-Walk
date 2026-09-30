"""Derived art masks from CC0 surveyed heights and 2001 provincial land use.
The classification is historical mapped land cover; fine erosion is authored.
No photograph pixels are used. Regenerate after adding native survey tiles.
"""
import json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

root=Path('assets/terrain-v14')
meta=json.loads((root/'manifest.json').read_text())
w,h=2800,2400
nodes=np.zeros((h+1,w+1),np.float32)
for tile in meta['tiles']:
    level=next(l for l in tile['levels'] if l['spacing']==5)
    data=np.fromfile(root/level['file'],dtype='<f4').reshape(level['width'],level['width'])
    x=(tile['e']-702000)//5; y=(5172000-tile['n']-2000)//5
    nodes[y:y+401,x:x+401]=data
height=(nodes[:-1,:-1]+nodes[1:,:-1]+nodes[:-1,1:]+nodes[1:,1:])*.25
dz,dx=np.gradient(height,5)
slope=np.hypot(dx,dz)
steep=1-1/np.sqrt(1+slope*slope)

def box(a,r):
    b=np.pad(a,((r,r),(r,r)),mode='edge')
    s=np.pad(b,((1,0),(1,0))).cumsum(0,dtype=np.float64).cumsum(1)
    k=r*2+1
    return ((s[k:,k:]-s[:-k,k:]-s[k:,:-k]+s[:-k,:-k])/(k*k)).astype(np.float32)

# Concavity at 25 and 75 m gives soil hollows and dry exposed ribs, with
# no dependence on a screenshot/camera or repeated world-height stripes.
curve=np.clip(.5+(box(height,5)-height)*.035+(box(height,15)-height)*.007,0,1)
yy,xx=np.indices((h,w)); ux=dx/np.maximum(slope,.001); uz=dz/np.maximum(slope,.001)
debris=np.zeros_like(height)
for distance in [20,45,80,125,185,265]:
    ix=np.clip(np.rint(xx+ux*distance/5).astype(int),0,w-1)
    iz=np.clip(np.rint(yy+uz*distance/5).astype(int),0,h-1)
    source=np.clip((steep[iz,ix]-.25)/.32,0,1)
    # Uphill steep source, increasingly diffuse lower down the fan.
    debris=np.maximum(debris,source*(1-distance/420))
debris=box(debris,1)
aspect=np.clip(.5+(dx*.65+dz*.57)*.25,0,1)
geology=np.stack([steep,curve,debris,aspect],axis=-1)
(root/'geology.rgba').write_bytes(np.rint(np.clip(geology,0,1)*255).astype(np.uint8).tobytes())

# Constant-sun horizon swept across the entire survey in sun order. Linear
# interpolation follows the oblique light ray between adjacent 5 m columns.
# This replaces the old sparse 27 m horizon samples; it is derived lighting,
# not a second set of measured heights. Runtime authored cliffs use their bake.
sun=np.array([-.65,.50,.57]); horizontal=np.hypot(sun[0],sun[2]); ux=sun[0]/horizontal; uz=sun[2]/horizontal
shift=uz/abs(ux); rise=sun[1]/horizontal*5/abs(ux)
horizon=height.copy(); row=np.arange(h); yy=np.clip(row+shift,0,h-1); i0=np.floor(yy).astype(int);i1=np.minimum(i0+1,h-1); mix=yy-i0
for col in range(1,w):
    previous=horizon[:,col-1]
    upstream=previous[i0]*(1-mix)+previous[i1]*mix-rise
    horizon[:,col]=np.maximum(height[:,col],upstream)
excess=horizon-height
factor=np.clip((excess-2.5)/8,0,1);factor=factor*factor*(3-2*factor)
light=np.rint((1-factor*.84)*255).astype(np.uint8)
rgba=np.stack([light,light,light,np.full_like(light,255)],axis=-1)
(root/'sun-horizon.rgba').write_bytes(rgba.tobytes())

features=json.loads((root/'source/landuse.geojson').read_text())
channels=[Image.new('L',(w,h),0) for _ in range(4)]
counts={}
for feature in features['features']:
    name=feature['properties']['NAME_IT']; counts[name]=counts.get(name,0)+1
    weights=([255,0,0,0] if name=='Bosco' else
             [80,0,0,140] if name=='Pascoli o arbusti nani alberati, prati alberati' else
             [0,0,0,255] if name=='Arbusti contorti e pino mugo' else
             [0,255,0,0] if name=='Roccia' else
             [0,0,255,0] if name=='Zone detritiche prive di vegetazione' else [0,0,0,0])
    if not any(weights): continue
    geom=feature['geometry']; polys=geom['coordinates'] if geom['type']=='MultiPolygon' else [geom['coordinates']]
    for rings in polys:
        mask=Image.new('L',(w,h),0);draw=ImageDraw.Draw(mask)
        for r,ring in enumerate(rings):
            points=[((p[0]-702000)/5-.5,(5172000-p[1])/5-.5) for p in ring]
            draw.polygon(points,fill=255 if r==0 else 0)
        for channel,value in zip(channels,weights):
            if value: channel.paste(value,(0,0),mask)
# Soften cartographic boundaries 7.5 m; finer breakup is slope-driven in shader.
cover=np.stack([np.asarray(c.filter(ImageFilter.GaussianBlur(1.5))) for c in channels],axis=-1)
(root/'landuse.rgba').write_bytes(cover.tobytes())
report={'size':[w,h],'metresPerPixel':5,'worldBounds':[-6700,-7700,14000,12000],
 'geologyChannels':['steepness 1-normal.y','multiscale concavity','upslope rock-source potential (authored)','solar aspect'],
 'landuseChannels':['woodland','bare rock','unvegetated debris','dwarf shrub / wooded pasture'],
 'landuseSource':'Province of Bolzano real land use map 1:10000, 2001 imagery, 2005 release; historical land cover, not current tree survey',
 'license':'CC0-1.0','featureCount':len(features['features']),'classes':counts,
 'derivedArt':'Slope/curvature/upslope masks guide authored materials; they are not geological or soil measurements.',
 'sha256':{f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in ['geology.rgba','landuse.rgba','sun-horizon.rgba','source/landuse.geojson']}}
(root/'fields.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'size':[w,h],'features':len(features['features']),'bytes':cover.nbytes*2}))
