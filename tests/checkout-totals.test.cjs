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

function bootCheckout(basket, hash = '') {
  const elements = new Map();
  const makeClassList = () => {
    const classes = new Set();
    return {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); }
    };
  };
  const makeElement = id => ({
    id,
    style: {},
    dataset: {},
    textContent: '',
    innerHTML: '',
    value: '',
    open: false,
    listeners: {},
    addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); },
    setAttribute(name, value) { this[name] = value; },
    scrollIntoView() { this.scrolledIntoView = true; },
    classList: makeClassList(),
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
    location: { origin: 'https://northpeptidesuk.com', hash },
    addEventListener(type, fn) { (windowListeners[type] = windowListeners[type] || []).push(fn); }
  };

  const sandbox = { window, document, localStorage, console, setTimeout, clearTimeout };
  vm.runInNewContext(inlineCheckoutScript(), sandbox);
  for (const fn of windowListeners.load || []) fn();
  return {
    byId,
    call(name, ...args) { return sandbox[name](...args); },
    navigateHash(nextHash) {
      window.location.hash = nextHash;
      for (const fn of windowListeners.hashchange || []) fn();
    },
    basket() { return JSON.parse(store.get('npuk_basket') || '[]'); }
  };
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

const coolingItem = { name: 'Thermal Cooled Packaging', dose: 'Insulated foil pouch + gel packs', price: 5, qty: 1 };
const isCoolingItem = item => item.name === coolingItem.name && item.dose === coolingItem.dose;

test('optional chilled packaging is available for standard, pen, and accessory-only baskets', () => {
  const baskets = [
    [{ name: 'Retatrutide', dose: '10mg', price: 50, qty: 1 }],
    [{ name: 'Retatrutide Pen Vial', dose: '10mg', price: 70, qty: 1 }],
    [{ name: 'Alcohol Wipes', dose: '10 pack', price: 3, qty: 1 }]
  ];
  for (const basket of baskets) {
    const app = bootCheckout(basket);
    assert.equal(app.byId('smart-section').style.display, '', basket[0].name);
    assert.equal(app.byId('cooling-toggle').textContent, 'Add to order');
    assert.equal(app.byId('cooling-status').hidden, true);
    assert.equal(app.basket().some(isCoolingItem), false, 'packaging must remain optional');
  }
  assert.equal(bootCheckout([]).byId('smart-section').style.display, 'none');
});

test('chilled packaging adds, persists after refresh, and removes from its own card', () => {
  const basket = [{ name: 'Retatrutide Pen Vial', dose: '10mg', price: 70, qty: 1 }];
  let app = bootCheckout(basket);
  app.call('toggleCoolingPackaging', app.byId('cooling-toggle'));
  assert.deepEqual(app.basket(), [...basket, coolingItem]);
  assert.equal(app.byId('subtotal').textContent, '£75');
  assert.equal(app.byId('grand-total').textContent, '£78.99');
  assert.equal(app.byId('cooling-toggle').textContent, 'Remove');
  assert.equal(app.byId('cooling-card').classList.contains('in-order'), true);
  assert.equal(app.byId('cooling-status').hidden, false);
  assert.match(app.byId('checkout-lines').innerHTML, /Thermal Cooled Packaging/);

  app = bootCheckout(app.basket());
  assert.equal(app.byId('cooling-toggle').textContent, 'Remove');
  app.call('toggleCoolingPackaging', app.byId('cooling-toggle'));
  assert.deepEqual(app.basket(), basket);
  assert.equal(app.byId('subtotal').textContent, '£70');
  assert.equal(app.byId('grand-total').textContent, '£73.99');
  assert.equal(app.byId('cooling-toggle').textContent, 'Add to order');
  assert.equal(app.byId('cooling-toggle')['aria-label'], 'Add chilled packaging to your order');
  assert.equal(app.byId('cooling-status').hidden, true);
  assert.equal(bootCheckout(app.basket()).byId('cooling-toggle').textContent, 'Add to order');
});

test('chilled packaging is charged once across every add path and the order-summary remove stays in sync', () => {
  const app = bootCheckout([{ name: 'GHK-Cu', dose: '50mg', price: 30, qty: 1 }]);
  app.call('addCoolingPackaging', app.byId('cooling-toggle'));
  app.call('addCoolingPackaging', app.byId('cooling-toggle'));
  app.call('addReachItem', null, coolingItem.name, coolingItem.price, coolingItem.dose);
  app.call('addCheckoutAddon', null, coolingItem.name, coolingItem.price, coolingItem.dose);
  app.call('changeCheckoutQty', 1, 1);
  assert.deepEqual(app.basket().filter(isCoolingItem), [coolingItem]);
  assert.equal(app.byId('subtotal').textContent, '£35');
  const packagingLine = app.byId('checkout-lines').innerHTML.split('data-item-name="Thermal Cooled Packaging"')[1];
  assert.ok(packagingLine.includes('Per order'));
  assert.ok(!packagingLine.includes('Increase quantity'), 'per-order packaging must have no quantity stepper');
  app.call('removeCheckoutItem', 1);
  assert.equal(app.byId('cooling-toggle').textContent, 'Add to order');
  assert.equal(app.byId('cooling-status').hidden, true);
  assert.equal(app.byId('subtotal').textContent, '£30');
});

