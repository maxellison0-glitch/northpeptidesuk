'use strict';

// End-to-end through the real handlers: checkout saves the order, the dispatch
// page API marks it dispatched, and the review email goes out once. Vercel Blob
// and Resend are replaced with in-memory fakes.

const test = require('node:test');
const assert = require('node:assert/strict');
const { createFakeBlob } = require('./fake-blob.cjs');

const createOrder = require('../api/create-order.js');
const orders = require('../api/orders.js');
const reviewRequests = require('../api/review-requests.js');

const ADMIN_KEY = 'admin-key-for-tests-0123456789';
const CRON_SECRET = 'cron-secret-for-tests-0123456789';
const ENV = {
  RESEND_API_KEY: 're_test',
  ORDER_NOTIFY_EMAIL: 'owner@example.com',
  ORDER_FROM_EMAIL: 'North Peptides UK <no-reply@northpeptidesuk.com>',
  BANK_ACCOUNT_NAME: 'North Peptides',
  BANK_SORT_CODE: '00-00-00',
  BANK_ACCOUNT_NUMBER: '12345678',
  ORDER_DATA_KEY: 'order-data-key-for-tests-0123456789',
  ADMIN_KEY,
  CRON_SECRET
};

const blobPath = require.resolve('@vercel/blob');

