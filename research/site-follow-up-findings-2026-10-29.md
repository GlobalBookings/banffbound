# Follow-up findings from the wildlife/trail/stays release

These are evidence-led follow-ups to the completed scoped release, not changes included in PR7. Recorded29 October2026. The broader site review remains active.

Status update for the next release: the cycling findings below are repaired in the nine-route planner and three reviewed guide overrides; consent enforcement is replaced by the shared versioned loader/event controls and tested withdrawal paths. Evidence is in `cycling-planning-sources-2026-10-29.md` and `consent-control-sources-2026-10-29.md`. These dated findings are retained as the before-state record.

Three new hotel/activity booking comparisons and draft Google/Bing message mappings follow the user's affiliate-first choice. Publishing the pages does not establish account-specific paid-traffic permission, an approved advertising budget, sales or profitability. The launch plan records those remaining decisions. Across the broader site, 52 of295 canonical blog guides and52 of95 hotel profiles now have the scoped review status described by their registers; remaining legacy content needs review rather than a blanket freshness claim.

## Cycling permissions and route planning

Read-only audit: `biking.astro`, its local route cards, four rendered bike articles and cycling activity data.

1. `/biking` presents a summit-style Tunnel Mountain ride. The [current Parks restricted-activity order](https://parks.canada.ca/pn-np/ab/banff/bulletins/8942f86e-3565-4b9a-a424-7c86d7c97701) explicitly prohibits all bicycles on Tunnel Mountain Summit Trail. Distinguish permitted bench/campground networks.
2. `/biking` and `/blog/spray-river-trail` imply a winter Spray River fat-bike loop. [Parks winter guide](https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff) prohibits bikes on West in winter; East is a separate permitted description. Replace blanket year-round loop, grooming and easy/flat claims.
3. `/blog/banff-mountain-biking` omits the [July10–September15 cycling prohibition beyond Stewart Canyon Bridge](https://parks.canada.ca/pn-np/mtn/ours-bears/gestion-management/ours-bears/minnewanka). `/biking` also claims all trails are open in summer.
4. [Official Banff mountain-bike profiles](https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/velomontagne-mountainbiking/banff) list Rundle Riverside Difficult/13.9km one way, Sundance paved approach with bikes stopping before canyon, Goat Creek18.7km summer with descending direction towards Banff. These differ from current bike-page cards. Keep summer/winter route figures scoped separately.
5. [Parks e-bike rules](https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/veloselectriques-ebikes) use specific pedal-assist exceptions/segments; paved surface alone is insufficient. [Town guidance](https://banff.ca/1298/Share-the-Road) covers all-ages helmet requirements for power-assisted bicycles.
6. `/blog/banff-legacy-trail` conflates the [26.8km wider corridor](https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/cyclismeroute-roadcycling/heritage-legacy) with individual town/station segments. Remove predictable headwind and guaranteed bus-return assumptions; [Roam transport is subject to rack space, fit and refusal](https://roamtransit.com/about-us/transportation-policies/).
7. Rental addresses need correction: [Wilson](https://www.wmsll.com/contact.html) is101 Lake Louise Drive, Samson Mall; [Banff Adventures](https://www.banffadventures.com/plan-your-trip/contact-us/) is211 Bear Street. Remove unsupported prices.
8. Qualify unverified bike photographs, fitness and crowd claims. The reviewed fat-biking override and activity record already distinguish key permissions; preserve their valid source scopes.

## Consent controls do not enforce stored preferences

Source inspection and isolated in-memory execution, not browser traffic observation:

- BaseLayout unconditionally loads AdSense, GA4 and Google Ads and queues config commands, including for stored preferences with all optional flags disabled.
- `src/scripts/tracking.js` emits affiliate-click, Ads conversion, CTA/external-link, scroll and engagement events without reading preferences. URL payloads retain query strings, truncated to500 characters.
- BlogLayout loads Expedia and GetYourGuide embeds; tours.astro loads GetYourGuide independently of the affiliate preference.
- The banner checks only for a stored localStorage value; malformed/old values suppress it. There is no validation, enforced expiry or persistent reopen/revoke control. Blocked storage throws before showing/binding the banner.
- The privacy page promises opt-out and describes a one-year cookie; actual persistence is unbounded localStorage.

Bounded repair: one shared module with validated/versioned preferences and defensive persistence; optional categories off until chosen; gate both provider loading and event capture; Accept all/Reject optional/Save and persistent preferences control. Apply revocation to capture and provider controls, then reload into gated state. Preserve native outbound affiliate URLs/IDs and distinguish referral links from embedded third-party widgets. Test fresh, partial, declined, returning, revoked, malformed, expired and storage-blocked states. No legal conclusion is asserted by this implementation audit.

Likely repair surface: BaseLayout, tracking.js, BlogLayout, tours, Footer, privacy page and a shared consent module/focused tests. Changes must preserve existing native booking navigation and all affiliate IDs.
