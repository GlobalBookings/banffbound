# DigitalOcean native redirects - groundwork

Read-only official-document review after the third winter release. No app setting or routing rule changed. Existing redirect pages still return HTTP200; this note is not a rollout receipt.

The current App Platform redirect guide documents same-app HTTP301/308 redirect rules under Networking and ingress.rules[].redirect. Use explicit redirect_code because the default is302. Exact/prefix path and authority matches are documented; exact matches are the bounded choice for known aliases. Setting uri overwrites the original URI. Query preservation, matching priority against the existing slash component route, generic trailing-slash normalisation, path-regex captures and a rule-count quota were not established by these documents.

Sources:
- https://docs.digitalocean.com/products/app-platform/how-to/url-rewrites/ (verified September3,2026; native HTTP redirects)
- https://docs.digitalocean.com/products/app-platform/reference/app-spec/ (ingress.rules match and redirect fields)
- https://docs.digitalocean.com/reference/doctl/reference/apps/spec/get/ (latest versus deployment-specific app spec)
- https://docs.digitalocean.com/reference/doctl/reference/apps/spec/validate/ (schema/full validation)
- https://docs.digitalocean.com/products/app-platform/how-to/update-app-spec/ (spec save triggers redeploy)
- https://docs.digitalocean.com/reference/doctl/reference/apps/update/ (source update flag)
- https://docs.digitalocean.com/products/app-platform/details/limits/ (still contains contradictory unsupported301/302 language and caching warnings)

Next implementation should privately preserve current/active deployment specs without exposing environment values, produce an ingress-only reviewable diff, validate it, then test a small alias set. Verify both slash variants, query strings, canonical destinations, assets, overlapping rules, Location headers and redirect chains. Retain static HTML stubs until real edge responses are verified, and retain the prior deployment receipt. Treat the documentation conflict as a reason to require live proof rather than claiming support from docs alone. Do not turn arbitrary retired attraction/language URLs into unrelated homepage redirects.

## Actual app validation - 29 October 2026

The live app validator rejected the prepared exact-match candidate with: errors validating app spec; first error in field ingress.rules.rule.match.path: App Ingress path routing only supports prefix matching. No exact rule was saved. This runtime evidence supersedes the documentation-based exact-match proposal for this app. Bare prefix aliases can overlap canonical slugs and loop, so they must not be substituted silently. A revised slash-terminated prefix plan is recorded separately; it matches descendant paths as well and leaves slashless stubs in place. The revised behavior is awaiting explicit user approval after automatic review identified its difference from the exact-match plan.

## Verified rollout - 29 October 2026

User explicitly approved both the credential-preserving app-spec rollout and the revised prefix/descendant semantics. The saved40-rule configuration uses slash-terminated path prefixes. Live testing established segment-boundary matching and slash normalisation: both alias forms redirect, while similarly named sibling paths remain unaffected. All100public checks passed, including40aliases in both forms, preserved queries, canonical targets, overlapping canonical-name controls, public pages/assets and the documented descendant behavior. The exact-match proposal was not applied; an additional temporary overlap test was rejected by approval review and was not applied. Full app specs remain private, and all non-ingress fields were preserved semantically. See the public mapping plan and live verification JSON.
