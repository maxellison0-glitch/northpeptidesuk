const crypto = require("node:crypto");
const {
  DISCOUNT_CODES,
  validateOrderItems,
  calculateDelivery,
  compactText,
  corsHeaders
} = require("../server/commerce-core.js");

const ORDER_FROM_EMAIL = process.env.ORDER_FROM_EMAIL || "North Peptides UK <orders@northpeptidesuk.com>";

// Comma-separated list supported, e.g. "orders@northpeptidesuk.com,backup@example.com"
function ownerNotifyRecipients() {
  return String(process.env.ORDER_NOTIFY_EMAIL || "orders@northpeptidesuk.com")
    .split(",")
    .map(address => address.trim())
    .filter(Boolean);
}

function json(res, statusCode, body, origin) {
  const headers = corsHeaders(origin);
  Object.entries({ ...headers, "Content-Type": "application/json" }).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  return res.status(statusCode).send(JSON.stringify(body));
}

// Legacy globally-unique format — the safe fallback when the sequential
// counter (Vercel Blob) is unavailable. Orders must never fail over a ref.
function generateLegacyOrderRef() {
  const d = new Date();
  const date = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
  return `NP-${date}-${rand}`;
}

async function generateOrderRef() {
  try {
    const { list, put } = require("@vercel/blob");
    const { nextSequentialRef } = require("../server/order-ref.js");
    return await nextSequentialRef({ list, put });
  } catch (err) {
    console.error(`[create-order] sequential ref unavailable, using legacy format: ${err.message}`);
    return generateLegacyOrderRef();
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(value) {
  return "£" + Number(value).toFixed(2).replace(/\.00$/, "");
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
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Email send failed.");
  return data;
}

// One retry so a transient Resend/network blip can't silently lose an order email.
async function resendSendWithRetry(payload) {
  try {
    return await resendSend(payload);
  } catch (firstError) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      return await resendSend(payload);
    } catch (secondError) {
      secondError.firstAttempt = firstError.message;
      throw secondError;
    }
  }
}

