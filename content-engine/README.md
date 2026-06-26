# North Peptides UK — Content Engine

A dependency-free static content engine that turns structured article data into
SEO-ready, compliance-gated blog pages, and keeps `blog/index.html`, `sitemap.xml`
and `robots.txt` in sync automatically.

It exists to do one thing safely: **publish UK research-peptide content that earns
organic rankings, while guaranteeing every page is research-use-only (RUO) compliant.**
No npm install, no build framework — just Node and the repo's existing vanilla stack.

## Why it's built this way
- **Compliance is the core, not a wrapper.** Every page must pass an automated gate
  (`compliance.js`) before it can be written. The gate fails closed: one violation and
  nothing ships. This is the UK MHRA/ASA guardrail — no human dosing, no therapeutic or
  outcome claims (weight loss, muscle gain, healing), no before/after framing.
- **One source of truth.** Articles are data (`articles/*.js`). The template, the blog
  index, and the full sitemap are all generated — so they can never drift out of sync,
  and the sitemap always reflects the real catalogue (pulled from `../product-data.js`)
  and canonical `www` URLs.
- **No external accounts required.** Pure repo tooling, in line with the staged
  "flip-the-switch later" plan.

## Files
| File | Role |
|---|---|
| `compliance.js` | The gate. Forbidden-pattern + required-disclaimer linter. CLI + library. |
| `site.js` | Site constants, canonical base, static-page list, catalogue access helpers. |
| `template.js` | Renders article pages and the blog index. Owns the layout + JSON-LD. |
| `build.js` | Orchestrator: load → render → **gate** → write pages + index + sitemap + robots. |
| `articles/*.js` | Article source data (one file per article). Files starting with `_` are ignored. |
| `keyword-backlog.md` | Prioritised topic queue grounded in the real product line. |

## Usage
```bash
# Check every article against the compliance gate (writes nothing)
node content-engine/build.js --check

# Full build: gate, then write blog pages + regenerate index/sitemap/robots
node content-engine/build.js

# Run the gate directly against any HTML file(s)
node content-engine/compliance.js blog/some-page.html
```

## Adding an article
Create `content-engine/articles/<slug>.js` exporting:
```js
module.exports = {
  slug: 'kebab-case-slug',          // also the URL: /blog/<slug>.html
  metaTitle: '... | short',          // <title>
  title: 'Human-readable title',     // H1 + schema headline
  htmlTitle: 'Title<br><em>Sub</em>',// optional styled hero markup
  description: 'meta description ~155 chars',
  keyword: 'primary target keyword',
  category: 'Tag shown in hero/card',
  datePublished: 'YYYY-MM-DD',
  dateModified: 'YYYY-MM-DD',        // optional
  cardSummary: 'blog-index card text', // optional, falls back to description
  intro: 'lead paragraph (plain text)',
  relatedProducts: ['slug', ...],    // sidebar; must exist in product-data.js
  sections: [ { id, heading, html } ], // html is author prose — SCANNED by the gate
  faqs: [ { q, a } ],                // optional → FAQ section + FAQPage schema
  allow: [ /regex/ ],                // optional: exempt a specific legit phrase
};
```
Then run `node content-engine/build.js`. The RUO callout and disclaimer are injected by
the template and wrapped in `<!--compliance:ignore-start/end-->` fences, so the gate
trusts them and scans only your `sections[].html` prose.

## What the gate blocks (summary)
- Human administration / self-injection, "pinning", "on cycle"
- Dosing aimed at a person: recommended/typical/daily/weekly dose, mg/kg, IU-on-syringe
- Outcome claims: weight loss, muscle gain, appetite suppression, anti-aging, before/after
- Therapeutic claims: treats a condition, cure/remedy, "promotes healing", prevent disease,
  "clinically proven", FDA/MHRA-approved, prescription framing, side-effects framing
- Positioning a product **for** human use/consumption
- Missing the required RUO + "not for human or animal consumption" statements

Legitimate research terms are deliberately allowed (e.g. "wound-healing model",
"treat the same as", "freeze-thaw cycle") — see the rule comments in `compliance.js`.

## Roadmap (not yet built)
1. **CI re-gate** — a no-secret GitHub Action running `build.js --check` on every PR, so
   non-compliant content can never merge even if the local gate is skipped.
2. **Scheduled generation** — a Claude Code routine that drafts the next backlog item,
   runs it through the gate, and opens a PR for review (autonomy + gate, per the plan).
3. **Measurement loop** — feed Search Console query data back into `keyword-backlog.md`
   to prioritise what to write next.
