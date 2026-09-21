# PAGE_ROADMAP

Status: ACTIVE — sole effective roadmap, rebuilt 2026-09-21 because the repository contained no previous roadmap.

## Completed this cycle

| ID | Priority | Decision | URL | Result | Content Review |
|---|---:|---|---|---|---|
| CODES-20260921 | NOW | UPDATE + CREATE | `/codes/`, `/codes/expired/`, plus localized code pages | Restored the daily updater with six directly reachable cross-check sources, parallel fetches, multilingual status parsing, a two-independent-source promotion rule, and quarantine for conflicts. Published 8 current codes: seven weekly codes with the same verified bundle plus regional community-confirmed `THXHEART26`; rechecked 74 historical codes and restored none. The main page now shows only 8 recent expired entries and links to the searchable archive. | PASS — current and archive titles/H1/canonical, answer table, source placement, external indicators, archive search, desktop top/middle/footer and internal links checked; 25 automated tests pass. Mobile visual recheck for the new archive is `NOT_CHECKED` because the local headless browser could not load the Tailwind CDN; responsive classes and mobile-safe click targets were inspected, but production mobile must be rechecked after deployment. |
| EVENTS-20260921 | NOW | UPDATE + CREATE | `/events/`, `/events/party-festival-september-2026/`, `/events/burger-bliss/`, `/events/september-23-update-preview/` | Restored daily event discovery with official Steam RSS and public official-X post verification; current cards now lead to internal guides, and event artwork is downloaded/refreshed by source hash while the last valid image is retained on fetch failure. Added verified artwork mappings for September 23 Preview, Echo of Ancients, Qixi Fair, and Dave the Diver; all 17 published event guides now have local artwork. | PASS — exact server-time windows, tasks/rewards and known unknowns are stated; hub/detail links and desktop top/middle/footer checked. Artwork coverage test passes; mobile responsive classes and 44px controls reviewed, but live mobile rendering remains NOT_CHECKED. |
| SOCIAL-20260921 | NEXT → DONE | UPDATE | `/guides/friends-invites-gifting/` | Added exact Consume Food permission path and watering-group coordination/privacy guidance. | PASS — player task answered in first body section, community evidence labeled, hero image added, anchors/link targets/mobile/footer checked. |
| PLATFORM-20260921 | NEXT → DONE | UPDATE | `/faq/platforms/` | Rechecked current official Steam, App Store, and Google Play listings; refreshed Switch/PS5 status wording and date. | PASS — existing title/H1/canonical preserved; official source block, image, external indicators, desktop/mobile/footer checked. |

## Covered — no new URL

| Intent group | Existing coverage | Decision |
|---|---|---|
| Common Brimstone location | `/database/insects/common-brimstone/` answers location, time, weather, and level | COVERED |
| Cat breeds/list | `/database/cats/` lists all cats and traits | COVERED |
| Flower breeding/crossbreeding | `/guides/flower-crossbreeding/` contains requirements, layouts, chart, and troubleshooting | COVERED |
| Fish locations | `/guides/fishing-locations/` provides searchable locations | COVERED |
| Meteor shower | `/guides/meteor-shower/` covers schedule, locations, wishes, and photos | COVERED |
| What is Heartopia/gameplay | Homepage and guide hubs cover the game loop | COVERED; protect homepage |
| Release date/download | `/faq/platforms/` and `/download/` now current | UPDATE completed; no new URL |
| Visitor food permissions/watering groups | Existing social page can naturally answer both | UPDATE completed; no new URL |

## Deferred queue and triggers

| Intent/task | Decision | Missing evidence | Recheck trigger |
|---|---|---|---|
| Next gacha / Sep 23 banners | DEFER | Preview names exist, but rates, cost, pity, availability, and exact dates are not published | Official Sep 23 patch notes plus live in-game rules panel |
| Sep 23 building changes | DEFER | Official preview says building becomes more flexible but gives no mechanics | Patch live and exact controls/limits verified |
| Sep 23 collaboration/Mid-Autumn walkthrough | DEFER | Only feature names and preview art are available | Tasks, requirements, rewards, locations, and schedule published |
| Invisible-wall or slanted-building bug fix | DEFER | Player reports exist; no reproducible cause or official fix | Official known-issues entry or repeatable steps on current client |
| Current weekly codes after Sep 30 | DEFER | Current codes expire Sep 30 at 10:59 UTC-5 | Recheck immediately after deadline or on a new official weekly post |
| Event-hub CTR response | DEFER | Update just shipped | Compare 14 complete GSC days after deployment; do not change title from partial data |
| New insect/cat/flower pages | COVERED | Current dedicated pages already answer the task | Reopen only if GSC query-to-page mapping shows mismatch or missing subtask |
| `aniimo` | OUT_OF_SCOPE | Different game/entity | None unless site scope changes explicitly |

## Next measurement window

- Earliest useful 7-day post-change read: once GSC final data covers 2026-09-22 through 2026-09-28.
- Compare like-for-like Web search, no country/device/search-appearance filters.
- Preserve homepage and winner-page metadata unless page-level evidence shows a concrete mismatch.
