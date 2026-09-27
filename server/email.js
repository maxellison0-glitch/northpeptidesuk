// Shared building blocks for the customer emails sent after checkout (payment
// confirmation, review request): formatting, the branded layout, and sending
// through Resend.

const SITE_URL = "https://www.northpeptidesuk.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UK_LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  weekday: "long",
  day: "numeric",
  month: "long"
});

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Same style as the order confirmation email: £269.99, £25.
function formatMoney(value) {
  return "£" + Number(value).toFixed(2).replace(/\.00$/, "");
}

// "Monday 28 September"
function ukLongDate(date) {
  return UK_LONG_DATE.format(date);
}

function firstName(name) {
  return String(name || "").trim().split(/\s+/)[0] || "there";
}

function isEmailAddress(value) {
  return EMAIL_RE.test(String(value || "").trim());
}

// The layout every customer email shares: logo bar, blue title band, body,
// research-use footer. `title`, `subtitle`, `body` and `footerNote` are HTML
// the caller has already escaped; `preheader` is the plain inbox preview line.
function emailLayout({ preheader, title, subtitle, body, footerNote }) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#132A46;line-height:1.6;max-width:560px;margin:0 auto;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#F7FAF8;">
        ${escapeHtml(preheader)}
      </div>
      <div style="background:#10233F;padding:18px 24px;border-radius:12px 12px 0 0;text-align:center;">
        <img src="${SITE_URL}/logo.png" width="52" height="52" alt="North Peptides UK" style="display:inline-block;border-radius:50%;border:0;">
      </div>
      <div style="background:#1F6FEB;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;font-size:20px;">${title}</h2>
        <p style="margin:6px 0 0;font-size:14px;color:#DCEBFF;">${subtitle}</p>
      </div>
      <div style="border:1px solid #D8E5F2;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
        ${body}
        <p style="font-size:12px;color:#9CA3AF;margin-top:20px;">${footerNote ? `${footerNote}<br>` : ""}North Peptides UK &middot; Research use only. Not for human or animal consumption.</p>
      </div>
    </div>`;
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

// Replies go to the first ORDER_NOTIFY_EMAIL address, as with the order email.
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

// Sends one of an order's one-off emails at most once: the marker is claimed
// before sending and released only if the send fails, so a later retry works.
// `idempotencyKey` also lets Resend drop a duplicate if a send is retried.
async function sendOnce({ store, marker, ref, to, message, sendEmail, idempotencyKey, identity = senderIdentity() }) {
  if (!isEmailAddress(to)) return { ref, status: "skipped", reason: "no valid customer email" };
  if (!(await store.claim(marker, ref))) return { ref, status: "skipped", reason: "already sent" };
  try {
    const result = await sendEmail({
      from: identity.from,
      to: [String(to).trim()],
      reply_to: identity.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text
    }, { idempotencyKey });
    return { ref, status: "sent", id: result && result.id };
  } catch (err) {
    await store.release(marker, ref).catch(releaseErr => {
      console.error(`[email] could not release the ${marker} claim for ${ref}: ${releaseErr.message}`);
    });
    return { ref, status: "failed", reason: err.message };
  }
}

module.exports = {
  SITE_URL,
  escapeHtml,
  formatMoney,
  ukLongDate,
  firstName,
  isEmailAddress,
  emailLayout,
  sleep,
  resendEmail,
  senderIdentity,
  sendOnce
};
