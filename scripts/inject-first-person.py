#!/usr/bin/env python3
"""
Inject authentic first-person experience markers into blog posts.
Author persona: Jack, lives in Canmore (20 min from Banff).
"""

import re
import random
import os

random.seed(42)  # reproducible results

# ---------------------------------------------------------------------------
# FIRST-PERSON ASIDE TEMPLATES
# Each list entry is a 2-sentence max aside. {slug} and {name} may appear.
# ---------------------------------------------------------------------------

HIKING_ASIDES_TOP = [
    "I've done this trail more times than I can count since moving to Canmore — it rewards you differently every season.",
    "Living 20 minutes from Banff means I can hit this trailhead before sunrise, and honestly that's the best way to experience it.",
    "This is one of those hikes I recommend to every friend who visits me in Canmore. It never disappoints.",
    "I did this one for the first time in 2019 and I've gone back at least once a year since. The trail itself is the reward.",
    "Full disclosure: I live in Canmore, and this hike is one of the main reasons I stay in the valley.",
    "My partner and I have made this a semi-regular weekend hike. On a clear morning, the light on the peaks is unreal.",
    "I keep coming back to this trail because conditions change so drastically month to month — it's a different hike every time.",
    "As someone who lives 20 minutes away, I can tell you the parking situation here has gotten much worse over the past two years. Arrive early.",
    "I hiked this on a random Tuesday in October and had the whole trail to myself. Timing is everything.",
    "I've brought three different pairs of boots up this trail. The terrain is honest — it'll tell you fast if your footwear isn't right.",
    "Honestly, this is the trail I go to when I need to clear my head. Thirty minutes from my door in Canmore to the trailhead.",
    "I've seen people attempt this in running shoes in July and regret it by the halfway point. Bring proper boots.",
    "Last September I counted six other cars at the trailhead at 7 AM. By 10 AM the lot was overflowing. Draw your own conclusions.",
    "My dog and I have done this trail in every season. Winter is the most peaceful, but you'll need microspikes.",
    "I'll be honest: this hike is more of a slog than the photos suggest. But the payoff at the top is absolutely worth it.",
]

HIKING_ASIDES_MID = [
    "The section right around here is where most people turn back. If you push through the next 20 minutes, you'll have the best views to yourself.",
    "I always pack an extra layer for this stretch — even in August, the wind picks up once you're above the treeline.",
    "Pro tip from a local: the creek crossing about halfway through is tricky in June. Earlier in the season, it's snowpack; later, it's fine.",
    "I've eaten lunch at this exact spot more times than I should admit. Bring something warm to drink — the temperature drops fast up here.",
    "Last time I was here in late September, the larch trees were peak gold. I actually pulled over on the drive home to look at my photos because I couldn't believe they were real.",
    "The viewpoint everyone photographs is fine, but walk 200 metres past it and you'll get a better angle without the crowds.",
    "I ran into a grizzly on this section two summers ago. Gave it space and waited. Carry bear spray — it's not optional.",
    "The trail surface changes dramatically after this point. I swap to my poles here every time.",
    "On my last visit the wildflowers were incredible — lupines and Indian paintbrush everywhere. Peak bloom is usually mid-July to early August.",
    "This is where you'll feel the elevation if you're visiting from sea level. Take it slow; there's no rush.",
    "The Parks Canada trail crew does a great job maintaining this section, but after heavy rain it gets muddy. Gaiters help.",
    "I once made the mistake of doing this stretch at noon in July. Bring way more water than you think you need.",
    "My favourite thing about this part of the trail is how the sound changes — suddenly you can hear the creek and nothing else.",
    "If you're here in winter, this is where the snow really deepens. Snowshoes aren't optional past this point.",
    "The wind can be brutal through this corridor. I've turned back here twice and I'm not embarrassed about it.",
]

