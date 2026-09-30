import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

root=Path('assets/terrain-v14');meta=json.loads((root/'manifest.json').read_text())
height=np.zeros((2401,2801),np.float32)
for t in meta['tiles']:
    l=next(l for l in t['levels'] if l['spacing']==5)
    a=np.fromfile(root/l['file'],dtype='<f4').reshape(401,401)
    x=(t['e']-702000)//5;y=(5172000-t['n']-2000)//5;height[y:y+401,x:x+401]=a
dz,dx=np.gradient(height,5)
light=np.array([-.65,.50,.57]);light=light/np.linalg.norm(light)
shade=np.clip((-dx*light[0]+light[1]-dz*light[2])/np.sqrt(1+dx*dx+dz*dz),0,1)
cover=np.fromfile(root/'landuse.rgba',dtype=np.uint8).reshape(2400,2800,4)/255
rgb=np.broadcast_to(np.array([.51,.59,.38]),(2400,2800,3)).copy()
for k,color in [(0,[.23,.37,.27]),(1,[.73,.71,.66]),(2,[.66,.63,.56]),(3,[.40,.48,.31])]:
    weight=cover[:,:,k:k+1];rgb=rgb*(1-weight)+weight*np.array(color)
rgb*=.45+shade[:-1,:-1,None]*.55
poly=np.array([[-45,-130],[320,-130],[360,-70],[650,-50],[950,80],[980,520],[0,550],[-45,430]])
route=np.array([[15,165],[16,125],[30,88],[57,54],[74,15],[91,-25],[113,-61],[150,-120]])
canvas=Image.new('RGB',(1800,1060),'#101713');draw=ImageDraw.Draw(canvas)
font=lambda size,bold=False:ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf' if bold else 'C:/Windows/Fonts/segoeui.ttf',size)
def text(x,y,t,size=20,color='#d8e2d4',bold=False):draw.text((x,y),t,font=font(size,bold),fill=color)
image=Image.fromarray(np.rint(np.clip(rgb,0,1)*255).astype(np.uint8))
text(50,26,'Seceda V0.14 · terrain source and playable coverage',32,'white',True)
text(50,76,'Same scenic extent · native 2.5 m elevation source',22)
text(1060,160,'Preserved route and connected pasture',22)
for bounds,box in [([-6700,-7700,7300,4300],(50,125,940,806)),([-170,-240,1100,650],(1060,225,690,484))]:
    x0,z0,x1,z1=bounds;ox,oy,ww,hh=box
    crop=((x0+6700)/5,(z0+7700)/5,(x1+6700)/5,(z1+7700)/5)
    canvas.paste(image.crop(crop).resize((ww,hh),Image.Resampling.LANCZOS),(ox,oy))
    xy=lambda x,z:(ox+(x-x0)/(x1-x0)*ww,oy+(z-z0)/(z1-z0)*hh)
    draw.rectangle((ox,oy,ox+ww,oy+hh),outline='#667560',width=1)
    if ww==940:
        for x in range(-6700,7301,2000):draw.line([xy(x,z0),xy(x,z1)],fill='#778577',width=1)
        for z in range(-7700,4301,2000):draw.line([xy(x0,z),xy(x1,z)],fill='#778577',width=1)
    points=[xy(x,z) for x,z in poly];draw.line(points+[points[0]],fill='#ff98bd',width=3)
    draw.line([xy(x,z) for x,z in route],fill='white',width=3)
    for x,z in route[[0,-1]]:
        px,py=xy(x,z);draw.ellipse((px-4,py-4,px+4,py+4),fill='#ffde84')
    length=2000 if ww==940 else 250;px,py=xy(x1-length-70,z1-60);ex,_=xy(x1-70,z1-60)
    draw.line([(px,py),(ex,py)],fill='white',width=4);text(px,py-28,str(length)+' m',18,'white')
    text(ox+15,oy+12,'N ↑',20,'white',True)
text(1076,716,'White: original 328 m route',20,'white')
text(1076,750,'Pink: 0.602 km² walking envelope',20,'#ff98bd')
text(1076,784,'Local steep banks remain blocked. Cliff faces,',18)
text(1076,812,'the high massif and the outer region are scenic.',18)
text(1076,860,'42 survey cores · 2 × 2 km each',20)
text(1076,892,'No new walking area in this terrain pass.',18)
text(50,960,'EPSG:25832 · E708700 / N5164300 / altitude 2500 m · 1:1 metre scale',21)
text(50,1001,'Hillshade and historical land-cover interpretation from provincial CC0 data. The walking boundary is authored.',18)
canvas.save('artifacts/terrain-v014/survey-coverage.png')
