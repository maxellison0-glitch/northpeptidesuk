// Owner-only order API behind the dispatch page (/admin/). Requests need the
// session cookie from logging in, or "Authorization: Bearer <ADMIN_KEY>".
//
//   POST { action: "login", key }              check ADMIN_KEY and set the session cookie
//   POST { action: "logout" }                  clear the session cookie
//   GET                                        recent orders with dispatch and review status
//   POST { action: "dispatch", refs: [...] }   mark orders dispatched (review email follows)
//   POST { action: "undo-dispatch", ref }      unmark, while the review email is still pending
//   POST { action: "send-review-request", ref } send that order's review email now
//   POST { action: "send-due" }                run the daily review-email job now

const { openOrderStore, isValidRef, hasUsableSecret } = require("../server/order-store.js");
const {
  authorizeAdmin,
  isAdminKey,
  createSessionCookie,
  clearSessionCookie,
  usableSecrets
} = require("../server/admin-auth.js");
const {
  reviewDueDate,
  sendReviewRequest,
  sendDueReviewRequests,
  resendEmail
} = require("../server/review-requests.js");

const LIST_WINDOW_DAYS = 45;
const LIST_LIMIT = 150;
const MAX_REFS_PER_REQUEST = 100;
const CONCURRENCY = 6;
const NOT_SET_UP = "Admin access is not set up. Add ADMIN_KEY (16+ characters) in Vercel and redeploy.";

function send(res, status, body) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).send(JSON.stringify(body));
}

async function login(res, key) {
  if (!usableSecrets(["ADMIN_KEY"]).length) return send(res, 503, { ok: false, error: NOT_SET_UP });
  if (!isAdminKey(String(key || "").trim())) {
    await new Promise(resolve => setTimeout(resolve, 400)); // slows down guessing
    return send(res, 401, { ok: false, error: "That admin key was not accepted." });
  }
  res.setHeader("Set-Cookie", createSessionCookie());
  return send(res, 200, { ok: true });
}

function currentConfig() {
  return {
    orderDataKey: hasUsableSecret(process.env.ORDER_DATA_KEY),
    cronSecret: usableSecrets(["CRON_SECRET"]).length > 0,
    email: Boolean(process.env.RESEND_API_KEY)
  };
}

