# Optional affiliate embeds and privacy integration

Reviewed 29 October 2026 against the current repository and primary provider documentation. This record describes source and offline checks, not deployed/network verification or legal certification. Root owns `BaseLayout.astro`, `tracking.js`, shared `consent.js`, release checks and publication. No account, campaign, host, Git or full-build actions were performed by this owner.

## Finite affiliate embed inventory

| Surface | Previous automatic load | Retained provider configuration |
| --- | --- | --- |
| BlogLayout, top banner | `https://creator.expediagroup.com/products/banners/assets/eg-affiliate-banners.js` | class `eg-affiliate-banners`; program `ca-expedia`; network `pz`; layout `leaderboard`; image `mountains`; message `bye-bye-bucket-list-hello-adventure`; camref `1101l3MtWX`; empty pubref; link `home`; loader class `eg-affiliate-banners-script`. |
| BlogLayout, activity block | `https://widget.getyourguide.com/dist/pa.umd.production.min.js` | widget `auto`; partner `QW960HO`; campaign `banffboundblog`; loader partner `QW960HO`. |
| Tours, activity block | `https://widget.getyourguide.com/dist/pa.umd.min.js` | href `https://widget.getyourguide.com/default/activities.frame`; location `284`; locale `en-US`; widget `activities`;9items; partner `QW960HO`; loader partner `QW960HO`. |

Repository searches under `src` and relevant public/source HTML found these three affiliate loading surfaces. No other affiliate iframe/script was found. JSON-LD scripts are data, not affiliate loaders. Shared Google tag/advertising scripts belong to root’s separate consent work. Blog/Footer newsletter forms are native user-submitted Mailchimp POST forms; their public form identifiers and behaviour are retained.

## Implementation and scope

- Owned files: `src/layouts/BlogLayout.astro`, `src/pages/tours.astro`, `src/components/Footer.astro`, `src/pages/privacy.astro`; new `src/scripts/affiliateEmbeds.js`, focused check and this note.
- Server-rendered placeholders have no vendor target classes/data, external script `src`, iframe or frame `src`. Full normal Expedia/GetYourGuide referral links remain outside the mount and usable without JavaScript or optional consent. Link targets and identifiers are retained; `rel=sponsored` and clear labels identify affiliate links. The new blog GYG fallback carries the existing `banffboundblog` campaign.
- Controller imports only `hasConsent` and `subscribeConsent` from shared core. A denied or throwing consent API fails closed. It constructs only allowlisted fixed vendor DOM attributes; visitor/URL/DOM strings cannot supply arbitrary provider URLs or markup. All targets are mounted before the one loader per provider starts. Repeated init, unchanged grants and `astro:page-load` do not duplicate loaders. `astro:before-swap` tears down owned DOM for navigation.
- **Final integration decision:** preserve direct-parent provider behaviour, including contextual GYG auto content. An isolated opaque frame was considered but rejected because it can break context/scanning. No vendor code or configuration was regenerated in an account dashboard.
- Revocation synchronously removes owned targets, all mount children (including provider replacements/frames) and loader script elements, restores the blocked state and ignores late callbacks. Root applies denied flags and reloads the document immediately after subscriber notification. Removing a script cannot undo completed/in-flight requests or remove already-executed provider globals; the fresh gated document supplies that final reset. The implementation does not promise deletion of all third-party cookies or recall of previously transmitted data.
- Provider load failure leaves native links intact and gives visible status. A loaded SDK is described as content requested, not proof that inventory, price or booking content rendered. Ad blockers and provider failures may still prevent widgets.

## Native tour handoff audit

The six existing tour ideas and their exact product/category/destination URLs remain. Specific product IDs `t113074` and `t441813`, category paths and `partner_id=QW960HO` are retained. Links opening unfiltered Banff results are now labelled as searches, rather than being presented as the named tour’s booking page. Static prices, ratings, durations, included-lunch/equipment claims, free-cancellation and skip-the-line promises were removed because this release has no current evidence for them. Each choice supplies itinerary, season, transport, return or inclusion questions. All tour images are explicitly illustrative stock landscapes; the unverified tourism-hosted wolverine image was replaced with an existing illustrative landscape URL, without new assets.

## Privacy implementation evidence

