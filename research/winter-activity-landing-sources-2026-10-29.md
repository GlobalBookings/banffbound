# Banff winter activity booking landing — source review, 2026-10-29

## Scope and handoff

NEW files only: `src/pages/book/banff-winter-activities.astro`, `src/data/winterActivityLanding.ts`, `scripts/check-winter-activity-landing.mjs` and this note. Earlier cycling, verifier, trail, activity and blog files are unchanged. Root owns `PaidLandingLayout.astro`, common consent/tracking, shared metadata/config/CI and the combined build/publication.

Exports: `winterActivityLandingId`, `winterActivityReviewedAt`, `winterActivityCampaign`, `winterActivityPartnerId`, strict `winterActivityBookingUrl`, `winterActivityOffers`, `winterActivityFaqs`, `winterActivityMessageMap`, the current canyon bulletin URL, and `winterActivityExperienceOptions`, `normaliseWinterActivityExperience`, `buildWinterActivitySelection` for the progressive preference filter. Landing ID is `banff-winter-activities`; booking anchors carry that `data-landing-id` plus stable `data-offer-id=gyg-<productID>`. The shared layout's internal hero CTA points to `#experiences`; it does not represent a product booking. All six outbound product CTAs are native links, with placement `detail-card` on the three card CTAs and `final-shortlist` on the final three links.

Three exact marketplace product identities/public booking entries were verified. No participant/date inventory was submitted, no checkout/payment was attempted, no availability or commission was proved, and no affiliate conversion was generated. Product existence and a date-selection interface are not a guarantee of a particular departure.

## Offer identity and independent operator evidence

