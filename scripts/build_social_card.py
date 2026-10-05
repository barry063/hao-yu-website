"""Redraw only when displayed card fields differ from the frozen baseline."""
import argparse
import hashlib
import json
from pathlib import Path
import PIL
from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser()
parser.add_argument('--data', required=True)
parser.add_argument('--output', required=True)
args = parser.parse_args()
if PIL.__version__ != '12.3.0':
    raise ValueError('Pinned Pillow version required')
root = Path(__file__).resolve().parents[1]
fonts = root / 'build-resources/fonts'
for name, expected in json.loads((fonts / 'hashes.json').read_text()).items():
    if hashlib.sha256((fonts / name).read_bytes()).hexdigest() != expected:
        raise ValueError('Pinned font hash mismatch')
data = json.loads(Path(args.data).read_text(encoding='utf-8'))['social']
image = Image.new('RGB', (1200, 630), '#fafaf8')
draw = ImageDraw.Draw(image)
draw.rectangle((70, 80, 142, 85), fill='#1b514b')
for field, y, size, colour, bold in [('name',130,80,'#172322',True), ('role',280,32,'#172322',False),
    ('institution',330,32,'#526160',False), ('topic',445,23,'#1b514b',False), ('status',505,23,'#526160',False)]:
    font = ImageFont.truetype(str(fonts / ('VeraBd.ttf' if bold else 'Vera.ttf')), size)
    if draw.textbbox((70, y), data[field], font=font)[2] > 1130:
        raise ValueError('Social card wording exceeds layout; editorial review needed')
    draw.text((70, y), data[field], font=font, fill=colour)
image.save(args.output, format='PNG', optimize=False, compress_level=9)
