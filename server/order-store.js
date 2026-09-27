// Order records and their progress (paid, dispatched, emailed) in Vercel Blob.
//
// One small file per fact, so a state change never rewrites an order record
// and a listing alone shows where every order is:
//
//   orders/data/NP-1760.json            encrypted order record, written once at checkout
//   orders/paid/NP-1760                 marker; its upload time is when payment was confirmed
//   orders/payment-emailed/NP-1760      marker, claimed BEFORE the payment email is sent
//   orders/dispatched/NP-1760           marker; its upload time is the dispatch time
//   orders/review-requested/NP-1760     marker, claimed BEFORE the review email is sent
//
// Claiming an email's marker before sending it means no customer ever gets
// the same email twice.
//
// Records hold names, addresses and phone numbers, and the store may be a
// public one (any blob URL is readable by whoever has it), so every record is
// encrypted with AES-256-GCM under a key derived from ORDER_DATA_KEY. That key
// must never change once orders have been saved with it.

const crypto = require("node:crypto");

const DATA_PREFIX = "orders/data/";
const MARKERS = {
  paid: "orders/paid/",
  paymentEmailed: "orders/payment-emailed/",
  dispatched: "orders/dispatched/",
  reviewRequested: "orders/review-requested/"
};

// NP-1760 (sequential) or NP-20260926-A1B2 (legacy fallback from create-order).
const REF_PATTERN = /^NP-(?:\d{4,8}|\d{8}-[0-9A-F]{4})$/;
const MIN_SECRET_LENGTH = 16;

function isValidRef(ref) {
  return REF_PATTERN.test(String(ref || ""));
}

function hasUsableSecret(secret) {
  return String(secret || "").length >= MIN_SECRET_LENGTH;
}

function deriveKey(secret) {
  return Buffer.from(crypto.hkdfSync("sha256", String(secret), "north-peptides-orders", "order-record-v1", 32));
}

// The ref is bound in as associated data, so a record cannot be passed off as another order's.
function encryptRecord(record, key, ref) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(ref));
  const data = Buffer.concat([cipher.update(JSON.stringify(record), "utf8"), cipher.final()]);
  return JSON.stringify({
    v: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: data.toString("base64")
  });
}

function decryptRecord(text, key, ref) {
  const box = JSON.parse(text);
  if (box.v !== 1) throw new Error(`unknown order record version ${box.v}`);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(box.iv, "base64"));
  decipher.setAAD(Buffer.from(ref));
  decipher.setAuthTag(Buffer.from(box.tag, "base64"));
  const plain = Buffer.concat([decipher.update(Buffer.from(box.data, "base64")), decipher.final()]);
  return JSON.parse(plain.toString("utf8"));
}

// What gets stored: the validated order minus the bank details (they are the
// shop's, not the customer's, and live in env vars).
function orderRecordFrom(order, now = new Date()) {
  const { bankDetails, ...rest } = order;
  return { v: 1, createdAt: now.toISOString(), ...rest };
}

function accessFromUrl(url) {
  const match = /\.(private|public)\.blob\.vercel-storage\.com\//i.exec(String(url || ""));
  return match ? match[1].toLowerCase() : null;
}

function isAlreadyExists(err) {
  return /already exists/i.test(String(err && err.message));
}

function isAccessError(err) {
  return /access/i.test(String(err && err.message));
}

function refFromPathname(pathname, prefix) {
  const ref = String(pathname).slice(prefix.length).replace(/\.json$/, "");
  return isValidRef(ref) ? ref : null;
}

function markerPrefix(kind) {
  if (!Object.prototype.hasOwnProperty.call(MARKERS, kind)) throw new Error(`unknown order marker "${kind}"`);
  return MARKERS[kind];
}

