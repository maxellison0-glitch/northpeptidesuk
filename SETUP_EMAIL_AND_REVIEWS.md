# Setup: Bank Transfer Orders, Email, Newsletter and Reviews

The storefront accepts orders by bank transfer. Vercel validates each basket against the server catalogue, creates an order reference and uses Resend to email the payment instructions.

## 1. Order and email variables

Keep `orders@northpeptidesuk.com` as the inbox used to read and answer customer messages. Use Resend for automated messages sent by the website.

1. Add and verify `northpeptidesuk.com` in Resend.
2. Add the DNS records Resend provides alongside the existing Google Workspace records.
3. Create a Resend API key.
4. In Vercel Project Settings, add these environment variables:

   | Name | Purpose |
   |---|---|
   | `RESEND_API_KEY` | Authorises automated order and site emails |
   | `ORDER_NOTIFY_EMAIL` | Receives new-order alerts; normally `orders@northpeptidesuk.com` |
   | `ORDER_FROM_EMAIL` | Sender identity; normally `North Peptides UK <orders@northpeptidesuk.com>` |
   | `BANK_ACCOUNT_NAME` | Account name shown after order submission and in the email |
   | `BANK_SORT_CODE` | Sort code shown to the customer |
   | `BANK_ACCOUNT_NUMBER` | Account number shown to the customer |

5. Apply the variables only to the environments that should accept orders, then redeploy.

Every submitted order now:

- is recalculated from the server-side catalogue rather than trusting browser prices;
- receives a unique order reference;
- emails the shop an awaiting-payment order breakdown; and
- emails the customer the matching total and bank-transfer instructions.

Do not dispatch until the transfer appears in the bank account.

## 2. Newsletter list

The homepage signup forms post to `/api/subscribe`.

1. Create an Audience in Resend.
2. Copy its Audience ID.
3. Add `RESEND_AUDIENCE_ID` in Vercel and redeploy.

Without an Audience ID, signup notifications are emailed to the order inbox instead.

## 3. Reviews

The live site must not show scores, stars, review counts or review schema until genuine customer feedback exists.

1. Collect feedback through the first-party review form or customer email replies.
2. Moderate submissions for personal, medical and prohibited content before publishing.
3. Publish only genuine feedback and keep visible reviews aligned with structured data.
4. Do not add business-level aggregate rating schema. Any future product review feed must remain product-specific and policy-compliant.
