# Winter shortlist hotel audit — 28 October 2026

Scope: the eight hotel records used by `/winter-stays`, in `src/data/hotels.ts`. This is an editorial verification record, not a live inventory feed. Official property pages were used for facilities, rooms, dining, access and policies. Expedia's own pages were used only to verify booking destinations. No rates, review scores or guest quotations were imported.

## Changes common to the eight records

- Removed ungrounded review scores/counts, `guestLoves`, renovation/build dates and unsupported room counts. Retained room counts only where the official property source supports them.
- Replaced undated nightly-rate strings with `Check your dates`. The `priceRange` symbols remain an editorial budget tier; they are not a quoted rate. No fixed pet, parking, resort or cancellation fee is asserted.
- Added or refreshed `officialUrl`, `checkedOn: 2026-10-28` and a property-specific `facilityNote`.
- Removed generic stock photographs and photographs that could not be identified as the property. All 21 retained photographs were extracted from the official pages below, fetched successfully as images and visually inspected. Lake Louise Inn's former Banff Springs photograph was contradictory and was replaced.
- Preserved names and slugs. Corrected Lake Louise Inn to its official contact-page coordinates, `51.4286653, -116.1848642`, and Fairmont Chateau Lake Louise to the coordinates linked by its official map, `51.416787, -116.212386`. Updated each record and its `knownCoords` override together. Other coordinates are unchanged. Preserved booking URLs except the two demonstrably wrong Lake Louise property IDs documented below.
- Classified Emerald Lake Lodge as **Yoho National Park, British Columbia**, rather than Lake Louise. Added the corresponding area metadata. This is a geographic distinction, not a suggestion of public transport between these places.

## Property evidence and material corrections

### Moose Hotel and Suites — `moose-hotel-suites`