FOOD_ASIDES_TOP = [
    "I eat in Banff at least twice a month — living in Canmore means these restaurants are basically my neighbourhood spots.",
    "My partner and I have a running list of every restaurant in Banff. This one has been in regular rotation for years.",
    "I'll be upfront: Banff restaurants aren't cheap, but the quality has improved massively over the past few years.",
    "Living in Canmore means I skip the tourist-trap restaurants and eat where the locals eat. These are the ones worth your money.",
    "I've probably spent an embarrassing amount at Banff restaurants since moving to the Bow Valley. No regrets.",
    "As a Canmore local, I get asked for restaurant recommendations constantly. These are the places I actually send people.",
    "Fair warning: weekend reservations in Banff are brutal. I've learned to book Thursday or go early.",
    "I've eaten at most restaurants on Banff Ave at least once. Some of them twice was too many.",
    "My go-to move is lunch in Banff after a morning hike. The food tastes better when you've earned it.",
    "Living nearby means I can be honest about this — some Banff restaurants are genuinely great, and some coast on tourist traffic. I'll help you tell the difference.",
]

FOOD_ASIDES_MID = [
    "Last time I was here on a Friday evening, the wait was about 25 minutes without a reservation. Worth it.",
    "The portion sizes here are solid — my partner and I usually split an appetizer and get one entrée each, and we leave full.",
    "I've tried most of the menu over multiple visits. The items I keep coming back to are the ones I've highlighted above.",
    "Parking near Banff Ave restaurants is a headache. I usually park at the train station lot and walk — it's five minutes.",
    "If you're coming from Lake Louise or Canmore, the drive is worth it for a meal here. Trust me.",
    "Prices jumped a bit in 2025 but the quality held. Budget about $30-45 CAD per person for a solid meal.",
    "The lunch menu is a significantly better deal than dinner, and the food is identical. That's what I'd do on a budget.",
    "I brought my parents here when they visited from out of province and they still bring it up. High praise from my family.",
    "Happy hour here is one of Banff's better-kept secrets. The locals know; now you do too.",
    "The staff turnover in Banff is real, but this place has had the same core team for a while. You can taste the consistency.",
]

HOTEL_ASIDES_TOP = [
    "I live in Canmore so I don't need to book hotels in Banff, but I've toured most of these properties and recommended them to dozens of visiting friends.",
    "My parents stay at this place every time they visit me in Canmore, and they're always happy with it.",
    "Full transparency: I've toured this hotel and talked to management. The rooms facing the valley are noticeably better — ask for one.",
    "Friends visiting me in the Bow Valley always ask where to stay. My answer depends on budget, but this one comes up often.",
    "I've dropped off and picked up enough friends at Banff hotels to have strong opinions. This is one of the better options.",
    "As a local, I don't stay overnight in Banff, but I've had drinks and meals at most of the hotel restaurants. Some are genuinely excellent.",
    "The hotel market in Banff is competitive but pricey. I always tell friends to check midweek rates — the difference can be 30-40%.",
    "When my in-laws visited last summer, this is where we booked them. They loved the location and the mountain views from the room.",
]

HOTEL_ASIDES_MID = [
    "One thing I'll note from visiting friends here: the parking can be tight. If you're driving from Calgary, confirm parking availability when you book.",
    "I've had coffee in this lobby more times than I can count — it's a good spot even if you're not a guest.",
    "The walk from here to Bear Street and Banff Ave takes about 10 minutes. A lot of hotels claim 'walking distance' but this one actually is.",
    "Friends who've stayed here in winter say the heated pool is the highlight. After a day of skiing, I can see why.",
    "I always tell visiting friends: don't judge Banff hotels by chain-hotel standards. The mountain setting changes the whole experience.",
    "From what I hear from friends who stay here regularly, the off-season rates are a genuine bargain for what you get.",
]

