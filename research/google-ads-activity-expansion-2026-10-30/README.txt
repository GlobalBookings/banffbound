LOCAL GOOGLE ADS ACTIVITY EXPANSION PACKAGE — NOT UPLOADED

Existing campaign: 24416287886
BB | CA | Search | Winter activities | 50GBP test

This package adds 12 ready guide groups, 12 responsive search ads and 93
keywords (58 exact, 35 phrase). Group and keyword bids are GBP0.07.
It contains no Campaign, budget, targeting, network, date, hotel or shared
account-asset rows. The existing GBP50 total and campaign maximum remain.
The held Johnston group is omitted. Castle is a secondary public guide
choice but remains held for ads; no Castle group or keywords are included.

Run the local checks:
  python3 research/google-ads-activity-expansion-2026-10-30/check-upload.py

Native web-upload order:
  1. 01-ad-groups.csv
  2. 02-responsive-search-ads.csv
  3. 03-keywords.csv

The CSV headers come from the retained Google Ads Uploads native templates;
template-provenance.json records the primary template URLs and hashes.
source-targets.json and manifest.json record the reviewed copy and scope.

Before account apply, the primary agent must verify the deployed guide URLs,
preview each file against the intended campaign, confirm expected Add counts
and zero errors, then reopen persisted objects and campaign safeguards.
These Add files must not be blindly reapplied after a partial import; inspect
provider objects first to avoid duplicates. Enabled is an intended row status,
not evidence that a provider object is approved, serving or profitable.

Final URLs are clean, relevant guide URLs. Their fixed tracking suffix keeps
the existing bb_ca_winter_50_test cohort and adds a stable activity-specific
utm_content. SSR merchant links stay editorial; the separately reviewed
allowlist installer handles matching Google/cpc traffic. No dated merchant
availability, paid click, booking or earned commission was tested here.