function buildOwnerEmailHtml(order) {
  const rows = order.items.map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.name)} ${escapeHtml(item.dose)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.qty}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(item.lineTotal)}</td>
    </tr>`).join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <h2>New bank transfer order — ${escapeHtml(order.ref)}</h2>
      <p style="color:#B45309;font-weight:700;">AWAITING PAYMENT — do not dispatch until funds clear.</p>
      <p><strong>Total:</strong> ${formatMoney(order.grandTotal)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(order.customer.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.customer.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.customer.phone || "Not supplied")}</p>
      <p><strong>Delivery:</strong> ${escapeHtml(order.delivery.label)} (${formatMoney(order.delivery.charge)})</p>
      <p><strong>Address:</strong><br>${[order.customer.address1, order.customer.address2, order.customer.city, order.customer.county, order.customer.postcode].filter(Boolean).map(escapeHtml).join("<br>")}</p>
      ${order.customer.notes ? `<p><strong>Notes:</strong><br>${escapeHtml(order.customer.notes).replace(/\n/g, "<br>")}</p>` : ""}
      ${order.discountCode ? `<p><strong>Discount:</strong> ${escapeHtml(order.discountCode)} (${Math.round(order.discountPct * 100)}% off)</p>` : ""}
      <h3>Items</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr>
          <th style="text-align:left;border-bottom:2px solid #111827;padding-bottom:8px;">Item</th>
          <th style="text-align:center;border-bottom:2px solid #111827;padding-bottom:8px;">Qty</th>
          <th style="text-align:right;border-bottom:2px solid #111827;padding-bottom:8px;">Amount</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function buildCustomerEmailHtml(order) {
  const rows = order.items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:14px;">${escapeHtml(item.name)} ${escapeHtml(item.dose)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:center;font-size:14px;">${item.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;white-space:nowrap;">${formatMoney(item.lineTotal)}</td>
    </tr>`).join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#132A46;line-height:1.6;max-width:560px;margin:0 auto;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#F7FAF8;">
        Order received — complete your bank transfer to confirm.
      </div>
      <div style="background:#10233F;padding:18px 24px;border-radius:12px 12px 0 0;text-align:center;">
        <img src="https://www.northpeptidesuk.com/logo.png" width="52" height="52" alt="North Peptides UK" style="display:inline-block;border-radius:50%;border:0;">
      </div>
      <div style="background:#1F6FEB;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;font-size:20px;">Order received — pay by bank transfer</h2>
        <p style="margin:6px 0 0;font-size:14px;color:#DCEBFF;">Hi ${escapeHtml(order.customer.name)} — one step left to confirm your order.</p>
      </div>
      <div style="border:1px solid #D8E5F2;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
        <p>Thanks for your order with North Peptides UK. To complete it, please send a bank transfer using the details below.</p>

        <div style="margin:18px 0;padding:18px;background:#F0F7FF;border:1px solid #B8D6F0;border-radius:10px;">
          <p style="margin:0 0 10px;font-weight:700;color:#10233F;font-size:15px;">Bank transfer details</p>
          <table style="width:100%;font-size:14px;">
            <tr><td style="padding:4px 0;color:#4B5F75;width:40%;">Account name</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(order.bankDetails.accountName)}</td></tr>
            <tr><td style="padding:4px 0;color:#4B5F75;">Sort code</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(order.bankDetails.sortCode)}</td></tr>
            <tr><td style="padding:4px 0;color:#4B5F75;">Account number</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(order.bankDetails.accountNumber)}</td></tr>
            <tr><td style="padding:4px 0;color:#4B5F75;">Amount</td><td style="padding:4px 0;font-weight:700;color:#1F6FEB;">${formatMoney(order.grandTotal)}</td></tr>
            <tr><td style="padding:4px 0;color:#4B5F75;">Reference</td><td style="padding:4px 0;font-weight:700;color:#1F6FEB;">${escapeHtml(order.ref)}</td></tr>
          </table>
        </div>

        <p style="font-size:13px;color:#B45309;font-weight:600;">Please use your order reference (${escapeHtml(order.ref)}) as the payment reference so we can match your transfer.</p>

        <p>Once we receive your payment (usually within a few hours via Faster Payments), we'll confirm by email. Orders placed before 12pm Mon&ndash;Fri are aimed to be dispatched the next working day by ${escapeHtml(order.delivery.label)}, sent in plain, unmarked packaging.</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead><tr>
            <th style="text-align:left;border-bottom:2px solid #10233F;padding-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.03em;">Item</th>
            <th style="text-align:center;border-bottom:2px solid #10233F;padding-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.03em;">Qty</th>
            <th style="text-align:right;border-bottom:2px solid #10233F;padding-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.03em;">Amount</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="text-align:right;font-size:16px;"><strong>Total to transfer: ${formatMoney(order.grandTotal)}</strong></p>
        <p style="font-size:13px;color:#6B7280;">Order reference: ${escapeHtml(order.ref)}</p>

        <div style="margin:22px 0;padding:16px;background:#F8FBFF;border:1px solid #CFE0F1;border-radius:10px;">
          <p style="margin:0 0 6px;font-weight:700;color:#10233F;">Share your order experience</p>
          <p style="margin:0;font-size:14px;color:#4B5F75;">After your order has arrived, you can leave honest feedback about ordering, delivery, packaging or support.</p>
          <p style="margin:12px 0 0;"><a href="https://www.feedbackplatform.com/review/northpeptidesuk.com" style="display:inline-block;background:#1F6FEB;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:7px;font-size:14px;font-weight:700;">Leave feedback</a></p>
        </div>

        <div style="margin:22px 0;padding:16px;background:#EEF7FD;border:1px solid #CFE0F1;border-radius:10px;">
          <p style="margin:0 0 6px;font-weight:700;color:#10233F;">Need help?</p>
          <p style="margin:0;font-size:14px;color:#4B5F75;">Reply to this email with your order reference and we'll help with any questions.</p>
        </div>
        <p style="font-size:12px;color:#9CA3AF;margin-top:20px;">North Peptides UK &middot; Research use only. Not for human or animal consumption.</p>
      </div>
    </div>`;
}

function buildCustomerEmailText(order) {
  const items = order.items.map(item =>
    `- ${item.name} ${item.dose} x${item.qty} — ${formatMoney(item.lineTotal)}`
  ).join("\n");

  return `Order received — pay by bank transfer

Hi ${order.customer.name},

Thanks for your order with North Peptides UK. To complete it, please send a bank transfer:

Account name: ${order.bankDetails.accountName}
Sort code: ${order.bankDetails.sortCode}
Account number: ${order.bankDetails.accountNumber}
Amount: ${formatMoney(order.grandTotal)}
Reference: ${order.ref}

Please use your order reference (${order.ref}) as the payment reference.

Once we receive payment, we'll confirm by email. Orders placed before 12pm Mon-Fri are aimed to be dispatched the next working day.

${items}

Total to transfer: ${formatMoney(order.grandTotal)}
Order reference: ${order.ref}

