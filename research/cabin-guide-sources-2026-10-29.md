# Cabin stay guide — source review, 29 October 2026

Full replacement of the canonical `banff-cabin-rentals` body, retaining its 7 January 2026 publication date. The former unsupported savings percentages, price ranges, generic kitchens/hot tubs, cabin-capital ranking, implied cheapest base and universal transfer assumptions are removed. This is a six-example category comparison, not live inventory or an exhaustive property ranking.

## Primary evidence and exact scope

- [Tunnel Mountain Mountain Cabin](https://tunnelmountain.com/mountain-cabin/): freestanding chalet, queen bedroom/loft with two double beds, full kitchen and category equipment. [Amenities](https://tunnelmountain.com/amenities/) and [FAQ](https://tunnelmountain.com/faq/) distinguish local Roam passes from regional services. Old holiday terms in the FAQ are not copied as current booking rules.
- [Castle Deluxe One Bedroom](https://www.castlemountain.com/rooms-deluxeonebedroomchalet.html): named unit's king bedroom, sofa bed, stove/oven, full fridge and dishwasher. [FAQ](https://www.castlemountain.com/faqs.html) supports the separate road base, winter planning and self-catering. Exact rates, timing, pet fees and generic activity safety prose are not carried forward.
- [Baker Creek Family Superior Two Bedroom](https://basecampresorts.com/room-details/baker-creek-family-superior-two-bedroom-cabin/): two bedrooms, queen/bunk arrangements, mini-fridge/microwave/hot plate rather than an asserted full oven kitchen. [Property page](https://basecampresorts.com/bakercreek/) lists the Parkway location, Creekside Café and conditional winter amenities. The corporate Canmore footer is not the property address.
- [Paradise historic cabins](https://paradiselodge.com/cabins/): Wilson's convenience area differs from other named cabin kitchens. [Winter page](https://paradiselodge.com/paradise-lodge/) expressly distinguishes summer historic cabins from winter suites. Winter filtering removes the selected cabin, not the whole property; the operator's natural-rink marketing is not repeated as permission or safety advice.
- [Storm cabins](https://stormmountainlodge.com/logcabins/): no cabin kitchens, indoor/outdoor cooking prohibited, no fridge/coffee maker/Wi-Fi; winter driveway caution. [Contact](https://stormmountainlodge.com/contact/) and home page have differing reduced-season patterns, so actual nights/meals require direct confirmation. No universal daily operation or meal rate is invented.
- [Cathedral FAQ](https://www.cathedralmountainlodge.com/frequently-asked-questions/): summer operation, Yoho/Field BC, no regular lodge shuttle, room-specific family/loft requirements and meal reservation arrangements. [Accommodation](https://www.cathedralmountainlodge.com/accommodation/) supports category links. The meal-led filter recommends a food plan; it does not assert an unverified no-kitchen facility fact.

## Commercial and image handling

Three Expedia property URLs exactly reuse the separately verified Banff/Lake Louise landing identities (Tunnel h16324, Baker h7710611, Paradise h7829397), with camref1101l3MtWX preserved. No other named Expedia identity is newly claimed verified; Castle, Storm and Cathedral link to the operator directly. Each source-reviewed directory profile is linked, and all 95 underlying hotel records/URLs remain untouched. The three merchant destinations do not establish availability of the named cabin category.

Property photos reuse the exact current reviewed gallery URLs, captioned as gallery examples rather than booked inclusions. The legacy article hero is qualified as illustrative and omitted from Article image claims. No image-reuse licence is asserted by the source review.

## Interactive behavior and verification

The server emits all six cards, sources, native booking links and five matching visible/schema FAQs. The conditional client adds three filters, count/notes, empty state and reset. Winter excludes the two known summer-cabin examples; remaining results still require actual-date and opening confirmation. URL dimensions are allowlisted, duplicate/invalid values normalize safely, unrelated campaign parameters/hash survive, and controls work if History API changes are blocked. No storage, external SDK or purchase event is added.

`check-cabin-planning.mjs` exercises the actual model and client over 60 combinations, native destination IDs, source/profile/image identities, SSR and FAQ parity, URL restoration, reset, blocked history, incomplete DOM and idempotence. A successful build/test is not a booking, commission, advertising approval or ranking result.

Browser review also exposed generic Banff mid-article/sticky promotions inside authored comparisons and Jasper pages. The shared layout now leaves authored booking routes in place and uses fixed Jasper or Lake Louise-area native fallback searches where appropriate. The optional provider SDK configuration and consent gate are unchanged. `check-article-booking-context.mjs` checks actual SSR/native destinations and the real inline suppression gate as well as unchanged default behavior; no reader query values enter provider links.
