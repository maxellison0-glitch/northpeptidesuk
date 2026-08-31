# TikTok Pixel Consent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consent-gated TikTok Pixel `D8RU9FBC77UATVQ6JIUG` and guarded commerce events to every North Peptides UK storefront page.

**Architecture:** A single deferred browser script owns consent state, renders the shared banner/settings control, injects TikTok's official base script once, and exposes a no-op-until-consented tracking API. Existing basket and checkout functions call that API at the moments already authoritative for AddToCart, InitiateCheckout, and successful order creation.

**Tech Stack:** Static HTML/CSS/JavaScript, TikTok Pixel browser SDK, Node.js built-in `node:test` and `vm` modules.

---

## File Structure

- Create `tiktok-analytics.js`: consent storage, banner UI, Pixel initialization, and guarded tracking API.
- Create `tests/tiktok-analytics.test.cjs`: browser-sandbox behavioural tests for consent and Pixel loading.
- Create `tests/tiktok-pages.test.cjs`: static integration checks across HTML, basket, and checkout files.
- Modify `index.html`, `checkout.html`, `compliance.html`: include the shared script.
- Modify `basket.js`: emit AddToCart and InitiateCheckout through the shared API.
- Modify `checkout.html`: emit checkout add-on and successful-payment events.

### Task 1: Consent-gated Pixel loader

**Files:**
- Create: `tests/tiktok-analytics.test.cjs`
- Create: `tiktok-analytics.js`

- [ ] **Step 1: Write failing consent tests**

Create a Node test harness using `vm.runInNewContext` with fake `window`, `document`, and `localStorage`. Assert that an unset choice renders `#npuk-cookie-banner` without appending a TikTok script; Reject saves `rejected` and still appends no script; Accept saves `accepted`, appends exactly one script whose URL contains `sdkid=D8RU9FBC77UATVQ6JIUG`, and queues exactly one PageView even if Accept is pressed again on the same page; a saved acceptance loads once and sends one PageView on each genuine page load; and `track()` before acceptance does not create or queue TikTok calls.

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('tiktok-analytics.js', 'utf8');

function boot(savedConsent) {
  const store = new Map(savedConsent ? [['npuk_analytics_consent', savedConsent]] : []);
  const appendedScripts = [];
  const elements = new Map();
  const makeElement = tag => ({
    tagName: tag.toUpperCase(), id: '', style: {}, dataset: {}, children: [],
    classList: { add() {}, remove() {} },
    append(...children) { this.children.push(...children); },
    appendChild(child) { this.children.push(child); if (child.id) elements.set(child.id, child); },
    addEventListener(type, fn) { this['on' + type] = fn; },
    setAttribute() {}
  });
  const firstScript = { parentNode: { insertBefore(node) { appendedScripts.push(node); } } };
  const document = {
    readyState: 'complete', body: makeElement('body'), head: makeElement('head'),
    createElement: makeElement,
    getElementById(id) { return elements.get(id) || null; },
    getElementsByTagName(tag) { return tag === 'script' ? [firstScript] : []; },
    addEventListener() {}
  };
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, value); },
    removeItem(key) { store.delete(key); }
  };
  const window = { document, localStorage, location: { pathname: '/' } };
  const sandbox = { window, document, localStorage, console, setTimeout, clearTimeout };
  vm.runInNewContext(source, sandbox);
  return { window, store, appendedScripts, elements };
}

test('does not load TikTok before consent', () => {
  const app = boot();
  assert.equal(app.appendedScripts.length, 0);
  assert.ok(app.window.NPUKAnalytics);
});

test('rejection persists without loading TikTok', () => {
  const app = boot();
  app.window.NPUKAnalytics.reject();
  assert.equal(app.store.get('npuk_analytics_consent'), 'rejected');
  assert.equal(app.appendedScripts.length, 0);
});

test('acceptance loads the configured pixel once', () => {
  const app = boot();
  app.window.NPUKAnalytics.accept();
  app.window.NPUKAnalytics.accept();
  assert.equal(app.store.get('npuk_analytics_consent'), 'accepted');
  assert.equal(app.appendedScripts.length, 1);
  assert.match(app.appendedScripts[0].src, /sdkid=D8RU9FBC77UATVQ6JIUG/);
});

test('saved acceptance loads TikTok at startup', () => {
  assert.equal(boot('accepted').appendedScripts.length, 1);
});

