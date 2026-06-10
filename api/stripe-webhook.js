const crypto = require("node:crypto");

const corsHeaders = {
  "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*"
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

function buildEmailHtml(session, lineItems) {
  const metadata = session.metadata || {};
  const rows = (lineItems.data || []).map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${item.description || item.price?.product || "Item"}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity || 1}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(item.amount_total, session.currency)}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <h2>Paid order received</h2>
      <p><strong>Total:</strong> ${formatMoney(session.amount_total, session.currency)}</p>
      <p><strong>Stripe session:</strong> ${session.id}</p>
      <p><strong>Customer:</strong> ${metadata.name || session.customer_details?.name || "Not supplied"}</p>
      <p><strong>Email:</strong> ${metadata.email || session.customer_details?.email || "Not supplied"}</p>
      <p><strong>Phone:</strong> ${session.customer_details?.phone || "Not supplied"}</p>
      <p><strong>Delivery:</strong> ${metadata.delivery || "Not supplied"}</p>
      <p><strong>Address:</strong><br>${metadata.address || "Check Stripe customer details"}</p>
      ${metadata.notes ? `<p><strong>Notes:</strong><br>${metadata.notes}</p>` : ""}
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

async function sendOrderEmail(session, lineItems) {
  if (!process.env.RESEND_API_KEY || !process.env.ORDER_NOTIFY_EMAIL) {
    return { skipped: true, reason: "Email environment variables are not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.ORDER_FROM_EMAIL || "North Peptides UK <onboarding@resend.dev>",
      to: [process.env.ORDER_NOTIFY_EMAIL],
      subject: `Paid order ${session.id} - ${formatMoney(session.amount_total, session.currency)}`,
      html: buildEmailHtml(session, lineItems)
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Order email failed.");
  return { skipped: false, id: data.id };
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

  const event = JSON.parse(rawBody.toString("utf8"));
  if (event.type !== "checkout.session.completed") {
    return json(res, 200, { received: true, ignored: event.type });
  }

  const session = event.data.object;
  const lineItems = await stripeGet(`/checkout/sessions/${session.id}/line_items?limit=100`);
  const email = await sendOrderEmail(session, lineItems);

  return json(res, 200, { received: true, email });
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};
