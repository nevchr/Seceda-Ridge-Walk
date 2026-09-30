import json,math
from PIL import Image,ImageDraw
s=json.load(open('artifacts/exploration-v012/survey.json')); out=Image.new('RGB',(1450,650),'#10191c');d=ImageDraw.Draw(out)
for panel in range(2):
 ox=20+panel*720
 for x,z,h,slope in s['points']:
  xx=ox+(x+700)*.38; yy=70+(z+700)*.4
  if panel==0:
   t=max(0,min(1,(h+580)/650));color=(int(55+120*t),int(80+100*t),int(65+95*t))
  else:
   t=max(0,min(1,slope/1.05));color=(int(48+200*t),int(160-110*t),int(64-15*t))
  d.rectangle((xx,yy,xx+4,yy+4),fill=color)
 def line(pts,color):d.line([(ox+(x+700)*.38,70+(z+700)*.4)for x,z in pts],fill=color,width=2)
 line([(p['x'],p['z'])for p in s['route']],'white')
 line([(-45,-130),(320,-130),(320,245),(-45,245),(-45,-130)],'cyan')
 line([(-45,-130),(320,-130),(360,-70),(650,-50),(950,80),(980,520),(0,550),(-45,430),(-45,-130)],'#f39bdc')
 d.text((ox,22),'SURVEY ELEVATION: 1,912 - 2,565 m' if panel==0 else 'SLOPE: GREEN = GENTLE / RED = STEEP',fill='white')
 d.text((ox,610),'White: route | Cyan: V0.11 rectangle | Pink: V0.12 pasture envelope',fill='white')
out.save('artifacts/exploration-v012/survey-coverage.png')
