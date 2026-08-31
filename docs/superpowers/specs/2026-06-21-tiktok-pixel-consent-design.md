# TikTok Pixel and Cookie Consent Design

## Objective

Install TikTok Pixel `D8RU9FBC77UATVQ6JIUG` across the North Peptides UK storefront while preventing TikTok analytics from loading until a visitor explicitly accepts analytics cookies.

## Scope

- Load one shared analytics script on `index.html`, `checkout.html`, and `compliance.html`.
- Display a cookie-consent banner when no saved choice exists.
- Provide equally accessible Accept and Reject actions.
- Store the visitor's choice in first-party local storage.
- Load TikTok's base Pixel and record `PageView` only after acceptance.
- Keep TikTok blocked after rejection.
- Provide a cookie-settings control so a visitor can revisit or withdraw the choice.
- Track commerce events only while consent remains granted.

## Architecture

Create `tiktok-analytics.js` as the single owner of consent state, Pixel loading, banner rendering, and guarded event dispatch. Each HTML page includes this script with `defer`; the script creates the same accessible banner on every page, avoiding duplicated inline implementations. Existing basket and checkout code calls a small public tracking function, which becomes a no-op until consent is accepted and the Pixel is available.

The Pixel ID is a public browser identifier, so it is stored directly in the analytics script. No TikTok access token, payment information, or private credential is introduced.

## Consent Behaviour

The saved state has three possible values: unset, accepted, or rejected.

- Unset: show the banner and do not request any TikTok resource.
- Accepted: hide the banner, load TikTok's official base code once, grant consent, and send the current page view.
- Rejected: hide the banner, revoke consent if TikTok was previously loaded, and do not load it on later pages.
- Cookie settings: clear/reopen the choice UI, allowing acceptance or rejection to be changed.

Reject does not merely hide the banner: it guarantees that `analytics.tiktok.com/i18n/pixel/events.js` is not injected during a fresh rejected session.

## Events

- `PageView`: exactly once per real storefront page load after consent and Pixel initialization. Reopening Cookie settings or pressing Accept again on the same page must not emit another PageView.
- `AddToCart`: successful additions through the shared basket function, with product name, variant, price, quantity, value, and GBP currency where available.
- `InitiateCheckout`: when the visitor proceeds from the basket to checkout, including basket value and GBP currency.
- `CompletePayment`: only after the order endpoint reports a successfully created order; it is not emitted merely when the checkout form is submitted.

Commerce payloads use TikTok's standard structure: `contents` is an array with one object per line item containing `content_id`, `content_name`, `content_type`, `quantity`, and numeric unit `price`; event-level `value` is numeric and `currency` is `GBP`. The completed order total is retained until the bank-transfer confirmation screen so `CompletePayment` uses the completed order total rather than reconstructing an incomplete total.

Event calls made before consent are discarded rather than queued. This prevents actions taken before acceptance from being sent retroactively.

## User Interface

The banner appears fixed along the bottom of the viewport, uses the site's existing green/neutral palette, remains legible on mobile, and does not imply that acceptance is required to shop. It links to the compliance/privacy information and exposes Accept and Reject as real buttons with visible keyboard focus.

A compact Cookie settings button/link remains available after the initial decision so consent can be changed later.

## Failure Handling

If TikTok's script is blocked by an extension or network policy, shopping and checkout continue normally. Pixel initialization is idempotent, so navigating code or repeated consent actions cannot inject duplicate scripts or duplicate the initial page view. Invalid basket values are omitted or normalized rather than breaking storefront behaviour.

## Verification

Automated tests will verify consent-state transitions, one-time script injection, no loading after rejection, guarded event dispatch, and event payload construction. Static-page checks will confirm every relevant page includes the shared script and a cookie-settings control. Live verification will confirm the deployed site shows the banner in a clean session, makes no TikTok request before acceptance, loads the correct Pixel ID after acceptance, persists both choices, and reports test events in TikTok Events Manager.

## Delivery

Work is isolated on branch `codex/tiktok-pixel-consent`, based on the current GitHub `main`. Existing uncommitted files in the original local checkout are not modified. The finished change will be presented as a pull request rather than pushed directly to the live branch.
