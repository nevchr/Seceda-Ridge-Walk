"""Read-only asset inventory; no image pixels are altered."""
import json
from pathlib import Path
from PIL import Image

root = Path('assets')
files = [p for p in root.rglob('*') if p.is_file()]
textures = []
for p in files:
    if p.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp'):
        continue
    with Image.open(p) as im:
        textures.append({'file': p.as_posix(), 'width': im.width,
                         'height': im.height, 'mode': im.mode,
                         'bytes': p.stat().st_size})
report = {'totalAssetBytes': sum(p.stat().st_size for p in files),
          'v15DerivativeBytes': sum(p.stat().st_size for p in files if 'terrain-v15' in p.parts),
          'v14AssetBytes': sum(p.stat().st_size for p in files if 'terrain-v14' in p.parts),
          'files': len(files), 'textures': textures,
          'note': 'On-disk inventory includes preserved source maps and legacy assets that are not all resident or sampled at runtime. Texture dimensions do not imply total GPU allocation. Authored meshes are generated at startup; final/report.json records their geometry.'}
Path('artifacts/surface-v015/assets.json').write_text(json.dumps(report, indent=2))
print(json.dumps({k: v for k, v in report.items() if k != 'textures'}, indent=2))
