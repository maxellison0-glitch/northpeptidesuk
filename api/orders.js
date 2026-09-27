// Owner-only order API behind the dispatch page (/admin/). Requests need the
// session cookie from logging in, or "Authorization: Bearer <ADMIN_KEY>".
//
//   POST { action: "login", key }                check ADMIN_KEY and set the session cookie
//   POST { action: "logout" }                    clear the session cookie
//   GET                                          recent orders with payment, dispatch and email status
//   POST { action: "paid", refs: [...] }         mark orders paid and email each customer a confirmation
//   POST { action: "undo-paid", ref }            move an order back to awaiting payment (before dispatch)
//   POST { action: "send-payment-email", ref }   retry a payment confirmation that failed to send
//   POST { action: "dispatch", refs: [...] }     mark paid orders dispatched (review email follows)
//   POST { action: "undo-dispatch", ref }        unmark, while the review email is still pending
//   POST { action: "send-review-request", ref }  send that order's review email now
//   POST { action: "send-due" }                  run the daily review-email job now

const { openOrderStore, isValidRef, hasUsableSecret } = require("../server/order-store.js");
const {
  authorizeAdmin,
  isAdminKey,
  createSessionCookie,
  clearSessionCookie,
  usableSecrets
} = require("../server/admin-auth.js");
const { resendEmail, sleep } = require("../server/email.js");
const { sendPaymentConfirmation } = require("../server/payment-confirmation.js");
const { reviewDueDate, sendReviewRequest, sendDueReviewRequests } = require("../server/review-requests.js");

const LIST_WINDOW_DAYS = 45;
const LIST_LIMIT = 150;
const MAX_REFS_PER_REQUEST = 100;
const MAX_PAID_PER_REQUEST = 40; // each sends an email; keeps a batch well inside maxDuration
const CONCURRENCY = 6;
const EMAIL_PAUSE_MS = 600; // Resend allows a few sends a second
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

