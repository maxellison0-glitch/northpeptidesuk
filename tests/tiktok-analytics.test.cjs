const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('tiktok-analytics.js', 'utf8');

function boot(savedConsent, googleConfig = {}, options = {}) {
  const store = options.store || new Map(savedConsent ? [['npuk_analytics_consent', savedConsent]] : []);
  const appendedScripts = [];
  const elements = new Map();
  const windowEvents = new Map();
  const storageReads = [];

  const makeElement = tag => {
    const element = {
      tagName: tag.toUpperCase(),
      style: {},
      dataset: {},
      children: [],
      hidden: false,
      attributes: {},
      classList: { add() {}, remove() {} },
      append(...children) { children.forEach(child => this.appendChild(child)); },
      appendChild(child) {
        this.children.push(child);
        if (typeof child === 'object') child.parentNode = this;
        return child;
      },
      insertAdjacentElement(position, child) {
        assert.equal(position, 'afterend');
        const siblings = this.parentNode.children;
        siblings.splice(siblings.indexOf(this) + 1, 0, child);
        child.parentNode = this.parentNode;
      },
      closest(selector) {
        if (this.tagName.toLowerCase() === selector) return this;
        return this.parentNode ? this.parentNode.closest(selector) : null;
      },
      querySelector(selector) {
        return this.children.find(child => child.tagName === 'A' && selector === 'a[href$="cookies.html"]' && child.href.endsWith('cookies.html')) ||
          this.children.map(child => typeof child.querySelector === 'function' ? child.querySelector(selector) : null).find(Boolean) || null;
      },
      focus(options) { document.activeElement = this; this.focusOptions = options; },
      addEventListener(type, fn) { this[`on${type}`] = fn; },
      setAttribute(name, value) { this.attributes[name] = value; }
    };
    Object.defineProperty(element, 'id', {
      get() { return this._id || ''; },
      set(value) { this._id = value; if (value) elements.set(value, this); }
    });
    return element;
  };

  const firstScript = {
    parentNode: {
      insertBefore(node) { appendedScripts.push(node); }
    }
  };
  const document = {
    readyState: 'complete',
    body: makeElement('body'),
    head: makeElement('head'),
    createElement: makeElement,
    querySelector(selector) { return this.body.children.find(child => child.tagName.toLowerCase() === selector) || null; },
    getElementById(id) { return elements.get(id) || null; },
    getElementsByTagName(tag) { return tag === 'script' ? [firstScript] : []; },
    addEventListener() {}
  };
  const main = makeElement('main');
  document.body.appendChild(main);
  let footer;
  if (options.footer) {
    footer = makeElement('footer');
    const list = makeElement('ul');
    const item = makeElement('li');
    const policy = makeElement('a');
    policy.href = '/cookies.html';
    item.appendChild(policy);
    list.appendChild(item);
    footer.appendChild(list);
    document.body.appendChild(footer);
  }
  const localStorage = {
    getItem(key) {
      storageReads.push(key);
      if (options.storageUnavailable) throw new Error('Storage unavailable');
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      if (options.storageUnavailable || options.storageWriteUnavailable) throw new Error('Storage unavailable');
      store.set(key, value);
    },
    removeItem(key) { store.delete(key); }
  };
  const window = {
    document,
    localStorage,
    addEventListener(type, fn) { windowEvents.set(type, fn); },
    location: { pathname: '/' },
    NPUK_GOOGLE_CONFIG: googleConfig
  };
  const sandbox = { window, document, localStorage, console, setTimeout, clearTimeout };
  vm.runInNewContext(source, sandbox);
  function storageEvent(key, newValue, storageArea = localStorage) {
    windowEvents.get('storage')({ key, newValue, storageArea });
  }
  return { window, document, main, footer, store, appendedScripts, elements, storageReads, storageEvent };
}

