"""V15 natural-surface reflectance study, derived from the licensed 2023 ortho.

This is an authored interpretation, not measured albedo or a building inventory.
Keep all V14 originals. Work on their 48 m gutters so core boundaries agree.
"""
from pathlib import Path
import json, hashlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

source=Path('assets/terrain-v14/orthophoto')
out=Path('assets/terrain-v15');out.mkdir(exist_ok=True)
meta=json.loads((source/'license-and-manifest.json').read_text())
features=json.loads(Path('assets/terrain-v14/source/landuse.geojson').read_text())['features']
built_names=['Case singole, case sparse','Rete stradale e spazi associati','Tessuto extraurbano denso','Tessuto urbano rado','impianti a fune (edifici) e spazi associati','Superfici industriali e commerciali','Area a copertura artificiale non classificabile','Altre attrezzature di interesse pubblico','Attrezzature sportive e per il tempo libero']
cover=np.fromfile('assets/terrain-v14/landuse.rgba',np.uint8).reshape(2400,2800,4)

def blur(a,r):
    b=np.pad(a,((r,r),(r,r)),mode='edge')
    s=np.pad(b,((1,0),(1,0))).cumsum(0,dtype=np.float64).cumsum(1)
    k=r*2+1
    return ((s[k:,k:]-s[:-k,k:]-s[k:,:-k]+s[:-k,:-k])/(k*k)).astype(np.float32)
def smooth(a,low,high):
    t=np.clip((a-low)/(high-low),0,1);return t*t*(3-2*t)