test('older saved baskets are repaired to one £5 packaging charge before display and submission', () => {
  const app = bootCheckout([
    { name: 'GHK-Cu', dose: '50mg', price: 30, qty: 1 },
    { ...coolingItem, qty: 3, price: 10 },
    { ...coolingItem, qty: 2 }
  ]);
  assert.deepEqual(app.basket().filter(isCoolingItem), [coolingItem]);
  assert.equal(app.byId('subtotal').textContent, '£35');
  assert.equal(app.byId('cooling-toggle').textContent, 'Remove');
  assert.equal(core.validateOrderItems(app.basket()).grossSubtotal, 35);
});

test('packaging totals and free delivery stay in parity with server pricing, including discounts', () => {
  const basket = [
    { name: 'Retatrutide Pen Vial', dose: '10mg', price: 70, qty: 1 },
    { name: 'BPC-157', dose: '10mg', price: 25, qty: 1 }
  ];
  const app = bootCheckout(basket);
  assert.equal(app.byId('grand-total').textContent, '£98.99');
  app.call('addCoolingPackaging', app.byId('cooling-toggle'));
  for (const [code, pct] of [['', 0], ['WELCOME10', 0.1]]) {
    if (code) {
      app.byId('discount-input').value = code;
      app.call('applyDiscount');
    }
    const server = core.validateOrderItems(app.basket(), pct);
    assert.equal(server.error, undefined);
    assert.equal(server.items.find(isCoolingItem).listTotal, 5);
    const delivery = core.calculateDelivery('standard', code, server.grossSubtotal);
    const expected = '£' + (server.productSubtotal + delivery.charge).toFixed(2).replace('.00', '');
    assert.equal(app.byId('grand-total').textContent, expected);
    assert.equal(app.byId('standard-delivery-price').textContent, 'FREE');
  }
  app.call('toggleCoolingPackaging', app.byId('cooling-toggle'));
  assert.equal(app.byId('grand-total').textContent, '£89.49');
  assert.equal(app.byId('standard-delivery-price').textContent, '£3.99');
});

test('checkout upsells share a native disclosure that is closed by default and keeps delivery outside it', () => {
  const disclosure = checkoutHtml.match(/<details\b[^>]*id="checkout-extras"[^>]*>([\s\S]*?)<\/details>/);
  assert.ok(disclosure, 'all checkout upsells must sit in one native disclosure');
  assert.doesNotMatch(disclosure[0].split('>')[0], /\sopen(?:\s|=|$)/);
  assert.match(disclosure[1], /<summary\b/);
  assert.match(disclosure[1], /Optional extras/);
  assert.match(disclosure[1], /Chilled packaging £5 · research supplies/);
  for (const id of ['chilled-packaging', 'reach-module', 'supplies-head']) {
    assert.ok(disclosure[1].includes('id="' + id + '"'), id + ' must be inside the disclosure');
  }
  assert.doesNotMatch(disclosure[1], /id="delivery-standard"|id="checkout-form"|id="discount-input"/);
  const app = bootCheckout([{ name: 'Retatrutide', dose: '10mg', price: 50, qty: 1 }]);
  assert.equal(app.byId('checkout-extras').open, false);
  app.call('addCoolingPackaging', app.byId('cooling-toggle'));
  assert.equal(app.byId('checkout-extras').open, false, 'basket changes must not force extras open');
  assert.equal(bootCheckout(app.basket()).byId('checkout-extras').open, false, 'refresh should keep the default checkout compact');
});

test('direct chilled packaging links open the disclosure on load and hash changes', () => {
  const basket = [{ name: 'Retatrutide', dose: '10mg', price: 50, qty: 1 }];
  const direct = bootCheckout(basket, '#chilled-packaging');
  assert.equal(direct.byId('checkout-extras').open, true);
  assert.equal(direct.byId('chilled-packaging').scrolledIntoView, true);
  direct.byId('checkout-extras').open = false;
  direct.call('addCoolingPackaging', direct.byId('cooling-toggle'));
  assert.equal(direct.byId('checkout-extras').open, false, 'the customer can close extras even while the packaging hash remains');

  const app = bootCheckout(basket);
  app.navigateHash('#delivery-standard');
  assert.equal(app.byId('checkout-extras').open, false);
  app.navigateHash('#chilled-packaging');
  assert.equal(app.byId('checkout-extras').open, true);
  app.call('addCoolingPackaging', app.byId('cooling-toggle'));
  assert.equal(app.byId('checkout-extras').open, true, 'adding an extra must preserve an open disclosure');
});

test('collapsed extras summary shows selected packaging and supplies and updates on removal', () => {
  const app = bootCheckout([{ name: 'Retatrutide', dose: '10mg', price: 50, qty: 1 }]);
  assert.equal(app.byId('extras-selection').hidden, true);
  app.call('addCoolingPackaging', app.byId('cooling-toggle'));
  assert.equal(app.byId('extras-selection').textContent, 'Chilled packaging added');
  assert.equal(app.byId('extras-selection').hidden, false);
  app.call('addCheckoutAddon', null, 'Alcohol Wipes', 3, '10 pack');
  assert.equal(app.byId('extras-selection').textContent, 'Chilled packaging added · 1 supply item in your order');
  app.call('toggleCoolingPackaging', app.byId('cooling-toggle'));
  assert.equal(app.byId('extras-selection').textContent, '1 supply item in your order');
  app.call('removeCheckoutItem', 1);
  assert.equal(app.byId('extras-selection').hidden, true);
  assert.equal(app.byId('checkout-extras').open, false);
});