test('shows consent UI without loading TikTok before a choice', () => {
  const app = boot();
  assert.equal(app.appendedScripts.length, 0);
  assert.equal(app.elements.get('npuk-cookie-banner').hidden, false);
  assert.equal(app.elements.get('npuk-cookie-settings').hidden, true);
  assert.ok(app.window.NPUKAnalytics);
});

test('blank Google config stays dormant after analytics consent', () => {
  const app = boot();
  app.window.NPUKAnalytics.accept();
  const googleScripts = app.appendedScripts.filter(script => /googletagmanager\.com/.test(script.src || ''));
  assert.equal(googleScripts.length, 0);
});

test('rejection persists and keeps TikTok blocked', () => {
  const app = boot();
  app.window.NPUKAnalytics.reject();
  assert.equal(app.store.get('npuk_analytics_consent'), 'rejected');
  assert.equal(app.appendedScripts.length, 0);
  assert.equal(app.elements.get('npuk-cookie-banner').hidden, true);
});

test('acceptance loads the configured pixel once', () => {
  const app = boot();
  app.window.NPUKAnalytics.accept();
  app.window.NPUKAnalytics.accept();
  assert.equal(app.store.get('npuk_analytics_consent'), 'accepted');
  assert.equal(app.appendedScripts.length, 1);
  assert.match(app.appendedScripts[0].src, /sdkid=D8RU9FBC77UATVQ6JIUG/);
  assert.equal(app.window.ttq.filter(call => call[0] === 'page').length, 1);
});

test('GA4 loads only after consent when a measurement ID is configured', () => {
  const app = boot(null, { ga4MeasurementId: 'G-TEST12345' });
  assert.equal(app.appendedScripts.some(script => /gtag\/js/.test(script.src || '')), false);

  app.window.NPUKAnalytics.accept();

  assert.equal(app.appendedScripts.filter(script => /gtag\/js\?id=G-TEST12345/.test(script.src || '')).length, 1);
  assert.deepEqual(app.window.dataLayer[0][0], 'consent');
  assert.deepEqual(app.window.dataLayer[0][1], 'default');
  assert.deepEqual(app.window.dataLayer[1][0], 'consent');
  assert.deepEqual(app.window.dataLayer[1][1], 'update');
  assert.equal(app.window.dataLayer.some(args => args[0] === 'config' && args[1] === 'G-TEST12345'), true);
});

test('GTM loads after consent and takes priority over direct GA4 when configured', () => {
  const app = boot(null, { ga4MeasurementId: 'G-TEST12345', gtmContainerId: 'GTM-TEST123' });
  app.window.NPUKAnalytics.accept();
  assert.equal(app.appendedScripts.filter(script => /gtm\.js\?id=GTM-TEST123/.test(script.src || '')).length, 1);
  assert.equal(app.appendedScripts.some(script => /gtag\/js/.test(script.src || '')), false);
});

test('Google commerce events use GA4 event names and item payloads', () => {
  const app = boot(null, { ga4MeasurementId: 'G-TEST12345' });
  app.window.NPUKAnalytics.accept();
  app.window.NPUKAnalytics.track('AddToCart', {
    contents: [{ content_id: 'Retatrutide:10mg', content_name: 'Retatrutide', quantity: 2, price: 45 }],
    value: 90,
    currency: 'GBP'
  });
  const event = app.window.dataLayer.find(args => args[0] === 'event' && args[1] === 'add_to_cart');
  assert.ok(event, 'expected add_to_cart event');
  assert.equal(event[2].currency, 'GBP');
  assert.equal(event[2].value, 90);
  assert.deepEqual(JSON.parse(JSON.stringify(event[2].items)), [{
    item_id: 'Retatrutide:10mg',
    item_name: 'Retatrutide',
    quantity: 2,
    price: 45
  }]);
});

test('saved acceptance loads TikTok at startup', () => {
  assert.equal(boot('accepted').appendedScripts.length, 1);
});

