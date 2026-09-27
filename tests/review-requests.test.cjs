'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createOrderStore, orderRecordFrom } = require('../server/order-store.js');
const {
  ukDate,
  reviewDueDate,
  isReviewDue,
  buildReviewRequestEmail,
  sendReviewRequest,
  sendDueReviewRequests
} = require('../server/review-requests.js');
const { lint, formatReport } = require('../content-engine/compliance.js');
const { createFakeBlob } = require('./fake-blob.cjs');

const SECRET = 'test-order-data-key-0123456789abcdef';
const IDENTITY = { from: 'North Peptides UK <no-reply@northpeptidesuk.com>', replyTo: 'orders@northpeptidesuk.com' };

function order(ref, overrides = {}) {
  return orderRecordFrom({
    ref,
    items: [{ name: 'KPV', dose: '10mg', qty: 1, listPrice: 30, listTotal: 30, unitPrice: 30, lineTotal: 30 }],
    grandTotal: 33.99,
    delivery: { label: 'Royal Mail Tracked 48', charge: 3.99 },
    customer: { name: 'Sam Smith', email: 'sam@example.com', city: 'Leeds', postcode: 'LS1 1AA' },
    ...overrides
  });
}

async function storeWithDispatched(dispatches) {
  const blob = createFakeBlob();
  const store = createOrderStore({ blob, secret: SECRET });
  for (const [ref, dispatchedAt, overrides] of dispatches) {
    await store.saveOrder(order(ref, overrides));
    if (dispatchedAt) {
      await store.claim('dispatched', ref);
      blob.setUploadedAt(`orders/dispatched/${ref}`, new Date(dispatchedAt));
    }
  }
  return { blob, store };
}

function recorder({ failFor = [] } = {}) {
  const sent = [];
  const sendEmail = async (payload, options) => {
    if (failFor.includes(payload.to[0])) throw new Error('Resend is down');
    sent.push({ payload, options });
    return { id: `email-${sent.length}` };
  };
  return { sent, sendEmail };
}

test('UK calendar dates follow BST and GMT', () => {
  assert.equal(ukDate(new Date('2026-09-28T23:30:00Z')), '2026-09-29'); // 00:30 BST
  assert.equal(ukDate(new Date('2026-12-01T23:30:00Z')), '2026-12-01'); // 23:30 GMT
});

test('review emails are due three working days after dispatch', () => {
  assert.equal(reviewDueDate(new Date('2026-09-28T10:00:00Z')), '2026-10-01'); // Mon -> Thu
  assert.equal(reviewDueDate(new Date('2026-10-01T10:00:00Z')), '2026-10-06'); // Thu -> Tue
  assert.equal(reviewDueDate(new Date('2026-10-02T15:00:00Z')), '2026-10-07'); // Fri -> Wed
  assert.equal(reviewDueDate(new Date('2026-10-03T11:00:00Z')), '2026-10-07'); // Sat -> Wed
});

test('an order is due from its date, and never once it is three weeks old', () => {
  const monday = new Date('2026-09-28T16:00:00Z');
  assert.equal(isReviewDue(monday, new Date('2026-09-30T09:00:00Z')), false);
  assert.equal(isReviewDue(monday, new Date('2026-10-01T09:00:00Z')), true);
  assert.equal(isReviewDue(monday, new Date('2026-10-15T09:00:00Z')), true);
  assert.equal(isReviewDue(monday, new Date('2026-10-20T09:00:00Z')), false);
});

test('the email links to the review form with the order filled in, and passes the compliance gate', () => {
  const email = buildReviewRequestEmail(order('NP-1760'), { dispatchedAt: new Date('2026-09-28T10:00:00Z') });
  assert.equal(email.subject, 'How was your order NP-1760?');
  assert.match(email.html, /Hi Sam, your order NP-1760 was dispatched on Monday 28 September\./);
  assert.match(email.html, /href="https:\/\/www\.northpeptidesuk\.com\/reviews\/\?ref=NP-1760"/);
  for (let rating = 1; rating <= 5; rating += 1) {
    assert.match(email.html, new RegExp(`/reviews/\\?ref=NP-1760&amp;rating=${rating}"`));
  }
  assert.match(email.text, /https:\/\/www\.northpeptidesuk\.com\/reviews\/\?ref=NP-1760\n/);
  assert.match(email.text, /reply and let us know/);
  const result = lint(email.html);
  assert.ok(result.ok, formatReport('review email', result));
});