Shared core was inspected after creation. Current contract exports `getConsent`, `hasConsent`, `subscribeConsent`; record key `bb-cookie-consent`, version2, optional analytics/advertising/affiliate booleans, essential flag and timestamp,365-day maximum age. Invalid, missing, expired or incompatible entries deny optional categories. Storage failures can use current-page memory. Root handles Google loading, consent UI, expiration/storage changes and true-to-false reload.

Privacy copy distinguishes this `localStorage` record from cookies, optional embeds from ordinary referral navigation, and browser storage from account-wide choices. It removes obsolete browser OpenWeatherMap/location and “anonymised” collection claims, unverified fixed Google cookie/retention settings and continued-use acceptance. Fonts, externally hosted images and user-requested map libraries/tiles can make requests independently; the page does not claim that all third-party requests are blocked. Newsletter submission and email contact remain separate user actions. No blanket legal, anonymity, deletion or retention guarantee is made.

Primary provider sources checked:

- GetYourGuide [Can I install a widget?](https://partner.getyourguide.support/hc/en-us/articles/14070475990045-Can-I-install-a-widget-on-my-website) and [Integrations101](https://partner.getyourguide.support/hc/en-us/articles/13981142809501-Integrations-101): widgets, deep links and the Integration Analyzer are distinct integration mechanisms. Existing SDK configuration is retained; this task does not add a new analyzer/account configuration.
- GetYourGuide [Privacy Policy](https://www.getyourguide.com/c/privacy-policy/): external provider processing and choices. No fixed third-party cookie duration copied into the site policy.
- Expedia [Travel Creator help](https://help.creator.expediagroup.com/hc/en-us), [widget implementation guidance](https://help.creator.expediagroup.com/hc/en-us/articles/12483503517847-How-to-implement-the-search-widget) and [Privacy Statement](https://www.expedia.com/legal/privacy): referral/widget mechanisms and provider-controlled processing. Search-widget instructions are contextual documentation, not proof of this banner’s implementation; the exact banner code comes from the existing repository. No commission/cookie-window promise is made.
- Vrbo [Canadian Privacy Statement](https://www.vrbo.com/en-ca/legal/privacy): external booking provider controls.
- Google [partner-site data information](https://policies.google.com/technologies/partner-sites) and [cookie information](https://policies.google.com/technologies/cookies): browser/device/page interaction processing; policy avoids an anonymity promise and account-specific retention assumptions.
- Intuit [Global Privacy Statement](https://www.intuit.com/privacy/statement/), including Mailchimp: user-requested newsletter service and communication data; not a claim that the privacy category switch is newsletter subscription consent.
- Amazon’s linked [Canadian Privacy Notice](https://www.amazon.ca/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ) returned503 in the review tool; no policy details were inferred. Existing native Amazon affiliate links elsewhere remain untouched, including tag `banffbound-20`.

Direct SDK text retrieval through the research tool was unavailable; the published SDK URLs/configuration above are the repository’s existing integration, not a claim to have audited provider code. Root’s browser/public checks must separately verify runtime network gating and actual provider rendering after consent.

## Additional bounded photo-scope request

Root requested optional BlogLayout props `imageIsIllustrative:boolean` and `imageNote:string`, default false/empty. When true, the hero alt and visible caption qualify the photograph, Article schema has no `image`, and BaseLayout uses its generic OG default. Other guides preserve their existing default behaviour. Root supplies these props only for newly reviewed `banff-legacy-trail`, `banff-mountain-biking`, `spray-river-trail` where route-photo identity is unverified. This owner did not change the shared blog renderer or acquire images.

## Focused validation

Run `node scripts/check-affiliate-embeds.mjs` and `node --check src/scripts/affiliateEmbeds.js`. Checks execute the actual controller against an offline consent/DOM stand-in: initial deny, another optional category enabled while affiliate remains denied, pre-existing positive choice, exact vendor attributes/URLs/IDs/campaign, repeat init/page-load/grants, provider error fallback, revocation including a provider-replaced frame, late callbacks, fresh grant and page-swap cleanup, unavailable consent API, invalid/prototype DOM config and unchanged native anchors. The real shared API exports/key/max-age are checked for copy parity; root owns its storage/UI/event tests.

Four owned Astro files compile with zero error diagnostics. Actual BlogLayout frontmatter fixtures verify default versus illustrative schema image behaviour. Six tour records and six categories retain valid partner IDs; native newsletter identifiers and fallback/sponsored links are asserted. A source-wide Astro/HTML scan rejects new raw Expedia/GYG script/frame `src` bypasses. No network, vendor code execution or full site build occurs in this focused check.