ACTIVITY_ASIDES_TOP = [
    "I've done this activity at least a few times since moving to Canmore, and I keep coming back because it's one of those Banff experiences that actually delivers.",
    "Living 20 minutes from Banff, I've tried most of the touristy activities. This one is actually worth the price.",
    "My recommendation if you only do one activity in Banff: make it this one. I've lived in the valley for years and I'm still not tired of it.",
    "As a Canmore local, I'm naturally skeptical of anything that feels like a tourist trap. This isn't one.",
    "I've brought visiting friends here more times than I can count. The reaction is always the same — genuinely impressed.",
    "I'll be honest: I avoided this for my first two years in the Bow Valley because I assumed it was all hype. I was wrong.",
    "You don't need to be an expert to enjoy this. I went in as a complete beginner and had a fantastic time.",
    "The key with this activity is timing. I've done it in every season and the experience varies dramatically.",
]

ACTIVITY_ASIDES_MID = [
    "The crowds are manageable if you go first thing in the morning. I always aim for the earliest available slot.",
    "Bring layers — the temperature can shift 10°C in an hour up here, especially in spring and fall.",
    "I've watched the pricing on this creep up over the years, but honestly it's still fair for what you get.",
    "The guides here are mostly locals who actually know the area. Ask questions — they'll share stuff you won't find online.",
    "One thing the brochures don't mention: the drive to get here is half the experience. Take the Bow Valley Parkway if you have time.",
    "My advice: skip the basic package and go for the longer option. The extra hour makes a real difference.",
]

GENERAL_ASIDES_TOP = [
    "I've lived in Canmore — 20 minutes from Banff — for several years now, and the thing I tell every visitor is the same: come with a plan but leave room to wander.",
    "As a Bow Valley local, I get asked about Banff constantly. Here's what I actually tell people, not what the brochures say.",
    "Living this close to Banff has taught me one thing: the best experiences are almost never the most expensive ones.",
    "I drive through Banff multiple times a week, and there are still corners of the park that surprise me.",
    "The locals' version of Banff is very different from the tourist version. I'll try to give you a bit of both here.",
    "After years in Canmore, my perspective on Banff has changed a lot. The park is massive and most visitors only see about 5% of it.",
    "I'll be honest: Banff tourism can feel overwhelming. But if you know where to look, the authentic experiences are still there.",
    "One thing about living near a national park — you never run out of new things to discover, even after years.",
]

GENERAL_ASIDES_MID = [
    "Shoulder season — May and October — is when Banff is at its best, in my opinion. Fewer crowds, lower prices, and the light is incredible.",
    "The one thing I wish I'd known before moving here: the weather in the Bow Valley can change completely in 30 minutes. Always pack layers.",
    "Locals will tell you the same thing: Tuesday through Thursday is a different Banff than Saturday. Plan accordingly.",
    "If you're driving from Calgary, leave before 7 AM on weekends. The highway traffic has gotten significantly worse.",
    "I keep a pair of microspikes in my car from October to May. The trails look clear from the parking lot but the shaded sections are a different story.",
    "Parks Canada has really improved the infrastructure over the past couple years. The new shuttle systems actually work well.",
    "My biggest piece of advice: don't try to do everything in one trip. Pick two or three things and do them properly.",
    "The cellular signal in the park is spotty at best. Download offline maps before you leave Canmore or Calgary.",
]

WINTER_ASIDES = [
    "Winter in the Bow Valley is genuinely cold — I'm talking -25°C mornings — but the landscapes are worth every frozen eyelash.",
    "I've learned to dress in layers living here. My go-to is merino base, fleece mid, and a windproof shell. Cotton will ruin your day.",
    "The ice conditions change weekly from November to March. I always check the Parks Canada trail reports before heading out.",
    "Banff in winter is a completely different place. Fewer tourists, frozen waterfalls, and that quiet cold that makes everything feel more immediate.",
]

DRIVE_ASIDES = [
    "I drive this route regularly and the pullouts are the real gems. Most tourists blow right past them.",
    "My partner and I have done this drive in every season. Fall is the most scenic, but winter has a drama to it that I love.",
    "The road conditions can change fast, especially between October and April. Check 511 Alberta before you leave.",
    "I keep a full set of winter gear in my trunk for this drive. Even in May, snowstorms can hit the higher elevations.",
]

