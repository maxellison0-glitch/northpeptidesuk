'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const fs = require('node:fs');

const checkoutSource = fs.readFileSync('server/stripe-checkout.js', 'utf8');
const checkout = require('../server/stripe-checkout.js');
const webhook = require('../api/stripe-webhook.js');

function response(ok, data, status = ok ? 200 : 400) {
  return { ok, status, async json() { return data; } };
}

async function createSession(payload) {
  const previousKey = process.env.STRIPE_SECRET_KEY;
  const previousFetch = global.fetch;
  let request;
  process.env.STRIPE_SECRET_KEY = 'sk_test_example';
  global.fetch = async (url, options) => {
    request = { url, options, params: new URLSearchParams(String(options.body)) };
    return response(true, { url: 'https://checkout.stripe.test/session' });
  };
  try {
    const result = await checkout.createCheckoutSession(payload, 'https://northpeptidesuk.com');
    return { result, request };
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousKey;
  }
}

function publicDiscounts(source) {
  const start = source.indexOf('const PUBLIC_DISCOUNT_CODES = {');
  const block = source.slice(start, source.indexOf('};', start));
  return Object.fromEntries([...block.matchAll(/"([^"]+)":\s*([\d.]+)/g)].map(match => [match[1], Number(match[2])]));
}

function clientDiscounts(source) {
  const start = source.indexOf('const DISCOUNT_CODES = {');
  const block = source.slice(start, source.indexOf('};', start));
  return Object.fromEntries([...block.matchAll(/'([^']+)':\s*([\d.]+)/g)].map(match => [match[1], Number(match[2])]));
}

test('public site discount codes stay in parity and FIRST40 is removed', () => {
  const checkoutHtml = fs.readFileSync('checkout.html', 'utf8');
  assert.deepEqual(publicDiscounts(checkoutSource), clientDiscounts(checkoutHtml));
  assert.doesNotMatch(checkoutSource, /FIRST40/);
  assert.doesNotMatch(checkoutHtml, /FIRST40/);
});

test('site discounts disable Stripe promotion-code stacking', async () => {
  const base = { items: [{ name: 'Pen-Style Research Kit', dose: '3ml cartridge + BAC water + x5 pen tips', price: 24.99, qty: 1 }] };
  const discounted = await createSession({ ...base, discountCode: 'AJ20' });
  assert.equal(discounted.result.statusCode, 200);
  assert.equal(discounted.request.params.get('allow_promotion_codes'), 'false');
  assert.equal(discounted.request.params.get('line_items[0][price_data][unit_amount]'), '1999');

  const fullPrice = await createSession(base);
  assert.equal(fullPrice.request.params.get('allow_promotion_codes'), 'true');
  assert.equal(fullPrice.request.params.get('line_items[0][price_data][unit_amount]'), '2499');
});

test('crafted pen-kit metadata cannot select a browser-controlled tier price', async () => {
  const crafted = await createSession({ items: [{
    name: 'Pen-Style Research Kit',
    dose: 'crafted variant',
    price: 14.99,
    qty: 1,
    _kitFor: 'Retatrutide',
    _kitVolume: 3
  }] });
  assert.equal(crafted.result.statusCode, 400);
  assert.match(JSON.parse(crafted.result.body).error, /Unavailable item/);
  assert.equal(crafted.request, undefined);
});

function signedRequest(event, secret) {
  const raw = Buffer.from(JSON.stringify(event));
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest('hex');
  const req = Readable.from([raw]);
  req.method = 'POST';
  req.headers = { 'stripe-signature': `t=${timestamp},v1=${signature}` };
  return req;
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

async function deliver(event) {
  const env = {
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ORDER_NOTIFY_EMAIL: process.env.ORDER_NOTIFY_EMAIL
  };
  const previousFetch = global.fetch;
  const calls = [];
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_example';
  process.env.STRIPE_SECRET_KEY = 'sk_test_example';
  process.env.RESEND_API_KEY = 're_test_example';
  process.env.ORDER_NOTIFY_EMAIL = 'owner@example.test';
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('/line_items')) return response(true, { data: [] });
    return response(true, { id: `email_${calls.length}` });
  };
  const res = mockResponse();
  try {
    await webhook(signedRequest(event, process.env.STRIPE_WEBHOOK_SECRET), res);
    return { res, calls, body: JSON.parse(res.body) };
  } finally {
    global.fetch = previousFetch;
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function session(paymentStatus = 'unpaid') {
  return {
    id: 'cs_test_delayed', payment_status: paymentStatus, amount_total: 2499, currency: 'gbp',
    customer_details: { name: 'Test Customer', email: 'customer@example.test' }, metadata: {}
  };
}

test('completed but unpaid Checkout sessions return 200 without fulfilment', async () => {
  const delivery = await deliver({ id: 'evt_unpaid', type: 'checkout.session.completed', data: { object: session('unpaid') } });
  assert.equal(delivery.res.statusCode, 200);
  assert.equal(delivery.body.fulfilled, false);
  assert.equal(delivery.calls.length, 0);
});

test('completed and paid Checkout sessions fulfil normally', async () => {
  const delivery = await deliver({ id: 'evt_paid', type: 'checkout.session.completed', data: { object: session('paid') } });
  assert.equal(delivery.res.statusCode, 200);
  assert.equal(delivery.calls.length, 3);
  assert.equal(delivery.calls.filter(call => call.url.includes('api.resend.com')).length, 2);
});

test('async payment success fulfils with stable per-session email idempotency keys', async () => {
  const delivery = await deliver({ id: 'evt_success', type: 'checkout.session.async_payment_succeeded', data: { object: session('paid') } });
  assert.equal(delivery.res.statusCode, 200);
  assert.equal(delivery.calls.length, 3);
  const emailCalls = delivery.calls.filter(call => call.url.includes('api.resend.com'));
  assert.deepEqual(emailCalls.map(call => call.options.headers['Idempotency-Key']), [
    'checkout-owner-cs_test_delayed',
    'checkout-customer-cs_test_delayed'
  ]);
});

test('async payment failure notifies only the owner and does not fulfil', async () => {
  const delivery = await deliver({ id: 'evt_failed', type: 'checkout.session.async_payment_failed', data: { object: session('unpaid') } });
  assert.equal(delivery.res.statusCode, 200);
  assert.equal(delivery.body.fulfilled, false);
  assert.equal(delivery.calls.length, 1);
  assert.equal(delivery.calls[0].options.headers['Idempotency-Key'], 'checkout-payment-failed-owner-cs_test_delayed');
  const payload = JSON.parse(delivery.calls[0].options.body);
  assert.deepEqual(payload.to, ['owner@example.test']);
  assert.match(payload.subject, /Payment failed/);
});
