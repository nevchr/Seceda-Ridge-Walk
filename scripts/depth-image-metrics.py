from pathlib import Path
from PIL import Image
import numpy as np
import json

root = Path('artifacts/depth-v06')
roi = (800, 300, 1210, 670)  # fixed distant ridge rectangle; excludes foreground wind
def pixels(path):
    return np.asarray(Image.open(path).convert('RGB').crop(roi), dtype=np.float32)
baseline = pixels(root/'diagnostics-before/03-viewpoint-baseline.png')
result = {}
for mode in ['live-shadow-off', 'dtm-shadow-off', 'authored-cast-on', 'bump-off']:
    delta = np.abs(pixels(root/f'diagnostics-before/03-viewpoint-{mode}.png') - baseline)
    result[mode] = {'meanAbsoluteChannelDifference255': float(delta.mean()),
                    'percentPixelsChangingMoreThan2Levels': float((delta.max(axis=2)>2).mean()*100)}
data = {'method': 'Pixel differences in one fixed distant-ridge rectangle, same camera, sky and materials except named toggle. No foreground foliage in the rectangle. These quantify a change, not visual quality.', 'rectangleXYXY': roi, 'v05IndividualToggles': result}
(root/'lighting-diagnosis.json').write_text(json.dumps(data,indent=2))
print(json.dumps(data,indent=2))