test('events before consent are discarded', () => {
  const app = boot();
  assert.equal(app.window.NPUKAnalytics.track('AddToCart', { value: 10 }), false);
  assert.equal(app.appendedScripts.length, 0);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/tiktok-analytics.test.cjs`

Expected: FAIL because `tiktok-analytics.js` does not exist.

- [ ] **Step 3: Implement the shared analytics script**

Implement an IIFE with constants `PIXEL_ID = 'D8RU9FBC77UATVQ6JIUG'` and `CONSENT_KEY = 'npuk_analytics_consent'`. It must expose `window.NPUKAnalytics.accept`, `reject`, `openSettings`, `getConsent`, and `track`; create an accessible bottom banner and persistent Cookie settings button; inject the official TikTok SDK only when consent is accepted; call `ttq.grantConsent()` and `ttq.page()` once; call `ttq.revokeConsent()` when withdrawing after a load; and return `false` from `track` unless consent is currently accepted.

```js
(function (window, document) {
  'use strict';
  const PIXEL_ID = 'D8RU9FBC77UATVQ6JIUG';
  const CONSENT_KEY = 'npuk_analytics_consent';
  let pixelLoaded = false;

  function getConsent() { return window.localStorage.getItem(CONSENT_KEY); }
  function setVisible(visible) {
    const banner = document.getElementById('npuk-cookie-banner');
    if (banner) banner.hidden = !visible;
  }
  function loadPixel() {
    if (pixelLoaded || getConsent() !== 'accepted') return false;
    pixelLoaded = true;
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t; var ttq=w[t]=w[t]||[];
      ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)));};};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e;};
      ttq.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};n=d.createElement('script');n.type='text/javascript';n.async=true;n.src=r+'?sdkid='+e+'&lib='+t;var a=d.getElementsByTagName('script')[0];a.parentNode.insertBefore(n,a);};
      ttq.load(PIXEL_ID); ttq.grantConsent(); ttq.page();
    }(window, document, 'ttq');
    return true;
  }
  function accept() { window.localStorage.setItem(CONSENT_KEY, 'accepted'); setVisible(false); loadPixel(); }
  function reject() { window.localStorage.setItem(CONSENT_KEY, 'rejected'); setVisible(false); if (pixelLoaded && window.ttq) window.ttq.revokeConsent(); }
  function openSettings() { setVisible(true); }
  function track(eventName, payload) {
    if (getConsent() !== 'accepted' || !pixelLoaded || !window.ttq) return false;
    window.ttq.track(eventName, payload || {}); return true;
  }
  function renderConsentUi() {
    const style = document.createElement('style');
    style.textContent = '#npuk-cookie-banner{position:fixed;z-index:10000;right:18px;bottom:18px;left:18px;display:flex;align-items:center;gap:18px;max-width:1080px;margin:auto;padding:18px 20px;border:1px solid #cfe0d7;border-radius:10px;background:#fff;color:#16241e;box-shadow:0 12px 40px rgba(22,36,30,.16);font-family:"DM Sans",Arial,sans-serif}#npuk-cookie-banner[hidden]{display:none}#npuk-cookie-banner p{flex:1;margin:0;font-size:.86rem;line-height:1.55}#npuk-cookie-banner a{color:#00795f}#npuk-cookie-banner button,#npuk-cookie-settings{min-height:42px;padding:10px 17px;border:1px solid #00795f;border-radius:6px;background:#fff;color:#00795f;font:600 .76rem "DM Sans",Arial,sans-serif;cursor:pointer}#npuk-cookie-banner button:last-child{background:#00795f;color:#fff}#npuk-cookie-banner button:focus-visible,#npuk-cookie-settings:focus-visible{outline:3px solid #9ad8c5;outline-offset:2px}#npuk-cookie-settings{position:fixed;z-index:9999;right:14px;bottom:14px;min-height:34px;padding:7px 10px;border-color:#cfe0d7;background:#fff;color:#526157;font-size:.68rem}@media(max-width:640px){#npuk-cookie-banner{align-items:stretch;flex-wrap:wrap;gap:10px;right:10px;bottom:10px;left:10px;padding:16px}#npuk-cookie-banner p{flex-basis:100%}#npuk-cookie-banner button{flex:1}}';
    document.head.appendChild(style);
    const banner = document.createElement('section'); banner.id = 'npuk-cookie-banner'; banner.setAttribute('aria-label', 'Cookie consent');
    const text = document.createElement('p'); text.innerHTML = 'We use analytics cookies to understand site traffic and improve advertising. <a href="compliance.html">Learn more</a>.';
    const rejectButton = document.createElement('button'); rejectButton.type = 'button'; rejectButton.textContent = 'Reject'; rejectButton.addEventListener('click', reject);
    const acceptButton = document.createElement('button'); acceptButton.type = 'button'; acceptButton.textContent = 'Accept'; acceptButton.addEventListener('click', accept);
    banner.append(text, rejectButton, acceptButton); document.body.appendChild(banner);
    const settings = document.createElement('button'); settings.id = 'npuk-cookie-settings'; settings.type = 'button'; settings.textContent = 'Cookie settings'; settings.addEventListener('click', openSettings); document.body.appendChild(settings);
    setVisible(getConsent() === null);
  }
  window.NPUKAnalytics = { accept, reject, openSettings, getConsent, track };
  function start() { renderConsentUi(); if (getConsent() === 'accepted') loadPixel(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}(window, document));
```

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test tests/tiktok-analytics.test.cjs`

Expected: 5 tests PASS with no warnings.

- [ ] **Step 5: Commit the loader**

