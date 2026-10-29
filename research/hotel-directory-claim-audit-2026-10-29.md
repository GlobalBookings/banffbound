# Hotel directory: rendered-claim audit and ten property reviews

Checked **29 October 2026**. Scope: `src/data/hotels.ts`, the two hotel-directory templates, `src/data/hotelDirectory.ts` and the focused check/source record. No child agents, Git actions, full build, publication, booking, conversion, account or hosting writes were performed by this agent. Root owns sitemap/CI and final rendered-release verification.

## What the existing rendered output actually published

Before editing, all **95** existing local `dist/hotel-directory/*/index.html` profiles were inspected. These were already-built files, not a new build or a claim of independent live-HTTP verification:

| Rendered claim surface | Profiles |
| --- | ---: |
| Amenities section | 95 |
| Total-room count | 69 |
| Generic free-cancellation wording | 25 |
| Hotel schema address | 95 |
| Hotel schema image | 94 |
| Precise schema geo | 3 |
| Numeric price tokens in the main profile content | 0 |

The previous template already hid numeric rate/review fields, as requested. That did **not** establish the provenance of the remaining description, amenity, room, dining, policy, count, history, address or imagery claims. Examples in the actual HTML included Copperstone described as a Canmore riverside property with an indoor pool, Falcon Crest described as having an indoor pool and a Silvertip location, and Castle/Storm imagery naming other hotels.

### Raw inventory provenance

The 95-record module contained **12** previously reviewed records with official-source/check-date fields. The other **83** had no equivalent record-level source review. Before this phase it retained 83 undated “From $” strings, 83 review-score records and 83 “guest loves” arrays. These values are not evidence of current quotes or verified guest testimony. No reliable source/capture trail for those older editorial fields was found in the inspected module or related source searches.

Primary images alone included **59 Unsplash stock URLs**. The same Banff Springs filename was used by nine records, eight of which were not Banff Springs. Galleries also mixed generic stock and identifiable other-property images. A filename was direct contradictory evidence in those cases, not proof that every other unidentified image was false.

The existing coordinate correction had already removed generated spirals from the public `hotels` export, but many legacy manual points still lacked provenance. This phase adds no synthetic points. The directory initially retained the three documented points. This phase also verifies two publisher GPS locators for Banff Springs and Rimrock; only these five source-documented points reach the projection, map and precise schema. The contradictory Canmore point for Copperstone was removed from the retained manual map because its actual official address is Dead Man’s Flats; no replacement is guessed.

## Public claim and indexability contract

The explicit register in `hotelDirectory.ts` separates source review from a date string or inherited provider URL. The assigned directory views consume this projection, rather than publishing every legacy field from `hotels.ts`.

| Scope | Count | Public treatment |
| --- | ---: | --- |
| Selected property facts reviewed | 21 | Dated primary-source profiles with category/operation caveats; verified property imagery where available |
| Location only | 1 | Boundary Lodge: sourced condominium location and unit/manager caveats; no property-wide amenity or photo claims |
| Sourced former-name history | 2 | Old identity retained with primary evidence of current identity; no invented current facilities or replacement booking IDs |
| Legacy lead awaiting source review | 71 | All names/URLs remain discoverable; unsupported description, facilities, policies, address, counts and imagery withheld |

All **95 discovery records** and detail URLs remain. The first 21 profiles in the listing have reviewed selected facts; source-status filters let visitors choose the scope. Area/type labels on unreviewed leads are explicitly stored classifications, not independently verified locations. Editorial budget symbols remain categories, never rate quotes.

The 71 unreviewed detail pages contain identity-confirmation guidance and reviewed alternatives, **not substantive sourced property guides**. Root approved `noindex, follow` for exactly these 71, using the existing BaseLayout behavior (which also suppresses Pagefind indexing). The eligible set is the 21 reviewed profiles, one location-only profile and two source-backed histories: **24 detail pages**. Root is integrating matching sitemap exclusion. No unreviewed page is described as fully reviewed.

Stable APIs:

```ts
isHotelDirectoryIndexable(slug: string): boolean;
unreviewedHotelDirectorySlugs: Set<string>; // exactly 71 at this review
directoryHotels: DirectoryHotel[];         // all 95 discovery records
```

