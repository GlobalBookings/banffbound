# Banff hotel affiliate landing: sources and acquisition handoff

Checked 29 October 2026. New route: `/book/banff-hotels/`. New model: `src/data/banffHotelLanding.ts`. This page serves hotel-booking intent with an original six-property room/base comparison and direct native Expedia check-dates links. It is an independent BanffBound guide; it does not claim to be the hotel or Expedia.

## Selection and useful comparison

The six are chosen from the directory’s 49 selected-fact profiles to cover distinct Banff stay plans. Their order is not a quality, price, guest-review or popularity ranking. No star/guest scores, prices, savings, availability, free-cancellation or commission-performance promises are published.

| Slug | Stay plan | Decision the page helps make |
| --- | --- | --- |
| `moose-hotel-suites` | Central Banff Avenue suites and hot pools | Hotel room versus separate-bedroom suite; a microwave/fridge/sink nook versus a full cooking kitchen |
| `mount-royal-hotel` | Central restaurants and a hotel-room base | Match the provider’s bed layout/room position; keep the current rooftop maintenance notice visible |
| `tunnel-mountain-resort` | Hillside self-catering and flexible sleeping layouts | Selected full-kitchen condo versus Superior Suite kitchenette; loft stairs, grocery journey and local return |
| `canalta-lodge` | Outer-avenue hotel with courtyard tubs and kitchen upgrades | Named Kitchen Loft versus a different loft with fridge/microwave; town/pickup journey from 545 Banff Avenue |
| `juniper-hotel` | Hillside outlook and bistro | Deluxe mountain-facing versus Standard forest-side room; requested town shuttle and later return |
| `fairmont-banff-springs` | Spray Avenue resort and specific family layouts | Main-building/Gatehouse choice, Family Room versus Family Suite, resort/town journey and complete quote |

The page does not require a booking quote or a filter before showing its comparison. All six cards, room/cooking/facility/base notes, source links, FAQ and native booking anchors are server-rendered. Native selects progressively narrow by location and selected room/facility needs; without JavaScript the complete six-card list remains usable. The filter tags identify a published category or facility, not a reservation, room allocation, pool admission or party-capacity guarantee.

## Merchant identity evidence

Each selected inherited provider URL was opened as a public primary Expedia property source and matched by property name and street address. No booking, payment, account, conversion test or provider write was performed. Source-reader pages include cached crawls; these checks establish property identity, not a live room offer or facility guarantee. Every landing CTA preserves `camref=1101l3MtWX` and the exact existing provider URL. No changes were needed to frozen directory data or its 95 URLs.