After your order has arrived, you can leave honest feedback about ordering, delivery, packaging or support:
https://www.feedbackplatform.com/review/northpeptidesuk.com

Questions? Reply to this email — it reaches us at orders@northpeptidesuk.com.

North Peptides UK - Research use only. Not for human or animal consumption.`;
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;

  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(204).send("");
  }

  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" }, origin);

  if (!process.env.RESEND_API_KEY) return json(res, 500, { error: "Email service is not configured." }, origin);

  const bankAccountName = process.env.BANK_ACCOUNT_NAME;
  const bankSortCode = process.env.BANK_SORT_CODE;
  const bankAccountNumber = process.env.BANK_ACCOUNT_NUMBER;
  if (!bankAccountName || !bankSortCode || !bankAccountNumber) {
    return json(res, 500, { error: "Bank details are not configured." }, origin);
  }

  const payload = req.body || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) return json(res, 400, { error: "Your basket is empty." }, origin);

  const customer = payload.customer || {};
  const name = compactText(customer.name, 120);
  const email = compactText(customer.email, 160);
  const phone = compactText(customer.phone, 30);
  const address1 = compactText(customer.address1, 200);
  const city = compactText(customer.city, 100);
  const postcode = compactText(customer.postcode, 12);

  if (!name) return json(res, 400, { error: "Name is required." }, origin);
  if (!email) return json(res, 400, { error: "Email is required." }, origin);
  if (!address1) return json(res, 400, { error: "Address is required." }, origin);
  if (!city) return json(res, 400, { error: "City/town is required." }, origin);
  if (!postcode) return json(res, 400, { error: "Postcode is required." }, origin);

  const discountCode = String(payload.discountCode || "").trim().toUpperCase();
  const discountPct = DISCOUNT_CODES[discountCode] || 0;
  const hasDiscount = discountPct > 0;

  const validation = validateOrderItems(items, hasDiscount ? discountPct : 0);
  if (validation.error) return json(res, 400, { error: validation.error }, origin);
  const validatedItems = validation.items;
  const delivery = calculateDelivery(payload.deliveryMethod, discountCode, validation.productSubtotal);
  const deliveryCharge = delivery.charge;
  const grandTotal = validation.productSubtotal + deliveryCharge;

  const orderRef = await generateOrderRef();
  const bankDetails = {
    accountName: bankAccountName,
    sortCode: bankSortCode,
    accountNumber: bankAccountNumber
  };

  const order = {
    ref: orderRef,
    items: validatedItems,
    grandTotal,
    delivery: { label: delivery.label, charge: deliveryCharge },
    discountCode: hasDiscount ? discountCode : null,
    discountPct,
    customer: {
      name,
      email,
      phone,
      address1,
      address2: compactText(customer.address2, 200),
      city,
      county: compactText(customer.county, 100),
      postcode,
      notes: compactText(customer.notes, 1000)
    },
    bankDetails
  };

  const notifyRecipients = ownerNotifyRecipients();
  const emails = { owner: "failed", customer: "failed" };

  try {
    const ownerEmail = await resendSendWithRetry({
      from: ORDER_FROM_EMAIL,
      to: notifyRecipients,
      reply_to: email,
      subject: `Bank transfer order ${orderRef} — ${formatMoney(grandTotal)}`,
      html: buildOwnerEmailHtml(order)
    });
    emails.owner = "sent";
    console.log(`[create-order] owner email sent for ${orderRef} to ${notifyRecipients.join(", ")}: ${JSON.stringify(ownerEmail)}`);
  } catch (err) {
    console.error(`[create-order] owner email FAILED for ${orderRef} to ${notifyRecipients.join(", ")}: ${err.message}${err.firstAttempt ? ` (first attempt: ${err.firstAttempt})` : ""}`);
  }

  try {
    const customerEmail = await resendSendWithRetry({
      from: ORDER_FROM_EMAIL,
      to: [email],
      reply_to: notifyRecipients[0],
      subject: `Your North Peptides UK order — ${orderRef}`,
      html: buildCustomerEmailHtml(order),
      text: buildCustomerEmailText(order)
    });
    emails.customer = "sent";
    console.log(`[create-order] customer email sent for ${orderRef} to ${email}: ${JSON.stringify(customerEmail)}`);
  } catch (err) {
    console.error(`[create-order] customer email FAILED for ${orderRef} to ${email}: ${err.message}${err.firstAttempt ? ` (first attempt: ${err.firstAttempt})` : ""}`);
  }

  return json(res, 200, {
    success: true,
    orderRef,
    bankDetails,
    grandTotal: grandTotal.toFixed(2),
    emails
  }, origin);
};
