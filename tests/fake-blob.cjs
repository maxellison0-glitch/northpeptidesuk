'use strict';

// In-memory stand-in for @vercel/blob's list/put/get/del, behaving like a
// private or a public store: wrong-access writes are rejected the way the
// service rejects them, and writes without allowOverwrite fail if the blob exists.

function createFakeBlob({ access = 'private', pageSize = 1000 } = {}) {
  const files = new Map();
  const calls = { put: 0, list: 0, get: 0, del: 0 };
  const urlFor = pathname => `https://teststore.${access}.blob.vercel-storage.com/${pathname}`;
  const pathnameOf = urlOrPathname => (String(urlOrPathname).startsWith('https://')
    ? new URL(urlOrPathname).pathname.slice(1)
    : String(urlOrPathname));

  return {
    files,
    calls,
    urlFor,
    async put(pathname, body, options) {
      calls.put += 1;
      if (options.access !== access) throw new Error(`Vercel Blob: Cannot use ${options.access} access on a ${access} store.`);
      if (files.has(pathname) && !options.allowOverwrite) {
        throw new Error('Vercel Blob: This blob already exists, use `allowOverwrite: true` if you want to overwrite it.');
      }
      files.set(pathname, { body: String(body), uploadedAt: new Date() });
      return { url: urlFor(pathname), pathname };
    },
    async list({ prefix = '', cursor, limit = 1000 }) {
      calls.list += 1;
      const size = Math.min(limit, pageSize);
      const all = [...files].filter(([pathname]) => pathname.startsWith(prefix)).sort(([a], [b]) => a.localeCompare(b));
      const start = cursor ? Number(cursor) : 0;
      const page = all.slice(start, start + size);
      const hasMore = start + size < all.length;
      return {
        blobs: page.map(([pathname, file]) => ({ pathname, url: urlFor(pathname), uploadedAt: file.uploadedAt, size: file.body.length })),
        hasMore,
        cursor: hasMore ? String(start + size) : undefined
      };
    },
    async get(urlOrPathname, options) {
      calls.get += 1;
      if (options.access !== access) return null;
      const file = files.get(pathnameOf(urlOrPathname));
      return file ? { statusCode: 200, stream: new Response(file.body).body } : null;
    },
    async del(urlOrPathname) {
      calls.del += 1;
      files.delete(pathnameOf(urlOrPathname));
    },
    // Test helper: backdate a marker or record.
    setUploadedAt(pathname, date) {
      files.get(pathname).uploadedAt = date;
    }
  };
}

module.exports = { createFakeBlob };
