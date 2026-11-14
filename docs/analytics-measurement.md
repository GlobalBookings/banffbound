# Analytics and test history

The signed-in GA4 interface verified property `494425433`, web stream `11396726413` (BanffBound.com), measurement ID `G-2DP7J42ZW0`, and traffic received in the preceding 48 hours on 2026-10-30; the site and reporting agent match these IDs. Live Data API report metadata verified the property timezone as **America/Vancouver** and report currency as CAD on 2026-10-30. Google Ads test budgets and bids are GBP; a GA4 report currency is not a conversion of actual commissions or ad costs.

## What is measured

Analytics consent controls page views, affiliate clicks, CTA clicks, scroll thresholds and visible time on page. Advertising consent independently controls the existing Google Ads affiliate click-out diagnostic. An outbound click is **not** a purchase, booking, sale, commission or profit. Declined consent, blockers and unobserved merchant bookings are not reconstructed.

Raw URL queries and fragments remain excluded from event URLs. Only these exact tagged arrivals get explicit manual campaign acquisition fields: `google` / `cpc` / `bb_ca_winter_50_test` (Ads `24416287886`) and `google` / `cpc` / `bb_ca_hotels_7_day_test` (Ads `24411162375`). No raw `utm_term`, `utm_content`, click identifier, email address or booking detail is copied. Static `content_id` supplies page-level campaign content. Public UTM labels can be shared or spoofed and do not prove a billed click.

The seven event-scoped custom definitions were registered and read back in the live property: `landing_id`, `content_id`, `content_type`, `offer_id`, `placement`, `paid_cohort`, `affiliate_partner`. `paid_source` remains an older compatibility parameter. Event retention was increased from 2 to **14 months**, saved and verified in the interface; user retention was already 14 months and its reset-on-new-activity setting was already enabled, both unchanged. The interface states retention changes take effect after 24 hours. These settings were applied in GA4, not by client code. New definitions may take up to 48 hours to appear in reports; historical missing labels cannot be reconstructed. Standard aggregated reports are treated separately from event-level retention.

The GA4 Google Ads links screen showed **zero completed links**, with no link created. Fixed manual campaign attribution remains available; automatic Ads cost import or a newly linked Analytics-to-Ads data flow is not configured by this work. See the [verified settings receipt](../research/ga4-measurement-settings-2026-10-30.json).

Native GetYourGuide referrals work before consent and without JavaScript. For the exact known activity cohort, the client can select a fixed SSR-provided paid `cmp` only on a marked HTTPS `www.getyourguide.com` link, with the correct publisher ID and a matching fixed product/search pathname. Mapped article wrappers also cover authored links to the exact same reviewed product and publisher; unrelated products, search recommendations and destinations retain their original URLs. Offer labels fall back only when that exact product link matches, never for every page link or page view. It copies no incoming query value into the merchant URL and uses no extra browser storage. Organic or unknown arrivals retain their rendered editorial link. This referral label is distinct from analytics consent; it does not send a tracking request by itself. Internal navigation has no new persistent cohort storage: GA4's session campaign, where observed, should be used for subsequent-page analysis rather than treating an untagged page event as a new paid arrival.

## App Store clicks and downloads

In GA4 property `494425433`, filter to the `app_store_click` event. Use **Page path and screen class**, **App Store app** (`app_store_app`), and **App Store campaign** (`app_store_campaign`) as rows and **Event count** as the measure. These two custom dimensions are event-scoped. Analytics consent is required, and the event counts clicks on either BanffBound iPhone app without triggering the existing Google Ads affiliate conversion.

In [App Store Connect](https://appstoreconnect.apple.com/apps), open the matching app, then **Analytics → Acquisition → Campaigns** and read **First-Time Downloads**. Match the campaign token with the GA4 report. The homepage and apps guide have separate tokens for each app. Audio Walk's existing landing and editorial campaign tokens are preserved. If an article visitor follows its intermediate Audio Walk page before clicking the store, GA4 shows the actual click page and Apple receives the article's campaign token where the site has one.

Apple attributes first-time downloads within 24 hours of tapping the tagged link under its campaign rules. Its reports use UTC, can withhold results for campaigns below five first-time downloads, and cannot be joined to individual GA4 clicks. Compare the same campaign and aligned date windows over several days, allowing for reporting delay and consent differences. [Apple campaign reporting](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/).

## Historical records

GA4 is the managed historical reporting source. The repository has no browser admin analytics panel. The existing agent sends a daily Slack briefing; when this updated agent version runs, its aggregate report is also written as a private immutable JSON snapshot in `agents/data/analytics-history/`, or `GA4_HISTORY_DIR` when configured. Failed sections use `unavailable` and `null`; a successful empty query can report zero. Affiliate totals use only `affiliate_click` and paginate through all rows, avoiding double counting generic outbound events and top-20 truncation.

These are source-level agent changes; a website deployment alone is not proof that the separate agent runtime has updated or run successfully. The current DigitalOcean agent specification has no persistent volume. Container-local snapshots must **not** be described as redeploy-safe history. Use an operator directory with backups or configured persistent storage for retention. No new service or schedule is introduced.

For a read-only, manually archived report without Slack or account changes:

```sh
python3 scripts/capture-ga4-history.py \
  --env-file /absolute/private/path/to/agents/.env \
  --output-dir /absolute/persistent/private/ga4-history
```

The utility uses the existing OAuth configuration, confirms the property timezone from report metadata, captures the last 28 completed local days plus daily 2026 traffic, known campaign landing sessions and affiliate sessions, and optional offer/placement detail. It paginates; missing permission, disabled API, failed section, or missing custom definition produces unavailable data, not zero. Each file is created once with mode 0600, without credentials or raw user identifiers. The output directory should stay outside public assets and Git. It prints only its receipt and aggregate availability. It never runs scheduled agents or sends messages.

Google Ads cost/click history and merchant completed bookings/cancellations/commission history remain separate ledgers. Expedia currently uses a shared publisher link; no confirmed paid merchant commission reconciliation is implied. Reconcile completed merchant transactions, currencies and attribution windows before calculating paid ROAS or profit. Do not divide sitewide affiliate events by unrelated pageviews as a paid landing conversion rate.

Sources: [GA4 campaign configuration](https://developers.google.com/analytics/devguides/collection/ga4/reference/config), [custom event parameters](https://developers.google.com/analytics/devguides/collection/ga4/event-parameters), [Data API custom dimensions](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema), [GA4 retention](https://support.google.com/analytics/answer/7667196).