| Stable offer / exact GYG product | Supplier identity verified on that product | Operator source and scope used for original comparison |
| --- | --- | --- |
| `gyg-303253`: [Banff: Morning or Afternoon Johnston Canyon Icewalk](https://www.getyourguide.com/banff-l284/banff-morning-or-afternoon-johnston-canyon-icewalk-t303253/) | Discover Banff Tours; product ID 303253 | [Discover Banff Tours Johnston Canyon Icewalk](https://banfftours.com/activities/johnston-canyon-icewalk/). Guided winter canyon walking, catwalk/path setting, winter traction equipment and Banff transport format. No published price, rating, hours-long duration, minimum-age guarantee or availability is copied. Actual selected departure requirements remain on the booking option. |
| `gyg-256607`: [Banff: Banff Gondola Admission Ticket](https://www.getyourguide.com/banff-l284/banff-banff-gondola-admission-ticket-t256607/) | Pursuit Collection; product ID 256607 | [Pursuit Banff Gondola](https://www.banffjaspercollection.com/attractions/banff-gondola/) and [hours/location](https://www.banffjaspercollection.com/attractions/banff-gondola/hours-location/). Sulphur Mountain attraction from Mountain Avenue, indoor interpretation plus outdoor areas; operating and outdoor-access checks, separate ticket/meal/transport questions. No guaranteed visibility, winter free shuttle or free cancellation claim. The current marketplace page and direct operator have restrictive cancellation language, so a generic cancellation benefit would be particularly misleading. |
| `gyg-437912`: [From Banff: Winter Wonderland; Lake Louise & Johnston Canyon](https://www.getyourguide.com/banff-l284/from-banff-winter-wonderland-lake-louise-johnston-canyon-t437912/) | Radventures; product ID 437912 | [Radventures Winter Wonderland](https://www.radventurescanada.com/day-tours/winter-wonderland/). Guided road outing, Lake Louise/Johnston corridor, condition-dependent outdoor stops and selected Banff pickup format. The operator's direct page and reseller details differ on pickup, equipment/skates and food; those inclusions are not promised across sales channels. Readers must check the exact GYG option. No lake-ice permission or guaranteed skating/snowshoe/wildlife claim is imported from marketing copy. |

These are product-level deep URLs, not destination/category searches. The superseded wildlife product `t437687` resolved to a generic GYG page during review and was rejected. Broad multi-stop listings advertising Hot Springs or Moraine Lake were not substituted for the winter-specific products because their seasonal/inclusion claims needed further checking. Nothing implies a direct affiliate relationship with the operators themselves.

The public GYG pages were consulted for product identity, supplier and link verification. Original comparative copy uses operator facts plus practical decisions: walking versus ride-based attraction versus road day, actual travel base, group needs and return plan. No platform descriptions, guest reviews, photographs, price/rating databases or branded design were reproduced.

## Current access and booking caveats carried into the page

[Parks Canada's Johnston Canyon closure bulletin](https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c), read 2026-10-29, issued October 13, lists the trail/day-use area, washrooms and P1 closed for construction through a scheduled December 11, 2026 end. The page expressly does not confirm reopening. The **notice before the first booking CTA on each affected offer** explicitly states that the trail/day-use area is closed October 13 to a scheduled December 11, reopening is unconfirmed, and the operator must confirm the route for the selected date. The dated source and explanation also appear below the comparison. A product calendar does not override that closure.

The Gondola's current operator hours page is date-specific and subject to change; no fixed operating schedule is copied. Summer transport promotions do not establish winter inclusion. The Radventures direct page's selectable Banff hotel collection does not prove the same pickup on every reseller option. Ice, skating, snowshoeing and views remain conditional rather than promised. No opening-date, wildlife, natural-ice safety or eligibility verdict is generated by this landing.

## Affiliate links and campaign label

The existing partner ID is preserved exactly: `partner_id=QW960HO`. Every booking link adds only the static page campaign `cmp=banffboundwinteractivities`; it contains no search query, visitor/device identifier, ad click ID, personal data or dynamically supplied campaign value. Public [GYG deep-link guidance](https://partner.getyourguide.support/hc/en-us/articles/13981115676061-Deep-links-101) documents product deep links, manual `partner_id` construction and optional campaign names/reporting. The existing `cmp` convention is retained; no integration analyzer, account report or commission attribution was accessed or validated.

Prominent disclosure appears in the hero detail and booking section. CTA text identifies GetYourGuide as the booking destination; `rel="noopener sponsored"` marks affiliate links. BanffBound does not process the purchase, claim exclusive rates, use prices/ratings/savings or assert any universal cancellation policy. Native product links work without an optional partner widget, JavaScript click interception or enabling affiliate embeds. Shared consent and tracking remain root-owned.

## Keyword/message-to-page map (planning only)

| Intent example | On-page promise | Target |
| --- | --- | --- |
| Banff winter activities / things to do in Banff in winter | Compare three formats, journey and group fit, then choose a date | `#experiences` |
| guided Johnston Canyon ice walk / Johnston Canyon winter tour | Guided canyon walk with walking/access/date checks | `#johnston-icewalk` |
| Banff gondola winter tickets / Sulphur Mountain sightseeing tickets | Attraction admission, Mountain Avenue approach and selected ticket | `#banff-gondola` |
| Banff Lake Louise winter day tour | Guided road outing, actual pickup and condition-dependent stops | `#winter-wonderland` |

These are intent/message examples, not approved keywords, bids, ad text or platform eligibility findings. Attraction/operator names may carry rights or channel restrictions that require separate checking. The page does not call itself the official operator, an official ticket office or an approved paid-search destination. GYG brand bidding is not recommended.

## Public PPC/partner terms: material boundary, no account-specific approval

The public [GetYourGuide Partner Terms and Conditions](https://www.getyourguide.com/c/partner-terms-and-conditions/) served version August 2, 2024. Relevant provisions found:

- **3.1.8:** prohibits the parties' brand/trademark use and variations in paid-search keywords and combinations. This covers Google/Bing-style PPC/SEM, not merely a single platform.
- **3.1.10:** contains a paid-search/direct-control-or-ownership traffic restriction. The clause is not affirmative evidence that this account may run paid acquisition through an owned comparison landing. Obtain the applicable partner/account interpretation before launch.
- **5.3:** promotions not expressly permitted by the terms require prior written consent.

**No account-specific paid-traffic approval was found or asserted.** This is a public-terms evidence note and a conservative interpretation boundary, not legal advice or proof of an individualized permission grant. No ads, budgets, accounts, conversion settings or external messages were created/changed. Root must resolve applicable partner permission and advertising-platform requirements before any launch/spend.

## Focused verification

Run `node scripts/check-winter-activity-landing.mjs`. It checks the exact three product IDs/providers/deep paths and static affiliate parameters; refuses generic, foreign, pre-parameterized or fragment URLs; requires distinct substantive comparisons and conditional access flags; verifies native SSR booking anchors and disclosure, explicit dated closure wording before affected CTAs, actual placement attributes, four visible FAQs drawn from the same data as FAQ schema, matching message anchors, and the absence of provider SDK/widget markup or invented commerce claims. It target-compiles the Astro page without a full site build or network request. Shared layout presence is reported separately; root owns layout/build/browser integration.

The progressively revealed “What would you like to do?” control accepts only `all`, `icewalk`, `summit` and `road-day`. The full three-card comparison and all six native booking links remain in the server HTML without JavaScript. The actual bundled client is exercised in an offline DOM harness for exact offer filtering, visible count, reset, each valid deep link, invalid/duplicate query values, idempotent initialization and blocked history. Only the `experience` query parameter is set/removed; existing ad parameters and the fragment remain intact. No dates, participant data, eligibility score or live inventory is collected, and merchant links are neither selected nor modified by the filter.

No new imagery is supplied or identified as a particular product. No product/Offer/price/rating/availability schema is emitted. FAQPage schema uses exactly the visible questions and answers. Source review date is visible on each card and the final source note.
