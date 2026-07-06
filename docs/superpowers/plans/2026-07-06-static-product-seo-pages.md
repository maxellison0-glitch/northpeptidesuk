# Static Product SEO Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build crawlable static landing pages for every catalogue product at `/products/<slug>/` while preserving the existing basket, checkout, analytics consent, and RUO compliance guardrails.

**Architecture:** Add a content-engine product-page renderer that uses `product-data.js` as the single source of truth. Update the build pipeline to write `products/<slug>/index.html`, update canonical product URL helpers, regenerate sitemap/products feed, and rewrite internal catalogue links to clean product URLs.

**Tech Stack:** Node.js content engine, vanilla HTML/CSS/JS, existing `node:test` suite, existing compliance linter.

---

### Task 1: Product Page Regression Tests

**Files:**
- Create: `tests/product-pages.test.cjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing tests**

Create tests that assert every product in `product-data.js` has a generated `products/<slug>/index.html`, that `sitemap.xml` and `products.json` use `/products/<slug>/`, and that homepage/blog product links no longer point at `product.html?product=`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/product-pages.test.cjs`

Expected: FAIL because `products/<slug>/index.html` does not exist yet.

### Task 2: Product URL Helpers And Renderer

**Files:**
- Modify: `content-engine/site.js`
- Create: `content-engine/product-page-template.js`

- [ ] **Step 1: Add clean product URL helpers**

Add `productPath(slug)` returning `/products/<slug>/`, and update `productUrl(slug)` to use `SITE.base + productPath(slug)`.

- [ ] **Step 2: Add the renderer**

Create `renderProductPage(slug, product)` that emits complete static HTML with:
- product title/meta/canonical/Open Graph
- Product, Offer, BreadcrumbList, and FAQ JSON-LD where available
- visible product image, summary, variants, specs, research areas, and RUO disclaimer
- add-to-basket buttons using existing `basket.js`
- `site-config.js`, `tiktok-analytics.js`, `age-gate.js`, and `dispatch-bar.js`

### Task 3: Build Pipeline Output

**Files:**
- Modify: `content-engine/build.js`
- Modify: `products.json`
- Modify: `sitemap.xml`

- [ ] **Step 1: Render product pages in the build**

Update `build.js` so full builds create `products/<slug>/index.html` for every catalogue product.

- [ ] **Step 2: Use clean product URLs in sitemap and product feed**

Update sitemap and `products.json` to use `productUrl(slug)`.

### Task 4: Internal Link Rewriting

**Files:**
- Modify: `content-engine/template.js`
- Modify: `index.html`
- Generated: `blog/*.html`

- [ ] **Step 1: Rewrite generated article links**

Add a small renderer helper that converts `/product.html?product=<slug>` links inside article HTML to `/products/<slug>/` for known product slugs.

- [ ] **Step 2: Rewrite homepage links**

Replace homepage card links and image click targets from `product.html?product=<slug>` to `products/<slug>/`.

### Task 5: Legacy Product Template

**Files:**
- Modify: `product.html`

- [ ] **Step 1: Keep legacy page working**

Leave `product.html?product=<slug>` functional for old links, but make product SEO point to `/products/<slug>/`.

- [ ] **Step 2: Avoid duplicate search pages**

Set the default legacy product template to `noindex, follow`; static product pages are the indexable targets.

### Task 6: Verification And Commit

**Files:**
- All touched files

- [ ] **Step 1: Generate output**

Run: `node content-engine\build.js`

- [ ] **Step 2: Run all checks**

Run:
- `node --test tests/product-pages.test.cjs`
- `npm test`
- `npm run verify-copy`
- `node content-engine\build.js --check`

- [ ] **Step 3: Visual smoke test**

Run a local server and inspect at least:
- `/products/retatrutide/`
- `/products/bacteriostatic-water/`
- homepage product links

- [ ] **Step 4: Commit**

Commit only the isolated worktree changes on `codex/static-product-seo-pages`.
