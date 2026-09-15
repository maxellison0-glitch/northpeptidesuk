# Mobile checkout audit — 15 September 2026

## Findings and fixes

| Finding | Change |
| --- | --- |
| At 390px, the checkout Shop link extended beyond the navigation edge. The narrow-logo rule only applied below 380px. | Responsive wordmark through 600px, a nonshrinking 44px Shop target, and a narrower 320px layout. |
| Optional thermal packaging was hidden for pen-only and accessory-only baskets. | Chilled packaging is selectable for every nonempty basket at £5 per order. Add/remove, refresh, duplicate prevention and totals remain synchronized. |
| Upsells made checkout unnecessarily long. | One native Optional extras disclosure, collapsed by default, contains packaging, recommendations and supplies. Its summary advertises the £5 option and shows selected extras. Direct packaging links open the disclosure. |
| A saved-cookie control floated over mobile content. | After a choice, a compact Cookie settings button sits in normal page flow at the bottom. It reopens the banner; consent defaults and tracking rules are unchanged. |
| Mobile shop/product headers wrapped controls onto an extra row. | One row for logo and 44px shopping controls, with a separate full-width search field. The basket badge sits clear of its icon. |
| Homepage displayed 21 products / 15 vials despite 26 cards / 20 compounds, including tablets and liquid products. | Correct counts and Research Compounds category wording. |
| Catalogue delivery text said Tracked 24 at £3.99. | Corrected to the existing server rate: Tracked 48 £3.99; free from £100. |
| All products links pointed to a missing /products/ page. | Restored the existing catalogue renderer and included the hub in future builds and checks. |

## Verification

- Automated suite: 76 tests and static regression passed.
- Existing research-copy checks: 59 generated pages passed; 41 product-copy checks passed.
- Browser checks at 320, 360, 375, 390, 430, 600, 768 and 1280 CSS pixels for the checkout header.
- Expanded extras have no off-screen elements at 320px. Shared shop/product headers checked with a populated basket.
- Browser flow: product to basket to checkout; expand/collapse extras; packaging add, refresh and removal; delivery price updates; packaging deep link; saved cookie rejection and reopening settings.
- Unit coverage includes pen-only/accessory-only baskets, restored duplicate packs, discounts, free-delivery thresholds and client/server price parity.
- No live order was submitted. The order API, payment and email code are unchanged.
