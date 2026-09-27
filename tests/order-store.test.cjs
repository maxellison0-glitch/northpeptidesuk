'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createOrderStore,
  orderRecordFrom,
  isValidRef,
  encryptRecord,
  decryptRecord,
  deriveKey
} = require('../server/order-store.js');
const { createFakeBlob } = require('./fake-blob.cjs');

const SECRET = 'test-order-data-key-0123456789abcdef';

function sampleOrder(ref = 'NP-1760') {
  return {
    ref,
    items: [{ name: 'BPC-157', dose: '10mg', qty: 2, listPrice: 25, listTotal: 50, unitPrice: 25, lineTotal: 50 }],
    grossSubtotal: 50,
    productSubtotal: 50,
    grandTotal: 53.99,
    delivery: { label: 'Royal Mail Tracked 48', charge: 3.99 },
    customer: { name: 'Sam Smith', email: 'sam@example.com', phone: '07700900123', address1: '1 High Street', city: 'Leeds', postcode: 'LS1 1AA' },
    bankDetails: { accountName: 'North Peptides', sortCode: '00-00-00', accountNumber: '12345678' }
  };
}

test('order refs: sequential and legacy formats only', () => {
  assert.ok(isValidRef('NP-1760'));
  assert.ok(isValidRef('NP-20260926-A1B2'));
  for (const bad of ['', 'np-1760', 'NP-17', 'NP-1760/../x', '../orders/data/NP-1760', 'NP-1760.json']) {
    assert.equal(isValidRef(bad), false, bad);
  }
});

test('a missing or short ORDER_DATA_KEY refuses to open the store', () => {
  assert.throws(() => createOrderStore({ blob: createFakeBlob(), secret: undefined }), /ORDER_DATA_KEY/);
  assert.throws(() => createOrderStore({ blob: createFakeBlob(), secret: 'too-short' }), /ORDER_DATA_KEY/);
});

test('saved records drop bank details and never hold customer data in plain text', async () => {
  const blob = createFakeBlob();
  const store = createOrderStore({ blob, secret: SECRET });
  const record = orderRecordFrom(sampleOrder(), new Date('2026-09-26T10:00:00Z'));
  assert.equal('bankDetails' in record, false);
  assert.equal(record.createdAt, '2026-09-26T10:00:00.000Z');

  await store.saveOrder(record);
  const stored = blob.files.get('orders/data/NP-1760.json').body;
  for (const secret of ['Sam Smith', 'sam@example.com', '07700900123', 'High Street', 'LS1 1AA', '12345678']) {
    assert.equal(stored.includes(secret), false, `${secret} must not be stored in plain text`);
  }
  assert.deepEqual(await store.readOrder('NP-1760'), record);
});

test('records cannot be decrypted with another key or passed off as another order', () => {
  const key = deriveKey(SECRET);
  const box = encryptRecord({ ref: 'NP-1760', total: 10 }, key, 'NP-1760');
  assert.deepEqual(decryptRecord(box, key, 'NP-1760'), { ref: 'NP-1760', total: 10 });
  assert.throws(() => decryptRecord(box, deriveKey('a-different-key-0123456789'), 'NP-1760'));
  assert.throws(() => decryptRecord(box, key, 'NP-1761'));
  const tampered = JSON.parse(box);
  tampered.data = Buffer.from('{"ref":"NP-1760","total":0}').toString('base64');
  assert.throws(() => decryptRecord(JSON.stringify(tampered), key, 'NP-1760'));
});

test('works with a public store too, and remembers which access worked', async () => {
  const blob = createFakeBlob({ access: 'public' });
  const store = createOrderStore({ blob, secret: SECRET });
  await store.saveOrder(orderRecordFrom(sampleOrder('NP-1761')));
  await store.saveOrder(orderRecordFrom(sampleOrder('NP-1762')));
  // First save: private rejected, public accepted. Second save goes straight to public.
  assert.equal(blob.calls.put, 3);
  const record = await store.readOrder('NP-1762');
  assert.equal(record.customer.name, 'Sam Smith');
});

test('a fresh instance reads from a public store without being told its access', async () => {
  const blob = createFakeBlob({ access: 'public' });
  await createOrderStore({ blob, secret: SECRET }).saveOrder(orderRecordFrom(sampleOrder()));
  const fresh = createOrderStore({ blob, secret: SECRET });
  assert.equal((await fresh.readOrder('NP-1760')).ref, 'NP-1760');
  assert.equal(await fresh.readOrder('NP-9999'), null);
});

test('dispatch and review markers are claimed once and listed with their times', async () => {
  const blob = createFakeBlob({ pageSize: 2 });
  const store = createOrderStore({ blob, secret: SECRET });
  for (const ref of ['NP-1760', 'NP-1761', 'NP-1762']) await store.saveOrder(orderRecordFrom(sampleOrder(ref)));
  blob.files.set('orders/data/not-an-order.json', { body: '{}', uploadedAt: new Date() });

  assert.equal(await store.markDispatched('NP-1760'), true);
  assert.equal(await store.markDispatched('NP-1760'), false);
  assert.equal(await store.claimReviewRequest('NP-1760'), true);
  assert.equal(await store.claimReviewRequest('NP-1760'), false);
  blob.setUploadedAt('orders/dispatched/NP-1760', new Date('2026-09-28T09:30:00Z'));

  const state = await store.listState();
  assert.deepEqual([...state.orders.keys()].sort(), ['NP-1760', 'NP-1761', 'NP-1762']);
  assert.equal(state.dispatched.get('NP-1760').toISOString(), '2026-09-28T09:30:00.000Z');
  assert.ok(state.reviewRequested.has('NP-1760'));
  assert.equal(state.dispatched.has('NP-1761'), false);

  await store.clearDispatched('NP-1760');
  await store.releaseReviewRequest('NP-1760');
  const after = await store.listState();
  assert.equal(after.dispatched.size, 0);
  assert.equal(after.reviewRequested.size, 0);
});

test('saving refuses refs that could escape the orders folder', async () => {
  const store = createOrderStore({ blob: createFakeBlob(), secret: SECRET });
  await assert.rejects(() => store.saveOrder({ ref: '../evil' }), /invalid ref/);
  assert.equal(await store.readOrder('../evil'), null);
});
