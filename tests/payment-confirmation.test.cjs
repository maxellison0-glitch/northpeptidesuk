'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createOrderStore, orderRecordFrom } = require('../server/order-store.js');
const { buildPaymentConfirmedEmail, sendPaymentConfirmation } = require('../server/payment-confirmation.js');
const { lint, formatReport } = require('../content-engine/compliance.js');
const { createFakeBlob } = require('./fake-blob.cjs');

const SECRET = 'test-order-data-key-0123456789abcdef';
const PAID_AT = new Date('2026-09-27T14:05:00Z');

function order(overrides = {}) {
  return orderRecordFrom({
    ref: 'NP-1788',
    items: [
      { name: 'Retatrutide', dose: '20mg', qty: 2, listPrice: 90, listTotal: 180, unitPrice: 81, lineTotal: 162 },
      { name: 'Bacteriostatic Water', dose: '10ml vial', qty: 1, listPrice: 10, listTotal: 10, unitPrice: 9, lineTotal: 9 }
    ],
    grossSubtotal: 190,
    productSubtotal: 171,
    discountAmount: 19,
    discountCode: 'WELCOME10',
    discountPct: 0.1,
    grandTotal: 171,
    delivery: { label: 'Royal Mail Tracked 48', charge: 0 },
    customer: { name: 'Sam Naylor', email: 'sam@example.com', address1: '1 High Street', address2: 'Flat 2', city: 'Leeds', county: '', postcode: 'LS1 1AA' },
    ...overrides
  });
}

test('the payment email confirms the amount, explains what happens next and shows the order', () => {
  const email = buildPaymentConfirmedEmail(order(), { paidAt: PAID_AT });
  assert.equal(email.subject, 'Payment received — your order NP-1788 is being prepared');
  const html = email.html;
  assert.match(html, /Thanks Sam, your £171 bank transfer for order NP-1788 has arrived\. Here&#39;s what happens next\./, 'inbox preview line');
  assert.match(html, /Payment received &#10003;/);
  assert.match(html, /Amount received<\/td><td[^>]*>£171</);
  assert.match(html, /Confirmed<\/td><td[^>]*>Sunday 27 September</);
  assert.match(html, /Paid in full/);
  assert.match(html, /packed with care in plain, unmarked packaging/);
  assert.match(html, /Dispatched by Royal Mail Tracked 48/);
  assert.match(html, /We aim to dispatch it the next working day\./);
  assert.match(html, /Retatrutide 20mg<\/td>\s*<td[^>]*>2<\/td>\s*<td[^>]*>£180</);
  assert.match(html, /Discount \(WELCOME10, 10% off\)<\/td><td[^>]*>&minus;£19</);
  assert.match(html, /Delivery \(Royal Mail Tracked 48\)<\/td><td[^>]*>Free</);
  assert.match(html, /Total paid<\/td><td[^>]*>£171</);
  assert.match(html, /Sam Naylor<br>1 High Street<br>Flat 2<br>Leeds<br>LS1 1AA/);
  assert.match(html, /Spotted a mistake\? Reply to this email before your order is dispatched/);
  const result = lint(html);
  assert.ok(result.ok, formatReport('payment email', result));
});

test('the plain-text version carries the same facts', () => {
  const { text } = buildPaymentConfirmedEmail(order(), { paidAt: PAID_AT });
  for (const line of [
    'Amount received: £171',
    'Order reference: NP-1788',
    'Confirmed: Sunday 27 September',
    '- Retatrutide 20mg x2 - £180',
    'Discount (WELCOME10, 10% off): -£19',
    'Delivery (Royal Mail Tracked 48): Free',
    'Total paid: £171',
    'Sam Naylor\n1 High Street\nFlat 2\nLeeds\nLS1 1AA',
    'Research use only. Not for human or animal consumption.'
  ]) {
    assert.ok(text.includes(line), line);
  }
});

test('no discount line without a code, and a delivery charge when one was paid', () => {
  const email = buildPaymentConfirmedEmail(
    order({ discountCode: null, discountPct: 0, discountAmount: 0, grossSubtotal: 190, grandTotal: 196.99, delivery: { label: 'Royal Mail Tracked 24', charge: 6.99 } }),
    { paidAt: PAID_AT }
  );
  assert.doesNotMatch(email.html, /Discount \(/);
  assert.match(email.html, /Delivery \(Royal Mail Tracked 24\)<\/td><td[^>]*>£6\.99</);
  assert.match(email.html, /Total paid<\/td><td[^>]*>£196\.99</);
});

test('customer-typed details are escaped', () => {
  const email = buildPaymentConfirmedEmail(
    order({ customer: { name: '<b>Sam</b>', email: 'sam@example.com', address1: '<script>x</script>', city: 'Leeds', postcode: 'LS1' } }),
    { paidAt: PAID_AT }
  );
  assert.doesNotMatch(email.html, /<script>|<b>Sam/);
  assert.match(email.html, /&lt;script&gt;x&lt;\/script&gt;/);
});

test('the payment email is sent once, and a failed send can be retried', async () => {
  const store = createOrderStore({ blob: createFakeBlob(), secret: SECRET });
  await store.saveOrder(order());
  const sent = [];
  let failNext = true;
  const sendEmail = async (payload, options) => {
    if (failNext) { failNext = false; throw new Error('Resend is down'); }
    sent.push({ payload, options });
    return { id: 'email-1' };
  };
  const identity = { from: 'North Peptides UK <no-reply@northpeptidesuk.com>', replyTo: 'orders@northpeptidesuk.com' };

  const failed = await sendPaymentConfirmation({ store, sendEmail, ref: 'NP-1788', paidAt: PAID_AT, identity });
  assert.deepEqual(failed, { ref: 'NP-1788', status: 'failed', reason: 'Resend is down' });
  const retried = await sendPaymentConfirmation({ store, sendEmail, ref: 'NP-1788', paidAt: PAID_AT, identity });
  assert.equal(retried.status, 'sent');
  const again = await sendPaymentConfirmation({ store, sendEmail, ref: 'NP-1788', paidAt: PAID_AT, identity });
  assert.deepEqual(again, { ref: 'NP-1788', status: 'skipped', reason: 'already sent' });

  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].payload.to, ['sam@example.com']);
  assert.equal(sent[0].payload.reply_to, 'orders@northpeptidesuk.com');
  assert.equal(sent[0].options.idempotencyKey, 'payment-confirmed-NP-1788');
});

test('orders without a record or a usable email are skipped without being claimed', async () => {
  const store = createOrderStore({ blob: createFakeBlob(), secret: SECRET });
  await store.saveOrder(order({ customer: { name: 'Sam', email: 'not-an-email' } }));
  const sendEmail = async () => { throw new Error('should not send'); };
  assert.deepEqual(
    await sendPaymentConfirmation({ store, sendEmail, ref: 'NP-1788', paidAt: PAID_AT }),
    { ref: 'NP-1788', status: 'skipped', reason: 'no valid customer email' }
  );
  assert.deepEqual(
    await sendPaymentConfirmation({ store, sendEmail, ref: 'NP-1799', paidAt: PAID_AT }),
    { ref: 'NP-1799', status: 'skipped', reason: 'no saved order record' }
  );
  assert.equal((await store.listState()).paymentEmailed.size, 0);
});
