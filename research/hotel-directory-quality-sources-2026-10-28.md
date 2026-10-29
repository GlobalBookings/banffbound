# Hotel directory: bounded property review

Checked **28 October 2026**. This is a source review, not a live availability, room-accessibility or booking test. Only four existing records were revised: `douglas-fir-resort`, `rundle-mountain-lodge`, `hi-lake-louise-alpine-centre` and `banff-boundary-lodge`. No Sandman Canmore record exists in `src/data/hotels.ts`; no property was invented. The eight records reviewed in `winter-hotel-sources-2026-10-28.md` were preserved.

Undated nightly quotes, ungrounded review scores/counts and “guest loves” statements, unsupported room counts/building dates and promotional first-person-style judgments were removed from these four records. `$` tiers remain editorial categories, not rate quotes. HI Lake Louise and Boundary Lodge had no verified star classification, so their star fields were removed; the type permits an absent classification. Douglas Fir and Rundle retain the property classes shown by Expedia, without using its guest-review scores.

## Douglas Fir Resort and Chalets

- [Official amenities](https://douglasfir.com/amenities/), [waterpark](https://douglasfir.com/amenities/indoor-waterpark/), [accommodation categories](https://douglasfir.com/accommodations/), [FAQ](https://douglasfir.com/faq/), [reservations](https://douglasfir.com/reservations/) and [dog policy](https://douglasfir.com/about/pet-policy/) establish the Tunnel Mountain Drive address, distinct studio/condo/loft/chalet categories, kitchens, different fireplace types, guest-only waterpark, local Roam passes, playpens on request and limited dog-friendly outside condos booked by phone with advance approval. Dog rules include a maximum of two, designated inventory and charges; online room inventory must not imply pet eligibility.
- **Dated status:** the official waterpark page advertises maintenance closure **26–30 October**, without a year in its visible notice. The [property's Expedia listing](https://www.expedia.ca/Banff-Hotels-Douglas-Fir-Resort-And-Chalets.h904421.Hotel-Information) identifies this as **2026**. The record states the check date, preserves this distinction and asks visitors to confirm reopening. The separate guest-pool FAQ is marked closed. Published official waterpark hours differ, so no fixed schedule or open-on-arrival promise is reproduced.
- The waterpark page requires guests aged 17 and under to be supervised by an adult aged at least 18. The FAQ says no cribs and lists playpens on request for children up to age three. No universal cancellation window, pet fee, parking guarantee, shared steam room or all-regional-bus entitlement is asserted.
- The former generic Banff Expedia search was replaced with the directly verified property page **h904421**. `camref=1101l3MtWX` is retained. The operator's direct dog-room approval remains necessary even though the provider's ordinary inventory says pets are not allowed.

## Rundle Mountain Lodge

- [Official home](https://rundlemountain.com/), [rooms](https://rundlemountain.com/rooms/) and [the lodge](https://rundlemountain.com/the-lodge/) establish **1723 Bow Valley Trail, Canmore**, an **indoor pool**, coin laundry, WiFi and designated pet-friendly rooms. A shared outdoor hot tub was not substantiated and was removed. The Jacuzzi Suite's hot tub is an **in-room** feature, not a general facility.
- Selected kitchenette categories have different equipment: some list a cooktop and others a stove/oven. The record does not turn that into an all-rooms kitchen promise. The official site prints conflicting postal codes and ambiguous reception hours; neither is presented as a reliable check-in window. Guests are asked to confirm arrival/access needs, pets, parking, meal inclusions and the selected rate's terms.
- [Travel Alberta's official listing](https://www.travelalberta.com/listings/rundle-mountain-lodge-11278) identifies the property and its entrance/courtyard photos. It lists year-round availability and seasonal outdoor gathering facilities; outdoor use remains subject to current restrictions.
- The former Canmore destination search was replaced with the directly verified [Expedia property page h4371137](https://www.expedia.ca/Canmore-Hotels-Rundle-Mountain-Lodge.h4371137.Hotel-Information), retaining the affiliate ID. No rates or provider-review scores were copied.

## HI Lake Louise Alpine Centre

- [Official property page](https://hihostels.ca/en/hostels/hi-lake-louise) (also reachable through the [legacy destination URL](https://hihostels.ca/en/destinations/hi-lake-louise)) establishes year-round operation at **203 Village Road**, check-in from **16:00**, check-out **11:00**, shared/private/family categories, kitchens, Bill Peyto's Café, storage/waxing facilities and other listed communal amenities.
- Categories include **Ensuite WC**. A WC label must not be expanded into an all-rooms private-shower claim. Guests should confirm precise bathroom and bed/access arrangements. The hostel is in the village, separate from the lakeshore and ski resort. No all-season lake/Moraine Lake transfer or guaranteed ski-shuttle schedule is promised.
- [Property-specific booking terms](https://hihostels.ca/en/booking-terms-and-conditions/hi-lake-louise-alpine-centre-booking-t-c) require an adult primary booker and parent/guardian accompaniment for under-18s. Ages 12 and under require a private room or privatized dorm; ages 13–17 may share with a parent/guardian. The terms prohibit pets with an exception for certified guide/service dogs. Direct bookings receive the member rate and membership is included; the old nonmember surcharge assertion was removed. Rate/channel-specific cancellation terms replace the unsupported universal 48-hour rule.
- The former `totalRooms:164` confused a claimed bed inventory with rooms. The [2024 official fact sheet](https://hihostels.ca/upload/images/docs/Hostel-Fact-Sheets/HILakeLouise-FactSheet_2024.pdf) itself reports a different bed count; no current room or bed count is carried forward.
- **Unresolved provider identification:** the existing Expedia **h7700312** could not be independently confirmed by the available public page/search. There was no direct contradictory property-ID evidence, so it was preserved rather than replaced with a guessed ID. The record exposes this limitation and links the official property site. This link should not be described as independently verified until a direct provider identity match is obtained.

## Banff Boundary Lodge

- The [Municipal District of Bighorn Harvie Heights area plan](https://www.mdbighorn.ca/DocumentCenter/View/4629/Bylaw-21-24-Harvie-Heights-ARP), Figure 5, locates the lodge in **Harvie Heights**, a separate community from Banff town. [PEKA's property-management page](https://peka.ab.ca/client-portal-condo/boundary) identifies the condominium property; its Canmore office address is not the lodge address and its generic header photo is not accepted as a lodge photo.
- The [MD's official emergency-plan table, zone Z14](https://mdbighorn.ca/AgendaCenter/ViewFile/Agenda/_08182025-921) identifies **Banff Boundary Lodge parking lot, 1000 Harvie Hgts Rd**, at **51°07.547′ N, 115°23.244′ W**. Converted to decimal degrees: **51.125783, -115.387400**. This directly contradicts the old record location. Both the record and its new `knownCoords` entry use this official parking-lot point; it is a property locator, not an entrance/accessibility or collection-point instruction for visitors.
- Area was corrected from `Downtown Banff` to the existing `Bow Valley` category. The five-minute Banff-town drive claim, unsupported simple-room inventory, cheapest-rate claims, blanket no-pet/free-parking assertions and guessed facility/arrival policies were removed.
- Current property-wide accommodation/booking policies could not be verified. The `.ca`/`.com` property domains did not return a usable official accommodation page during this review. The profile makes unit/manager-specific verification explicit instead of inferring facilities, pet acceptance or check-in from unrelated rentals.
- Expedia now opens an accurately labelled **Harvie Heights destination search** with the preserved affiliate ID. It is not a verified unit or property booking. Search results for individual condo IDs were not substituted as a building-wide property ID.
- **No verified usable official property photo was found.** The old Bynder filename explicitly named **Canoe Hotel**, and the remaining images were generic stock. They were removed: `image:''`, `images:[]`. Templates must provide a text/neutral fallback and must not display another property's photo.

## Image provenance and visual review

Six source images were downloaded unchanged into the new, scoped `public/images/hotels/` directory and opened for visual inspection before use. They are property images identified by an official property/tourism page, not evidence that a specific room or facility will be available for a visitor's dates. No images were generated and no generic stock galleries remain in the four audited records.

| Local file | Verified source image | Visual check |
| --- | --- | --- |
| `douglas-fir-official-winter-exterior-2026-10-28.jpg` | [Operator winter exterior](https://douglasfir.com/wp-content/uploads/DFRWinter_8JX2nF21.jpg), published on the official site | Snow-covered resort lodge with mountain backdrop |
| `douglas-fir-official-room-2026-10-28.jpg` | [Operator room image](https://douglasfir.com/wp-content/uploads/Douglas-Fir-Resort-And-Chalets-photos-Room-1.jpeg), official site | Actual room with kitchen and fireplace; representative category only |
| `hi-lake-louise-official-exterior-2026-10-28.webp` | [Official hostel exterior](https://hihostels.ca/upload/images/hostels/AB/lake-louise/_1280xAUTO_fit_center-center_none_ns/567753/HILakelouise_2025_secondary_exterior02.webp), official property gallery | Timber hostel exterior and approach |
| `hi-lake-louise-official-lounge-2026-10-28.webp` | [Official hostel lounge](https://hihostels.ca/upload/images/hostels/AB/lake-louise/_640xAUTO_fit_center-center_none_ns/567768/HILakelouise_2025_mainlounge2.webp), official property gallery | Timber lounge, fireplace and pool table |
| `rundle-mountain-travel-alberta-entrance-2026-10-28.jpg` | [Travel Alberta entrance image](https://cdn.sanity.io/images/lr9tta69/production/b47f923f11549535e4ac203bff53e80446e25cfe-640x480.jpg?w=1920&q=77&fit=max&auto=format), official listing | Rundle Mountain Lodge sign and entrance visible |
| `rundle-mountain-travel-alberta-courtyard-2026-10-28.jpg` | [Travel Alberta courtyard image](https://cdn.sanity.io/images/lr9tta69/production/77cb70b50604222e3185eb644eb23959af3c5bcf-640x480.jpg?w=1920&q=77&fit=max&auto=format), official listing | Same signed lodge, courtyard and mountain backdrop |

The Rundle operator's published photo URLs could not be downloaded because its TLS handshake failed; the HTTP host returned an ISP warning page, which was not used or bypassed. Official Travel Alberta images supplied a verified alternative. Boundary's management-company header and other hotels' images were rejected.

## Integration notes and bounded checks

- Initial handoff: existing `Hotel-Search` links needed destination-search wording and Boundary needed photo fallbacks. The directory template follow-up below now implements these changes.
- Initial inspection found that the legacy coordinate loop overwrote explicit record coordinates unless the slug had a `knownCoords` entry. A later export regression check established that **seven**, rather than all eight, previously reviewed hotels had retained manual/source points. Tunnel Mountain Resort was still receiving a generated point; the follow-up below corrects it.
- No booking, test conversion, account mutation, build or publication was performed. Focused static checks cover TypeScript syntax, record identity/preservation, image existence and affiliate parameters; release integration is owned by root.
- Check results: **95** slug/name identities and source order preserved; exactly the four scoped records changed, with the other **91** (including the previously reviewed eight) preserved byte-for-byte. In-memory TypeScript transformation/export inspection passed; all 95 Expedia URLs retain `camref=1101l3MtWX`; all six local files decode as their expected image format. Boundary's exported point/search destination/empty image were asserted. `git diff --check` passed. These are source/data checks, not a production or booking verification.

## Directory template and coordinate follow-up — 29 October 2026

Expanded authorization covers `src/pages/hotel-directory/index.astro`, `[slug].astro` and the existing data/source record. No additional property research or booking was performed. The HI Expedia ID remains unresolved on the existing evidence and is unchanged.

### Exported data contract

```ts
lat?: number | null;
lng?: number | null;
coordinateStatus: 'source-verified' | 'indicative' | 'unavailable';
coordinateSource?: string;
coordinateCheckedOn?: string;
coordinateNote?: string;
```

`hotelRecords` is private; the public `hotels` array retains the 95 slug/name identities and source order. Normalization returns paired finite numbers only for a documented point or a retained legacy manual `knownCoords` entry. Other records return paired `null` values. Consumers must check finite coordinates and the status; the presence of a facilities `checkedOn` date does **not** verify coordinates.

- **3 source-verified:** Fairmont Chateau Lake Louise, Lake Louise Inn and Banff Boundary Lodge. Their sources, check date and locator/access caveats are returned alongside the point. They alone receive precise `geo` in directory-detail schema.
- **50 indicative:** existing manual `knownCoords` entries without independently documented coordinate provenance. Their numbers are preserved, shown as hollow gold circles with explicit indicative wording, and excluded from precise schema geo.
- **42 unavailable:** no independently documented point or retained manual `knownCoords` entry. No area centroid, spiral offset or unverified inline pair is substituted. They remain in the complete filterable grid but have no marker or schema geo.
- **Tunnel Mountain Resort correction:** the old exported point `51.186, -115.555` was generated from the first Tunnel Mountain spiral offset, rather than a reviewed point. Its inline record says `51.1825, -115.554`, but that pair also lacks source provenance. Root explicitly approved removing the generated point: exported coordinates are now `null`/`unavailable`. All eight reviewed hotels retain their editorial fields, photos and booking URLs, and the other seven retain their prior exported coordinate numbers.

The map explains point provenance and incomplete coverage, counts mapped versus total matching results, fits the retained matching points, differentiates source pins from indicative circles, and directs visitors to confirm actual addresses/arrival routes. The same provenance note appears on detail pages. Neither a marker nor schema point establishes an entrance, parking location or accessible arrival route.

### Photo and provider-link integration

- Blank photos produce a neutral text fallback across the detail hero, directory grid, related-property cards and map popups. Empty gallery entries are filtered; blank schema `image` is omitted. Local schema image paths are made absolute.
- Every Expedia `Hotel-Search` handoff is labelled **Search the area on Expedia**, with an explanation that results can include other properties and require an exact property/address/unit check. Provider property IDs and affiliate parameters are preserved.
- No-JavaScript content includes the complete 95-profile grid and detail/source/booking information. Inactive filters and map switches remain hidden until their script is ready. A library error or timeout restores the filtered grid with a retry message; late obsolete loads cannot create duplicate maps. View buttons expose pressed state and markers retain keyboard metadata.

### Bounded verification results

Both assigned Astro sources transformed with **zero compiler diagnostics**, and a focused TypeScript `tsc --noEmit` check of `src/data/hotels.ts` passed. An in-memory data export check verifies the coordinate/status counts, absence of generated points, all 95 affiliate parameters and the reviewed-eight preservation exception above. A controlled DOM/Leaflet harness ran the actual directory client script and detail frontmatter: **358 assertions passed**, covering combined/reset/URL filters, filtered map bounds, null/string coordinates, photo/schema fallbacks, destination-search wording, map failure/timeout/retry/late-load behavior and toggle state. All 95 schemas were examined; exactly three include precise geo. `git diff --check` passed. No site build, publication, booking or conversion test was performed; production/browser integration remains root's release step.
