'use strict';

// The checkout's email typo check (gmail.con -> gmail.com) and the server's
// email validation. A mistyped address means the customer never gets their
// bank details, so both sides guard it.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const checkout = fs.readFileSync(path.join(__dirname, '..', 'checkout.html'), 'utf8');

function loadSuggestEmail() {
  const start = checkout.indexOf('const EMAIL_DOMAINS = [');
  const end = checkout.indexOf('function showEmailSuggestion');
  assert.ok(start > 0 && end > start, 'typo helpers found in checkout.html');
  const sandbox = {};
  vm.runInNewContext(`${checkout.slice(start, end)}\nthis.suggestEmail = suggestEmail;`, sandbox);
  return sandbox.suggestEmail;
}

test('likely email typos get a suggested fix', () => {
  const suggestEmail = loadSuggestEmail();
  const cases = {
    'sam@gmail.con': 'sam@gmail.com',
    'sam@gmial.com': 'sam@gmail.com',
    'sam@gmai.com': 'sam@gmail.com',
    'Sam.Taylor@Hotmial.co.uk': 'Sam.Taylor@hotmail.co.uk',
    'sam@hotmail.co': 'sam@hotmail.co.uk',
    'sam@yahoo.co.ul': 'sam@yahoo.co.uk',
    'sam@outlok.com': 'sam@outlook.com',
    'sam@icloud.cm': 'sam@icloud.com',
    'sam@btinternet.con': 'sam@btinternet.com',
    'sam@mycompany.con': 'sam@mycompany.com'
  };
  for (const [typed, expected] of Object.entries(cases)) {
    assert.equal(suggestEmail(typed), expected, typed);
  }
});

test('real addresses are left alone', () => {
  const suggestEmail = loadSuggestEmail();
  for (const email of [
    'sam@gmail.com', 'sam@hotmail.co.uk', 'sam@mail.com', 'sam@email.com', 'sam@me.com',
    'sam@mycompany.co.uk', 'orders@northpeptidesuk.com', 'sam@uni.ac.uk', 'not-an-email', 'sam@', ''
  ]) {
    assert.equal(suggestEmail(email), '', email);
  }
});

test('checkout points out a typo once, then lets the customer keep their address', () => {
  assert.match(checkout, /if \(emailSuggestion && emailSuggestionShownFor !== emailField\.value\)/);
  assert.match(checkout, /showBankTransferSuccess\(data, customer\.email\)/);
  assert.match(checkout, /Check your spam or junk folder/);
});

test('the server rejects an order whose email cannot receive the bank details', async () => {
  const handler = require('../api/create-order.js');
  const env = { RESEND_API_KEY: 're_test', BANK_ACCOUNT_NAME: 'N', BANK_SORT_CODE: '00-00-00', BANK_ACCOUNT_NUMBER: '1' };
  const previous = {};
  for (const [name, value] of Object.entries(env)) { previous[name] = process.env[name]; process.env[name] = value; }
  try {
    const res = {
      headers: {},
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      send(body) { this.body = JSON.parse(body); return this; }
    };
    await handler({
      method: 'POST',
      headers: { origin: 'https://www.northpeptidesuk.com' },
      body: {
        items: [{ name: 'BPC-157', dose: '10mg', qty: 1 }],
        customer: { name: 'Sam', email: 'sam@gmail', address1: '1 High St', city: 'Leeds', postcode: 'LS1 1AA' }
      }
    }, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /check your email address/i);
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});