`DirectoryHotel.sourceStatus` is `reviewed | location-only | former-name | unreviewed`; it also carries scope, source links, operation notes and photo notes. Only the documented five have numeric coordinates in this projection. Legacy and former-name pages emit WebPage schema rather than unverified Hotel facts; Boundary's sourced place/address/point is identified separately. No star/review/offer/rate schema is emitted. The three protected locators remain Chateau `51.416787,-116.212386`, Lake Louise Inn `51.4286653,-116.1848642` and Boundary `51.125783,-115.3874`.

The prior **12 raw reviewed records are unchanged in full**, including photos, provider URLs, facts and exported coordinates. Ten new raw records were updated from primary sources. Remaining legacy raw fields are preserved in the original source module for further review; future directory rendering must use the source projection. Root checked other consumers and confirmed their selected-name/image/fact usage does not require broader component edits in this phase.

## Ten additional property reviews

### Castle Mountain Chalets — Castle Junction

Sources: [official accommodation](https://www.castlemountain.com/rooms-list.html), [FAQ](https://www.castlemountain.com/faqs.html), [policies](https://www.castlemountain.com/policies.html).

Distinguished chalet/suite categories, kitchens and wood/gas fireplace or jetted-bath differences; removed universal wood-fireplace/deck/backcountry claims, unverified counts/dates, guest quotes and drive-time promises. Dog eligibility is category-specific; Mountain View Suites are excluded. FAQ and policy charges differ, so no fee is copied. The general store does not substitute for a complete meal plan. The reviewed photo is an operator-labelled Mountain Pine interior, not Banff Springs or stock.

### Storm Mountain Lodge — Highway 93 South

Sources: [cabins](https://stormmountainlodge.com/logcabins/), [home](https://stormmountainlodge.com/), [contact/location](https://stormmountainlodge.com/contact/), [dining](https://stormmountainlodge.com/cuisine/).

The operator explicitly says cabins have no kitchens and prohibits indoor/outdoor cooking; it lists no cabin WiFi, TV, telephone, fridge or coffee maker. Dogs can be accommodated under conditions, contradicting the blanket no-pets claim. The home and contact pages differ on reduced-season midweek opening patterns, so the profile asks for actual nights/meals rather than reproducing either as a guarantee. Removed the unsupported child-age rule, nightly dining promise and other-property gallery. The cabin image is the operator's own cabin CTA, with its original text overlay retained.

### HI Castle Mountain Wilderness Hostel — Castle Junction

Sources: [official hostel](https://hihostels.ca/en/hostels/hi-castle-mountain), [wilderness operating calendar](https://hihostels.ca/en/wilderness/calendar).

The current page lists a shared **14-bed room category**, communal kitchen, linens and fireside facilities; a category count is not total room inventory. Its calendar includes winter operation and a specific **12 October–5 November 2026** closure. That contradicts the old summer-only/36-room-or-bed story. Published arrival windows and no-out-of-hours-arrival rule are retained; water/bathing/connectivity and group/animal requirements are left for direct confirmation. Two attempts to inspect published official gallery images returned HTTP 429; no unviewed image or stock substitute is published.

### Baker Creek by Basecamp — Bow Valley Parkway

Sources: [current property/categories/café](https://basecampresorts.com/bakercreek/), [operator group/meal-service distinction](https://basecampresorts.com/group-details/baker-creek-weddings/).

This is a Parkway cabin/suite base near Lake Louise, separately located from its village/lakeshore. Cooking equipment, fireplaces and loft/Jacuzzi features vary by category. The current page lists Creekside Café; the operator group page says there is no full restaurant. Removed the invented Bistro breakfast/dinner programme and universal cabin facilities, unsupported counts/history, guest quotes and fixed cancellation terms. The current operator cabin photo replaces the mixed gallery.

### Copperstone Resort — Dead Man’s Flats

Sources: [official property/address/facilities](https://www.copperstoneresort.com/), [official contact](https://www.copperstoneresort.com/contact-us).

Corrected the address to **250 2nd Avenue, Dead Man’s Flats**, rather than Canmore; the area category is the broader Bow Valley. The operator lists suite kitchens/laundry and an **outdoor hot tub**, not evidence for the former indoor-pool story. Its site advertises allocated pet-friendly suites and uses a room-specific No Pets Allowed badge, so acceptance must be confirmed for the unit. Removed the wrong retained Canmore point, riverside/trail/restaurant assumptions, invented testimony and Banff Springs imagery. The official winter property image was visually checked; its pictured dog is not an all-unit pet policy.

### Stoneridge Mountain Resort — Canmore

Sources: [official amenities](https://www.stoneridgeresort.ca/amenities/), [address, transport and FAQ](https://www.stoneridgeresort.ca/contact-us/).

The address is **30 Lincoln Park, Canmore**. The operator lists one-/two-/three-bedroom suites with kitchens/laundry, an outdoor heated pool/hot tub, outdoor dry sauna and Black Dog Café. These listings are not a weather-independent operating guarantee. Pet restrictions are explicit; assistance/access arrangements should be discussed directly. The airport-transfer information points to a Coast Hotel stop, not a reserved Stoneridge pickup. Removed generic cancellation, room-count/history and guest claims. The official exterior image visibly identifies Stoneridge.

### Falcon Crest Lodge — Canmore

Sources: [official amenities](https://www.falconcrestlodge.ca/amenities), [one-bedroom category](https://www.falconcrestlodge.ca/rooms/one-bedroom-suite).

Corrected the Kananaskis Way context and replaced the indoor-pool story with **two outdoor hot tubs**. The reviewed One Bedroom Suite has a full kitchen/laundry and is described as pet-free; those category facts are not extended to every hotel room. The current on-site restaurant is Dingsway. Removed guaranteed Banff savings, fabricated/undated history/counts and guest testimony. A verified official one-bedroom kitchen/living-area photo replaces stock.

### Cathedral Mountain Lodge — Field/Yoho, BC

Sources: [official FAQ](https://www.cathedralmountainlodge.com/frequently-asked-questions/), [cabin categories](https://www.cathedralmountainlodge.com/accommodation/).

Corrected the area to **Yoho National Park** and address to **1 Yoho Valley Road, Field, BC**. The operator describes summer operation from late May to early October, no regular transfer to/from the lodge, and conditional sister-property benefits. Premier Loft cabins have ladder access; the FAQ identifies families with children eight or older for that category and says the lodge is no longer pet-friendly. Riverside dining requires its own reservation. Removed all-cabin tub/deck assumptions, invented programmes/count/history and a general winter-base implication. The official gallery image shows the lodge's riverside cabin setting.

### Fairmont Banff Springs — Spray Avenue

Sources: [current Fairmont room inventory](https://www.fairmont.com/en/hotels/banff/fairmont-banff-springs.html), [Gatehouse layouts](https://www.banff-springs-hotel.com/stay/gatehouse/), [guest services](https://www.banff-springs-hotel.com/stay/guest-services/), [publisher address/GPS](https://all.accor.com/hotel/A550/index.en.shtml).

Corrected the inventory to **724 rooms/suites**, replacing 757. The source distinguishes Fairmont rooms, accessible roll-in-shower categories, the Gatehouse Family Room with king/two bunks and the separate Family Suite. The guest-services checkout is **noon**, replacing 11am; local Roam passes do not establish a ski/airport transfer. Removed unverified guest quotes, fixed fees, old spa naming, count/history/renovation assumptions and mixed stock/other-hotel gallery. The actual **405 Spray Avenue** location now has its own area rather than “Downtown Banff.” The official guest-services hero was visually checked as an actual guest-room/service photograph without claiming its category or inclusion.

Publisher “Hotel location” GPS is **51.164332,-115.56183** at the named address, checked **2026-10-29**. This replaces the unsupported legacy directory point; it is a property locator, not an entrance/parking instruction. The three prior documented locators and all prior twelve exported records remain unchanged.

### Rimrock Banff, Emblems Collection — Sulphur Mountain

Sources: [current operator](https://www.emblemscollection.com/rimrock-banff/), [Accor October 2026 opening release](https://press.accor.com/emblems-collection-announces-the-opening-of-rimrock-banff/?lang=eng), [Classic Room](https://www.emblemscollection.com/rimrock-banff/rooms-suites/classic-room/), [Wellness Studio](https://www.emblemscollection.com/rimrock-banff/rooms-suites/wellness-studio-peak-view-private-terrace/), [Bathhouse](https://www.emblemscollection.com/rimrock-banff/wellness/the-bathhouse/), [directions](https://www.emblemscollection.com/rimrock-banff/contact-directions/), [publisher GPS](https://all.accor.com/hotel/C1W0/index.en.shtml), [official tourism identity/address](https://www.banfflakelouise.com/business/rimrock-banff).

Accor’s current release says the hotel **has opened in October 2026**, rather than a future-opening or closed status. Corrected Emblems ownership from Marriott to **Accor** and removed the inherited 343-room/2023 renovation and old Eden/Primrose/Larkspur dining claims. Current operator names are Parker’s Table, Social and Rimrock Market. Classic Rooms have a hotel view, king/two-queen configurations and beverage equipment/mini-fridge; this is not a full kitchen or universal mountain view. Wellness Studio is a distinct two-adult king category. Bathhouse/Movement facilities are source-listed with current admission and room inclusion left for confirmation. The **300 Mountain Avenue** address now uses Sulphur Mountain, separate from the town-centre hotel strip. No complimentary town shuttle is promised.

Publisher “Hotel location” GPS is **51.151834,-115.559831** at the named address, checked **2026-10-29**. It is a property locator, not an entrance/parking instruction. The opening release’s room/view image was fetched and visually inspected; it does not establish the offered room or view.

## Former-name records retained truthfully

- **Inns of Banff:** the [operator's July 2025 release](https://www.banfflodgingco.com/wp-content/uploads/PReleaseBCP_July2025-FINAL.pdf) says the former site was redeveloped as Hotel Canoe & Suites and The Otter Hotel. The original record/URL is retained as history, with no guessed replacement property ID or old-facility claims.
- **Banff International Hotel:** the [operator contact page](https://prod.banffjaspercollection.com/contact-us/) and [Pursuit renaming announcement](https://www.pursuitcollection.com/Website/media/pursuit/press-release-BTC-introduces-Elk-and-Avenue-Hotel.pdf) identify Elk + Avenue Hotel at 333 Banff Avenue as the former Banff International. It is not conflated with Moxy or with a separate current hotel under the old name.

## Provider evidence and URL preservation

All **95 names, slugs and Expedia URLs** are unchanged; every affiliate parameter remains `camref=1101l3MtWX`. Their identity/URL tuple SHA-256 is `18d4c39bbe88ad1221c66f86cf7c535e4e7fb6e173933e4639d6e8d84dec370d`.

Root's parallel, read-only provider-target check found matching current primary property targets for [Castle h6508769](https://www.expedia.ca/Castle-Junction-Hotels-Castle-Mountain-Chalets.h6508769.Hotel-Information) and [Storm h12637578](https://www.expedia.ca/Castle-Junction-Hotels-Storm-Mountain-Lodge-Cabins-Dining.h12637578.Hotel-Information). Baker's inherited exact target was inaccessible, so its property-ID match remains unverified. Five of the original eight new reviews already use destination searches, which establish no particular property identity. No contradictory property ID was established and none was guessed or changed. Destination searches remain explicitly labelled; source facts and inherited booking targets are treated separately.

The retained Banff Springs h13652 and Rimrock h15672 targets were not independently reverified in this source pass; their unchanged property IDs are not inferred from the new operator or GPS evidence. The earlier unresolved HI Lake Louise property-ID verification is not silently promoted by this phase. No live rate, guest score, room reservation or test conversion is claimed.

## New-image provenance

All accepted images below were fetched into temporary storage and visually opened before use. They remain original official URLs in the record; no out-of-scope asset files were created. The prior reviewed photos were preserved. A representative image is not a booking inclusion.

| Property | Accepted official image | Inspection |
| --- | --- | --- |
| Castle | [Mountain Pine image](https://www.castlemountain.com/system/images/500x300/_H0A7971.jpg) | Operator-labelled interior with stove/table; no generic resort substitution |
| Storm | [Cabin CTA](https://stormmountainlodge.com/wp-content/uploads/2022/03/CTA_Cabins_01c.png) | Actual log cabins with original operator text overlay |
| Baker | [Operator cabin image](https://basecampresorts.com/wp-content/uploads/Baker-Creek-Trapper-Cabin-Nick-Fitzhardinge-Low-Res-2-copy.webp) | Log cabin exterior at the property |
| Copperstone | [Official winter property image](https://d199a9u7yadple.cloudfront.net/copperstoneresort/index/bg-season-winter.1673284912376.jpg) | Property entrance/winter setting; no pet-policy inference |
| Stoneridge | [Official exterior](https://www.stoneridgeresort.ca/wp-content/uploads/2023/02/Stoneridge-Mountain-Resort_Exterior-1-1.jpg) | Signed property exterior |
| Falcon Crest | [Official one-bedroom suite](https://image-tc.galaxy.tf/wijpeg-a1wo7j7pss8adpv5u6u4v6iay/one-bedroom-suite_standard.jpg?crop=2%2C0%2C1197%2C898) | Kitchen and living area from the named category |
| Cathedral | [Official gallery image](https://www.cathedralmountainlodge.com/wp-content/uploads/2025/07/CML-Gallery-Home-428x241.webp) | Cabin/river/mountain setting identified by the operator gallery |
| HI Castle | None accepted | Published images returned 429; blank-photo fallback used |
| Banff Springs | [Official guest-services hero](https://www.banff-springs-hotel.com/content/uploads/2022/10/Guest-Services-Winter-Hero.jpg) | Guest-room/service photograph; no particular category or inclusion inferred |
| Rimrock | [Official October opening-release image](https://press.accor.com/wp-content/uploads/2026/10/232289f0612e46888344356f86c62256-m.jpg) | Room/view photograph published with the hotel opening; no universal view inferred |

## Focused verification

`node research/check-hotel-directory-quality-2026-10-29.mjs` passes **764 assertions**. It checks 95 stable identities/provider URLs, all affiliate IDs, full preservation of the prior twelve, exact 24/71 indexability coverage, source-status counts, all 95 schema contracts, suppression of legacy claims/photos/coordinates, the three protected points plus both new publisher locators and their exact review dates, nullable/poisoned data, source/area/type/budget/search filters, URL validation, reset, map failure/timeout/retry/late-load behavior, blank-photo popups, and complete no-JavaScript discovery structure. Both assigned Astro sources transform with **zero diagnostics**, and focused `tsc --noEmit` of the data/helper passes. This is not a full site build, browser release check or live booking verification.

The legacy raw fields remain a review backlog rather than evidence for publishing. The inventory below documents each route's current public source scope. Root will verify generated robots, sitemap and Pagefind coverage during integration.

## Complete 95-record source inventory

| Record | Area / stored label | Public source scope | Scope date | Property image | Indexable |
| --- | --- | --- | --- | --- | --- |
| [fairmont-banff-springs](/hotel-directory/fairmont-banff-springs/) | Spray Avenue | reviewed | 2026-10-29 | Source-reviewed | Yes |
| [rimrock-banff](/hotel-directory/rimrock-banff/) | Sulphur Mountain | reviewed | 2026-10-29 | Source-reviewed | Yes |
| [moose-hotel-suites](/hotel-directory/moose-hotel-suites/) | Downtown Banff | reviewed | 2026-10-28 | Source-reviewed | Yes |
| [hotel-canoe-suites](/hotel-directory/hotel-canoe-suites/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [otter-hotel](/hotel-directory/otter-hotel/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [fox-hotel-suites](/hotel-directory/fox-hotel-suites/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [banff-caribou-lodge-spa](/hotel-directory/banff-caribou-lodge-spa/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [banff-park-lodge](/hotel-directory/banff-park-lodge/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [buffalo-mountain-lodge](/hotel-directory/buffalo-mountain-lodge/) | Tunnel Mountain | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [banff-rocky-mountain-resort](/hotel-directory/banff-rocky-mountain-resort/) | Tunnel Mountain | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [tunnel-mountain-resort](/hotel-directory/tunnel-mountain-resort/) | Tunnel Mountain | reviewed | 2026-10-28 | Source-reviewed | Yes |
| [elk-avenue-hotel](/hotel-directory/elk-avenue-hotel/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [royal-canadian-lodge](/hotel-directory/royal-canadian-lodge/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [brewster-mountain-lodge](/hotel-directory/brewster-mountain-lodge/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [peaks-hotel-suites](/hotel-directory/peaks-hotel-suites/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [rundlestone-lodge](/hotel-directory/rundlestone-lodge/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [banff-aspen-lodge](/hotel-directory/banff-aspen-lodge/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [banff-ptarmigan-inn](/hotel-directory/banff-ptarmigan-inn/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [canalta-lodge](/hotel-directory/canalta-lodge/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [mount-royal-hotel](/hotel-directory/mount-royal-hotel/) | Downtown Banff | reviewed | 2026-10-28 | Source-reviewed | Yes |
| [juniper-hotel](/hotel-directory/juniper-hotel/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [best-western-banff](/hotel-directory/best-western-banff/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [charltons-banff](/hotel-directory/charltons-banff/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [banff-inn](/hotel-directory/banff-inn/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [dorothy-motel](/hotel-directory/dorothy-motel/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [bow-view-lodge](/hotel-directory/bow-view-lodge/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [red-carpet-inn](/hotel-directory/red-carpet-inn/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [irwins-mountain-inn](/hotel-directory/irwins-mountain-inn/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [kenrick-hotel](/hotel-directory/kenrick-hotel/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [moxy-banff](/hotel-directory/moxy-banff/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [king-edward-hotel](/hotel-directory/king-edward-hotel/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [hi-banff-alpine-centre](/hotel-directory/hi-banff-alpine-centre/) | Tunnel Mountain | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [sunshine-mountain-lodge](/hotel-directory/sunshine-mountain-lodge/) | Bow Valley | reviewed | 2026-10-28 | Source-reviewed | Yes |
| [johnston-canyon-lodge](/hotel-directory/johnston-canyon-lodge/) | Bow Valley | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [castle-mountain-chalets](/hotel-directory/castle-mountain-chalets/) | Castle Junction | reviewed | 2026-10-29 | Source-reviewed | Yes |
| [storm-mountain-lodge](/hotel-directory/storm-mountain-lodge/) | Castle Junction | reviewed | 2026-10-29 | Source-reviewed | Yes |
| [blackstone-mountain-lodge](/hotel-directory/blackstone-mountain-lodge/) | Canmore | reviewed | 2026-10-28 | Source-reviewed | Yes |
| [malcolm-hotel](/hotel-directory/malcolm-hotel/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [everwild-canmore](/hotel-directory/everwild-canmore/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [coast-canmore-hotel](/hotel-directory/coast-canmore-hotel/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [basecamp-lodge-canmore](/hotel-directory/basecamp-lodge-canmore/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [lamphouse-canmore](/hotel-directory/lamphouse-canmore/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [mount-engadine-lodge](/hotel-directory/mount-engadine-lodge/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [mystic-springs-chalets](/hotel-directory/mystic-springs-chalets/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [fairmont-chateau-lake-louise](/hotel-directory/fairmont-chateau-lake-louise/) | Lake Louise | reviewed | 2026-10-28 | Source-reviewed | Yes |
| [lake-louise-inn](/hotel-directory/lake-louise-inn/) | Lake Louise | reviewed | 2026-10-28 | Source-reviewed | Yes |
| [mountaineer-lodge](/hotel-directory/mountaineer-lodge/) | Lake Louise | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [deer-lodge](/hotel-directory/deer-lodge/) | Lake Louise | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [post-hotel-spa](/hotel-directory/post-hotel-spa/) | Lake Louise | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [baker-creek-by-basecamp](/hotel-directory/baker-creek-by-basecamp/) | Bow Valley | reviewed | 2026-10-29 | Source-reviewed | Yes |
| [paradise-lodge-bungalows](/hotel-directory/paradise-lodge-bungalows/) | Lake Louise | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [hi-lake-louise-alpine-centre](/hotel-directory/hi-lake-louise-alpine-centre/) | Lake Louise | reviewed | 2026-10-28 | Source-reviewed | Yes |
| [num-ti-jah-lodge](/hotel-directory/num-ti-jah-lodge/) | Lake Louise | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [emerald-lake-lodge](/hotel-directory/emerald-lake-lodge/) | Yoho National Park | reviewed | 2026-10-28 | Source-reviewed | Yes |
| [banff-centre-hotel](/hotel-directory/banff-centre-hotel/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [banff-boutique-inn](/hotel-directory/banff-boutique-inn/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [banff-beaver-cabins](/hotel-directory/banff-beaver-cabins/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [hidden-ridge-resort](/hotel-directory/hidden-ridge-resort/) | Tunnel Mountain | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [basecamp-suites-banff](/hotel-directory/basecamp-suites-banff/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [douglas-fir-resort](/hotel-directory/douglas-fir-resort/) | Tunnel Mountain | reviewed | 2026-10-28 | Source-reviewed | Yes |
| [elkhorn-lodge](/hotel-directory/elkhorn-lodge/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [inns-of-banff](/hotel-directory/inns-of-banff/) | Downtown Banff | former-name | 2026-10-29 | Withheld / unavailable | Yes |
| [banff-international-hotel](/hotel-directory/banff-international-hotel/) | Downtown Banff | former-name | 2026-10-29 | Withheld / unavailable | Yes |
| [samesun-banff-hostel](/hotel-directory/samesun-banff-hostel/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [banff-international-hostel](/hotel-directory/banff-international-hostel/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [banff-boundary-lodge](/hotel-directory/banff-boundary-lodge/) | Bow Valley | location-only | 2026-10-28 | Withheld / unavailable | Yes |
| [rundle-chalets](/hotel-directory/rundle-chalets/) | Downtown Banff | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [falcon-crest-lodge](/hotel-directory/falcon-crest-lodge/) | Canmore | reviewed | 2026-10-29 | Source-reviewed | Yes |
| [pocaterra-inn-waterslide](/hotel-directory/pocaterra-inn-waterslide/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [rocky-mountain-ski-lodge](/hotel-directory/rocky-mountain-ski-lodge/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [canmore-rocky-mountain-inn](/hotel-directory/canmore-rocky-mountain-inn/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [northwinds-hotel-canmore](/hotel-directory/northwinds-hotel-canmore/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [chateau-canmore](/hotel-directory/chateau-canmore/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [silver-creek-lodge](/hotel-directory/silver-creek-lodge/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [stoneridge-mountain-resort](/hotel-directory/stoneridge-mountain-resort/) | Canmore | reviewed | 2026-10-29 | Source-reviewed | Yes |
| [grande-rockies-resort](/hotel-directory/grande-rockies-resort/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [super-8-canmore](/hotel-directory/super-8-canmore/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [georgetown-inn](/hotel-directory/georgetown-inn/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [drake-inn](/hotel-directory/drake-inn/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [sunset-resorts-canmore](/hotel-directory/sunset-resorts-canmore/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [copperstone-resort](/hotel-directory/copperstone-resort/) | Bow Valley | reviewed | 2026-10-29 | Source-reviewed | Yes |
| [lady-macdonald-country-inn](/hotel-directory/lady-macdonald-country-inn/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [windtower-lodge-suites](/hotel-directory/windtower-lodge-suites/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [summit-grande-rockies](/hotel-directory/summit-grande-rockies/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [canmore-inn-suites](/hotel-directory/canmore-inn-suites/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [solara-resort](/hotel-directory/solara-resort/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [days-inn-canmore](/hotel-directory/days-inn-canmore/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [rundle-mountain-lodge](/hotel-directory/rundle-mountain-lodge/) | Canmore | reviewed | 2026-10-28 | Source-reviewed | Yes |
| [bear-bison-inn](/hotel-directory/bear-bison-inn/) | Canmore | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [hi-castle-mountain-hostel](/hotel-directory/hi-castle-mountain-hostel/) | Castle Junction | reviewed | 2026-10-29 | Withheld / unavailable | Yes |
| [banff-gate-mountain-lodge](/hotel-directory/banff-gate-mountain-lodge/) | Bow Valley | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [crossing-resort](/hotel-directory/crossing-resort/) | Bow Valley | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [kicking-horse-mountain-lodge](/hotel-directory/kicking-horse-mountain-lodge/) | Bow Valley | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
| [cathedral-mountain-lodge](/hotel-directory/cathedral-mountain-lodge/) | Yoho National Park | reviewed | 2026-10-29 | Source-reviewed | Yes |
| [painted-warriors-ranch](/hotel-directory/painted-warriors-ranch/) | Bow Valley | unreviewed | Unreviewed | Withheld / unavailable | Noindex, follow |