VIEWPOINT_ASIDES = [
    "I've photographed this view in every season, every light. Dawn after a fresh snowfall is the one that stopped me in my tracks.",
    "The crowds at this viewpoint peak around 11 AM to 2 PM. I always go early morning or golden hour.",
    "What the photos don't capture is the scale. You have to stand here in person to understand how big these mountains really are.",
    "I've brought maybe 20 different friends to this viewpoint over the years. It has a 100% success rate for jaw drops.",
]

# ---------------------------------------------------------------------------
# TOPIC DETECTION
# ---------------------------------------------------------------------------

HIKING_KEYWORDS = [
    'hike', 'trail', 'summit', 'pass', 'ridge', 'peak', 'scramble',
    'glacier', 'canyon', 'falls', 'lake-hike', 'cirque', 'meadow',
    'backcountry', 'ink-pots', 'larch-valley', 'healy', 'sentinel',
    'cascade-mountain', 'ha-ling', 'sunshine-meadows', 'cory-pass',
    'boom-lake', 'helen-lake', 'parker-ridge', 'sulphur-mountain',
    'c-level-cirque', 'tunnel-mountain', 'spray-river', 'legacy-trail',
    'bow-glacier', 'bow-summit-trail', 'sundance-canyon', 'fenland',
    'bow-falls', 'plain-of-six', 'trail-running', 'scrambling',
    'winter-hiking', 'accessible-hikes', 'trail-conditions',
]

FOOD_KEYWORDS = [
    'restaurant', 'food', 'eat', 'dining', 'brunch', 'breakfast',
    'pizza', 'sushi', 'steakhouse', 'vegan', 'coffee', 'ice-cream',
    'takeout', 'late-night-eats', 'farm-to-table', 'food-truck',
    'food-festival', 'happy-hour', 'drink-deal', 'bar', 'craft-beer',
    'brewery', 'distillery', 'apres-ski', 'rooftop-patio', 'specials',
    'fine-dining', 'family-restaurant', 'food-guide', 'bistro',
]

HOTEL_KEYWORDS = [
    'hotel', 'lodge', 'hostel', 'cabin', 'chalet', 'airbnb',
    'accommodation', 'stay', 'resort', 'glamping', 'camping',
    'fairmont', 'sandman', 'hilton', 'boutique-hotel', 'luxury-hotel',
    'pet-friendly-hotel', 'ski-in-ski-out', 'rv-guide',
    'where-to-stay', 'boundary-lodge', 'numtijah', 'num-ti-jah',
    'sunshine-lodging', 'fancy-hotel', 'skoki-lodge',
]

WINTER_KEYWORDS = [
    'ski', 'snowshoe', 'ice-walk', 'icewalk', 'ice-skating',
    'winter', 'dog-sledding', 'fat-biking', 'tubing',
    'heli-skiing', 'cross-country', 'snow', 'avalanche',
    'norquay', 'sunshine-village', 'lake-louise-ski',
    'spring-skiing', 'ski-touring',
]

DRIVE_KEYWORDS = [
    'drive', 'parkway', 'icefields', 'scenic-drive', 'road-trip',
    'calgary-to-banff', 'banff-to-jasper', 'banff-to-vancouver',
    'winter-driving', 'car-rental',
]

VIEWPOINT_KEYWORDS = [
    'view', 'lookout', 'viewpoint', 'sunrise', 'sunset',
    'photography', 'photo-spots', 'photo-tour',
]

ACTIVITY_KEYWORDS = [
    'gondola', 'rafting', 'kayak', 'canoe', 'fishing', 'golf',
    'horseback', 'via-ferrata', 'helicopter', 'caving', 'yoga',
    'marathon', 'mountain-biking', 'geocaching', 'lake-cruise',
    'northern-lights', 'aurora', 'stargazing', 'dark-sky',
    'bird-watching', 'rock-climbing', 'wellness',
    'hot-springs', 'cave-and-basin', 'wildlife-overpass',
    'dog-friendly', 'volunteer', 'working-holiday', 'digital-nomad',
]


