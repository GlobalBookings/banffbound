from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
assets = root / 'assets'
assets.mkdir(exist_ok=True)

def icon(size, transparent=False):
    im = Image.new('RGBA', (size, size), (0,0,0,0) if transparent else '#163b31')
    d = ImageDraw.Draw(im)
    def polygon(points, fill):
        d.polygon([(int(x*size), int(y*size)) for x,y in points], fill=fill)
    polygon([(0.18,.66),(.43,.28),(.60,.51),(.70,.38),(.86,.66)], '#c8a96e')
    polygon([(.35,.40),(.43,.28),(.53,.42),(.46,.39),(.43,.42),(.40,.38)], '#faf9f1')
    polygon([(.65,.45),(.70,.38),(.76,.46),(.71,.44),(.69,.46)], '#faf9f1')
    d.line([(size*.25,size*.74),(size*.76,size*.74)], fill='#c8a96e', width=max(1,int(size*.012)))
    return im

icon(1024).convert('RGB').save(assets/'icon.png')
icon(1024,True).save(assets/'adaptive-icon.png')
icon(256).save(assets/'favicon.png')
icon(512).save(assets/'splash.png')

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
    picture = Image.open(root.parent/'public/images/blog'/source).convert('RGB')
    picture.thumbnail((1200,900))
    picture.save(assets/target, quality=83, optimize=True)
print(f'Created icons and {len(sources)} bundled editorial images.')
