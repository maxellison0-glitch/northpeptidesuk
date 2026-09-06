'use strict';

// Executes checkout.html's inline script in a stub DOM and asserts the order
// summary actually renders. A regex-only check cannot catch a ReferenceError
// that stops updateTotals() from running (the "subtotal stuck at £0" bug).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const core = require('../server/commerce-core.js');
const checkoutHtml = fs.readFileSync(path.join(ROOT, 'checkout.html'), 'utf8');

function inlineCheckoutScript() {
  const scripts = [...checkoutHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  const main = scripts.find(source => source.includes('basketData'));
  assert.ok(main, 'checkout.html must contain its inline basket script');
  return main;
}

function bootCheckout(basket) {
  const elements = new Map();
  const makeElement = id => ({
    id,
    style: {},
    dataset: {},
    textContent: '',
    innerHTML: '',
    value: '',
    listeners: {},
    addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); },
    classList: { add() {}, remove() {}, contains: () => false },
    closest: () => ({ classList: { add() {}, remove() {} } })
  });
  const byId = id => {
    if (!elements.has(id)) elements.set(id, makeElement(id));
    return elements.get(id);
  };

  const standardRadio = { value: 'standard', dataset: { price: '', label: 'Royal Mail Tracked 24' } };
  const document = {
    getElementById: byId,
    querySelector: selector => (selector === 'input[name="delivery"]:checked' ? standardRadio : null),
    querySelectorAll: () => [],
    addEventListener() {}
  };
  const store = new Map([['npuk_basket', JSON.stringify(basket)]]);
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, value); },
    removeItem(key) { store.delete(key); }
  };
  const windowListeners = {};
  const window = {
    document,
    localStorage,
    location: { origin: 'https://northpeptidesuk.com' },
    addEventListener(type, fn) { (windowListeners[type] = windowListeners[type] || []).push(fn); }
  };

  const sandbox = { window, document, localStorage, console, setTimeout, clearTimeout };
  vm.runInNewContext(inlineCheckoutScript(), sandbox);
  for (const fn of windowListeners.load || []) fn();
  return { byId };
}

test('checkout renders subtotal and total for a loaded basket', () => {
  const app = bootCheckout([{ name: 'Retatrutide Pen Vial', price: 100, dose: '20mg', qty: 1 }]);
  assert.equal(app.byId('subtotal').textContent, '£100');
  // ≥ £100 qualifies for free standard delivery.
  assert.equal(app.byId('grand-total').textContent, '£100');
  assert.equal(app.byId('standard-delivery-price').textContent, 'FREE');
});

test('checkout adds the standard delivery charge below the free-delivery threshold', () => {
  const app = bootCheckout([{ name: 'Retatrutide', price: 45, dose: '10mg', qty: 1 }]);
  assert.equal(app.byId('subtotal').textContent, '£45');
  const expected = 45 + core.DELIVERY.standard.price;
  assert.equal(app.byId('grand-total').textContent, '£' + expected.toFixed(2).replace('.00', ''));
});

test('client delivery prices stay in parity with server rules', () => {
  const standard = checkoutHtml.match(/value="standard" data-price="([\d.]+)"/);
  const tracked24 = checkoutHtml.match(/value="tracked24" data-price="([\d.]+)"/);
  const dhl = checkoutHtml.match(/value="dhl" data-price="([\d.]+)"/);
  assert.ok(standard && tracked24 && dhl, 'all three delivery radios must declare data-price');
  assert.equal(Number(standard[1]), core.DELIVERY.standard.price);
  assert.equal(Number(tracked24[1]), core.DELIVERY.tracked24.price);
  assert.equal(Number(dhl[1]), core.DELIVERY.dhl.price);
  // updateTotals() re-applies the standard charge from its own constant — keep it in sync too.
  const fallback = checkoutHtml.match(/deliveryPrice = freeDelivery \? 0 : ([\d.]+);/);
  assert.ok(fallback, 'updateTotals must set the standard delivery fallback price');
  assert.equal(Number(fallback[1]), core.DELIVERY.standard.price);
});

test('tracked24 drops to £4.99 once the order qualifies for free delivery', () => {
  assert.equal(core.calculateDelivery('tracked24', '', 150).charge, 4.99);
  assert.equal(core.calculateDelivery('tracked24', '', 90).charge, core.DELIVERY.tracked24.price);
  assert.equal(core.calculateDelivery('tracked24', 'SUMMERSHIP', 20).charge, 4.99);
  assert.equal(core.calculateDelivery('dhl', '', 150).charge, core.DELIVERY.dhl.price);
  assert.equal(core.DELIVERY.tracked24.freeOrderPrice, 4.99);
  assert.ok(checkoutHtml.includes('deliveryPrice = freeDelivery ? 4.99 : 6.99;'), 'client must mirror the tracked24 discount rule');
});