function parseBody(req) {
  if (!req.body) return {};
  return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

function statusFor(ref, state) {
  const dispatchedAt = state.dispatched.get(ref);
  const reviewRequestedAt = state.reviewRequested.get(ref);
  return {
    dispatchedAt: dispatchedAt ? dispatchedAt.toISOString() : null,
    reviewDueDate: dispatchedAt ? reviewDueDate(dispatchedAt) : null,
    reviewRequestedAt: reviewRequestedAt ? reviewRequestedAt.toISOString() : null
  };
}

// Only what the dispatch page shows: no email, phone or full address.
function summarise(record) {
  const customer = record.customer || {};
  return {
    name: customer.name || "",
    town: customer.city || "",
    postcode: customer.postcode || "",
    items: (record.items || []).map(item => ({ name: `${item.name} ${item.dose}`.trim(), qty: item.qty })),
    total: record.grandTotal,
    delivery: record.delivery ? record.delivery.label : ""
  };
}

async function recentOrders(store, now = new Date()) {
  const state = await store.listState();
  const cutoff = now.getTime() - LIST_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recent = [...state.orders]
    .filter(([, meta]) => meta.createdAt.getTime() >= cutoff)
    .sort((a, b) => b[1].createdAt - a[1].createdAt)
    .slice(0, LIST_LIMIT);

  return mapLimit(recent, CONCURRENCY, async ([ref, meta]) => {
    const base = { ref, createdAt: meta.createdAt.toISOString(), ...statusFor(ref, state) };
    try {
      const record = await store.readOrder(ref, meta.url);
      return record ? { ...base, readable: true, ...summarise(record) } : { ...base, readable: false };
    } catch (err) {
      console.error(`[orders] could not read ${ref}: ${err.message}`);
      return { ...base, readable: false };
    }
  });
}

async function dispatch(store, refs) {
  const state = await store.listState();
  const unknown = refs.filter(ref => !state.orders.has(ref));
  if (unknown.length) return { status: 400, body: { ok: false, error: `No saved order for ${unknown.join(", ")}.` } };

  const now = new Date();
  const results = await mapLimit(refs, CONCURRENCY, async ref => {
    const created = await store.markDispatched(ref, now);
    const dispatchedAt = created ? now : state.dispatched.get(ref) || now;
    return { ref, status: created ? "dispatched" : "already dispatched", reviewDueDate: reviewDueDate(dispatchedAt) };
  });
  return { status: 200, body: { ok: true, results } };
}

async function undoDispatch(store, ref) {
  const state = await store.listState();
  if (state.reviewRequested.has(ref)) {
    return { status: 409, body: { ok: false, error: `The review email for ${ref} has already been sent.` } };
  }
  await store.clearDispatched(ref);
  return { status: 200, body: { ok: true, ref } };
}

async function sendNow(store, ref) {
  const state = await store.listState();
  const dispatchedAt = state.dispatched.get(ref);
  if (!dispatchedAt) return { status: 409, body: { ok: false, error: `Mark ${ref} as dispatched first.` } };
  const order = state.orders.get(ref);
  const result = await sendReviewRequest({ store, sendEmail: resendEmail, ref, dispatchedAt, orderUrl: order && order.url });
  if (result.status === "sent") return { status: 200, body: { ok: true, result } };
  return { status: result.status === "failed" ? 502 : 409, body: { ok: false, result, error: `Not sent: ${result.reason}.` } };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return send(res, 405, { ok: false, error: "Method not allowed." });

  let body = {};
  if (req.method === "POST") {
    try {
      body = parseBody(req) || {};
    } catch {
      return send(res, 400, { ok: false, error: "Bad request." });
    }
  }

  if (body.action === "logout") {
    res.setHeader("Set-Cookie", clearSessionCookie());
    return send(res, 200, { ok: true });
  }
  if (body.action === "login") return login(res, body.key);

  const access = authorizeAdmin(req);
  if (access === "unconfigured") return send(res, 503, { ok: false, error: NOT_SET_UP });
  if (access !== "ok") return send(res, 401, { ok: false, error: "Please log in." });

  const config = currentConfig();
  if (!config.orderDataKey) {
    return send(res, 503, { ok: false, config, error: "Orders can't be saved or read until ORDER_DATA_KEY (16+ characters) is added in Vercel." });
  }

  try {
    const store = openOrderStore();
    if (req.method === "GET") return send(res, 200, { ok: true, config, orders: await recentOrders(store) });

    if (body.action === "dispatch") {
      const refs = Array.isArray(body.refs) ? [...new Set(body.refs.map(ref => String(ref).trim().toUpperCase()))] : [];
      if (!refs.length || refs.length > MAX_REFS_PER_REQUEST || !refs.every(isValidRef)) {
        return send(res, 400, { ok: false, error: "Choose one or more valid order references." });
      }
      const outcome = await dispatch(store, refs);
      return send(res, outcome.status, outcome.body);
    }

    const ref = String(body.ref || "").trim().toUpperCase();
    if (body.action === "undo-dispatch" || body.action === "send-review-request") {
      if (!isValidRef(ref)) return send(res, 400, { ok: false, error: "That isn't a valid order reference." });
      if (body.action === "undo-dispatch") {
        const outcome = await undoDispatch(store, ref);
        return send(res, outcome.status, outcome.body);
      }
      if (!config.email) return send(res, 503, { ok: false, error: "Email service is not configured." });
      const outcome = await sendNow(store, ref);
      return send(res, outcome.status, outcome.body);
    }

    if (body.action === "send-due") {
      if (!config.email) return send(res, 503, { ok: false, error: "Email service is not configured." });
      return send(res, 200, { ok: true, ...(await sendDueReviewRequests({ store, sendEmail: resendEmail })) });
    }

    return send(res, 400, { ok: false, error: "Unknown action." });
  } catch (err) {
    console.error(`[orders] ${req.method} failed: ${err.message}`);
    return send(res, 500, { ok: false, error: "Something went wrong. Try again in a minute." });
  }
};