// Swaps in fake Blob, a recording Resend and the given env for one test.
async function withFakes(envOverrides, fn) {
  const blob = createFakeBlob();
  const emails = [];
  const previousEnv = {};
  const env = { ...ENV, ...envOverrides };
  for (const name of Object.keys(env)) {
    previousEnv[name] = process.env[name];
    if (env[name] === undefined) delete process.env[name];
    else process.env[name] = env[name];
  }
  const previousFetch = global.fetch;
  const previousBlob = require.cache[blobPath];
  require.cache[blobPath] = {
    id: blobPath,
    filename: blobPath,
    loaded: true,
    exports: { list: blob.list, put: blob.put, get: blob.get, del: blob.del }
  };
  global.fetch = async (url, options) => {
    emails.push({ url, headers: options.headers, body: JSON.parse(options.body) });
    return { ok: true, status: 200, headers: new Headers(), json: async () => ({ id: `email-${emails.length}` }) };
  };
  try {
    await fn({ blob, emails });
  } finally {
    global.fetch = previousFetch;
    if (previousBlob) require.cache[blobPath] = previousBlob;
    else delete require.cache[blobPath];
    for (const [name, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

async function invoke(handler, { method = 'GET', body, headers = {} } = {}) {
  const req = { method, body, headers: { origin: 'https://www.northpeptidesuk.com', ...headers } };
  const res = {
    headers: {},
    statusCode: 200,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    send(payload) { this.body = payload ? JSON.parse(payload) : payload; return this; },
    end() { return this; }
  };
  await handler(req, res);
  return res;
}

const asAdmin = { authorization: `Bearer ${ADMIN_KEY}` };

function placeOrder() {
  return invoke(createOrder, {
    method: 'POST',
    body: {
      items: [{ name: 'BPC-157', dose: '10mg', qty: 2 }],
      deliveryMethod: 'standard',
      customer: {
        name: 'Sam Smith',
        email: 'sam@example.com',
        phone: '07700900123',
        address1: '1 High Street',
        city: 'Leeds',
        postcode: 'LS1 1AA'
      }
    }
  });
}

test('orders API needs a configured, matching ADMIN_KEY', async () => {
  await withFakes({ ADMIN_KEY: undefined }, async () => {
    assert.equal((await invoke(orders, { headers: asAdmin })).statusCode, 503);
  });
  await withFakes({ ADMIN_KEY: 'short' }, async () => {
    assert.equal((await invoke(orders, { headers: { authorization: 'Bearer short' } })).statusCode, 503);
  });
  await withFakes({}, async () => {
    assert.equal((await invoke(orders)).statusCode, 401);
    assert.equal((await invoke(orders, { headers: { authorization: 'Bearer wrong-key-0123456789abc' } })).statusCode, 401);
    const ok = await invoke(orders, { headers: asAdmin });
    assert.equal(ok.statusCode, 200);
    assert.equal(ok.headers['Cache-Control'], 'no-store');
  });
});

test('the page logs in once, then uses an HttpOnly session cookie instead of the key', async () => {
  const { createSessionCookie } = require('../server/admin-auth.js');
  await withFakes({}, async () => {
    const wrong = await invoke(orders, { method: 'POST', body: { action: 'login', key: 'wrong-key-0123456789abc' } });
    assert.equal(wrong.statusCode, 401);
    assert.equal(wrong.headers['Set-Cookie'], undefined);

    const ok = await invoke(orders, { method: 'POST', body: { action: 'login', key: ADMIN_KEY } });
    assert.equal(ok.statusCode, 200);
    const cookie = ok.headers['Set-Cookie'];
    assert.match(cookie, /^npuk_admin=\d+\.[\w-]+; Max-Age=2592000; Path=\/api\/orders\/; HttpOnly; Secure; SameSite=Strict$/);
    assert.equal(cookie.includes(ADMIN_KEY), false, 'the key itself never goes into the cookie');

    const session = cookie.split(';')[0];
    assert.equal((await invoke(orders, { headers: { cookie: `theme=dark; ${session}` } })).statusCode, 200);
    const [expires, signature] = session.slice('npuk_admin='.length).split('.');
    const forged = [
      `npuk_admin=${Number(expires) + 86400}.${signature}`,
      `npuk_admin=${expires}.${signature.slice(0, -2)}${signature.endsWith('AA') ? 'BB' : 'AA'}`,
      'npuk_admin=garbage',
      createSessionCookie(Date.now() - 31 * 24 * 60 * 60 * 1000).split(';')[0]
    ];
    for (const bad of forged) {
      assert.equal((await invoke(orders, { headers: { cookie: bad } })).statusCode, 401, bad);
    }

    process.env.ADMIN_KEY = 'a-brand-new-admin-key-0123456789';
    assert.equal((await invoke(orders, { headers: { cookie: session } })).statusCode, 401, 'a new ADMIN_KEY logs every device out');

    const logout = await invoke(orders, { method: 'POST', body: { action: 'logout' } });
    assert.match(logout.headers['Set-Cookie'], /^npuk_admin=; Max-Age=0; Path=\/api\/orders\/; HttpOnly; Secure; SameSite=Strict$/);
  });
});

test('orders API reports a missing ORDER_DATA_KEY instead of failing silently', async () => {
  await withFakes({ ORDER_DATA_KEY: undefined, CRON_SECRET: undefined }, async () => {
    const res = await invoke(orders, { headers: asAdmin });
    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.body.config, { orderDataKey: false, cronSecret: false, email: true });
    assert.match(res.body.error, /ORDER_DATA_KEY/);
  });
});

function post(body) {
  return invoke(orders, { method: 'POST', headers: asAdmin, body });
}

test('checkout saves the order; paid, dispatch, both emails and undo work through the API', async () => {
  await withFakes({}, async ({ blob, emails }) => {
    const placed = await placeOrder();
    assert.equal(placed.statusCode, 200);
    assert.equal(placed.body.orderRef, 'NP-1747');
    assert.ok(blob.files.has('orders/data/NP-1747.json'), 'order record saved at checkout');

    const listed = await invoke(orders, { headers: asAdmin });
    assert.equal(listed.body.orders.length, 1);
    const [order] = listed.body.orders;
    assert.equal(order.ref, 'NP-1747');
    assert.equal(order.name, 'Sam Smith');
    assert.equal(order.town, 'Leeds');
    assert.deepEqual(order.items, [{ name: 'BPC-157 10mg', qty: 2 }]);
    assert.equal(order.paidAt, null);
    assert.equal(order.dispatchedAt, null);
    const listing = JSON.stringify(listed.body);
    for (const hidden of ['sam@example.com', '07700900123', '1 High Street', '12345678']) {
      assert.equal(listing.includes(hidden), false, `${hidden} should not reach the dispatch page`);
    }

    assert.equal((await post({ action: 'paid', refs: ['NP-9999'] })).statusCode, 400);
    assert.equal((await post({ action: 'dispatch', refs: ['../x'] })).statusCode, 400);
    const unpaid = await post({ action: 'dispatch', refs: ['NP-1747'] });
    assert.equal(unpaid.statusCode, 409);
    assert.match(unpaid.body.error, /Mark NP-1747 as paid first/);
    assert.equal((await post({ action: 'send-payment-email', ref: 'NP-1747' })).statusCode, 409);

    // Paid: the customer gets their payment confirmation straight away, once.
    const emailsBeforePaid = emails.length;
    const paid = await post({ action: 'paid', refs: ['np-1747'] });
    assert.equal(paid.statusCode, 200);
    assert.deepEqual(paid.body.results, [{ ref: 'NP-1747', status: 'paid', email: 'sent' }]);
    const confirmation = emails[emails.length - 1];
    assert.equal(emails.length, emailsBeforePaid + 1);
    assert.deepEqual(confirmation.body.to, ['sam@example.com']);
    assert.equal(confirmation.body.subject, 'Payment received — your order NP-1747 is being prepared');
    assert.equal(confirmation.headers['Idempotency-Key'], 'payment-confirmed-NP-1747');

    const paidAgain = await post({ action: 'paid', refs: ['NP-1747'] });
    assert.deepEqual(paidAgain.body.results, [{ ref: 'NP-1747', status: 'already paid', email: 'skipped', reason: 'already sent' }]);
    assert.equal((await post({ action: 'send-payment-email', ref: 'NP-1747' })).statusCode, 409);
    assert.equal(emails.length, emailsBeforePaid + 1, 'payment email never sent twice');
    const afterPaid = (await invoke(orders, { headers: asAdmin })).body.orders[0];
    assert.ok(afterPaid.paidAt);
    assert.ok(afterPaid.paymentEmailedAt);

    const tooEarly = await post({ action: 'send-review-request', ref: 'NP-1747' });
    assert.equal(tooEarly.statusCode, 409);

    const dispatched = await invoke(orders, { method: 'POST', headers: asAdmin, body: { action: 'dispatch', refs: ['np-1747'] } });
    assert.equal(dispatched.statusCode, 200);
    assert.equal(dispatched.body.results[0].status, 'dispatched');
    assert.match(dispatched.body.results[0].reviewDueDate, /^\d{4}-\d{2}-\d{2}$/);

    const emailsBefore = emails.length;
    const sent = await invoke(orders, { method: 'POST', headers: asAdmin, body: { action: 'send-review-request', ref: 'NP-1747' } });
    assert.equal(sent.statusCode, 200);
    const review = emails[emails.length - 1];
    assert.equal(emails.length, emailsBefore + 1);
    assert.deepEqual(review.body.to, ['sam@example.com']);
    assert.equal(review.body.subject, 'How was your order NP-1747?');
    assert.equal(review.body.reply_to, 'owner@example.com');
    assert.equal(review.headers['Idempotency-Key'], 'review-request-NP-1747');

    const again = await invoke(orders, { method: 'POST', headers: asAdmin, body: { action: 'send-review-request', ref: 'NP-1747' } });
    assert.equal(again.statusCode, 409);
    assert.equal(emails.length, emailsBefore + 1, 'never asked twice');

    const undo = await invoke(orders, { method: 'POST', headers: asAdmin, body: { action: 'undo-dispatch', ref: 'NP-1747' } });
    assert.equal(undo.statusCode, 409, 'no undo once the email has gone');
    assert.equal((await post({ action: 'undo-paid', ref: 'NP-1747' })).statusCode, 409, 'no undo-paid while dispatched');

    const after = (await invoke(orders, { headers: asAdmin })).body.orders[0];
    assert.ok(after.dispatchedAt);
    assert.ok(after.reviewRequestedAt);
  });
});

test('undo steps an order back: dispatched to paid, then paid to awaiting payment', async () => {
  await withFakes({}, async ({ emails }) => {
    await placeOrder();
    await post({ action: 'paid', refs: ['NP-1747'] });
    await post({ action: 'dispatch', refs: ['NP-1747'] });
    assert.equal((await post({ action: 'undo-dispatch', ref: 'NP-1747' })).statusCode, 200);
    assert.equal((await invoke(orders, { headers: asAdmin })).body.orders[0].dispatchedAt, null);

    assert.equal((await post({ action: 'undo-paid', ref: 'NP-1747' })).statusCode, 200);
    const back = (await invoke(orders, { headers: asAdmin })).body.orders[0];
    assert.equal(back.paidAt, null);

    // Paid again later: the customer already has their confirmation, so no second email.
    const emailsBefore = emails.length;
    const repaid = await post({ action: 'paid', refs: ['NP-1747'] });
    assert.deepEqual(repaid.body.results, [{ ref: 'NP-1747', status: 'paid', email: 'skipped', reason: 'already sent' }]);
    assert.equal(emails.length, emailsBefore);
  });
});

test('orders are still marked paid when email is not configured', async () => {
  await withFakes({ RESEND_API_KEY: undefined }, async () => {
    // Checkout needs Resend, so save the order straight into the store instead.
    const { openOrderStore, orderRecordFrom } = require('../server/order-store.js');
    await openOrderStore().saveOrder(orderRecordFrom({ ref: 'NP-1747', items: [], grandTotal: 10, customer: { name: 'Sam', email: 'sam@example.com' } }));
    const paid = await post({ action: 'paid', refs: ['NP-1747'] });
    assert.deepEqual(paid.body.results, [{ ref: 'NP-1747', status: 'paid', email: 'skipped', reason: 'email service is not configured' }]);
    assert.equal((await post({ action: 'send-payment-email', ref: 'NP-1747' })).statusCode, 503);
  });
});

test('checkout still succeeds when orders cannot be saved', async () => {
  await withFakes({ ORDER_DATA_KEY: undefined }, async ({ blob, emails }) => {
    const placed = await placeOrder();
    assert.equal(placed.statusCode, 200);
    assert.equal(placed.body.success, true);
    assert.equal([...blob.files.keys()].some(name => name.startsWith('orders/data/')), false);
    assert.equal(emails.length, 2, 'owner and customer emails still sent');
  });
});

test('daily job endpoint accepts CRON_SECRET or ADMIN_KEY and nothing else', async () => {
  await withFakes({ CRON_SECRET: undefined, ADMIN_KEY: undefined }, async () => {
    assert.equal((await invoke(reviewRequests, { headers: { authorization: `Bearer ${CRON_SECRET}` } })).statusCode, 503);
  });
  await withFakes({}, async () => {
    assert.equal((await invoke(reviewRequests)).statusCode, 401);
    assert.equal((await invoke(reviewRequests, { headers: { authorization: 'Bearer nope-nope-nope-nope-nope' } })).statusCode, 401);
    const byCron = await invoke(reviewRequests, { headers: { authorization: `Bearer ${CRON_SECRET}` } });
    assert.equal(byCron.statusCode, 200);
    assert.deepEqual(byCron.body, { ok: true, due: 0, results: [] });
    assert.equal((await invoke(reviewRequests, { method: 'POST', headers: asAdmin })).statusCode, 200);
  });
});
