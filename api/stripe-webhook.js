const crypto = require("node:crypto");
const SITE_URL = "https://northpeptidesuk.com";

const corsHeaders = {
  "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": SITE_URL,
  "Vary": "Origin"
};

function json(res, statusCode, body) {
  Object.entries({ ...corsHeaders, "Content-Type": "application/json" }).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  return res.status(statusCode).send(JSON.stringify(body));
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function parseStripeSignature(header) {
  return String(header || "").split(",").reduce((parts, part) => {
    const [key, value] = part.split("=");
    if (key && value) parts[key] = value;
    return parts;
  }, {});
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  const parts = parseStripeSignature(signatureHeader);
  if (!parts.t || !parts.v1) return false;

  try {
    const timestamp = Number.parseInt(parts.t, 10);
    if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

    const signedPayload = `${parts.t}.${rawBody.toString("utf8")}`;
    const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
    const actual = parts.v1;

    return (
      expected.length === actual.length &&
      crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(actual, "hex"))
    );
  } catch {
    return false;
  }
}

async function stripeGet(path) {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Stripe API request failed.");
  return data;
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: String(currency || "gbp").toUpperCase()
  }).format((amount || 0) / 100);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const TRUSTPILOT_URL = "https://www.trustpilot.com/review/northpeptidesuk.com";

// Pull the delivery address Stripe collected (shipping preferred, billing as fallback)
// so we no longer need to ask for it on the site. Handles both the older
// session.shipping_details shape and the newer collected_information one.
function formatAddress(session) {
  const shipping = session.shipping_details || session.collected_information?.shipping_details;
  const addr = shipping?.address || session.customer_details?.address;
  const name = shipping?.name || session.customer_details?.name;
  if (!addr) return escapeHtml(session.metadata?.address || "See Stripe dashboard");
  return [name, addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country]
    .filter(Boolean).map(escapeHtml).join("<br>");
}

function buildEmailHtml(session, lineItems) {
  const metadata = session.metadata || {};
  const rows = (lineItems.data || []).map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.description || item.price?.product || "Item")}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${escapeHtml(item.quantity || 1)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(item.amount_total, session.currency)}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <h2>Paid order received</h2>
      <p><strong>Total:</strong> ${formatMoney(session.amount_total, session.currency)}</p>
      <p><strong>Stripe session:</strong> ${escapeHtml(session.id)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(metadata.name || session.customer_details?.name || "Not supplied")}</p>
      <p><strong>Email:</strong> ${escapeHtml(metadata.email || session.customer_details?.email || "Not supplied")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(session.customer_details?.phone || "Not supplied")}</p>
      <p><strong>Delivery:</strong> ${escapeHtml(metadata.delivery || "Not supplied")}</p>
      <p><strong>Address:</strong><br>${formatAddress(session)}</p>
      ${metadata.notes ? `<p><strong>Notes:</strong><br>${escapeHtml(metadata.notes)}</p>` : ""}
      <h3>Items</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:2px solid #111827;padding-bottom:8px;">Item</th>
            <th style="text-align:center;border-bottom:2px solid #111827;padding-bottom:8px;">Qty</th>
            <th style="text-align:right;border-bottom:2px solid #111827;padding-bottom:8px;">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

const ORDER_FROM_EMAIL = process.env.ORDER_FROM_EMAIL || "North Peptides UK <orders@northpeptidesuk.com>";

async function resendSend(payload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Email send failed.");
  return data;
}

// Internal notification to the shop (orders@…): the full paid-order breakdown.
async function sendOrderEmail(session, lineItems) {
  if (!process.env.RESEND_API_KEY || !process.env.ORDER_NOTIFY_EMAIL) {
    return { skipped: true, reason: "Email environment variables are not configured." };
  }
  const data = await resendSend({
    from: ORDER_FROM_EMAIL,
    to: [process.env.ORDER_NOTIFY_EMAIL],
    reply_to: session.customer_details?.email || undefined,
    subject: `Paid order ${session.id} - ${formatMoney(session.amount_total, session.currency)}`,
    html: buildEmailHtml(session, lineItems)
  });
  return { skipped: false, id: data.id };
}

function buildCustomerEmailHtml(session, lineItems) {
  const rows = (lineItems.data || []).map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.description || "Item")}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${escapeHtml(item.quantity || 1)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(item.amount_total, session.currency)}</td>
    </tr>`).join("");
  const name = session.customer_details?.name || session.metadata?.name || "there";
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#16241E;line-height:1.6;max-width:560px;margin:0 auto;">
      <div style="background:#00795F;color:#fff;padding:22px 24px;border-radius:12px 12px 0 0;">
        <h2 style="margin:0;font-size:20px;">Order confirmed — thank you</h2>
      </div>
      <div style="border:1px solid #E2EAE4;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thanks for your order with North Peptides UK. We've received your payment and your order is being prepared for same-day dispatch on business days. You'll get tracking once it's on the way.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead><tr>
            <th style="text-align:left;border-bottom:2px solid #16241E;padding-bottom:8px;">Item</th>
            <th style="text-align:center;border-bottom:2px solid #16241E;padding-bottom:8px;">Qty</th>
            <th style="text-align:right;border-bottom:2px solid #16241E;padding-bottom:8px;">Amount</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="text-align:right;font-size:16px;"><strong>Total paid: ${formatMoney(session.amount_total, session.currency)}</strong></p>
        <p style="font-size:13px;color:#6B7280;">Order reference: ${escapeHtml(session.id)}</p>
        <div style="margin:22px 0;padding:16px;background:#F7FAF8;border:1px solid #E2EAE4;border-radius:10px;text-align:center;">
          <p style="margin:0 0 10px;">Happy with your order? A quick review really helps other researchers.</p>
          <a href="${TRUSTPILOT_URL}" style="display:inline-block;background:#00B67A;color:#fff;text-decoration:none;font-weight:700;padding:10px 20px;border-radius:8px;">★ Leave a Trustpilot review</a>
        </div>
        <p>Questions about your order? Just reply to this email — it reaches us at orders@northpeptidesuk.com.</p>
        <p style="font-size:12px;color:#9CA3AF;margin-top:20px;">North Peptides UK · Research use only. Not for human or animal consumption.</p>
      </div>
    </div>`;
}

