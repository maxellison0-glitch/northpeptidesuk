const ALLOWED_ORIGINS = new Set([
  "https://northpeptidesuk.com",
  "https://www.northpeptidesuk.com"
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORDER_FROM_EMAIL = process.env.ORDER_FROM_EMAIL || "North Peptides UK <orders@northpeptidesuk.com>";

const PROHIBITED_REVIEW_TERMS = [
  "dosage",
  "dose",
  "dosing",
  "injection",
  "inject",
  "injected",
  "self-inject",
  "weight loss",
  "fat loss",
  "appetite",
  "treatment",
  "therapy",
  "therapeutic",
  "healing",
  "cure",
  "pain",
  "symptoms",
  "side effects",
  "before and after"
];

const PROHIBITED_REVIEW_PATTERNS = [
  /\b(weight[-\s]?loss|lose\s+weight|losing\s+weight|fat[-\s]?loss)\b/i,
  /\b(appetite|hunger|feel\s+full)\b/i,
  /\b(inject|injected|injecting|self[-\s]?inject|jab)\b/i,
  /\b(dose|dosage|dosing)\b/i,
  /\b(treat|treatment|therapy|therapeutic|cure|healing|pain|symptoms?)\b/i,
  /\b(side[-\s]?effects?|adverse\s+(effect|reaction)s?)\b/i,
  /\bbefore\s+and\s+after\b|\bbefore\/after\b/i
];

function cors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://www.northpeptidesuk.com");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Content-Type", "application/json");
}

function send(res, status, body) {
  return res.status(status).send(JSON.stringify(body));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

async function readJson(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    total += buffer.length;
    if (total > 12_000) throw new Error("Payload too large");
    chunks.push(buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function findBlockedClaim(text) {
  return PROHIBITED_REVIEW_PATTERNS.find((pattern) => pattern.test(text));
}

async function resendSend(payload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Resend email failed.");
  return data;
}

module.exports = async function handler(req, res) {
  cors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "Method not allowed." });
  if (req.headers.origin && !ALLOWED_ORIGINS.has(req.headers.origin)) {
    return send(res, 403, { ok: false, error: "Origin not allowed." });
  }

  let payload;
  try {
    payload = await readJson(req);
  } catch {
    return send(res, 400, { ok: false, error: "Bad request." });
  }

  const rating = Number(payload.rating);
  const displayName = normalize(payload.displayName);
  const email = normalize(payload.email).toLowerCase();
  const orderReference = normalize(payload.orderReference);
  const review = normalize(payload.review);
  const consent = payload.consent === true || payload.consent === "true" || payload.consent === "on";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return send(res, 400, { ok: false, error: "Please choose a rating." });
  }
  if (!displayName || displayName.length > 80) {
    return send(res, 400, { ok: false, error: "Please enter a display name under 80 characters." });
  }
  if (email && (!EMAIL_RE.test(email) || email.length > 160)) {
    return send(res, 400, { ok: false, error: "Please enter a valid email, or leave it blank." });
  }
  if (orderReference.length > 80) {
    return send(res, 400, { ok: false, error: "Please shorten the order reference." });
  }
  if (review.length < 20 || review.length > 1200) {
    return send(res, 400, { ok: false, error: "Please write 20 to 1200 characters." });
  }
  if (!consent) {
    return send(res, 400, { ok: false, error: "Please confirm the moderation note." });
  }
  if (findBlockedClaim(`${displayName} ${review}`)) {
    return send(res, 400, {
      ok: false,
      error: "Please keep the review to ordering, dispatch, packaging or support. Remove personal outcomes or administration detail and try again."
    });
  }

  if (!process.env.RESEND_API_KEY || !process.env.ORDER_NOTIFY_EMAIL) {
    return send(res, 503, { ok: false, error: "Review collection is not available right now." });
  }

  const safeReview = escapeHtml(review).replace(/\n/g, "<br>");
  const html = `
    <h2>New website review</h2>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
      <tr><td><strong>Rating</strong></td><td>${rating}/5</td></tr>
      <tr><td><strong>Display name</strong></td><td>${escapeHtml(displayName)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email || "Not supplied")}</td></tr>
      <tr><td><strong>Order reference</strong></td><td>${escapeHtml(orderReference || "Not supplied")}</td></tr>
    </table>
    <h3>Review</h3>
    <p>${safeReview}</p>
    <p><em>Moderation note: publish only if this stays limited to the order experience and research-use-only positioning.</em></p>
  `;

  try {
    await resendSend({
      from: ORDER_FROM_EMAIL,
      to: [process.env.ORDER_NOTIFY_EMAIL],
      reply_to: email || undefined,
      subject: `New website review - ${rating}/5`,
      html
    });
    return send(res, 202, { ok: true, queued: true });
  } catch {
    return send(res, 502, { ok: false, error: "Could not send the review right now." });
  }
};
