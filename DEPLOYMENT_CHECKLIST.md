# Deployment Checklist

Keep this short. Follow these steps when preparing changes that affect checkout or payments.

- **Never commit Stripe secrets**: do not add `STRIPE_SECRET_KEY` or any `sk_...` value to the repo. Remove any accidental commits and rotate keys immediately.

- **Use Vercel environment variables**: set `STRIPE_SECRET_KEY` in the Vercel project Environment Variables (Preview for branch testing, Production when ready). See Vercel dashboard steps in the README or project settings.

- **Test mode vs Live mode**:
  - Use Stripe test keys (`sk_test_...`) for preview and local testing.
  - Switch to live keys (`sk_live_...`) only on Production once verified.

- **Branch / PR workflow (recommended for risky edits)**:
  1. Create a feature branch: `git switch -c feature/brief-description`.
  2. Push branch and open a GitHub Pull Request.
  3. Add `STRIPE_SECRET_KEY` to Vercel Preview env to test the Preview deployment.
  4. Test checkout flow on the Vercel Preview URL.
  5. Merge PR after review and testing.

- **Direct `main` push workflow (for small edits only)**:
  - Pull latest `main`, make small atomic changes, commit, and push.
  - Be aware: pushing to `main` triggers a Production deploy on Vercel. Use sparingly.

- **Verify checkout after deploy**:
  1. For Preview: check the Vercel Preview deployment URL after push/PR; run a test purchase with Stripe test card.
  2. For Production: verify the live site `checkout.html` initiates a POST to `/api/create-checkout-session` and completes a test payment only after swapping to live keys if you intend to process real payments.

- **Stripe test card reminder**: use Stripe test cards (e.g., `4242 4242 4242 4242`, any future expiry, any CVC, any 3‑digit ZIP) when testing in test mode.

Minimal extras:
- Keep `.env.example` as the template for local env keys; do not fill with real secrets.
- If a secret is accidentally committed: rotate the key in Stripe, remove the secret from the repo, and update Vercel/GitHub secrets.

File created on branch: `docs/deployment-checklist`
