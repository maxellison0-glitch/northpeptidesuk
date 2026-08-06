'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const core = require('../server/commerce-core.js');
const createOrder = require('../api/create-order.js');

function clientDiscounts(source) {
  const start = source.indexOf('const DISCOUNT_CODES = {');
  const block = source.slice(start, source.indexOf('};', start));
  return Object.fromEntries([...block.matchAll(/'([^']+)':\s*([\d.]+)/g)].map(match => [match[1], Number(match[2])]));
}

function mockResponse() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; }
  };
}

test('public site discount codes stay in parity and test-only codes are absent', () => {
  const checkoutHtml = fs.readFileSync(path.join(ROOT, 'checkout.html'), 'utf8');
  assert.deepEqual(core.PUBLIC_DISCOUNT_CODES, clientDiscounts(checkoutHtml));
  assert.doesNotMatch(checkoutHtml, /FIRST40|ADMININVALID|SHELLEY/);
  assert.equal(core.DISCOUNT_CODES.FIRST40, undefined);
});

test('trusted catalogue ignores browser prices, normalises doses and caps quantity', () => {
  const result = core.validateOrderItems([{
    name: 'GHK-Cu Pen Vial',
    dose: '50mg/3ml',
    price: 0.01,
    qty: 99
  }], 0.20);

  assert.equal(result.error, undefined);
  assert.equal(result.items[0].qty, 12);
  assert.equal(result.items[0].unitPrice, 33.6);
  assert.ok(Math.abs(result.productSubtotal - 403.2) < 1e-9);
});

test('crafted catalogue entries are rejected before an order is created', () => {
  const result = core.validateOrderItems([{
    name: 'Pen-Style Research Kit',
    dose: 'crafted variant',
    price: 1,
    qty: 1,
    _kitFor: 'Retatrutide'
  }]);

  assert.match(result.error, /Unavailable item/);
  assert.equal(result.items, undefined);
});

test('delivery is calculated from server rules', () => {
  assert.deepEqual(core.calculateDelivery('standard', '', 49.99), {
    method: 'standard', label: 'Royal Mail Tracked 24', charge: 3.99
  });
  assert.equal(core.calculateDelivery('standard', '', 50).charge, 0);
  assert.equal(core.calculateDelivery('standard', 'AJ', 10).charge, 0);
  assert.equal(core.calculateDelivery('express', 'AJ', 100).charge, 9.99);
});

test('order API recalculates a tampered basket and sends both emails', async () => {
  const envKeys = [
    'RESEND_API_KEY', 'ORDER_NOTIFY_EMAIL', 'ORDER_FROM_EMAIL',
    'BANK_ACCOUNT_NAME', 'BANK_SORT_CODE', 'BANK_ACCOUNT_NUMBER'
  ];
  const previousEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
  const previousFetch = global.fetch;
  const calls = [];

  Object.assign(process.env, {
    RESEND_API_KEY: 're_test_example',
    ORDER_NOTIFY_EMAIL: 'owner@example.test',
    ORDER_FROM_EMAIL: 'North Peptides UK <orders@example.test>',
    BANK_ACCOUNT_NAME: 'Example Research Ltd',
    BANK_SORT_CODE: '00-00-00',
    BANK_ACCOUNT_NUMBER: '00000000'
  });
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return { ok: true, async json() { return { id: `email_${calls.length}` }; } };
  };

  const req = {
    method: 'POST',
    headers: { origin: 'https://northpeptidesuk.com' },
    body: {
      items: [{ name: 'GHK-Cu', dose: '50mg', price: 0.01, qty: 2 }],
      deliveryMethod: 'standard',
      customer: {
        name: 'Test Customer', email: 'customer@example.test',
        address1: '1 Test Street', city: 'London', postcode: 'SW1A 1AA'
      }
    }
  };
  const res = mockResponse();

  try {
    await createOrder(req, res);
  } finally {
    global.fetch = previousFetch;
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  const body = JSON.parse(res.body);
  assert.equal(res.statusCode, 200);
  assert.equal(body.success, true);
  assert.equal(body.grandTotal, '54.00');
  assert.match(body.orderRef, /^NP-\d{8}-[A-F0-9]{4}$/);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(call => call.url === 'https://api.resend.com/emails'));
  assert.ok(calls.every(call => JSON.stringify(JSON.parse(call.options.body)).includes('54')));
});

test('only allowlisted origins receive matching CORS headers', () => {
  assert.equal(core.corsHeaders('https://www.northpeptidesuk.com/')['Access-Control-Allow-Origin'], 'https://www.northpeptidesuk.com');
  assert.equal(core.corsHeaders('https://attacker.example')['Access-Control-Allow-Origin'], 'https://northpeptidesuk.com');
});

test('legacy card-processor routes, webhook and secret placeholders stay removed', () => {
  const removed = [
    'api/create-checkout-session.js',
    'api/stripe-webhook.js',
    'server/stripe-checkout.js',
    'netlify/functions/create-checkout-session.js',
    'STRIPE_WEBHOOK_SETUP.md'
  ];
  for (const file of removed) {
    assert.equal(fs.existsSync(path.join(ROOT, file)), false, `${file} must stay removed`);
  }

  const activeConfig = [
    '.env.example', 'netlify.toml', 'vercel.json',
    'api/create-order.js', 'server/commerce-core.js', 'checkout.html'
  ].map(file => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\n');
  assert.doesNotMatch(activeConfig, /STRIPE_|create-checkout-session|stripe-webhook/i);
});