The [official hotel overview](https://moosehotelandsuites.com/) supports 174 rooms, rooftop hot pools, an indoor pool, Meadow Spa, Pacini, complimentary parking and local Roam passes. The [Superior One Bedroom Suite page](https://moosehotelandsuites.com/superior-one-bedroom-suite/) describes a kitchen nook with microwave, mini-fridge and sink, rather than a full kitchen, plus a fireplace and shower without a bathtub. The [FAQ](https://moosehotelandsuites.com/faq/) qualifies parking availability, vehicle clearance, pets and local transit coverage. Lake Louise and Johnston Canyon services are additional journeys, not an unlimited extension of the local guest pass. Removed the unsupported parking charge and invented dining descriptions. Cancellation terms depend on the chosen rate and holiday period.

### Mount Royal Hotel — `mount-royal-hotel`

The [official property page](https://www.banffjaspercollection.com/hotels/mount-royal-hotel/) identifies Brazen and Cascade Lounge. Its hot-tub maintenance notice reported **both rooftop hot tubs closed** when checked on 28 October 2026. The [official amenities page](https://prod.banffjaspercollection.com/hotels/mount-royal-hotel/rooms/amenities/) also displayed the closure notice. The record labels it as dated and directs readers to confirm reopening. Removed the invented/outdated list of Wild Bill's, Tony Roma's and Rose & Crown as on-site restaurants. The [rooms page](https://www.banffjaspercollection.com/hotels/mount-royal-hotel/rooms/) supports the selected room photographs and current room information. Parking is limited; no reserved space or universal cancellation window is promised.

### Tunnel Mountain Resort — `tunnel-mountain-resort`

The [official overview](https://tunnelmountain.com/) supports 105 units and a mix of cabins, condos and suites. The [rooms](https://tunnelmountain.com/rooms/), [amenities](https://tunnelmountain.com/amenities/) and [FAQ](https://tunnelmountain.com/faq/) distinguish full kitchens in selected categories from the Superior Suite's smaller cooking facilities. They support the indoor pool, fitness facilities, laundry, BBQs, parking and Banff local Roam passes. Removed the unsubstantiated hot tub. The local pass does not cover every destination; ski-resort and regional journeys need their own schedule. Selected pets require advance arrangements. Do not apply an obsolete holiday cancellation deadline to every future booking.

### Blackstone Mountain Lodge — `blackstone-mountain-lodge`

The [official FAQ](https://www.blackstonelodge.ca/faq) is explicit: the heated pool and two hot tubs are **outdoors**, extreme cold can close the pool area, there is no hotel shuttle and there is no on-site restaurant/bar/room service. It also states there are no purpose-built accessible rooms or accessible showers/baths/grab bars, and the pool area is not wheelchair accessible. A [Deluxe Room](https://www.blackstonelodge.ca/rooms/deluxe-room) has a mini-fridge; it is not a suite kitchen. The [Two Bedroom Suite](https://www.blackstonelodge.ca/rooms/two-bedroom-suite) supports kitchen, laundry and separate living facilities for that category. Removed invented indoor-pool claims, universal suite amenities, guaranteed views, short-walk promises and generic free cancellation. Parking, resort fees and access must be confirmed for the booking.

### Lake Louise Inn — `lake-louise-inn`

The [official at-a-glance page](https://www.lakelouiseinn.com/at-a-glance/) supports 247 rooms, an indoor pool/whirlpools, three dining venues, parking and the winter ski shuttle. [Accommodation information](https://www.lakelouiseinn.com/accommodations/) distinguishes multiple buildings and categories: some standard accommodation is in three-storey walk-up buildings without an elevator. [Amenities](https://www.lakelouiseinn.com/amenities/) and [dining](https://www.lakelouiseinn.com/dining/) support category-dependent kitchens, dog-room restrictions, no personal BBQs, changing restaurant opening days and takeaway rather than room service. The [contact page](https://www.lakelouiseinn.com/contact/) supplies the corrected coordinates. This is a village hotel, separately located from both the lakeshore and the ski resort. [Ski Louise's shuttle page](https://www.skilouise.com/getting-here/by-shuttle/) had not yet supplied the coming winter's pickup details at review; the record does not invent a timetable. Removed universal elevator/enclosed-walkway assumptions, unsupported sauna/steam facilities and a misleading simple drive to Moraine Lake.

### Fairmont Chateau Lake Louise — `fairmont-chateau-lake-louise`

The [official overview](https://www.fairmont.com/en/hotels/lake-louise/fairmont-chateau-lake-louise.html) supports 539 rooms at Lake Louise's lakeshore. The [rooms page](https://www.fairmont.com/en/hotels/lake-louise/fairmont-chateau-lake-louise/rooms.html) distinguishes lake-view and Fairmont Gold categories; a lake view is not universal. [Guest services](https://www.fairmont.com/en/hotels/lake-louise/fairmont-chateau-lake-louise/guest-services.html) covers health-club facilities, parking, accessibility and category-specific services. [BASIN Glacial Waters](https://www.fairmont.com/en/hotels/lake-louise/fairmont-chateau-lake-louise/wellness/basin-glacial-waters.html) has its own guest access, booking and purchase conditions; a room does not automatically include every wellness experience. The [dining page](https://www.fairmont.com/en/hotels/lake-louise/fairmont-chateau-lake-louise/dining.html) displayed an exceptional **26–29 October 2026 registered-overnight-guests-only restriction**, recorded as a dated notice. Removed unverified construction/renovation dates, universal marble-bath/view claims and generic cancellation promises. Winter rentals and skating require a current operation check.

Final bounded review found that the exported map position still used the old `knownCoords` override, `51.4168, -116.1770`, approximately 2.5 km east of the lakeshore property. The address link on Fairmont's [official location/contact page](https://www.fairmont.com/en/hotels/lake-louise/fairmont-chateau-lake-louise/location-contact.html) points to [its Google Maps location](https://www.google.com/maps/dir//Fairmont%20Chateau%20Lake%20Louise,%2B111%20Lake%20Louise%20Drive,%20T0L%201E0,%20LAKE%20LOUISE,%20Canada/@51.416787,-116.212386,17z). Corrected both coordinate occurrences to `51.416787, -116.212386` on 28 October 2026. This is direct property-published map evidence, not an inferred village centroid.

### Sunshine Mountain Lodge — `sunshine-mountain-lodge`

The [official lodge page](https://www.skibanff.com/plan/lodging/sunshine-mountain-lodge-in-resort) establishes the on-mountain, ski-in/ski-out location at Sunshine's upper village. The [FAQ](https://www.skibanff.com/plan/first-time-visitors/faqs) describes base-area check-in, luggage transfer and gondola access; guests cannot drive a private car up to the lodge. After-hours arrangements require advance contact and may carry a charge. Gondola/lift entitlement depends on the booking, rather than an assumed inclusion. [Amenities](https://www.skibanff.com/plan/lodging/sunshine-mountain-lodge-in-resort/sunshine-mountain-lodge-amenities), [dining](https://www.skibanff.com/plan/lodging/sunshine-mountain-lodge-in-resort/dining) and the [guest directory](https://www.skibanff.com/plan-your-visit/sunshine-mountain-lodge-guest-directory) support the hot tub, sauna, current venues and luggage planning. Official pages displayed differing Friday evening gondola times, so no universal last-departure time is copied. Removed first-tracks/fresh-powder guarantees, unsupported room count/history and automatic package inclusions.

### Emerald Lake Lodge — `emerald-lake-lodge`

The [official overview](https://crmr.com/resorts/emerald-lake/) and [FAQ](https://crmr.com/resorts/emerald-lake/faq/) establish the Yoho, BC location, shared-area WiFi, no in-room WiFi/televisions, limited prebooked pet-friendly rooms and a shuttle from the overnight guest car park. That shuttle is not transportation from Banff or Lake Louise. [Accommodation](https://crmr.com/resorts/emerald-lake/accommodations/) distinguishes Lodge, Lodge Plus, Lake View and suite layouts. [Dining](https://crmr.com/resorts/emerald-lake/dining/) identifies Mount Burgess Dining Room and Kicking Horse Lounge, with Cilantro/The Window operating seasonally. Equipment rentals are independently operated and seasonal. Removed the incorrect no-pets policy, universal lake views/jetted baths/heated floors, unsupported fitness facility/count/history, a fixed drive-time promise and universal cancellation window. Confirm meals and outside-food restrictions before travel.

## Booking destination checks

All links keep the existing `camref=1101l3MtWX` helper or destination-search expression. Expedia pages are cited here as the primary authority for Expedia's own property IDs; hotel amenity copy above follows property sources.

| Record | Destination result | Action |
| --- | --- | --- |
| Moose | [Expedia h14703440](https://www.expedia.ca/Banff-Hotels-Moose-Hotel-And-Suites.h14703440.Hotel-Information) identifies Moose Hotel and Suites in Banff. | Preserved. |
| Mount Royal | [Expedia h688930](https://www.expedia.ca/Banff-Hotels-Mount-Royal-Hotel.h688930.Hotel-Information) identifies Mount Royal Hotel in Banff. | Preserved. |
| Tunnel Mountain | [Expedia h16324](https://www.expedia.ca/Banff-Hotels-Tunnel-Mountain-Resort.h16324.Hotel-Information) identifies Tunnel Mountain Resort in Banff. | Preserved. |
| Blackstone | [Expedia h2238263](https://www.expedia.ca/Canmore-Hotels-Blackstone-Mountain-Lodge-By-CLIQUE.h2238263.Hotel-Information) identifies Blackstone Mountain Lodge in Canmore. | Preserved. |
| Lake Louise Inn | [Expedia h74992](https://www.expedia.ca/Lake-Louise-Hotels-Lake-Louise-Inn.h74992.Hotel-Information) directly names Lake Louise Inn. | Corrected existing h16406 to h74992. The prior URL was not accessible; the replacement is provider-confirmed, not inferred from a name. |
| Fairmont Chateau Lake Louise | [Expedia h22503](https://www.expedia.ca/Lake-Louise-Hotels-Fairmont-Chateau-Lake-Louise.h22503.Hotel-Information) directly names the Chateau and places it at Lake Louise. | Corrected existing Banff path/h2594 to the provider's Lake Louise path/h22503. |
| Sunshine | [Expedia h894279](https://www.expedia.ca/Sunshine-Hotels-Sunshine-Mountain-Lodge.h894279.Hotel-Information) identifies Sunshine Mountain Lodge. | Preserved. |
| Emerald | Existing [Emerald Lake, BC destination search](https://www.expedia.ca/Hotel-Search?destination=Emerald+Lake%2C+BC&camref=1101l3MtWX). | Preserved as a destination search. It is not represented here as a verified direct property booking. |

## Retained image provenance

The first image per record is also its `image` card source. The filenames below identify the exact retained assets; links are the stored URLs. Remote availability and property branding may change. Source-page verification and successful image responses were checked on 28 October 2026.

| Record | Official source page | Retained asset / visual check |
| --- | --- | --- |
| Moose | [Hotel overview](https://moosehotelandsuites.com/) | [One-bedroom-suite.jpg](https://moosehotelandsuites.com/wp-content/uploads/2026/07/One-bedroom-suite.jpg): suite living room with moose artwork. |
| Moose | Same official page | [Superior-two-queen.jpg](https://moosehotelandsuites.com/wp-content/uploads/2026/07/Superior-two-queen.jpg): two-queen room. |
| Moose | Same official page | [Two-bedroom-suite.jpg](https://moosehotelandsuites.com/wp-content/uploads/2026/07/Two-bedroom-suite.jpg): suite living/dining space. |
| Mount Royal | [Rooms](https://www.banffjaspercollection.com/hotels/mount-royal-hotel/rooms/) | [RM-Centennial-Room-Two-Beds.jpg](https://www.banffjaspercollection.com/Brewster/media/Images/Hotels/Mount-Royal-Hotel/Rooms/RM-Centennial-Room-Two-Beds.jpg?ext=.jpg): Centennial twin-bed layout. |
| Mount Royal | Same official page | [RM-Centennial-Room-Bed-Quilted-Headboard.jpg](https://www.banffjaspercollection.com/Brewster/media/Images/Hotels/Mount-Royal-Hotel/Rooms/RM-Centennial-Room-Bed-Quilted-Headboard.jpg?ext=.jpg): Centennial room. |
| Mount Royal | Same official page | [RM-Junior-Suite-Lounge-Kitchenette.jpg](https://www.banffjaspercollection.com/Brewster/media/Images/Hotels/Mount-Royal-Hotel/Rooms/RM-Junior-Suite-Lounge-Kitchenette.jpg?ext=.jpg): Junior Suite lounge/kitchenette. |
| Tunnel Mountain | [Hotel overview](https://tunnelmountain.com/) | [Tunnel-Mountain-Resort-10.jpg](https://tunnelmountain.com/wp-content/uploads/2026/06/Tunnel-Mountain-Resort-10.jpg): cabin exterior. |
| Tunnel Mountain | Same official page | [Tunnel-Images-TemplateTunnel-Condo-480x640-copy.jpg](https://tunnelmountain.com/wp-content/uploads/2026/06/Tunnel-Images-TemplateTunnel-Condo-480x640-copy.jpg): condo dining area. |
| Tunnel Mountain | Same official page | [pool-800.jpg](https://tunnelmountain.com/wp-content/uploads/2024/08/pool-800.jpg): indoor pool. |
| Blackstone | [Hotel overview](https://www.blackstonelodge.ca/) | [dsc09851-hdr-edit-edit_standard.jpg](https://image-tc.galaxy.tf/wijpeg-2rzfwjutqeks28672csybkm5/dsc09851-hdr-edit-edit_standard.jpg?crop=112%2C0%2C1777%2C1333): two-queen room. |
| Blackstone | Same official page | [1brm-out_standard.jpg](https://image-tc.galaxy.tf/wijpeg-5i1sgaaz19h6kn8g7kxgc2g87/1brm-out_standard.jpg?crop=112%2C0%2C1777%2C1333): winter balcony outlook. |
| Blackstone | Same official page | [bs204106-orig.jpg](https://image-tc.galaxy.tf/wijpeg-93dfv60c0ky8ohe3ws7ifqmdy/bs204106-orig.jpg?width=960): guests at the outdoor hot tub. The homepage's gift-certificate graphic was excluded. |
| Lake Louise Inn | [Hotel overview](https://www.lakelouiseinn.com/) | [DSC0734-700x500-1.jpg](https://www.lakelouiseinn.com/wp-content/uploads/2026/04/DSC0734-700x500-1.jpg): property entrance with the Lake Louise Inn sign. Replaces the Banff Springs image. |
| Lake Louise Inn | Same official page | [lobby-area-700x500-2.jpg](https://www.lakelouiseinn.com/wp-content/uploads/2025/10/lobby-area-700x500-2.jpg): lobby. |
| Fairmont Chateau | [Hotel overview](https://www.fairmont.com/en/hotels/lake-louise/fairmont-chateau-lake-louise.html) | [Accor asset met_p_a099-82](https://m.ahstatic.com/is/image/accorhotels/met_p_a099-82:4by3?fmt=jpg&wid=1200&hei=900&qlt=80): the Chateau beside Lake Louise. Same official CDN asset with a smaller delivery size. Only one verified image retained. |
| Sunshine | [Lodge overview](https://www.skibanff.com/plan/lodging/sunshine-mountain-lodge-in-resort) | [SML_night2.jpg](https://www.skibanff.com/sites/default/files/styles/scale_1440/public/2026-10/SML_night2.jpg?itok=syhWXLHD): lodge at night. |
| Sunshine | Same official page | [West Wing Premier Room-8.jpg](https://www.skibanff.com/sites/default/files/styles/scale_1440/public/2026-08/West%20Wing%20Premier%20Room-8.jpg?itok=LtQK-fKP): West Wing Premier room. |
| Sunshine | Same official page | [West Wing loft asset](https://www.skibanff.com/sites/default/files/styles/scale_1440/public/2026-08/Sunshine%20Mountain%20Lodge%20SML%20West%20Wing%20Premiere%20Loft-UR-standard%20v2-4000w.jpg?itok=Pas1ESqt): loft layout. |
| Emerald | [Lodge overview](https://crmr.com/resorts/emerald-lake/) | [Emerald-Lake-Lodge-26-optimized.jpg](https://crmr.com/wp-content/uploads/2024/03/Emerald-Lake-Lodge-26-optimized.jpg): winter lakeside/bridge scene. |
| Emerald | Same official page | [Emerald-Lake-Lodge-jpg-optimized.webp](https://crmr.com/wp-content/uploads/2024/03/Emerald-Lake-Lodge-jpg-optimized.webp): guest room and fireplace. |
| Emerald | Same official page | [0M5A0128-website-1024x683-1-jpg-optimized.webp](https://crmr.com/wp-content/uploads/2024/03/0M5A0128-website-1024x683-1-jpg-optimized.webp): lodge lounge. |

## Source sanity / handoff

- Compared each top-level record with the pre-task local snapshot: **95 records**, the **87 non-shortlisted records byte-identical**. All eight names and slugs are unchanged.
- Eight primary images and thirteen additional gallery images returned image MIME types and were visually inspected. No generic stock or Banff Springs filename remains in these eight galleries.
- All eight records omit review/rate claims and carry the check date. The two verified Expedia ID corrections above are the only affiliate expression changes.
- Area metadata and the Lake Louise Inn and Chateau coordinate overrides are the narrowly necessary shared-data changes. Templates must accept the Yoho area and a single Fairmont image; parent integration handles those views.
- No page template edits, production writes or builds were performed in this audit task. Root integration owns the final build and browser checks.
