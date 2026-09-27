// "Payment received" email, sent the moment an order is marked paid on the
// dispatch page. It keeps the promise in the order email ("once we receive
// your payment, we'll confirm by email") and is sent at most once per order.

const {
  escapeHtml,
  formatMoney,
  ukLongDate,
  firstName,
  emailLayout,
  sendOnce
} = require("./email.js");

function addressLines(customer) {
  return [customer.address1, customer.address2, customer.city, customer.county, customer.postcode].filter(Boolean);
}

function discountLabel(order) {
  return `Discount (${order.discountCode}, ${Math.round(order.discountPct * 100)}% off)`;
}

function deliveryCharge(delivery) {
  return delivery.charge > 0 ? formatMoney(delivery.charge) : "Free";
}

function step(marker, background, heading, detail) {
  return `
          <tr>
            <td style="width:36px;vertical-align:top;padding:7px 0;"><span style="display:inline-block;width:24px;height:24px;line-height:24px;border-radius:50%;background:${background};color:#ffffff;text-align:center;font-size:13px;font-weight:700;">${marker}</span></td>
            <td style="padding:7px 0;font-size:14px;"><strong style="color:#10233F;">${heading}</strong><br><span style="color:#4B5F75;">${detail}</span></td>
          </tr>`;
}

function buildPaymentConfirmedEmail(order, { paidAt }) {
  const ref = order.ref;
  const name = firstName(order.customer && order.customer.name);
  const customer = order.customer || {};
  const delivery = order.delivery || { label: "Royal Mail", charge: 0 };
  const amount = formatMoney(order.grandTotal);
  const confirmedOn = ukLongDate(paidAt);
  const items = order.items || [];

  const rows = items.map(item => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;font-size:14px;">${escapeHtml(item.name)} ${escapeHtml(item.dose)}</td>
            <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;text-align:center;font-size:14px;">${item.qty}</td>
            <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;text-align:right;font-size:14px;white-space:nowrap;">${formatMoney(item.listTotal)}</td>
          </tr>`).join("");

  const html = emailLayout({
    preheader: `Thanks ${name}, your ${amount} bank transfer for order ${ref} has arrived. Here's what happens next.`,
    title: "Payment received &#10003;",
    subtitle: `Thanks ${escapeHtml(name)}, your bank transfer for order ${escapeHtml(ref)} has arrived.`,
    body: `
        <div style="margin:0 0 22px;padding:18px;background:#F0F7FF;border:1px solid #B8D6F0;border-radius:10px;">
          <table role="presentation" style="width:100%;font-size:14px;">
            <tr><td style="padding:4px 0;color:#4B5F75;width:45%;">Amount received</td><td style="padding:4px 0;font-weight:700;color:#10233F;font-size:16px;">${amount}</td></tr>
            <tr><td style="padding:4px 0;color:#4B5F75;">Order reference</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(ref)}</td></tr>
            <tr><td style="padding:4px 0;color:#4B5F75;">Confirmed</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(confirmedOn)}</td></tr>
            <tr><td style="padding:4px 0;color:#4B5F75;">Status</td><td style="padding:4px 0;"><span style="display:inline-block;background:#E8F6EF;color:#0F7B4B;border:1px solid #BFE5D0;border-radius:999px;padding:1px 10px;font-size:13px;font-weight:700;">Paid in full</span></td></tr>
          </table>
        </div>

        <p style="margin:0 0 4px;font-weight:700;color:#10233F;font-size:15px;">What happens next</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">${step("&#10003;", "#0F7B4B", "Payment confirmed", "Thank you. There's nothing more to pay.")}${step("2", "#1F6FEB", "Packed", "Your order is packed with care in plain, unmarked packaging.")}${step("3", "#1F6FEB", `Dispatched by ${escapeHtml(delivery.label)}`, "We aim to dispatch it the next working day.")}
        </table>

        <p style="margin:24px 0 6px;font-weight:700;color:#10233F;font-size:15px;">Your order</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 6px;">
          <thead><tr>
            <th style="text-align:left;border-bottom:2px solid #10233F;padding-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.03em;">Item</th>
            <th style="text-align:center;border-bottom:2px solid #10233F;padding-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.03em;">Qty</th>
            <th style="text-align:right;border-bottom:2px solid #10233F;padding-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.03em;">Amount</th>
          </tr></thead>
          <tbody>${rows}
          </tbody>
        </table>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 0;">
          <tr><td style="padding:4px 0;color:#4B5F75;">Subtotal</td><td style="padding:4px 0;text-align:right;white-space:nowrap;">${formatMoney(order.grossSubtotal)}</td></tr>
          ${order.discountCode ? `<tr><td style="padding:4px 0;color:#4B5F75;">${escapeHtml(discountLabel(order))}</td><td style="padding:4px 0;text-align:right;white-space:nowrap;">&minus;${formatMoney(order.discountAmount)}</td></tr>` : ""}
          <tr><td style="padding:4px 0;color:#4B5F75;">Delivery (${escapeHtml(delivery.label)})</td><td style="padding:4px 0;text-align:right;white-space:nowrap;">${deliveryCharge(delivery)}</td></tr>
          <tr><td style="padding:8px 0 0;border-top:1px solid #D8E5F2;font-weight:700;color:#10233F;">Total paid</td><td style="padding:8px 0 0;border-top:1px solid #D8E5F2;text-align:right;font-weight:700;color:#10233F;white-space:nowrap;">${amount}</td></tr>
        </table>

        <div style="margin:22px 0;padding:14px 16px;background:#F8FBFF;border:1px solid #CFE0F1;border-radius:10px;">
          <p style="margin:0 0 4px;font-weight:700;color:#10233F;font-size:14px;">Delivering to</p>
          <p style="margin:0;font-size:14px;color:#132A46;line-height:1.5;">${escapeHtml(customer.name)}<br>${addressLines(customer).map(escapeHtml).join("<br>")}</p>
          <p style="margin:10px 0 0;font-size:13px;color:#B45309;font-weight:600;">Spotted a mistake? Reply to this email before your order is dispatched and we'll correct it.</p>
        </div>

        <div style="margin:22px 0 0;padding:16px;background:#EEF7FD;border:1px solid #CFE0F1;border-radius:10px;">
          <p style="margin:0 0 6px;font-weight:700;color:#10233F;">Questions?</p>
          <p style="margin:0;font-size:14px;color:#4B5F75;">Just reply to this email and include your order reference, ${escapeHtml(ref)}.</p>
        </div>`
  });

  const itemLines = items.map(item => `- ${item.name} ${item.dose} x${item.qty} - ${formatMoney(item.listTotal)}`).join("\n");
  const text = `Payment received

Hi ${name},

Thanks, your bank transfer for order ${ref} has arrived.

Amount received: ${amount}
Order reference: ${ref}
Confirmed: ${confirmedOn}
Status: Paid in full

What happens next
1. Payment confirmed. Thank you, there's nothing more to pay.
2. Packed with care in plain, unmarked packaging.
3. Dispatched by ${delivery.label}. We aim to dispatch it the next working day.

Your order
${itemLines}

Subtotal: ${formatMoney(order.grossSubtotal)}${order.discountCode ? `\n${discountLabel(order)}: -${formatMoney(order.discountAmount)}` : ""}
Delivery (${delivery.label}): ${deliveryCharge(delivery)}
Total paid: ${amount}

Delivering to:
${[customer.name, ...addressLines(customer)].filter(Boolean).join("\n")}

Spotted a mistake? Reply to this email before your order is dispatched and we'll correct it.

Questions? Just reply to this email and include your order reference, ${ref}.

North Peptides UK - Research use only. Not for human or animal consumption.`;

  return { subject: `Payment received — your order ${ref} is being prepared`, html, text };
}

// Emails one order's payment confirmation, at most once ever.
async function sendPaymentConfirmation({ store, sendEmail, ref, paidAt, orderUrl, identity }) {
  const order = await store.readOrder(ref, orderUrl);
  if (!order) return { ref, status: "skipped", reason: "no saved order record" };
  return sendOnce({
    store,
    marker: "paymentEmailed",
    ref,
    to: order.customer && order.customer.email,
    message: buildPaymentConfirmedEmail(order, { paidAt }),
    sendEmail,
    idempotencyKey: `payment-confirmed-${ref}`,
    identity
  });
}

module.exports = { buildPaymentConfirmedEmail, sendPaymentConfirmation };
