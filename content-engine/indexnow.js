'use strict';
/*
 * indexnow.js — ping IndexNow (Bing, Yandex, Seznam, Naver, …) with every URL
 * in sitemap.xml so new and updated pages are discovered within minutes
 * instead of waiting for the next organic crawl.
 *
 *   node content-engine/indexnow.js              submit every sitemap URL
 *   node content-engine/indexnow.js <url> <url>  submit only the given URLs
 *
 * Ownership is proved by the key file at the site root (<key>.txt), which this
 * script auto-discovers — no secret to manage (the key is public by design).
 * NOTE: Google does not participate in IndexNow; for Google, submit the sitemap
 * in Search Console. IndexNow covers Bing (and therefore ChatGPT search),
 * Yandex, Seznam and Naver, which share submissions with each other.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOST = 'www.northpeptidesuk.com';
const BASE = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function findKey() {
  const file = fs.readdirSync(ROOT).find(name => /^[a-f0-9]{8,128}\.txt$/i.test(name));
  if (!file) throw new Error('IndexNow key file (<key>.txt) not found in the site root.');
  return path.basename(file, '.txt');
}

function sitemapUrls() {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim()).filter(Boolean);
}

async function main() {
  const key = findKey();
  const cliUrls = process.argv.slice(2);
  const urlList = cliUrls.length ? cliUrls : sitemapUrls();
  if (!urlList.length) { console.error('No URLs to submit.'); process.exit(1); }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation: `${BASE}/${key}.txt`, urlList }),
  });

  console.log(`IndexNow: submitted ${urlList.length} URL(s) with key ${key}`);
  console.log(`Response: ${res.status} ${res.statusText}`);
  const text = await res.text().catch(() => '');
  if (text.trim()) console.log(text.trim());
  // 200/202 = accepted. 403 = key not verifiable — is <key>.txt live on the site yet?
  if (res.status !== 200 && res.status !== 202) process.exit(1);
}

main().catch(err => { console.error(err.message || err); process.exit(1); });