test('a genuine reload sends one new PageView', () => {
  const firstPage = boot('accepted');
  const reloadedPage = boot('accepted');
  assert.equal(firstPage.window.ttq.filter(call => call[0] === 'page').length, 1);
  assert.equal(reloadedPage.window.ttq.filter(call => call[0] === 'page').length, 1);
});

test('events before consent are discarded rather than queued', () => {
  const app = boot();
  assert.equal(app.window.NPUKAnalytics.track('AddToCart', { value: 10 }), false);
  assert.equal(app.appendedScripts.length, 0);
  assert.equal(app.window.ttq, undefined);
});

test('cookie settings reopens the banner after a saved choice', () => {
  const app = boot('rejected');
  assert.equal(app.elements.get('npuk-cookie-banner').hidden, true);
  assert.equal(app.elements.get('npuk-cookie-settings').hidden, false);
  app.window.NPUKAnalytics.openSettings();
  assert.equal(app.elements.get('npuk-cookie-banner').hidden, false);
  assert.equal(app.elements.get('npuk-cookie-settings').hidden, true);
  assert.equal(app.document.activeElement, app.elements.get('npuk-cookie-banner'));
  app.window.NPUKAnalytics.reject();
  assert.equal(app.elements.get('npuk-cookie-settings').hidden, false);
  assert.equal(app.document.activeElement, app.elements.get('npuk-cookie-settings'));
  assert.equal(app.document.activeElement.focusOptions.preventScroll, true);
  assert.equal(app.appendedScripts.length, 0);
});

test('saved-choice control is placed beside the existing footer policy links', () => {
  const app = boot('accepted', {}, { footer: true });
  const settings = app.elements.get('npuk-cookie-settings');
  assert.equal(settings.closest('footer'), app.footer);
  assert.equal(settings.parentNode.tagName, 'LI');
  assert.equal(settings.parentNode.parentNode.children[0].children[0].href, '/cookies.html');
  assert.equal(app.elements.has('npuk-cookie-utility'), false);
  assert.equal(app.elements.get('npuk-cookie-banner').hidden, true);
});

test('checkout gets a small settings footer directly after main content', () => {
  const app = boot('rejected');
  const utility = app.elements.get('npuk-cookie-utility');
  assert.equal(app.document.body.children.indexOf(utility), app.document.body.children.indexOf(app.main) + 1);
  assert.equal(utility.children[0], app.elements.get('npuk-cookie-settings'));
  assert.equal(utility.hidden, false);
  app.window.NPUKAnalytics.openSettings();
  assert.equal(utility.hidden, true);
  app.window.NPUKAnalytics.reject();
  assert.equal(utility.hidden, false);
});

test('acceptance still applies for the current page when browser storage is unavailable', () => {
  const app = boot(null, { ga4MeasurementId: 'G-TEST12345' }, { storageUnavailable: true });
  assert.equal(app.appendedScripts.length, 0);
  app.window.NPUKAnalytics.accept();
  assert.equal(app.window.NPUKAnalytics.getConsent(), 'accepted');
  assert.equal(app.elements.get('npuk-cookie-banner').hidden, true);
  assert.equal(app.window.NPUKAnalytics.track('AddToCart', { value: 10 }), true);
  app.window.NPUKAnalytics.reject();
  assert.equal(app.window.NPUKAnalytics.getConsent(), 'rejected');
  assert.equal(app.window.NPUKAnalytics.track('AddToCart', { value: 10 }), false);
});

test('reopening settings and rejecting saved acceptance blocks subsequent events', () => {
  const app = boot('accepted', { ga4MeasurementId: 'G-TEST12345' });
  app.window.NPUKAnalytics.openSettings();
  app.window.NPUKAnalytics.reject();
  assert.equal(app.window.NPUKAnalytics.track('AddToCart', { value: 10 }), false);
  assert.equal(app.window.ttq.at(-1)[0], 'revokeConsent');
  assert.equal(app.window.dataLayer.at(-1)[2].analytics_storage, 'denied');
  app.window.NPUKAnalytics.accept();
  assert.equal(app.window.ttq.at(-1)[0], 'grantConsent');
  assert.equal(app.window.dataLayer.at(-1)[2].analytics_storage, 'granted');
  assert.equal(app.appendedScripts.length, 2, 'changing choices must not duplicate analytics scripts');
});

