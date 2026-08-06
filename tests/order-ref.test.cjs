'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { nextSequentialRef, START_AT } = require('../server/order-ref.js');

function makeStore(existing = []) {
  const blobs = existing.map(n => ({ pathname: `orders/refs/${String(n).padStart(8, '0')}` }));
  const puts = [];
  return {
    puts,
    list: async () => ({ blobs, hasMore: false }),
    put: async (pathname, body, options) => { puts.push({ pathname, body, options }); }
  };
}

test('first ever reference is np1747', async () => {
  const store = makeStore();
  assert.equal(await nextSequentialRef(store), `np${START_AT}`);
  assert.equal(store.puts[0].pathname, 'orders/refs/00001747');
  assert.equal(store.puts[0].options.allowOverwrite, false);
});

test('continues from the highest claimed reference', async () => {
  const store = makeStore([1747, 1748, 1752]);
  assert.equal(await nextSequentialRef(store), 'np1753');
});

test('ignores junk pathnames and paginates with cursors', async () => {
  const pageOne = {
    blobs: [{ pathname: 'orders/refs/00001747' }, { pathname: 'orders/refs/not-a-number' }],
    hasMore: true,
    cursor: 'next-page'
  };
  const pageTwo = { blobs: [{ pathname: 'orders/refs/00001901' }], hasMore: false };
  const calls = [];
  const store = {
    list: async ({ cursor }) => { calls.push(cursor); return cursor ? pageTwo : pageOne; },
    put: async () => {}
  };
  assert.equal(await nextSequentialRef(store), 'np1902');
  assert.deepEqual(calls, [undefined, 'next-page']);
});

test('a lost claim race propagates so the caller can fall back', async () => {
  const store = {
    list: async () => ({ blobs: [], hasMore: false }),
    put: async () => { throw new Error('blob already exists'); }
  };
  await assert.rejects(() => nextSequentialRef(store), /already exists/);
});

test('retries with public access when the store rejects private access', async () => {
  const attempts = [];
  const store = {
    list: async () => ({ blobs: [], hasMore: false }),
    put: async (pathname, body, options) => {
      attempts.push(options.access);
      if (options.access === 'private') throw new Error('invalid access value');
    }
  };
  assert.equal(await nextSequentialRef(store), `np${START_AT}`);
  assert.deepEqual(attempts, ['private', 'public']);
});
