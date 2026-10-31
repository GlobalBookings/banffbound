# Published commerce catalogue provenance

The commercial collection is pinned separately to website revision
`dfa545a7e7130e8494aab6342349fe6ce71a226c`. This is the final cutoff; later website
changes do not automatically regenerate this native release. It does not regenerate the 42 original
places or 16 bundled guides, which retain their existing `4da51e0` source pin.
The generated provenance records the SHA-256 of every consumed website input,
the original GetYourGuide URLs and the app's sole transformation:
`cmp=banffboundapp`, the same non-personal label for every visitor.

At this revision the website has 15 central reviewed GetYourGuide offers
(11 editorial-ready, four held), 95 hotel records (49 selected-fact reviews,
one location-only, two former names, 43 unreviewed leads), 50 historical Vrbo
leads, 295 active blog articles and 15 activity entries. Redirected articles
are excluded. The complete generated inventory is in
`commerce-catalogue-inventory.json`; additional tour/category searches are
deduplicated by destination identity. Existing article referral destinations
are retained with generic provider/search labels rather than inheriting an
unverified anchor claim. The old unused `tripActivities.ts` is not treated as
the current website trip planner.

The online guide index additionally covers 72 published standalone visitor,
planning-tool and comparison pages, six town/base pages and all 81 published
trail, lake and viewpoint detail routes. Five canonical URLs already appear in
the activity-guide collection, so 154 additional guide entries are added without
duplicate canonical URLs. Legal, publisher, contact, home, report-submission,
test/widget and redirect routes are excluded. Every accepted and excluded
standalone source page is hash-verified against the same commit; the inventory
records route-to-item coverage. Static titles and descriptions are extracted
only from literal quoted layout attributes without executing Astro frontmatter.
Unverified legacy route records remain clearly marked references.

The expanded experience directory preserves 60 published groups with all 464
mapped numeric product identities exactly once. The source's 496 captured cards
contain 458 unique captured products; ten supplemental reviewed products bring
the distinct candidate inventory to 468. Four explicitly excluded candidates
remain blocked in every collection. The other 28 captured cards are duplicates,
not 28 additional excluded products. Do not call this a 496-unique-product or
32-exclusion catalogue.

The 66 individually reviewed mapped products may use only their own description,
operator, departure, notice and review date. The other 398 listing-only options
retain their own listing title and URL, with comparison context only: they gain
no operator, departure, inclusion, duration or eligibility fact from a group
primary. Every listing-only option says to check its own listing details.
The website's `experienceOptionTarget` supplies the exact product destination and
readiness semantics, with the same static app campaign transformation.

All 60 canonical group guide paths are indexed; 49 are newly authored experience
guides and eleven reuse existing blog/activity URLs without duplicate guide
cards. The three older published product references 556595, 113074 and 441813
remain clearly marked reference-only; they are outside the new mapped directory
and have no new operator or review claim. Thus the tour collection has 467
distinct product destinations plus its existing search/category links.

The original 15 central records retain their IDs, titles and precise place
relationships. Other listed operator names come only from the exact individually
reviewed product. GetYourGuide remains the sales channel, not an inferred
experience operator. Generic searches and legacy references gain no operator
claim. User-facing packing copy explains the website handoff; the Amazon
programme approval limitation remains here and in provenance rather than the
traveller's flow.

Four products retain their exact caution notices: Grotto Canyon and the Castle
Food Experience have listing-availability concerns; Johnston Canyon Icewalk and
the winter Lake Louise/Johnston outing retain dated closure/route warnings.
Editorial-ready never means open now, safe now or available for a date. Legacy
hotel identities and rental imports stay reference-only, with no imported
prices, ratings, coordinates or provider imagery.

Existing publisher identities are GetYourGuide `QW960HO`, Expedia
`1101l3MtWX`, Expedia car referral `https://expedia.com/affiliate/KB6G4xt`, and
Vrbo `1101l3MtWL` / creative `1011l63087` / adref `PZBJVX1Er0`. The website also
uses Amazon Canada `banffbound-20`; 35 packing recommendations route through the
owned website guide because approval for direct native Amazon Special Links
has not been established. No DiscoverCars integration was found.

Expedia's [official link guidance](https://help.creator.expediagroup.com/hc/en-us/articles/13164069784727-How-do-I-create-Affiliate-Links)
explicitly supports links in apps. Account-specific channel settings and
actual commission attribution are separate from URL correctness. GetYourGuide's
[cookie guidance](https://partner.getyourguide.support/hc/en-us/articles/13981115983133-How-does-the-cookie-ID-tracking-work)
supports manual affiliate deep links, warns that attribution inside its own app
is unsupported, and directs referrals to the mobile browser. Its
[API programme](https://partner.getyourguide.support/hc/en-us/articles/13981133907613-API-integration-and-requirements)
has separate access requirements; this export uses no API or provider content
feed. Amazon's [mobile policy](https://associates.amazon.ca/help/node/topic/GHBY6W8UPTEFD3ZX)
requires an Approved Mobile Application and prohibits rendering Amazon in
WebViews. No website programme identity is presented as independent proof of
that approval.

The website also contains consent-controlled GA4, Google Ads/AdSense and partner
widgets. Those scripts and identifiers are not transferred into native runtime.
This collection adds no SDK, automatic provider request, visitor/device ID,
advertising ID or private trip data to URLs. Provider clicks remain explicit
traveller choices, with adjacent affiliate disclosure. Actual bookings,
payments, refunds and availability remain with the provider. Clicks are not
commission receipts.

Regenerate with `node mobile/scripts/sync-commerce.mjs --source-root=<reviewed-checkout>`.
Add `--check` for deterministic read-only output verification. Every consumed
input must match the pinned Git blob; a new website revision requires explicit
pin review. The dirty original desktop checkout was audited separately and was
not used as commercial source input.
