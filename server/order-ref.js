// Sequential order references (np1747, np1748, ...) backed by Vercel Blob.
//
// Serverless functions are stateless, so the "last used number" lives in Blob
// storage as one tiny file per claimed reference: orders/refs/00001747, ...
// Zero-padded pathnames keep alphabetical listing order equal to numeric order.
// Claiming a number writes its file WITHOUT allowOverwrite — if two orders race
// for the same number, the loser throws and the caller falls back to the legacy
// globally-unique reference instead of ever issuing a duplicate.

const START_AT = 1747; // Max's chosen starting reference — np1747

function refNumberFromPathname(pathname) {
  const n = Number.parseInt(String(pathname).split("/").pop(), 10);
  return Number.isInteger(n) ? n : null;
}

async function highestClaimedRef(list) {
  let max = START_AT - 1;
  let cursor;
  do {
    const page = await list({ prefix: "orders/refs/", cursor, limit: 1000 });
    for (const blob of page.blobs || []) {
      const n = refNumberFromPathname(blob.pathname);
      if (n !== null && n > max) max = n;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return max;
}

async function claimRef(put, next) {
  const pathname = `orders/refs/${String(next).padStart(8, "0")}`;
  const body = String(next);
  // Older SDK versions only accept access "public"; newer private stores want
  // "private". Try private first, fall back once — any other failure bubbles up.
  try {
    await put(pathname, body, { access: "private", addRandomSuffix: false, allowOverwrite: false });
  } catch (err) {
    if (!/access/i.test(String(err && err.message))) throw err;
    await put(pathname, body, { access: "public", addRandomSuffix: false, allowOverwrite: false });
  }
}

async function nextSequentialRef({ list, put }) {
  const next = (await highestClaimedRef(list)) + 1;
  await claimRef(put, next);
  return `np${next}`;
}

module.exports = { nextSequentialRef, START_AT };