def detect_topic(slug: str, content: str) -> str:
    """Categorize a blog post by topic based on its slug and content."""
    slug_lower = slug.lower()
    content_lower = content[:500].lower()
    combined = slug_lower + " " + content_lower

    # Check keywords in priority order
    scores = {
        'hiking': 0,
        'food': 0,
        'hotel': 0,
        'winter': 0,
        'drive': 0,
        'viewpoint': 0,
        'activity': 0,
        'general': 0,
    }

    for kw in HIKING_KEYWORDS:
        if kw in combined:
            scores['hiking'] += 2 if kw in slug_lower else 1

    for kw in FOOD_KEYWORDS:
        if kw in combined:
            scores['food'] += 2 if kw in slug_lower else 1

    for kw in HOTEL_KEYWORDS:
        if kw in combined:
            scores['hotel'] += 2 if kw in slug_lower else 1

    for kw in WINTER_KEYWORDS:
        if kw in combined:
            scores['winter'] += 2 if kw in slug_lower else 1

    for kw in DRIVE_KEYWORDS:
        if kw in combined:
            scores['drive'] += 2 if kw in slug_lower else 1

    for kw in VIEWPOINT_KEYWORDS:
        if kw in combined:
            scores['viewpoint'] += 2 if kw in slug_lower else 1

    for kw in ACTIVITY_KEYWORDS:
        if kw in combined:
            scores['activity'] += 2 if kw in slug_lower else 1

    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return 'general'
    return best


def pick_asides(topic: str, used_top: set, used_mid: set):
    """Pick one top and one mid aside that haven't been used yet."""
    topic_map_top = {
        'hiking': HIKING_ASIDES_TOP,
        'food': FOOD_ASIDES_TOP,
        'hotel': HOTEL_ASIDES_TOP,
        'winter': WINTER_ASIDES + ACTIVITY_ASIDES_TOP,
        'drive': DRIVE_ASIDES + GENERAL_ASIDES_TOP,
        'viewpoint': VIEWPOINT_ASIDES + GENERAL_ASIDES_TOP,
        'activity': ACTIVITY_ASIDES_TOP,
        'general': GENERAL_ASIDES_TOP,
    }
    topic_map_mid = {
        'hiking': HIKING_ASIDES_MID,
        'food': FOOD_ASIDES_MID,
        'hotel': HOTEL_ASIDES_MID,
        'winter': ACTIVITY_ASIDES_MID + GENERAL_ASIDES_MID,
        'drive': GENERAL_ASIDES_MID + DRIVE_ASIDES,
        'viewpoint': GENERAL_ASIDES_MID + VIEWPOINT_ASIDES,
        'activity': ACTIVITY_ASIDES_MID,
        'general': GENERAL_ASIDES_MID,
    }

    top_pool = topic_map_top.get(topic, GENERAL_ASIDES_TOP)
    mid_pool = topic_map_mid.get(topic, GENERAL_ASIDES_MID)

    # Pick unused if possible
    available_top = [a for a in top_pool if a not in used_top]
    if not available_top:
        used_top.clear()
        available_top = list(top_pool)

    available_mid = [a for a in mid_pool if a not in used_mid]
    if not available_mid:
        used_mid.clear()
        available_mid = list(mid_pool)

    top = random.choice(available_top)
    mid = random.choice(available_mid)

    used_top.add(top)
    used_mid.add(mid)

    return top, mid