```bash
git add tiktok-analytics.js tests/tiktok-analytics.test.cjs
git commit -m "feat: add consent-gated TikTok pixel loader"
```

### Task 2: Page and commerce-event integration

**Files:**
- Create: `tests/tiktok-pages.test.cjs`
- Modify: `index.html`
- Modify: `checkout.html`
- Modify: `compliance.html`
- Modify: `basket.js`

- [ ] **Step 1: Write failing integration checks**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = file => fs.readFileSync(file, 'utf8');

test('all storefront pages include shared analytics', () => {
  for (const file of ['index.html', 'checkout.html', 'compliance.html']) {
    assert.match(read(file), /<script src="tiktok-analytics\.js" defer><\/script>/);
  }
});

test('basket emits AddToCart and InitiateCheckout', () => {
  const source = read('basket.js');
  assert.match(source, /NPUKAnalytics\.track\('AddToCart'/);
  assert.match(source, /NPUKAnalytics\.track\('InitiateCheckout'/);
});

test('checkout emits add-on and successful order events', () => {
  const source = read('checkout.html');
  assert.match(source, /NPUKAnalytics\.track\('AddToCart'/);
  assert.match(source, /NPUKAnalytics\.track\('CompletePayment'/);
  assert.ok(source.indexOf("paymentStatus === 'success'") < source.indexOf("NPUKAnalytics.track('CompletePayment'"));
});
```

- [ ] **Step 2: Run integration checks and verify RED**

Run: `node --test tests/tiktok-pages.test.cjs`

Expected: FAIL because pages and commerce functions are not integrated.

- [ ] **Step 3: Include analytics on every page**

Add this inside each page's `<head>`:

```html
<script src="tiktok-analytics.js" defer></script>
```

- [ ] **Step 4: Add guarded basket events**

After a successful `addToBasket`, call:

```js
if (window.NPUKAnalytics) {
  window.NPUKAnalytics.track('AddToCart', {
    content_type: 'product',
    content_name: name,
    content_id: name + ':' + dose,
    quantity,
    price: Number(price),
    value: Number(price) * quantity,
    currency: 'GBP'
  });
}
```

Immediately before navigating in `goToCheckout`, call:

```js
if (window.NPUKAnalytics) {
  window.NPUKAnalytics.track('InitiateCheckout', {
    content_type: 'product',
    quantity: basket.reduce((sum, item) => sum + item.qty, 0),
    value: getTotal(),
    currency: 'GBP'
  });
}
```

- [ ] **Step 5: Add guarded checkout events**

After a checkout add-on is saved, emit AddToCart with its name, dose, one unit, price/value, and GBP. In the successful order branch, recover the saved basket total before `showBankTransferSuccess()` clears it and emit:

```js
if (window.NPUKAnalytics) {
  window.NPUKAnalytics.track('CompletePayment', {
    content_type: 'product',
    quantity: basketData.reduce((sum, item) => sum + item.qty, 0),
    value: getSubtotal(),
    currency: 'GBP'
  });
}
```

Load `basketData` from session storage before evaluating the successful return so the payload reflects the completed order.

- [ ] **Step 6: Run all tests and verify GREEN**

Run: `node --test tests/*.test.cjs`

Expected: all tests PASS with no warnings.

- [ ] **Step 7: Commit integration**

```bash
git add index.html checkout.html compliance.html basket.js tests/tiktok-pages.test.cjs
git commit -m "feat: track consented storefront commerce events"
```

### Task 3: Browser and deployment verification

**Files:**
- Modify only if verification exposes a defect in the files above.

- [ ] **Step 1: Run final automated verification**

Run: `node --test tests/*.test.cjs`

Expected: all tests PASS.

- [ ] **Step 2: Serve the isolated worktree locally**

Run: `python -m http.server 4173`

Expected: the storefront is available at `http://127.0.0.1:4173/`.

- [ ] **Step 3: Verify clean-session rejection**

Open a clean browser session, confirm the banner appears, choose Reject, reload, and verify the banner stays dismissed and no request to `analytics.tiktok.com` occurs.

- [ ] **Step 4: Verify clean-session acceptance**

Clear site data, reload, choose Accept, and verify exactly one request containing `sdkid=D8RU9FBC77UATVQ6JIUG`, persisted acceptance, and a PageView in the TikTok Pixel helper/network inspection.

- [ ] **Step 5: Verify interaction events**

Add a product, proceed to checkout, add an add-on, and confirm AddToCart and InitiateCheckout calls. Verify CompletePayment is absent on ordinary form submission and only eligible on `checkout.html?payment=success` with a saved basket.

- [ ] **Step 6: Review branch diff**

Run: `git diff origin/main...HEAD --check` and `git status --short`.

Expected: no whitespace errors and no uncommitted files.

- [ ] **Step 7: Push and open a draft pull request**

Push `codex/tiktok-pixel-consent` and open a draft PR targeting `main`, summarizing consent behaviour, tracked events, automated test results, and manual browser verification. Do not merge or deploy without user approval.
