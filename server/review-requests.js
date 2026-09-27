// "How was your order?" emails, sent three working days after dispatch.
//
// Timing uses UK calendar dates: dispatched Monday -> asked Thursday,
// dispatched Friday -> asked the following Wednesday, so the email lands after
// the parcel rather than before it. Orders dispatched more than MAX_AGE_DAYS
// ago are never asked (e.g. if sending was switched off for a while).

const REVIEW_DELAY_WORKING_DAYS = 3;
const MAX_AGE_DAYS = 21;
const SITE_URL = "https://www.northpeptidesuk.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 24 * 60 * 60 * 1000;

const UK_DATE_PARTS = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});
const UK_LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  weekday: "long",
  day: "numeric",
  month: "long"
});

// "2026-09-28" for the UK calendar day containing `date`.
function ukDate(date) {
  const parts = Object.fromEntries(UK_DATE_PARTS.formatToParts(date).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addWorkingDays(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  let added = 0;
  while (added < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return date.toISOString().slice(0, 10);
}

function reviewDueDate(dispatchedAt) {
  return addWorkingDays(ukDate(dispatchedAt), REVIEW_DELAY_WORKING_DAYS);
}

function isReviewDue(dispatchedAt, now = new Date()) {
  return ukDate(now) >= reviewDueDate(dispatchedAt) && now - dispatchedAt <= MAX_AGE_DAYS * DAY_MS;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function reviewLink(ref, rating) {
  const params = new URLSearchParams({ ref });
  if (rating) params.set("rating", String(rating));
  return `${SITE_URL}/reviews/?${params}`;
}

function firstName(name) {
  return String(name || "").trim().split(/\s+/)[0] || "there";
}

function buildReviewRequestEmail(order, { dispatchedAt }) {
  const ref = order.ref;
  const name = firstName(order.customer && order.customer.name);
  const dispatchedOn = UK_LONG_DATE.format(dispatchedAt);
  const stars = [1, 2, 3, 4, 5].map(rating => `
          <td style="padding:0 3px;"><a href="${escapeHtml(reviewLink(ref, rating))}" title="${rating} out of 5" style="font-size:34px;line-height:1;color:#F2B01E;text-decoration:none;">&#9733;</a></td>`).join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#132A46;line-height:1.6;max-width:560px;margin:0 auto;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#F7FAF8;">
        Tap a star to tell us how order ${escapeHtml(ref)} went. It takes under a minute.
      </div>
      <div style="background:#10233F;padding:18px 24px;border-radius:12px 12px 0 0;text-align:center;">
        <img src="${SITE_URL}/logo.png" width="52" height="52" alt="North Peptides UK" style="display:inline-block;border-radius:50%;border:0;">
      </div>
      <div style="background:#1F6FEB;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;font-size:20px;">How was your order?</h2>
        <p style="margin:6px 0 0;font-size:14px;color:#DCEBFF;">Hi ${escapeHtml(name)}, your order ${escapeHtml(ref)} was dispatched on ${escapeHtml(dispatchedOn)}.</p>
      </div>
      <div style="border:1px solid #D8E5F2;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
        <p>We hope it arrived safely. Could you spare a minute to tell us how the ordering, delivery and packaging went? Honest reviews help other researchers choose a supplier with confidence.</p>
        <p style="margin:22px 0 6px;text-align:center;font-weight:700;color:#10233F;">Tap a star to start</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>${stars}
        </tr></table>
        <p style="text-align:center;margin:20px 0;"><a href="${escapeHtml(reviewLink(ref))}" style="display:inline-block;background:#1F6FEB;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:7px;font-size:15px;font-weight:700;">Leave a review</a></p>
        <p style="font-size:13px;color:#4B5F75;">Your order reference is filled in for you. Please keep the review to the order experience (ordering, delivery, packaging or support) so we can publish it.</p>
        <div style="margin:22px 0;padding:16px;background:#EEF7FD;border:1px solid #CFE0F1;border-radius:10px;">
          <p style="margin:0 0 6px;font-weight:700;color:#10233F;">Something not right?</p>
          <p style="margin:0;font-size:14px;color:#4B5F75;">Just reply to this email and we'll put it right.</p>
        </div>
        <p style="font-size:12px;color:#9CA3AF;margin-top:20px;">This is a one-off email about order ${escapeHtml(ref)}. If you'd rather not receive emails like this, reply and let us know.<br>North Peptides UK &middot; Research use only. Not for human or animal consumption.</p>
      </div>
    </div>`;

  const text = `How was your order?

Hi ${name},

Your order ${ref} was dispatched on ${dispatchedOn}. We hope it arrived safely.

Could you spare a minute to tell us how the ordering, delivery and packaging went? Honest reviews help other researchers choose a supplier with confidence.

Leave a review (your order reference is filled in for you):
${reviewLink(ref)}

Please keep the review to the order experience (ordering, delivery, packaging or support) so we can publish it.

Something not right? Just reply to this email and we'll put it right.

This is a one-off email about order ${ref}. If you'd rather not receive emails like this, reply and let us know.

North Peptides UK - Research use only. Not for human or animal consumption.`;

  return { subject: `How was your order ${ref}?`, html, text };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function resendEmail(payload, { idempotencyKey } = {}) {
  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {})
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) return data;
    // Resend allows a few requests a second; wait and retry when throttled.
    if (response.status === 429 && attempt < 3) {
      await sleep(Math.min(Number(response.headers.get("retry-after")) || 1, 5) * 1000);
      continue;
    }
    throw new Error(data.message || `Resend responded ${response.status}`);
  }
}

function senderIdentity() {
  const replyTo = String(process.env.ORDER_NOTIFY_EMAIL || "orders@northpeptidesuk.com")
    .split(",")
    .map(address => address.trim())
    .filter(Boolean)[0];
  return {
    from: process.env.ORDER_FROM_EMAIL || "North Peptides UK <orders@northpeptidesuk.com>",
    replyTo
  };
}

// Sends one order's review request, at most once ever: the review-requested
// marker is claimed before sending and released only if the send fails.
async function sendReviewRequest({ store, sendEmail, ref, dispatchedAt, orderUrl, identity = senderIdentity() }) {
  const order = await store.readOrder(ref, orderUrl);
  if (!order) return { ref, status: "skipped", reason: "no saved order record" };
  const to = String((order.customer && order.customer.email) || "").trim();
  if (!EMAIL_RE.test(to)) return { ref, status: "skipped", reason: "no valid customer email" };
  if (!(await store.claimReviewRequest(ref))) return { ref, status: "skipped", reason: "already sent" };

  try {
    const message = buildReviewRequestEmail(order, { dispatchedAt });
    const result = await sendEmail({
      from: identity.from,
      to: [to],
      reply_to: identity.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text
    }, { idempotencyKey: `review-request-${ref}` });
    return { ref, status: "sent", id: result && result.id };
  } catch (err) {
    await store.releaseReviewRequest(ref).catch(releaseErr => {
      console.error(`[review-requests] could not release the claim for ${ref}: ${releaseErr.message}`);
    });
    return { ref, status: "failed", reason: err.message };
  }
}

// The daily job: every dispatched order whose review date has arrived and that
// has not been asked yet, oldest first, `limit` per run (the rest go next run).
async function sendDueReviewRequests({ store, sendEmail, now = new Date(), limit = 20, pauseMs = 600 }) {
  const state = await store.listState();
  const due = [...state.dispatched]
    .filter(([ref, dispatchedAt]) => !state.reviewRequested.has(ref) && isReviewDue(dispatchedAt, now))
    .sort((a, b) => a[1] - b[1]);

  const results = [];
  for (const [ref, dispatchedAt] of due.slice(0, limit)) {
    if (results.length && pauseMs) await sleep(pauseMs);
    const order = state.orders.get(ref);
    results.push(await sendReviewRequest({ store, sendEmail, ref, dispatchedAt, orderUrl: order && order.url }));
  }
  return { due: due.length, results };
}

module.exports = {
  REVIEW_DELAY_WORKING_DAYS,
  MAX_AGE_DAYS,
  ukDate,
  addWorkingDays,
  reviewDueDate,
  isReviewDue,
  reviewLink,
  buildReviewRequestEmail,
  resendEmail,
  senderIdentity,
  sendReviewRequest,
  sendDueReviewRequests
};
