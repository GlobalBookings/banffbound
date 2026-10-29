# Lake Louise stays: affiliate-booking landing

Reviewed 29 October 2026. User objective supplied by root: **affiliate bookings first**, with future paid Google/Bing landing use. This is a new editorial comparison and native referral journey, not an activated ad, merchant booking, measured conversion, price feed or approved campaign. No ads, budget, account, host, Git or existing95hotel URLs changed.

## Bounded files and original visitor value

- New `src/pages/book/lake-louise-stays.astro` uses root-owned `PaidLandingLayout.astro` with the supplied title/description/eyebrow/heading/intro/primaryCta/heroImage/heroAlt interface and `hero-detail` slot. Hero CTA opens the on-page comparison, rather than silently selecting a merchant property.
- New `src/data/lakeLouiseLanding.ts` is a pure browser-compatible five-property comparison and fit model. It does not import the95-record directory into the client bundle or modify its data.
- New focused check plus this source record. Root owns the shared layout, consent/tracking, metadata, CI, build and deployment.

Five selected properties are among the **49 selected-fact-reviewed** directory profiles. The wider directory has additional location-only/former-name profiles; this landing does not claim those are full property reviews. No unreviewed hotel is promoted here.

The page adds a five-row quick comparison with native Expedia links, full server-rendered detail cards, explicit room and location tradeoffs, source links, a location/room/season fit control, quote-comparison guidance and four matched FAQ/schema answers. No account, freeform details, travel-party collection, localStorage or provider widget is introduced. Optional controls appear only once JavaScript initializes; all five cards, source notes and10property CTAs work without it.

The filter compares categories, not live availability, access suitability or a ranking. “Cooking” includes specified kitchen/kitchenette categories; it does not mean every room has a full oven kitchen. Mountaineer’s microwave/mini-fridge suite is excluded. Paradise is excluded from winter **cabin** results because its reviewed winter offer is suites. The two road bases remain explicitly different: Paradise is on Lake Louise Drive; Baker Creek is on the Bow Valley Parkway. No Lake Louise hotel is described as ski-in/ski-out, and no Sunshine/Yoho property is relabelled as Lake Louise.

## Primary operator evidence

### Fairmont Chateau Lake Louise