// blob: { list, put, get, del } from @vercel/blob (or an in-memory fake in tests).
function createOrderStore({ blob, secret }) {
  if (!hasUsableSecret(secret)) {
    throw new Error(`ORDER_DATA_KEY is missing or shorter than ${MIN_SECRET_LENGTH} characters`);
  }
  const key = deriveKey(secret);
  // A store is either private or public. Private is tried first (as in
  // order-ref.js) and whichever works is remembered for this instance.
  let access = null;

  async function write(pathname, body, { overwrite = false, contentType = "application/json" } = {}) {
    const options = { addRandomSuffix: false, allowOverwrite: overwrite, contentType };
    if (access) return blob.put(pathname, body, { ...options, access });
    try {
      const result = await blob.put(pathname, body, { ...options, access: "private" });
      access = "private";
      return result;
    } catch (err) {
      if (!isAccessError(err)) throw err;
      const result = await blob.put(pathname, body, { ...options, access: "public" });
      access = "public";
      return result;
    }
  }

  async function readText(urlOrPathname) {
    const known = access || accessFromUrl(urlOrPathname);
    const modes = known ? [known] : ["private", "public"];
    for (const mode of modes) {
      let result;
      try {
        result = await blob.get(urlOrPathname, { access: mode });
      } catch (err) {
        if (modes.length > 1 && isAccessError(err)) continue;
        throw err;
      }
      if (result && result.statusCode === 200) {
        access = access || mode;
        return new Response(result.stream).text();
      }
    }
    return null;
  }

  async function listAll(prefix) {
    const blobs = [];
    let cursor;
    do {
      const page = await blob.list({ prefix, cursor, limit: 1000 });
      blobs.push(...(page.blobs || []));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    if (!access) access = blobs.map(item => accessFromUrl(item.url)).find(Boolean) || null;
    return blobs;
  }

  function toTimes(items, prefix) {
    const times = new Map();
    for (const item of items) {
      const ref = refFromPathname(item.pathname, prefix);
      if (ref) times.set(ref, new Date(item.uploadedAt));
    }
    return times;
  }

  return {
    async saveOrder(record) {
      if (!isValidRef(record.ref)) throw new Error(`refusing to save order with invalid ref "${record.ref}"`);
      await write(`${DATA_PREFIX}${record.ref}.json`, encryptRecord(record, key, record.ref));
    },

    // Pass the blob URL from listState() when known; it skips access guessing.
    async readOrder(ref, url) {
      if (!isValidRef(ref)) return null;
      const text = await readText(url || `${DATA_PREFIX}${ref}.json`);
      return text == null ? null : decryptRecord(text, key, ref);
    },

    // Listings only, no record reads. `orders` maps each ref to its created
    // time and URL; each requested marker kind maps refs to when it was set.
    // Every listing is a billed Blob operation, so ask only for what you use.
    async listState({ orders = true, markers = Object.keys(MARKERS) } = {}) {
      const [data, ...lists] = await Promise.all([
        orders ? listAll(DATA_PREFIX) : null,
        ...markers.map(kind => listAll(markerPrefix(kind)))
      ]);
      const state = {};
      if (orders) {
        state.orders = new Map();
        for (const item of data) {
          const ref = refFromPathname(item.pathname, DATA_PREFIX);
          if (ref) state.orders.set(ref, { createdAt: new Date(item.uploadedAt), url: item.url });
        }
      }
      markers.forEach((kind, index) => { state[kind] = toTimes(lists[index], MARKERS[kind]); });
      return state;
    },

    // Sets a marker (paid, dispatched, or an email's claim); false if it was already set.
    async claim(kind, ref, at = new Date()) {
      try {
        await write(`${markerPrefix(kind)}${ref}`, at.toISOString(), { contentType: "text/plain" });
        return true;
      } catch (err) {
        if (isAlreadyExists(err)) return false;
        throw err;
      }
    },

    release(kind, ref) {
      return blob.del(`${markerPrefix(kind)}${ref}`);
    }
  };
}

// The production store, wired to the real SDK. Throws when ORDER_DATA_KEY is unusable.
function openOrderStore() {
  const { list, put, get, del } = require("@vercel/blob");
  return createOrderStore({ blob: { list, put, get, del }, secret: process.env.ORDER_DATA_KEY });
}

module.exports = {
  createOrderStore,
  openOrderStore,
  orderRecordFrom,
  isValidRef,
  hasUsableSecret,
  encryptRecord,
  decryptRecord,
  deriveKey,
  accessFromUrl,
  DATA_PREFIX,
  MARKERS
};
