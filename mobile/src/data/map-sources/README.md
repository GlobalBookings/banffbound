Map sources are independent of the original 42-place / 16-guide offline catalogue.

- `osm-source.json`: bounded, dated Overpass extract of selected public OSM tags;
  exact query and server base timestamp are retained. It is not a current-status
  feed. User/editor account metadata and arbitrary descriptions are not retained.
- `osm-points.json`: filtered and deduplicated OSM-derived points, separately
  distributable under ODbL. No BanffBound dining prose, official menu enrichment
  or independent publisher coordinates are inserted into this export.
- `editorial.json`: separately sourced BanffBound venue facts, exact identity joins,
  documented publisher hotel locators and reviewed source exclusions. Original
  unverified restaurant/trail coordinates and historical rental leads are absent.
- `provenance.json`: input/output hashes, counts, exclusions, semantic duplicate
  groups and each map point's coordinate source role.

Run `node mobile/scripts/sync-map.mjs` to generate, or append `--check` for a
network-free drift check. Every editorial extraction input (including transitive
website modules and the frozen mobile catalogue/commerce inputs) is checked against
its stored SHA-256. Their reviewed commit is `686a841ad452da0f19d1026d78abd0a9e8e75279`.
An isolated check can use `--source-root=<reviewed checkout>` or
`BANFFBOUND_MAP_SOURCE_ROOT`; all seven files must match the pin. The six legacy
content inputs also match the established `4da51e` snapshot, while commerce is
supplied by its separately reviewed generated snapshot.

Refreshing requires a deliberate source review and a new
snapshot, not automatic provider or per-device Overpass requests. Add/remove
editorial joins only after checking the exact venue and branch. A source check
date describes the review scope, not confirmed current operation.

The web export must make `osm-points.json`, `osm-source.json` and `LICENCE.txt`
available at `/app/map-data/` and retain visible map attribution. Tile hosting and
tile-cache policy are separate from OSM database licensing; no offline tile
archive is created by these files.