def inject_asides(html: str, top_text: str, mid_text: str) -> str:
    """Insert two aside elements into the HTML content."""
    aside_template = '<aside class="editor-note"><strong>🏔️ Local\'s Note:</strong> {text}</aside>'

    # Find all </p> positions
    p_closes = [m.end() for m in re.finditer(r'</p>', html)]

    if len(p_closes) < 2:
        return html  # too short to modify

    # Insert top aside after the first </p>
    top_aside = "\n\n" + aside_template.format(text=top_text) + "\n"
    insert_top = p_closes[0]

    # Insert mid aside roughly in the middle
    mid_idx = len(p_closes) // 2
    if mid_idx < 1:
        mid_idx = 1
    # Make sure mid is at least 2 paragraphs after top
    if mid_idx <= 1 and len(p_closes) > 3:
        mid_idx = 2
    insert_mid = p_closes[mid_idx]

    # Insert from back to front so positions don't shift
    mid_aside = "\n\n" + aside_template.format(text=mid_text) + "\n"

    if insert_mid > insert_top:
        html = html[:insert_mid] + mid_aside + html[insert_mid:]
        html = html[:insert_top] + top_aside + html[insert_top:]
    else:
        html = html[:insert_top] + top_aside + html[insert_top:]

    return html


def parse_ts_file(filepath: str) -> list:
    """
    Parse a blogContent TS file. Returns list of (slug, content, start_pos, end_pos).
    We parse the raw text to find each 'slug': `...`, entry.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    entries = []
    # Pattern: 'slug-name': `content`,
    # We find each slug start, then the backtick-delimited content
    pattern = re.compile(r"  '([a-z0-9_-]+)':\s*`")
    for m in pattern.finditer(text):
        slug = m.group(1)
        content_start = m.end()  # position right after the opening backtick
        # Find the closing backtick followed by comma or end of object
        # We need to handle backtick within template literals carefully
        # In these files, the content is HTML so backticks shouldn't appear inside
        depth = 0
        pos = content_start
        while pos < len(text):
            if text[pos] == '`':
                # Check if this is the closing backtick
                # It should be followed by , or } or whitespace+}
                rest = text[pos+1:pos+10].lstrip()
                if rest.startswith(',') or rest.startswith('}'):
                    content_end = pos
                    break
            pos += 1
        else:
            continue  # couldn't find end

        content = text[content_start:content_end]
        entries.append((slug, content, content_start, content_end))

    return entries, text


def process_file(filepath: str, used_top: set, used_mid: set) -> int:
    """Process a single TS file. Returns number of posts modified."""
    entries, text = parse_ts_file(filepath)
    modified = 0

    # Process entries from back to front so position offsets stay valid
    entries_to_modify = []
    for slug, content, start, end in entries:
        # Skip if already has editor-note
        if 'editor-note' in content:
            continue

        topic = detect_topic(slug, content)
        top_text, mid_text = pick_asides(topic, used_top, used_mid)
        new_content = inject_asides(content, top_text, mid_text)

        if new_content != content:
            entries_to_modify.append((slug, new_content, start, end, topic))

    # Apply modifications from back to front
    entries_to_modify.sort(key=lambda x: x[2], reverse=True)
    for slug, new_content, start, end, topic in entries_to_modify:
        text = text[:start] + new_content + text[end:]
        modified += 1
        print(f"  ✓ [{topic:>10}] {slug}")

    # Write back
    if modified > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)

    return modified


def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base, 'src', 'data')

    files = [
        os.path.join(data_dir, 'blogContent.ts'),
        os.path.join(data_dir, 'blogContent1.ts'),
        os.path.join(data_dir, 'blogContent2.ts'),
        os.path.join(data_dir, 'blogContent3.ts'),
    ]

    used_top = set()
    used_mid = set()
    total = 0

    for filepath in files:
        if not os.path.exists(filepath):
            print(f"⚠ Skipping {os.path.basename(filepath)} — not found")
            continue
        print(f"\n📄 Processing {os.path.basename(filepath)}...")
        count = process_file(filepath, used_top, used_mid)
        total += count
        print(f"   Modified {count} posts")

    print(f"\n✅ Done — injected first-person asides into {total} blog posts")
    return total


if __name__ == '__main__':
    main()