test('customer-typed names are escaped in the email', () => {
  const email = buildReviewRequestEmail(
    order('NP-1760', { customer: { name: '<img src=x onerror=alert(1)> Smith', email: 'sam@example.com' } }),
    { dispatchedAt: new Date('2026-09-28T10:00:00Z') }
  );
  assert.doesNotMatch(email.html, /<img src=x/);
  assert.match(email.html, /Hi &lt;img,/);
});

test('the daily job emails only orders whose day has come, oldest first', async () => {
  const { store } = await storeWithDispatched([
    ['NP-1760', '2026-09-28T10:00:00Z'], // Mon -> due Thu 1 Oct
    ['NP-1761', '2026-09-25T10:00:00Z'], // Fri -> due Wed 30 Sep
    ['NP-1762', '2026-09-30T10:00:00Z'], // Wed -> due Mon 5 Oct
    ['NP-1763', null] // not dispatched
  ]);
  const { sent, sendEmail } = recorder();
  const summary = await sendDueReviewRequests({ store, sendEmail, now: new Date('2026-10-01T09:00:00Z'), pauseMs: 0 });
  assert.equal(summary.due, 2);
  assert.deepEqual(summary.results.map(result => [result.ref, result.status]), [['NP-1761', 'sent'], ['NP-1760', 'sent']]);
  assert.deepEqual(sent.map(item => item.payload.to[0]), ['sam@example.com', 'sam@example.com']);
  assert.equal(sent[0].options.idempotencyKey, 'review-request-NP-1761');
});

test('nobody is asked twice, even when the job runs again', async () => {
  const { store } = await storeWithDispatched([['NP-1760', '2026-09-28T10:00:00Z']]);
  const { sent, sendEmail } = recorder();
  const now = new Date('2026-10-01T09:00:00Z');
  await sendDueReviewRequests({ store, sendEmail, now, pauseMs: 0 });
  const again = await sendDueReviewRequests({ store, sendEmail, now, pauseMs: 0 });
  assert.equal(again.due, 0);
  const manual = await sendReviewRequest({ store, sendEmail, ref: 'NP-1760', dispatchedAt: new Date('2026-09-28T10:00:00Z'), identity: IDENTITY });
  assert.deepEqual(manual, { ref: 'NP-1760', status: 'skipped', reason: 'already sent' });
  assert.equal(sent.length, 1);
});

test('a failed send is released so the next run retries it', async () => {
  const { store } = await storeWithDispatched([['NP-1760', '2026-09-28T10:00:00Z']]);
  const failing = recorder({ failFor: ['sam@example.com'] });
  const now = new Date('2026-10-01T09:00:00Z');
  const first = await sendDueReviewRequests({ store, sendEmail: failing.sendEmail, now, pauseMs: 0 });
  assert.deepEqual(first.results, [{ ref: 'NP-1760', status: 'failed', reason: 'Resend is down' }]);
  assert.equal((await store.listState()).reviewRequested.size, 0);

  const working = recorder();
  const second = await sendDueReviewRequests({ store, sendEmail: working.sendEmail, now, pauseMs: 0 });
  assert.equal(second.results[0].status, 'sent');
});

test('orders without a usable email are skipped without being claimed', async () => {
  const { store } = await storeWithDispatched([
    ['NP-1760', '2026-09-28T10:00:00Z', { customer: { name: 'Sam', email: 'not-an-email' } }]
  ]);
  const { sent, sendEmail } = recorder();
  const summary = await sendDueReviewRequests({ store, sendEmail, now: new Date('2026-10-01T09:00:00Z'), pauseMs: 0 });
  assert.deepEqual(summary.results, [{ ref: 'NP-1760', status: 'skipped', reason: 'no valid customer email' }]);
  assert.equal(sent.length, 0);
  assert.equal((await store.listState()).reviewRequested.size, 0);
});

test('each run sends at most the limit; the rest wait for the next run', async () => {
  const dispatches = Array.from({ length: 5 }, (_, index) => [`NP-17${60 + index}`, '2026-09-28T10:00:00Z']);
  const { store } = await storeWithDispatched(dispatches);
  const { sendEmail } = recorder();
  const now = new Date('2026-10-01T09:00:00Z');
  const first = await sendDueReviewRequests({ store, sendEmail, now, limit: 3, pauseMs: 0 });
  assert.equal(first.due, 5);
  assert.equal(first.results.length, 3);
  const second = await sendDueReviewRequests({ store, sendEmail, now, limit: 3, pauseMs: 0 });
  assert.equal(second.due, 2);
});
