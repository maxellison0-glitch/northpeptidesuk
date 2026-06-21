const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('tiktok-analytics.js', 'utf8');

function boot(savedConsent) {
  const store = new Map(savedConsent ? [['npuk_analytics_consent', savedConsent]] : []);
  const appendedScripts = [];
  const elements = new Map();

  const makeElement = tag => {
    const element = {
      tagName: tag.toUpperCase(),
      style: {},
      dataset: {},
      children: [],
      hidden: false,
      classList: { add() {}, remove() {} },
      append(...children) { this.children.push(...children); },
      appendChild(child) { this.children.push(child); },
      addEventListener(type, fn) { this[`on${type}`] = fn; },
      setAttribute() {}
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

test('shows consent UI without loading TikTok before a choice', () => {
  const app = boot();
  assert.equal(app.appendedScripts.length, 0);
  assert.equal(app.elements.get('npuk-cookie-banner').hidden, false);
  assert.ok(app.window.NPUKAnalytics);
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
  app.window.NPUKAnalytics.openSettings();
  assert.equal(app.elements.get('npuk-cookie-banner').hidden, false);
});