function parseRefs(value, max) {
  const refs = Array.isArray(value) ? [...new Set(value.map(ref => String(ref).trim().toUpperCase()))] : [];
  return refs.length && refs.length <= max && refs.every(isValidRef) ? refs : null;
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

function iso(date) {
  return date ? date.toISOString() : null;
}

function statusFor(ref, state) {
  const dispatchedAt = state.dispatched.get(ref);
  return {
    paidAt: iso(state.paid.get(ref)),
    paymentEmailedAt: iso(state.paymentEmailed.get(ref)),
    dispatchedAt: iso(dispatchedAt),
    reviewDueDate: dispatchedAt ? reviewDueDate(dispatchedAt) : null,
    reviewRequestedAt: iso(state.reviewRequested.get(ref))
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

function unknownRefs(refs, state) {
  const unknown = refs.filter(ref => !state.orders.has(ref));
  return unknown.length ? { status: 400, body: { ok: false, error: `No saved order for ${unknown.join(", ")}.` } } : null;
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

// Marks each order paid, then emails its confirmation (one at a time, to stay
// inside Resend's rate limit). An order already paid is not emailed twice.
async function markPaid(store, refs, emailEnabled) {
  const state = await store.listState({ markers: ["paid"] });
  const unknown = unknownRefs(refs, state);
  if (unknown) return unknown;

  const now = new Date();
  const results = [];
  for (const ref of refs) {
    if (results.length && emailEnabled) await sleep(EMAIL_PAUSE_MS);
    const created = await store.claim("paid", ref, now);
    const paidAt = created ? now : state.paid.get(ref) || now;
    const email = emailEnabled
      ? await sendPaymentConfirmation({ store, sendEmail: resendEmail, ref, paidAt, orderUrl: state.orders.get(ref).url })
      : { status: "skipped", reason: "email service is not configured" };
    results.push({ ref, status: created ? "paid" : "already paid", email: email.status, reason: email.reason });
  }
  return { status: 200, body: { ok: true, results } };
}

async function undoPaid(store, ref) {
  const state = await store.listState({ orders: false, markers: ["dispatched"] });
  if (state.dispatched.has(ref)) return { status: 409, body: { ok: false, error: `Undo the dispatch for ${ref} first.` } };
  await store.release("paid", ref);
  return { status: 200, body: { ok: true, ref } };
}

async function sendPaymentEmailNow(store, ref) {
  const state = await store.listState({ markers: ["paid"] });
  const paidAt = state.paid.get(ref);
  if (!paidAt) return { status: 409, body: { ok: false, error: `Mark ${ref} as paid first.` } };
  const order = state.orders.get(ref);
  const result = await sendPaymentConfirmation({ store, sendEmail: resendEmail, ref, paidAt, orderUrl: order && order.url });
  if (result.status === "sent") return { status: 200, body: { ok: true, result } };
  return { status: result.status === "failed" ? 502 : 409, body: { ok: false, result, error: `Not sent: ${result.reason}.` } };
}

// Only paid orders can be dispatched; the order email tells the shop not to
// dispatch until funds clear.
async function dispatch(store, refs) {
  const state = await store.listState({ markers: ["paid", "dispatched"] });
  const unknown = unknownRefs(refs, state);
  if (unknown) return unknown;
  const unpaid = refs.filter(ref => !state.paid.has(ref));
  if (unpaid.length) return { status: 409, body: { ok: false, error: `Mark ${unpaid.join(", ")} as paid first.` } };

  const now = new Date();
  const results = await mapLimit(refs, CONCURRENCY, async ref => {
    const created = await store.claim("dispatched", ref, now);
    const dispatchedAt = created ? now : state.dispatched.get(ref) || now;
    return { ref, status: created ? "dispatched" : "already dispatched", reviewDueDate: reviewDueDate(dispatchedAt) };
  });
  return { status: 200, body: { ok: true, results } };
}

async function undoDispatch(store, ref) {
  const state = await store.listState({ orders: false, markers: ["reviewRequested"] });
  if (state.reviewRequested.has(ref)) {
    return { status: 409, body: { ok: false, error: `The review email for ${ref} has already been sent.` } };
  }
  await store.release("dispatched", ref);
  return { status: 200, body: { ok: true, ref } };
}

async function sendReviewNow(store, ref) {
  const state = await store.listState({ markers: ["dispatched"] });
  const dispatchedAt = state.dispatched.get(ref);
  if (!dispatchedAt) return { status: 409, body: { ok: false, error: `Mark ${ref} as dispatched first.` } };
  const order = state.orders.get(ref);
  const result = await sendReviewRequest({ store, sendEmail: resendEmail, ref, dispatchedAt, orderUrl: order && order.url });
  if (result.status === "sent") return { status: 200, body: { ok: true, result } };
  return { status: result.status === "failed" ? 502 : 409, body: { ok: false, result, error: `Not sent: ${result.reason}.` } };
}

const EMAIL_OFF = { status: 503, body: { ok: false, error: "Email service is not configured." } };

async function runAction(store, body, config) {
  if (body.action === "paid" || body.action === "dispatch") {
    const max = body.action === "paid" ? MAX_PAID_PER_REQUEST : MAX_REFS_PER_REQUEST;
    const refs = parseRefs(body.refs, max);
    if (!refs) return { status: 400, body: { ok: false, error: `Choose between 1 and ${max} valid order references.` } };
    return body.action === "paid" ? markPaid(store, refs, config.email) : dispatch(store, refs);
  }

  const ref = String(body.ref || "").trim().toUpperCase();
  const singleRefActions = {
    "undo-paid": () => undoPaid(store, ref),
    "send-payment-email": () => (config.email ? sendPaymentEmailNow(store, ref) : EMAIL_OFF),
    "undo-dispatch": () => undoDispatch(store, ref),
    "send-review-request": () => (config.email ? sendReviewNow(store, ref) : EMAIL_OFF)
  };
  if (Object.prototype.hasOwnProperty.call(singleRefActions, body.action)) {
    if (!isValidRef(ref)) return { status: 400, body: { ok: false, error: "That isn't a valid order reference." } };
    return singleRefActions[body.action]();
  }

  if (body.action === "send-due") {
    if (!config.email) return EMAIL_OFF;
    return { status: 200, body: { ok: true, ...(await sendDueReviewRequests({ store, sendEmail: resendEmail })) } };
  }

  return { status: 400, body: { ok: false, error: "Unknown action." } };
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
    const outcome = await runAction(store, body, config);
    return send(res, outcome.status, outcome.body);
  } catch (err) {
    console.error(`[orders] ${req.method} ${body.action || ""} failed: ${err.message}`);
    return send(res, 500, { ok: false, error: "Something went wrong. Try again in a minute." });
  }
};