test('unrecognized stored consent asks for a choice and never loads analytics', () => {
  const app = boot('unexpected');
  assert.equal(app.elements.get('npuk-cookie-banner').hidden, false);
  assert.equal(app.appendedScripts.length, 0);
});

test('a rejection in another tab blocks commerce tracking before its storage event arrives', () => {
  const store = new Map();
  const first = boot(null, {}, { store });
  const second = boot(null, {}, { store });
  first.window.NPUKAnalytics.accept();
  second.window.NPUKAnalytics.reject();
  assert.equal(first.window.NPUKAnalytics.getConsent(), 'rejected');
  assert.equal(first.window.NPUKAnalytics.track('AddToCart', { value: 10 }), false);
});

test('cross-tab rejection revokes loaded SDKs and later acceptance restores them without reloading', () => {
  const store = new Map();
  const first = boot(null, { ga4MeasurementId: 'G-TEST12345' }, { store });
  const second = boot(null, {}, { store });
  first.window.NPUKAnalytics.accept();
  second.window.NPUKAnalytics.reject();
  first.storageEvent('npuk_analytics_consent', 'rejected');
  assert.equal(first.window.ttq.at(-1)[0], 'revokeConsent');
  assert.equal(first.window.dataLayer.at(-1)[2].analytics_storage, 'denied');
  assert.equal(first.elements.get('npuk-cookie-banner').hidden, true);
  second.window.NPUKAnalytics.accept();
  first.storageEvent('npuk_analytics_consent', 'accepted');
  assert.equal(first.window.ttq.at(-1)[0], 'grantConsent');
  assert.equal(first.window.dataLayer.at(-1)[2].analytics_storage, 'granted');
  assert.equal(first.window.NPUKAnalytics.track('AddToCart', { value: 10 }), true);
  assert.equal(first.appendedScripts.length, 2);
});

test('clearing consent in another tab revokes analytics and requests a new choice', () => {
  const app = boot('accepted', { ga4MeasurementId: 'G-TEST12345' });
  app.store.delete('npuk_analytics_consent');
  app.storageEvent(null, null);
  assert.equal(app.window.ttq.at(-1)[0], 'revokeConsent');
  assert.equal(app.window.dataLayer.at(-1)[2].analytics_storage, 'denied');
  assert.equal(app.elements.get('npuk-cookie-banner').hidden, false);
  assert.equal(app.window.NPUKAnalytics.track('AddToCart', { value: 10 }), false);
});

test('unrelated storage events are ignored without reading storage', () => {
  const app = boot('accepted');
  const reads = app.storageReads.length;
  const calls = app.window.ttq.length;
  app.storageEvent('basket', 'rejected');
  app.storageEvent('npuk_analytics_consent', 'rejected', {});
  assert.equal(app.storageReads.length, reads);
  assert.equal(app.window.ttq.length, calls);
  assert.deepEqual([...new Set(app.storageReads)], ['npuk_analytics_consent']);
});

test('failed consent writes preserve the current rejection despite an older stored acceptance', () => {
  const options = { storageWriteUnavailable: true };
  const app = boot('accepted', {}, options);
  app.window.NPUKAnalytics.reject();
  assert.equal(app.store.get('npuk_analytics_consent'), 'accepted');
  assert.equal(app.window.NPUKAnalytics.getConsent(), 'rejected');
  assert.equal(app.window.NPUKAnalytics.track('AddToCart', { value: 10 }), false);
  options.storageWriteUnavailable = false;
  app.window.NPUKAnalytics.accept();
  app.store.set('npuk_analytics_consent', 'rejected');
  assert.equal(app.window.NPUKAnalytics.getConsent(), 'rejected');
});