// Confirmation to the customer, sent as orders@… so replies land in the shop inbox.
async function sendCustomerEmail(session, lineItems) {
  const to = session.customer_details?.email || session.metadata?.email;
  if (!process.env.RESEND_API_KEY || !to) {
    return { skipped: true, reason: "No Resend key or customer email." };
  }
  const data = await resendSend({
    from: ORDER_FROM_EMAIL,
    to: [to],
    reply_to: process.env.ORDER_NOTIFY_EMAIL || undefined,
    subject: "Your North Peptides UK order is confirmed",
    html: buildCustomerEmailHtml(session, lineItems)
  });
  return { skipped: false, id: data.id };
}

// Instant alert to the shop for manually-created Stripe Invoices (e.g. a
// family/off-catalogue order) — covers both "created" and "paid" so this
// doesn't need checking by hand at either stage.
async function sendInvoiceEventEmail(invoice, label, amount) {
  if (!process.env.RESEND_API_KEY || !process.env.ORDER_NOTIFY_EMAIL) {
    return { skipped: true, reason: "Email environment variables are not configured." };
  }
  const html = `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <h2>${escapeHtml(label)}</h2>
      <p><strong>Invoice:</strong> ${escapeHtml(invoice.number || invoice.id)}</p>
      <p><strong>Amount:</strong> ${amount}</p>
      <p><strong>Customer:</strong> ${escapeHtml(invoice.customer_name || "Not supplied")}</p>
      <p><strong>Email:</strong> ${escapeHtml(invoice.customer_email || "Not supplied")}</p>
      ${invoice.description ? `<p><strong>Description:</strong> ${escapeHtml(invoice.description)}</p>` : ""}
      ${invoice.hosted_invoice_url ? `<p><a href="${escapeHtml(invoice.hosted_invoice_url)}">View invoice</a></p>` : ""}
    </div>`;
  const data = await resendSend({
    from: ORDER_FROM_EMAIL,
    to: [process.env.ORDER_NOTIFY_EMAIL],
    reply_to: invoice.customer_email || undefined,
    subject: `${label} ${invoice.number || invoice.id} - ${amount}`,
    html
  });
  return { skipped: false, id: data.id };
}

// Shared try/catch/log wrapper for the invoice.* event branches below.
async function notifyInvoiceEvent(res, invoice, label, amount) {
  let invoiceEmail;
  try {
    invoiceEmail = await sendInvoiceEventEmail(invoice, label, amount);
    console.log(`[stripe-webhook] ${label} email (${invoice.number || invoice.id}): ${JSON.stringify(invoiceEmail)}`);
  } catch (err) {
    invoiceEmail = { skipped: true, error: err.message };
    console.error(`[stripe-webhook] ${label} email FAILED: ${err.message}`);
  }
  return json(res, 200, { received: true, invoiceEmail });
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).send("");
  }
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!process.env.STRIPE_WEBHOOK_SECRET) return json(res, 500, { error: "Webhook secret is not configured." });
  if (!process.env.STRIPE_SECRET_KEY) return json(res, 500, { error: "Stripe secret key is not configured." });

  const rawBody = await readRawBody(req);
  const signature = req.headers["stripe-signature"];

  if (!verifyStripeSignature(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)) {
    return json(res, 400, { error: "Invalid Stripe signature." });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return json(res, 400, { error: "Invalid JSON payload." });
  }
  if (event.type === "invoice.created") {
    const invoice = event.data.object;
    return notifyInvoiceEvent(res, invoice, "Invoice created", formatMoney(invoice.amount_due, invoice.currency));
  }
  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    return notifyInvoiceEvent(res, invoice, "Invoice paid", formatMoney(invoice.amount_paid, invoice.currency));
  }

  if (event.type !== "checkout.session.completed") {
    return json(res, 200, { received: true, ignored: event.type });
  }

  const session = event.data.object;
  const lineItems = await stripeGet(`/checkout/sessions/${session.id}/line_items?limit=100`);

  // Notify the shop and confirm to the customer. Don't let a customer-email failure
  // (e.g. a bounced address) block the 200 the owner notification depends on.
  // Logged explicitly so the outcome is visible in Vercel's runtime logs directly —
  // no need to go find the raw response body in Stripe's webhook delivery UI.
  const email = await sendOrderEmail(session, lineItems);
  console.log(`[stripe-webhook] owner email: ${JSON.stringify(email)}`);
  let customerEmail;
  try {
    customerEmail = await sendCustomerEmail(session, lineItems);
    console.log(`[stripe-webhook] customer email (to ${session.customer_details?.email || session.metadata?.email}): ${JSON.stringify(customerEmail)}`);
  } catch (err) {
    customerEmail = { skipped: true, error: err.message };
    console.error(`[stripe-webhook] customer email FAILED: ${err.message}`);
  }

  return json(res, 200, { received: true, email, customerEmail });
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};
