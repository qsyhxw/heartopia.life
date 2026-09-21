# TRAFFIC_REVIEW — 2026-09-21

## Data scope and completeness

- Property: `sc-domain:heartopia.life` (Full User)
- Search type: Web
- Filters: no country, device, query, page, or search-appearance filter
- Date convention: Google Search Console/Search Analytics dates (Pacific Time)
- API request window: 2026-08-24 through 2026-09-20
- Final data available through: 2026-09-18
- Main comparison: 2026-09-12–2026-09-18 vs 2026-09-05–2026-09-11
- 28-day query/page background: 2026-08-22–2026-09-18
- 2026-09-19–2026-09-20 `dataState=all`: clue-only, excluded from decisions and week totals
- Daily totals and query/page aggregates are not added together.

## Final 7-day comparison

| Metric | 2026-09-12–18 | 2026-09-05–11 | Change |
|---|---:|---:|---:|
| Clicks | 5,594 | 6,859 | -1,265 (-18.4%) |
| Impressions | 175,053 | 199,554 | -24,501 (-12.3%) |
| CTR | 3.196% | 3.437% | -0.241 pp (-7.0% relative) |
| Weighted average position | 6.20 | 6.25 | +0.05 positions (slight improvement) |

Interpretation: demand/impressions fell more than rankings; average position did not deteriorate. Protect existing winners and fix factual freshness/CTR before considering broad layout or metadata changes.

## 28-day query-to-page signals

- `/codes/`: 8,726 clicks / 51,868 impressions; primary queries `heartopia codes`, `heartopia code`, and `heartopia redeem code`. This made the incorrect 50-code active list the highest-risk issue.
- Homepage: 1,215 / 58,085; brand query `heartopia` mapped correctly. No homepage rewrite.
- `/events/`: query `heartopia upcoming events` mapped to the correct hub (7 / 3,691, average position about 4.37) but had very low CTR and stale content. Updated the existing hub.
- `/faq/platforms/`: `heartopia switch` mapped correctly (16 / 1,311, average position about 7.11). Refreshed the existing answer rather than creating a duplicate page.
- `/database/insects/common-brimstone/`: new/high-impression location variants mapped to the dedicated page; no duplicate.
- `/database/cats/`: `heartopia cats list` mapped to the cat list; no duplicate.
- `/guides/flower-crossbreeding/`, `/guides/fishing-locations/`, and `/guides/meteor-shower/` already map their respective long-tail tasks.

## Trends input

Source file: `C:\Users\汽水鱼\Downloads\heartopia.csv`.

- The file supplies query, relative search interest, and change percentage, but contains no export timestamp, region, category, or search-type metadata.
- Google Trends UI was attempted twice and was not accessible in this run; exact parameters therefore remain `NOT_CHECKED`.
- Values were treated as relative direction only, not search volume.
- Relevant rising signals: `heartopia gameplay` (+180%), `heartopia next gacha` (+130%), `heartopia release date` (+100%), `what is heartopia` (+90%), `heartopia redeem code` (+90%), `heartopia switch` (+40%).
- `aniimo` (+550%) is out of scope. Low or zero relative interest did not automatically disqualify a concrete answerable player task.

## Public/official discovery

- Official Sep 19 Party Festival schedule and daily reset details: Steam announcement.
- Official Burger Bliss schedule/tasks/reward preview: Heartopia social announcement relayed in the player community.
- Official Sep 23 feature preview: Heartopia social announcement relayed in the player community.
- Repeated independent player reports confirm `Watch → Settings → Home Settings → Consume Food` and Self/Friends/Anyone choices.
- Recent watering-group question identified a specific coordination/privacy task; answered on the existing social page.