| Offer | Expedia ID | Public merchant property evidence | Matching street address |
| --- | --- | --- | --- |
| Moose Hotel And Suites | `h14703440` | [Expedia property page](https://www.expedia.ca/Banff-Hotels-Moose-Hotel-And-Suites.h14703440.Hotel-Information) | 345 Banff Ave, Banff |
| Mount Royal Hotel | `h688930` | [Expedia property page](https://www.expedia.ca/Banff-Hotels-Mount-Royal-Hotel.h688930.Hotel-Information) | 138 Banff Avenue, Banff |
| Tunnel Mountain Resort | `h16324` | [Expedia property page](https://www.expedia.ca/Banff-Hotels-Tunnel-Mountain-Resort.h16324.Hotel-Information) | 502 Tunnel Mountain Road, Banff |
| Canalta Hotel Lodge | `h888459` | [Expedia property page](https://www.expedia.ca/Banff-Hotels-Canalta-Lodge.h888459.Hotel-Information) | 545 Banff Ave, Banff |
| The Juniper Hotel | `h1216217` | [Expedia property page](https://www.expedia.ca/Banff-Hotels-The-Juniper-Hotel.h1216217.Hotel-Information) | 1 Juniper Way, Banff |
| Fairmont Banff Springs | `h13652` | [Expedia French-language property page](https://www.expedia.ca/fr/Banff-Hotels-Fairmont-Banff-Springs.h13652.Description-Hotel) | 405 Spray Ave, Banff |

The English Fairmont property page exceeded the source reader’s content limit; its French Expedia page showed the same `h13652` property name and 405 Spray Avenue address. The normal inherited English CTA remains unchanged. Canalta’s current merchant label is “Canalta Hotel Lodge”; the operator/directory name remains “Canalta Lodge” at the same address/ID.

The model explicitly records `bookingTargetKind: 'verified-property'`, the evidence URL, matched ID/address and checked date. It rejects a changed provider host, affiliate ID or property ID until the identity is rechecked. The booking page asks users to select their own dates and party on Expedia; no dates, travellers, rates or refund terms are prefilled or invented. A future unresolved property target must be presented as an honest property/destination search, rather than being silently promoted to the current verified-target kind.

## Operator facts and photos

The selected-fact directory source work remains frozen. For this landing, current official pages were refreshed for the material statements below; the landing’s selected-fact check date is 29 October 2026. Prior detailed evidence is also retained in `winter-hotel-sources-2026-10-28.md`, `hotel-directory-claim-audit-2026-10-29.md`, `hotel-banff-town-quality-sources-2026-10-29.md` and `hotel-regional-quality-sources-2026-10-29.md`.

- **Moose:** [Superior One Bedroom Suite](https://moosehotelandsuites.com/superior-one-bedroom-suite/) lists king/two-queen choices, living room, gas fireplace, shower without a bathtub, microwave, mini-fridge and sink. [Official amenities](https://moosehotelandsuites.com/amenities/) lists two rooftop hot pools, indoor pool, restaurant and local Roam passes. The landing does not call the nook a full kitchen or a town pass a ski transfer.
- **Mount Royal:** [Current official hotel page](https://www.banffjaspercollection.com/hotels/mount-royal-hotel/) was successfully read directly after the web reader timed out. It still says both hot tubs are closed for maintenance. The visible dated card notice preserves that fact and the hotel is excluded from the “hot pools or tubs” filter. Brazen, Cascade Lounge and library are the relevant published facilities. The page is positioned for a central room/restaurant stay, without promising quietness, free parking or spa access.
- **Tunnel Mountain:** [Official room inventory](https://tunnelmountain.com/rooms/) lists full kitchens in selected condos and kitchenettes in Superior Suites, including the exact one-bedroom/loft bed configurations. [Official amenities](https://tunnelmountain.com/amenities/) supports the indoor pool, barbecues, guest laundry and local transit benefit. No hot tub, ski-in/out or default cabin kitchen is claimed.
- **Canalta:** [Room inventory](https://canaltalodge.com/stay/), [King with Sofa and Kitchen Loft](https://canaltalodge.com/stay/single-king-sofa-kitchen-loft-room/), [other King with Sofa Loft](https://canaltalodge.com/stay/single-king-sofa-loft-room/) distinguish full kitchen from fridge/microwave. [Courtyard](https://canaltalodge.com/courtyard/) lists the outdoor hot tubs, cold plunge and barrel dry sauna. The landing does not promise an indoor swimming pool, price or universal kitchen/pet eligibility.
- **Juniper:** [Room inventory](https://thejuniper.com/all-rooms/) distinguishes Standard forest/Mount Norquay side from Deluxe mountain-facing categories. [Amenities](https://thejuniper.com/amenities/) lists the outdoor hot tub and bistro. [Current transport page](https://thejuniper.com/transport-location/) supplies 1 Juniper Way, requested shuttle hours 10 AM–6 PM and the unmarked walking-route caveat (sections without sidewalks/lighting). This material base/return tradeoff is visible before the booking choice is complete.
- **Fairmont:** [Current hotel inventory](https://www.fairmont.com/en/hotels/banff/fairmont-banff-springs.html), [Gatehouse categories](https://www.banff-springs-hotel.com/stay/gatehouse/) and [guest services](https://www.banff-springs-hotel.com/stay/guest-services/) support distinct main-building/Gatehouse choices, Family Room king plus twin bunks, Family Suite primary bedroom/built-in bunks/two bathrooms, restaurants, ski/bike storage and separately arranged spa treatments. The page does not infer a full kitchen or sell the Spray Avenue location as central Banff Avenue.

All six existing official image URLs were downloaded to temporary evidence files and visually inspected again for the new captions. No new shared or public image asset was written. The images identify the actual property/content; the caption does not guarantee the pictured category in a booking.

| Property | Existing image | Observed content and treatment |
| --- | --- | --- |
| Moose | [Official suite image](https://moosehotelandsuites.com/wp-content/uploads/2026/07/One-bedroom-suite.jpg) | Suite living room with moose artwork; card caption identifies the category |
| Mount Royal | [Official Centennial image](https://www.banffjaspercollection.com/Brewster/media/Images/Hotels/Mount-Royal-Hotel/Rooms/RM-Centennial-Room-Two-Beds.jpg?ext=.jpg) | Two-bed room with quilt-pattern headboards; no hot-tub promotional photo |
| Tunnel Mountain | [Official resort image](https://tunnelmountain.com/wp-content/uploads/2026/06/Tunnel-Mountain-Resort-10.jpg) | Resort cabin/building exterior; no promise of allocated unit |
| Canalta | [Official courtyard image](https://canaltalodge.com/wp-content/uploads/CANALTA2_0120_WEB-1024x683.jpg) | Guests in an outdoor courtyard hot tub; accurately labelled as such |
| Juniper | [Official Deluxe King image](https://thejuniper.com/app/uploads/2026/05/King-Deluxe_result-1024x683.webp) | King room with mountain-facing window; also used as the named hero image |
| Fairmont | [Official guest-services image](https://www.banff-springs-hotel.com/content/uploads/2022/10/Guest-Services-Winter-Hero.jpg) | Guest room and bell service; the filename is not used to invent an exterior/winter-scene caption |

## Conversion and consent integration

- Each hotel has a native `<a href="…expedia.ca/…?camref=1101l3MtWX">`, `target="_blank"`, `rel="sponsored noopener"`, `data-landing-id="banff-hotels"` and `data-offer-id="<hotel-slug>"`. Property-specific accessible names identify the destination and new tab.
- Affiliate disclosure appears before the first affiliate booking anchor. Source and provider roles are clear. Prices, availability and booking terms come from Expedia after users choose their dates and party.
- The page imports root’s `PaidLandingLayout.astro` contract. Root owns common BaseLayout consent/measurement. The landing itself adds no analytics, ads, widgets, provider embeds, network tracking or storage. The filter script never intercepts a booking anchor, sends data, opens windows or replaces native navigation.
- Main hero CTA leads to the six-choice comparison. Hotel CTAs lead directly to the verified property pages; a directory/detail read is optional. There is no gate, form submission or account requirement on this page.
- Filters use native labelled selects, an announced count and a reset/empty-result path. Validated `?base=` and `?priority=` values support message matching. Repeated page initialization preserves active controls; invalid values leave all six choices visible. No filter progress is stored.
- Structured data describes the actual CollectionPage and unordered six-item comparison. It emits no rates, reviews, availability, offers or precise coordinates.

## Proposed high-intent Google/Bing message mapping

This is a proposal for campaign planning, not evidence of campaigns, spend, approval, traffic, sales or commission. No ad-account actions were taken. The same intent structure can be adapted separately in Google Ads and Microsoft Advertising. No search-volume, CPC, conversion-rate or return estimates are asserted.

| Intent / example search terms | Honest message direction | Page target | Page evidence supporting the message |
| --- | --- | --- | --- |
| “Banff hotels”, “book hotel Banff”, “Banff accommodation” | **Compare Banff Hotels** · Choose a base and room, then check dates on Expedia | `/book/banff-hotels/` | Six distinct Banff choices, native property CTAs and full room/base notes |
| “downtown Banff hotels”, “hotels Banff Avenue downtown” | **Stay in Central Banff** · Compare Moose and Mount Royal room choices | `/book/banff-hotels/?base=central#compare-hotels` | Matching 138/345 Banff Avenue addresses; two central filter results |
| “Banff hotels with kitchen”, “Banff condo hotel kitchen” | **Compare Kitchen Stays in Banff** · Check the exact kitchen-equipped room | `/book/banff-hotels/?priority=cook#compare-hotels` | Tunnel selected condos and Canalta named kitchen categories; full kitchen versus nook explained |
| “Banff hotel hot tub”, “Banff hotels rooftop hot pools” | **Compare Banff Soak Options** · Rooftop pools, courtyard tubs or a hillside hotel | `/book/banff-hotels/?priority=soak#compare-hotels` | Moose, Canalta and Juniper facility descriptions; closed Mount Royal excluded |
| “Banff family suite”, “Banff separate bedroom hotel” | **Find a Room Layout That Fits** · Compare bedrooms, bunks, sofa beds and cooking | `/book/banff-hotels/?priority=separate#compare-hotels` | Moose suite, Tunnel condo and Fairmont Family Suite categories; actual party still checked in quote |
| “Banff hillside hotel”, “Banff hotel mountain view” | **Compare Banff Hillside Bases** · Match room outlook and town transport | `/book/banff-hotels/?base=hillside#compare-hotels` | Juniper outlook distinction and Tunnel hillside base; only selected view categories named |
| Property-name comparison intent, e.g. “Moose Hotel Banff rooms” | **Compare Moose Room Choices** · Suite nook, living area and rooftop hot pools | `/book/banff-hotels/?base=central#stay-moose-hotel-suites` | Named card, official suite evidence and matched Expedia property; independent-guide identity remains visible |
| “Fairmont Banff Springs family room” | **Compare Gatehouse Family Layouts** · Check the exact room on Expedia | `/book/banff-hotels/?base=spray#stay-fairmont-banff-springs` | Family Room versus Family Suite, source links and matched merchant h13652 |

Avoid ad promises about a cheapest/best rate, a discount, free cancellation, a room being available or an included facility/package unless a separately current, exact offer establishes them. The landing intentionally makes none of those promises. “Mountain view” messages must explain that the selected view category matters; the filter itself does not guarantee a view.

## Focused checks and preserved files

`node research/check-banff-hotel-landing-2026-10-29.mjs` passes **79 assertions**, including the six source-reviewed identities/photos, all six merchant ID/address evidence contracts, exact affiliate targets, disclosure/native-link attributes, lack of unverified rate/review schema, SSR/no-JS content, native accessible controls, valid/invalid query handling, combined filters, truthful empty state, reset, repeated initialization and the actual client script. Astro transform reports zero diagnostics. Targeted `tsc --noEmit` of the new landing model passes. Root’s paid layout is present and the page uses its exact supplied prop/slot contract.

The focused check also protects these frozen foundation-file hashes; no existing file was changed for the landing task:

| Frozen file | SHA-256 |
| --- | --- |
| `src/data/hotels.ts` | `2fff1117432d359cfdfea771c5e36153dbf37107e9609e7d5430a7bd9eb34e48` |
| `src/data/hotelDirectory.ts` | `bba710c243ef3cd64256e51adb8d54898bf200bc0db8090c5b21b197ed44492f` |
| `src/pages/hotel-directory/index.astro` | `1125c296d95b40f218c4dad2f2a7af9dbbfc861bdd8a65677be7ba60a396dacf` |
| `src/pages/hotel-directory/[slug].astro` | `c5c80421cb748a2307520e698e128887f23c10c825a4cd51fa7b81c93d151b9d` |

New files only: page, model, this source/message note and the focused check. No shared configuration/layout/CI edits, Git action, full build, publish or ad spend was performed. Root owns final layout, browser/release validation and any later acquisition activation.
