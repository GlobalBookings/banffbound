"""Export approved BanffBound artwork; never redraw or regenerate the brand.

Run without flags for icon exports only. Editorial photo regeneration is an
explicit operation: python3 scripts/create-assets.py --refresh-editorial
The artwork masters and design provenance are committed alongside this script.
"""

import argparse
from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
BRAND = ASSETS / 'brand'
ADAPTIVE_SCALE = 0.64


def read_master(name, expected_mode):
    path = BRAND / name
    if not path.is_file():
        raise SystemExit(f'Missing approved artwork: {path}. Restore it from Git; do not redraw the icon.')
    with Image.open(path) as image:
        if image.width != image.height or image.mode != expected_mode:
            raise SystemExit(f'{path} must be square {expected_mode} artwork.')
        return image.copy()


def export_icons():
    master = read_master('icon-master.png', 'RGB')
    foreground = read_master('icon-foreground.png', 'RGBA')
    if foreground.getchannel('A').getextrema() != (0, 255):
        raise SystemExit('Approved foreground must contain both transparent and opaque pixels.')

    master.resize((1024, 1024), Image.Resampling.LANCZOS).save(ASSETS / 'icon.png', optimize=True)
    master.resize((256, 256), Image.Resampling.LANCZOS).save(ASSETS / 'favicon.png', optimize=True)

    # Android supplies the forest-green background from app.config.ts. Keep the
    # visible foreground within the adaptive-icon safe circle for system masks.
    adaptive = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    size = round(1024 * ADAPTIVE_SCALE)
    resized = foreground.resize((size, size), Image.Resampling.LANCZOS)
    offset = (1024 - size) // 2
    adaptive.alpha_composite(resized, (offset, offset))
    adaptive.save(ASSETS / 'adaptive-icon.png', optimize=True)

    # A transparent splash foreground avoids a rectangular backdrop against the
    # native splash screen's existing solid forest-green background.
    foreground.resize((512, 512), Image.Resampling.LANCZOS).save(ASSETS / 'splash.png', optimize=True)
    print('Exported icon, adaptive foreground, favicon and splash from approved artwork.')


def refresh_editorial():
    sources = {
        'lake.jpg': 'lake-louise-complete-guide.webp',
        'moraine.jpg': 'moraine-lake-guide.webp',
        'town.jpg': 'banff-town-guide.webp',
        'winter.jpg': 'banff-in-winter.webp',
        'canmore.jpg': 'canmore-day-trip.webp',
        'gondola.jpg': 'banff-gondola-guide.webp',
        'food.jpg': 'best-banff-restaurants-where-to-eat.webp',
    }
    for target, source in sources.items():
        with Image.open(ROOT.parent / 'public/images/blog' / source) as original:
            picture = original.convert('RGB')
            picture.thumbnail((1200, 900))
            picture.save(ASSETS / target, quality=83, optimize=True)
    print(f'Refreshed {len(sources)} bundled editorial images.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh-editorial', action='store_true')
    args = parser.parse_args()
    export_icons()
    if args.refresh_editorial:
        refresh_editorial()
