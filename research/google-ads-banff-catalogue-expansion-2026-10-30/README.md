# Banff distinct-guide Google Ads expansion

This package prepares native Google Ads web-upload CSVs. The generator does not connect to an account, preview an upload, apply a change or activate spending.

The destination is the existing activity campaign `24416287886`, **BB | CA | Search | Winter activities | 50GBP test**. Its £50 campaign-total budget, 7p maximum CPC, Canada Presence targeting, Google Search-only network and November 6 end date stay unchanged. There are no Campaign, budget, hotel or shared-account-asset rows.

`review-copy.json` contains the deliberately written copy and 6–10 exact/phrase keyword candidates for every guide family. `plan.json` shows the final target path, readiness, import status and existing-group reuse. Seasonal or otherwise held new families are Paused at group, ad and keyword levels.

The final source freeze contains 60 guide families: 19 ready and 41 held. This package prepares 50 new groups and 50 new responsive search ads: 9 Enabled and 41 Paused. It adds 400 keywords to those new groups and 80 novel keywords to 10 existing saved groups, for 480 additions in total: 300 exact and 180 phrase. Each family has eight reviewed candidates. No candidate duplicates a saved term in its destination group.

There are 49 new guide pages but 50 new ad groups because the existing Johnston Canyon guide has no saved ad group and receives a new Paused group. Ten other guide families reuse their exact saved groups. The two additional saved groups targeting legacy aliases and the existing winter-activities hub remain unchanged.

An actual canonical-path match to an existing saved ad reuses its exact group ID and name. Such a family receives only novel Keyword Add rows; it does not receive another RSA, a renamed group or any edit to an existing keyword. The package compares against the previously verified 97-keyword export. Refresh this readback immediately before applying; the package is not a live account audit.

Generate and check from the repository root:

```sh
node research/google-ads-banff-catalogue-expansion-2026-10-30/generate.mjs
python3 research/google-ads-banff-catalogue-expansion-2026-10-30/check-upload.py
```

The validated site model and every family’s reviewed copy must exist first. A new or removed family causes generation to stop until its explicit copy record is reconciled.

After deployment and native preview checks, use non-empty files in this order:

1. `01-new-ad-groups.csv`
2. `02-new-responsive-search-ads.csv`
3. `03-new-group-keywords.csv`
4. `04-existing-group-keyword-additions.csv`

Do not blindly reapply Add files. The operator must check the exact campaign, proposed counts and errors in preview, then verify saved objects and preserved budget/bid controls. An Enabled or Eligible object is not proof of paid delivery, purchase, revenue or profitability.

All CSVs use the exact previously retrieved native web template headers. Per-row default CPC fields request 7p; the existing Maximize clicks campaign’s maximum CPC is the controlling limit and requires a native settings readback.

`manifest.json` hashes the four upload files, explicit copy, review plan, preserved-state snapshot, templates, scripts, README and every source input bundled by the validated site model, including the railway-history partition. `validation-receipt.json` records the independent offline result and manifest hash. These receipts confirm local preparation only; deployment, native upload preview, application and saved-state readback remain separate checks.
