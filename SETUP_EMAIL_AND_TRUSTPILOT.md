# Setup: Order Emails, Newsletter, Wallets & Trustpilot

Everything below is a one-time setup in dashboards — no code changes needed. The site
code is already built to use these once you switch them on.

---

## 1. Email — send/receive as orders@northpeptidesuk.com (Resend)

Your Google Workspace mailbox (`orders@northpeptidesuk.com`) is where you **read and
reply** to customers. It is **not free** (~£5–6/user/month after the trial). That's fine —
it's your inbox.

To let the **website** send automated emails (order confirmations to customers, order
alerts to you, newsletter), we use **Resend** — free tier: 3,000 emails/month.

### Steps
1. Create a free account at <https://resend.com>.
2. **Add & verify your domain** `northpeptidesuk.com`: Resend → Domains → Add Domain.
   It gives you a few DNS records (SPF/DKIM/MX-like TXT + CNAME).
3. Add those records in your domain's DNS (where `northpeptidesuk.com` is managed).
   - These sit **alongside** your Google Workspace records — they don't clash. Google
     handles receiving mail; Resend handles sending from the website. Both can send
     "as" orders@ because each adds its own DKIM signature.
4. Create an **API key**: Resend → API Keys → Create.
5. In **Vercel → Project → Settings → Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `RESEND_API_KEY` | the key from step 4 (starts `re_…`) |
   | `ORDER_NOTIFY_EMAIL` | `orders@northpeptidesuk.com` (where order alerts go) |
   | `ORDER_FROM_EMAIL` | `North Peptides UK <orders@northpeptidesuk.com>` (optional — this is the default) |

6. **Redeploy** (Vercel → Deployments → Redeploy, or push any commit).

Now every paid order:
- emails **you** a full order breakdown (delivery address included, pulled from Stripe), and
- emails the **customer** a branded confirmation from orders@ with a Trustpilot review invite.

Replies to either land in your Workspace inbox.

---

## 2. Newsletter list (optional but recommended)

The homepage signup forms already POST to `/api/subscribe`. To store subscribers as a real
mailing list you can send to later:

1. Resend → Audiences → create an audience (e.g. "Newsletter").
2. Copy its **Audience ID**.
3. In Vercel env vars add `RESEND_AUDIENCE_ID` = that ID. Redeploy.

Now signups are saved to that audience. **If you skip this**, signups are instead emailed to
your `orders@` inbox (so none are lost) — the list option is just tidier.

---

## 3. Enable Apple Pay / Google Pay / Link (big conversion win)

The checkout code now asks Stripe to show **all** eligible payment methods (it no longer
forces card-only). You just enable them in Stripe:

1. Stripe Dashboard → **Settings → Payments → Payment methods**: turn on **Apple Pay**,
   **Google Pay**, **Link**, and **Cards**.
2. Apple Pay needs your domain verified — Stripe **auto-registers** the domain for hosted
   Checkout, so this is usually automatic. If prompted, add `northpeptidesuk.com` under
   Payment method domains.

That's it — wallet buttons then appear at the top of the Stripe checkout page, letting
mobile shoppers pay in one tap without typing an address.

---

## 4. Trustpilot — show live reviews

The homepage has a Trustpilot section (star badge + a live "TrustBox" + "Leave a review").
The badge and links already work and point to
`trustpilot.com/review/northpeptidesuk.com`. To make the **live reviews widget** populate:

1. Trustpilot Business → **Integrations → TrustBox** → pick a widget (the "Carousel" is
   already set up in the code).
2. Copy your **Business Unit ID**.
3. In `index.html`, find `REPLACE_WITH_YOUR_TRUSTPILOT_BUSINESS_UNIT_ID` and paste your ID
   in its place. Commit/push.

### Auto-invite customers to review (optional)
Trustpilot can email customers to ask for a review automatically. Easiest method:
Trustpilot Business → **Get reviews → Automatic Feedback Service (AFS)** gives you a unique
BCC address. Add that as a BCC on your order-confirmation flow (ask us to wire it in and
provide the AFS address). The customer confirmation email already includes a manual
"Leave a Trustpilot review" button in the meantime.