records=[]
for tile in meta['tiles']:
    bbox=tile['bbox']; raw=Image.open(source/tile['file']).convert('RGB')
    xx=np.clip(((bbox[0]+np.arange(2048)*2+1-702000)/5).astype(int),0,2799)
    yy=np.clip(((5172000-bbox[3]+np.arange(2048)*2+1)/5).astype(int),0,2399)
    c=cover[yy[:,None],xx[None,:]].astype(np.float32)/255
    # A 6 m median and sub-14 m bright-line suppression removes isolated roof/track highlights before extracting
    # colour ratios. Photographic RGB itself is never the final surface colour.
    rgb=np.asarray(raw.filter(ImageFilter.MedianFilter(3)),dtype=np.float32)/255
    linear=np.where(rgb<=.04045,rgb/12.92,((rgb+.055)/1.055)**2.4)
    lum=linear@np.array([.299,.587,.114],np.float32)
    # Remove sub-14 m bright linear marks in open pasture. Modelled mineral
    # textures/stone supply grit; do not paint photographed roads onto grass.
    opened=np.asarray(Image.fromarray(np.uint8(np.clip(lum*255,0,255))).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(7)),np.float32)/255
    natural=smooth(c[:,:,0]+c[:,:,1]+c[:,:,2],.08,.60)
    linear_marks=smooth(lum-opened,.035,.095)*(1-natural)
    lum=lum*natural+np.minimum(lum,opened+.014)*(1-natural)
    local=blur(lum,19)
    detail=np.clip((lum+.025)/(local+.025),.55,1.60)
    medium=np.clip((blur(lum,3)+.025)/(local+.025),.65,1.4)
    # Chromatic variation survives broad photographic shade better than luma.
    # Deep blue shade is assigned a neutral pasture estimate, not dark paint.
    ratio=linear[:,:,0]/np.maximum(linear[:,:,1],.012)
    dryness=smooth(ratio,.64,1.22)
    shade=smooth(linear[:,:,2]/np.maximum(linear[:,:,1],.015),.72,1.20)
    dryness=dryness*(1-shade*.8)+.35*shade*.8
    dryness=blur(dryness,1)
    # Historical artificial footprints are naturalised; no false flat village.
    mask=Image.new('L',(2048,2048));draw=ImageDraw.Draw(mask)
    for f in features:
        if f['properties']['NAME_IT'] not in built_names:continue
        g=f['geometry'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
        for rings in polys:
            points=[((p[0]-bbox[0])/2,(bbox[3]-p[1])/2) for p in rings[0]]
            if max(p[0] for p in points)<0 or min(p[0] for p in points)>2048 or max(p[1] for p in points)<0 or min(p[1] for p in points)>2048:continue
            draw.polygon(points,fill=255)
    built=np.asarray(mask.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(3)),np.float32)/255
    built=np.maximum(built,linear_marks)
    valid=1-built
    filled=blur(dryness*valid,22)/np.maximum(blur(valid,22),.05)
    dryness=dryness*(1-built)+filled*built
    detail=detail*(1-built)+built
    # Shared summer reflectance palette, in linear space. Fine true grass and
    # mineral textures are applied in world metres in the game, not baked here.
    wet=np.array([.071,.131,.035],np.float32);dry=np.array([.160,.195,.079],np.float32)
    colour=wet+(dry-wet)*dryness[:,:,None]
    colour*= ((.18+detail*.82)*(.65+medium*.35))[:,:,None]
    # Georeferenced historic canopy provides substrate, not photographed shadows.
    forest=smooth(c[:,:,0],.12,.7)
    forest_colour=np.array([.070,.109,.044])+(np.array([.098,.142,.067])-np.array([.070,.109,.044]))*dryness[:,:,None]
    forest_colour*= (.35+detail*.65)[:,:,None]
    colour=colour*(1-forest[:,:,None]) + forest_colour*forest[:,:,None]
    # Retain the real broad soil/pasture colour structure as well as ratios.
    # A palette-only result proved too smooth in packaged walking views.
    # Compress illumination, suppress blue cast shade, then remove masked
    # structures from this contribution using neighbouring natural colour.
    illumination=np.clip((local+.025)/.21,.40,1.50)
    geographic=np.clip(linear/illumination[:,:,None]**.55*np.array([.58,.78,.51]),.012,.35)
    support=blur(valid,18)
    for channel in range(3):
        fill=blur(geographic[:,:,channel]*valid,18)/np.maximum(support,.025)
        fallback=colour[:,:,channel]
        fill=np.where(support>.15,fill,fallback)
        geographic[:,:,channel]=geographic[:,:,channel]*(1-built)+fill*built
    confidence=(1-shade*.88)*(1-forest*.72)*.66
    colour=colour*(1-confidence[:,:,None])+geographic*confidence[:,:,None]
    # Snow, roofs and pale roads cannot survive as raw white patches. Rock and
    # scree are explicitly rebuilt from the surveyed/mapped material fields.
    encoded=np.where(colour<=.0031308,colour*12.92,1.055*np.maximum(colour,0)**(1/2.4)-.055)
    dest=out/tile['file'];Image.fromarray(np.uint8(np.clip(encoded*255,0,255))).save(dest,quality=96,subsampling=0)
    records.append({'file':dest.name,'bbox':bbox,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'sourceSHA256':hashlib.sha256((source/tile['file']).read_bytes()).hexdigest(),'naturalisationFraction':float(built.mean())})
    print(dest,flush=True)
record={'title':'V15 authored natural-surface colour from Ortofoto 2023','license':'CC BY 4.0','attribution':'Ortofoto 2023 RGB, Provincia Autonoma di Bolzano / Alto Adige, with AgEA','source':meta['catalog'],'licenseURL':meta['licenseURL'],'sourceManifest':'../terrain-v14/orthophoto/license-and-manifest.json','crs':'EPSG:25832','metresPerPixel':2,'dimensions':[2048,2048],'modifications':'6 m median and sub-14 m bright-line suppression, local brightness normalisation, chromatic pasture variation, authored summer reflectance palette, naturalised historical artificial footprints; shader adds physical world-space materials. This suppresses photographic lighting rather than performing calibrated inverse rendering. Compressed-illumination natural RGB is retained, blue cast shade suppressed, and bright linear marks infilled from nearby natural colour. Some unclassified traces may remain.','tiles':records}
(out/'surface-albedo.json').write_text(json.dumps(record,indent=2))
