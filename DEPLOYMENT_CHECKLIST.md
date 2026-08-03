# Deployment Checklist

Use this checklist for changes that affect orders, pricing or payment instructions.

## Secrets and hosting

- Never commit API keys or bank details. Keep real values in Vercel environment variables.
- Required order variables: `RESEND_API_KEY`, `BANK_ACCOUNT_NAME`, `BANK_SORT_CODE` and `BANK_ACCOUNT_NUMBER`.
- Recommended email variables: `ORDER_NOTIFY_EMAIL` and `ORDER_FROM_EMAIL`.
- Optional variables: `DISCOUNT_CODES_JSON` and `RESEND_AUDIENCE_ID`.
- Configure the same required variables for every Vercel environment that will accept test orders, then redeploy.

## Branch and review

1. Create or use a feature branch.
2. Run `node content-engine/build.js` after source catalogue or template changes.
3. Run `npm test`, `npm run compliance` and `npm run verify-copy`.
4. Push the branch and open a pull request.
5. Review the Vercel Preview before merging.

## Order verification

1. Add a low-value product and confirm the basket price matches the product page.
2. Submit a test order through `/checkout.html`.
3. Confirm `/api/create-order` returns an order reference, total and bank details.
4. Confirm both the shop notification and customer instruction emails arrive.
5. Confirm the total, delivery charge, discount and bank reference agree across the page and email.
6. Confirm the order remains awaiting payment until the bank transfer has actually cleared.

If a secret is ever committed, rotate it immediately, remove it from repository history and update the hosting environment.
