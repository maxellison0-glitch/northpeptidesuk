# Stripe Webhook Setup

Use this after checkout works in Stripe test mode.

## Vercel Environment Variables

Add these in Vercel project settings:

- `STRIPE_SECRET_KEY` - already configured for checkout
- `STRIPE_WEBHOOK_SECRET` - copied from the Stripe webhook endpoint
- `RESEND_API_KEY` - required for order notification + customer confirmation emails
- `ORDER_NOTIFY_EMAIL` - where paid order alerts are sent (`orders@northpeptidesuk.com`)
- `ORDER_FROM_EMAIL` - optional sender, defaults to `North Peptides UK <orders@northpeptidesuk.com>` (verify the domain in Resend first)
- `RESEND_AUDIENCE_ID` - optional, stores newsletter signups (`/api/subscribe`) in a Resend Audience

See `SETUP_EMAIL_AND_TRUSTPILOT.md` for the full walkthrough (Resend + Google Workspace, wallets, Trustpilot).

Do not commit real values to GitHub.

## Stripe Dashboard

1. Open Stripe Dashboard in test mode.
2. Go to Developers -> Webhooks.
3. Add endpoint:
   `https://northpeptidesuk.vercel.app/api/stripe-webhook`
4. Select event:
   `checkout.session.completed`
5. Save the endpoint.
6. Copy the signing secret beginning with `whsec_`.
7. Add that value to Vercel as `STRIPE_WEBHOOK_SECRET`.
8. Redeploy Vercel.

## Test

1. Complete a Stripe test checkout from the live site.
2. In Stripe Dashboard -> Developers -> Webhooks, open the endpoint.
3. Confirm the latest delivery is `200`.
4. If `RESEND_API_KEY` and `ORDER_NOTIFY_EMAIL` are configured, confirm the order email arrives.

## Live Mode

When ready for real payments, create the webhook again in Stripe live mode and add the live `whsec_...` value to Vercel Production.