[Official rooms](https://www.fairmont.com/en/hotels/lake-louise/fairmont-chateau-lake-louise/rooms.html), [guest services](https://www.fairmont.com/en/hotels/lake-louise/fairmont-chateau-lake-louise/guest-services.html).

Lakeshore property at111LakeLouiseDrive. Standard, specifically named Lakeview, suite and Fairmont Gold categories differ. A generic reservation does not establish a lake-view room or every category benefit. Village and ski-resort journeys remain separate. No wellness admission, rental/rink operation, activity inclusion, views, packages or current access guaranteed. The inherited26–29Oct2026 dining restriction is not repeated as a permanent rule or extended beyond its dates.

### Lake Louise Inn

[Official accommodation/building/appliance details](https://www.lakelouiseinn.com/accommodations/), [at a glance](https://www.lakelouiseinn.com/at-a-glance/).

Village address210VillageRoad. Multiple buildings and room categories; standard accommodation in building4 is a walk-up and only selected buildings have elevator access. Named suites/condos have cooking facilities with appliances listed in the FAQ. No universal kitchen, stairs or access assumption. The operator distinguishes a **winter ski-resort shuttle** from a **summer lake-shuttle product**. The landing asks for dates, reservation/pickup/return terms and does not claim free universal transit or a guaranteed connection.

### Mountaineer Lodge

[Official hotel/buildings/breakfast/transport](https://mountaineerlodge.com/the-hotel/), [actual Mountaineer Suite](https://mountaineerlodge.com/rooms/mountaineer-suite), [policies](https://mountaineerlodge.com/the-hotel/hotel-policies).

Village address101VillageRoad. Main Lodge interior access versus Timber exterior entrances; no elevator. The specific suite lists microwave and mini-fridge, separate sleeping/living space and a sofa bed; no full kitchen inferred from the room inventory’s generic heading. Breakfast is available for purchase; no fixed amount copied. A ski shuttle is different from an airport, lakeshore or Moraine Lake transfer. The operator’s conflicting/implausible driving-time examples are not copied as journey guarantees.

### Paradise Lodge & Bungalows

[Suites](https://paradiselodge.com/suites/), [current winter page/arrival instructions](https://paradiselodge.com/paradise-lodge/), [cabins](https://paradiselodge.com/cabins/), [location](https://paradiselodge.com/about-paradise-lodge-bungalows/).

105LakeLouiseDrive, between village and lakeshore. Fairview/Temple have kitchen facilities, while Saddleback has a refrigerator/microwave convenience area. Current winter page offers **suite accommodation**, with historic cabins described as summer lodging. Winter check-in uses Cabin1 and limited desk hours; late arrival requires advance contact. No exact future opening dates or automatic shuttle inclusion. The operator’s natural-ice/activity marketing is not reused as a safety or operation guarantee.

### Baker Creek by Basecamp

[Official property/café/location](https://basecampresorts.com/bakercreek/), [Family Superior Two Bedroom Cabin](https://basecampresorts.com/room-details/baker-creek-family-superior-two-bedroom-cabin/).

BowValleyParkway location outside the village. Cabins and suites differ. The current named cabin lists a kitchenette with mini-fridge, microwave and hotplate; do not call it an oven kitchen or infer that equipment in every unit. The current café is grab-and-go breakfast/lunch/snacks, not evidence of the former full Bistro dinner offer. That cabin page describes limited Wi-Fi, potentially patchy mobile service and no in-room phone; the page asks travellers to check communication needs. Rink, snowshoe and other seasonal activity marketing is not treated as guaranteed operation. Road conditions, groceries, dinner and a property-specific transfer/return are material booking choices.

## Expedia identity evidence and landing-only targets

Merchant research used bare public property pages, without affiliate click parameters. Name and address were compared to the operator identity. No dates, rates, review scores, guest quotes, refundable conditions or booking availability were copied. The published landing target adds **only `camref=1101l3MtWX`** to the confirmed property path.

| Property | Expedia public identity | Address match |
| --- | --- | --- |
| Fairmont Chateau Lake Louise | [h22503](https://www.expedia.ca/Lake-Louise-Hotels-Fairmont-Chateau-Lake-Louise.h22503.Hotel-Information) |111LakeLouiseDrive|
| Lake Louise Inn | [h74992](https://www.expedia.ca/Lake-Louise-Hotels-Lake-Louise-Inn.h74992.Hotel-Information) |210VillageRoad|
| Mountaineer Lodge | [h5157510](https://www.expedia.ca/Lake-Louise-Hotels-Mountaineer-Lodge.h5157510.Hotel-Information) |101VillageRoad|
| Paradise Lodge & Bungalows | [h7829397](https://www.expedia.ca/Lake-Louise-Hotels-Paradise-Lodge-Bungalows.h7829397.Hotel-Information) |105LakeLouiseDrive, Box7|
| Baker Creek by Basecamp | [h7710611](https://www.expedia.ca/Lake-Louise-Hotels-Baker-Creek-Mountain-Resort.h7710611.Hotel-Information) |BowValleyParkway|

The previous global Mountaineer/Paradise/Baker targets contain IDs893459/893466/6584769. The research tool could not retrieve those exact old paths. Different IDs plus inaccessible retrieval are an unresolved identity check, **not proof that a particular wrong property is returned**. Root was notified. All existing95global URLs remain untouched; the new landing has independently sourced property targets. All five landing targets were identifiable, so no property CTA needed an uncertain search-destination label. The page nevertheless tells the visitor to match the returned address and room.

Property photographs reuse the exact current reviewed directory image URLs; no new asset, inferred picture identity or third-party widget was added. Each card explains that the photographed room/facility is not a booking inclusion; hero caption names the Chateau lakeshore image rather than implying all five properties have that location.

## High-intent keyword/message mapping (planning only)

| Search intent | On-page message / useful entry context | Honest handoff |
| --- | --- | --- |
| Lake Louise hotels / accommodation / where to stay | Five actual bases, quick location-and-room comparison | Named property Expedia CTAs |
| Lake Louise village hotels | `?stay_base=village`: Lake Louise Inn vs Mountaineer, buildings/kitchens/breakfast choices | Correct VillageRoad property identities |
| Fairmont Chateau Lake Louise / Lake Louise lakeshore hotel | `?stay_base=lakeshore`: lakeshore address and explicit Lakeview-category decision | Chateau h22503, no view/package claim |
| Lake Louise hotels with kitchen / self-catering stay | `?stay_room=cooking`: category/appliance comparison | Inn, Paradise and Baker categories; no full-kitchen universal claim |
| Cabins near Lake Louise | `?stay_room=cabin`: two distinct road-base options with season selection | Explicit Parkway versus LakeLouiseDrive locations |
| Winter cabin near Lake Louise | `?stay_room=cabin&stay_season=winter`: Baker Creek cabin layout; Paradise winter suites distinguished | No cabin opening or availability guarantee |
| Lake Louise ski hotel / winter stay | `?stay_season=winter`: actual hotel-to-resort journey and morning/return checks | Room-only unless selected rate includes extras |

Do not turn this into “lowest price”, “last-minute deal”, “free cancellation”, “ski-in/ski-out Lake Louise”, “all-inclusive ski package” or a commission claim. Those require evidence about the actual product/rate/merchant terms that this editorial landing does not supply. No ad settings, keywords, negative keywords, tracking IDs or spend were changed by this task.

## Tracking and validation contract

Every property merchant CTA (quick table and detailed card) has `data-landing-id="lake-louise-stays"` and `data-offer-id="<hotel-slug>"`, plus a native href/target/`rel=sponsored`. The client only filters cards and updates its own whitelisted URL parameters. It never rewrites merchant links or waits for tracking. Existing campaign parameters on the landing URL remain intact through reset; no ad/party/dates are inserted into merchant URLs. Shared consent/tracking remains root-owned.

`node scripts/check-lake-louise-landing.mjs` passed: five selected reviewed identities/images; pinned property IDs and affiliate parameters;36validated filter combinations; cooking and winter-cabin distinctions; zero-result language; native CTA/disclosure/FAQ/SSR contracts; Astro compiler diagnostics0; actual script filter/count/notes/empty/reset, validated URL restore, campaign-query preservation and repeat-init guard. Strict standalone TypeScript check of the data module passed. Checks use no network or full build. They verify local contracts; the public merchant evidence above is a dated manual source check, not an automated live inventory assertion.
