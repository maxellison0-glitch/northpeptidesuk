// "How was your order?" emails, sent three working days after dispatch.
//
// Timing uses UK calendar dates: dispatched Monday -> asked Thursday,
// dispatched Friday -> asked the following Wednesday, so the email lands after
// the parcel rather than before it. Orders dispatched more than MAX_AGE_DAYS
// ago are never asked (e.g. if sending was switched off for a while).

const {
  SITE_URL,
  escapeHtml,
  ukLongDate,
  firstName,
  emailLayout,
  sleep,
  sendOnce
} = require("./email.js");

const REVIEW_DELAY_WORKING_DAYS = 3;
const MAX_AGE_DAYS = 21;
const DAY_MS = 24 * 60 * 60 * 1000;

const UK_DATE_PARTS = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
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

function reviewLink(ref, rating) {
  const params = new URLSearchParams({ ref });
  if (rating) params.set("rating", String(rating));
  return `${SITE_URL}/reviews/?${params}`;
}

function buildReviewRequestEmail(order, { dispatchedAt }) {
  const ref = order.ref;
  const name = firstName(order.customer && order.customer.name);
  const dispatchedOn = ukLongDate(dispatchedAt);
  const stars = [1, 2, 3, 4, 5].map(rating => `
          <td style="padding:0 3px;"><a href="${escapeHtml(reviewLink(ref, rating))}" title="${rating} out of 5" style="font-size:34px;line-height:1;color:#F2B01E;text-decoration:none;">&#9733;</a></td>`).join("");

  const html = emailLayout({
    preheader: `Tap a star to tell us how order ${ref} went. It takes under a minute.`,
    title: "How was your order?",
    subtitle: `Hi ${escapeHtml(name)}, your order ${escapeHtml(ref)} was dispatched on ${escapeHtml(dispatchedOn)}.`,
    body: `
        <p>We hope it arrived safely. Could you spare a minute to tell us how the ordering, delivery and packaging went? Honest reviews help other researchers choose a supplier with confidence.</p>
        <p style="margin:22px 0 6px;text-align:center;font-weight:700;color:#10233F;">Tap a star to start</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>${stars}
        </tr></table>
        <p style="text-align:center;margin:20px 0;"><a href="${escapeHtml(reviewLink(ref))}" style="display:inline-block;background:#1F6FEB;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:7px;font-size:15px;font-weight:700;">Leave a review</a></p>
        <p style="font-size:13px;color:#4B5F75;">Your order reference is filled in for you. Please keep the review to the order experience (ordering, delivery, packaging or support) so we can publish it.</p>
        <div style="margin:22px 0;padding:16px;background:#EEF7FD;border:1px solid #CFE0F1;border-radius:10px;">
          <p style="margin:0 0 6px;font-weight:700;color:#10233F;">Something not right?</p>
          <p style="margin:0;font-size:14px;color:#4B5F75;">Just reply to this email and we'll put it right.</p>
        </div>`,
    footerNote: `This is a one-off email about order ${escapeHtml(ref)}. If you'd rather not receive emails like this, reply and let us know.`
  });

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

// Sends one order's review request, at most once ever.
async function sendReviewRequest({ store, sendEmail, ref, dispatchedAt, orderUrl, identity }) {
  const order = await store.readOrder(ref, orderUrl);
  if (!order) return { ref, status: "skipped", reason: "no saved order record" };
  return sendOnce({
    store,
    marker: "reviewRequested",
    ref,
    to: order.customer && order.customer.email,
    message: buildReviewRequestEmail(order, { dispatchedAt }),
    sendEmail,
    idempotencyKey: `review-request-${ref}`,
    identity
  });
}

// The daily job: every dispatched order whose review date has arrived and that
// has not been asked yet, oldest first, `limit` per run (the rest go next run).
async function sendDueReviewRequests({ store, sendEmail, now = new Date(), limit = 20, pauseMs = 600 }) {
  const state = await store.listState({ orders: false, markers: ["dispatched", "reviewRequested"] });
  const due = [...state.dispatched]
    .filter(([ref, dispatchedAt]) => !state.reviewRequested.has(ref) && isReviewDue(dispatchedAt, now))
    .sort((a, b) => a[1] - b[1]);

  const results = [];
  for (const [ref, dispatchedAt] of due.slice(0, limit)) {
    if (results.length && pauseMs) await sleep(pauseMs);
    results.push(await sendReviewRequest({ store, sendEmail, ref, dispatchedAt }));
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
  sendReviewRequest,
  sendDueReviewRequests
};
