"""Channel packing of documented CC0 maps; no creative image changes."""
from PIL import Image
from pathlib import Path
import hashlib, json

root = Path(__file__).resolve().parents[1]
folder = root / 'assets/materials/v13'
n = Image.open(folder / 'grass005-NormalGL.jpg').convert('RGB')
ao = Image.open(folder / 'grass005-AmbientOcclusion.jpg').convert('L')
rough = Image.open(folder / 'grass005-Roughness.jpg').convert('L')
assert n.size == ao.size == rough.size
Image.merge('RGBA', (n.getchannel('R'), n.getchannel('G'), ao, rough)).save(folder / 'grass005-NA.png')
h = Image.open(root / 'assets/materials/gravelly_sand-height.jpg').convert('L')
r = Image.open(root / 'assets/materials/gravelly_sand-rough.jpg').convert('L')
r = r.resize(h.size, Image.Resampling.BILINEAR)
Image.merge('RGB', (h, r, Image.new('L', h.size, 0))).save(folder / 'gravelly_sand-HR.png')
report = {'operation': 'Lossless channel packing of decoded grass JPEGs. Gravel height unchanged; roughness bilinearly upsampled 1024 to 2048 to share its sampler.', 'maps': []}
for name, channels in [('grass005-NA.png', ['normal X', 'normal Y', 'ambient occlusion', 'roughness']), ('gravelly_sand-HR.png', ['height', 'roughness', 'unused'])]:
    path = folder / name
    report['maps'].append({'file': name, 'channels': channels, 'size': Image.open(path).size, 'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
(folder / 'packing.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
