# North Peptides UK — Social Playbook (TikTok-first)

The strategy behind every automated short-form post. Read this before generating
or scheduling anything. Companion files: `README.md` (the automated pipeline),
`queue.md` (the scheduled posts), `caption-gate.js` (compliance lint for captions
and voiceover scripts), `prompts.md` (Higgsfield production templates).

## 1. Diagnosis — why current posts flatline at ~200 views

Every post so far has been slow "premium product cinematography" of a vial:
no hook in the first second, no person or voice, no reason to comment, and no
search intent served. TikTok's distribution loop is retention-driven — a video
with weak 1-second hold and zero engagement signals never leaves the initial
~200-view test pool. That is exactly what the numbers show. It is a content
problem, not (only) a suppression problem — but suppression is real too:

- **TikTok** is the most peptide-tolerant major platform. Educational,
  research-framed content survives; sales-y content, GLP-1 branding, human-use
  claims and testimonial content get suppressed or removed.
- **Instagram/Facebook** treat peptides as unapproved pharmaceuticals and
  suspend seller accounts. Repost there for free, expect little, risk nothing
  on the main account (keep the shop link OUT of the IG bio).
- **YouTube Shorts** is the sleeper: search-indexed forever, so explainer
  content compounds. Same videos, near-zero extra cost.

**Platform priority: TikTok (primary) → YouTube Shorts (secondary) →
Instagram Reels (syndication only).**

## 2. The compliant-viral matrix

What actually goes viral in the peptide niche is mostly what we must never do:
transformation stories, testimonials, dosing talk, "my results". Those are
MHRA/ASA violations, our own gate blocks them, and AI-generated versions would
be fabricated testimonials — the fastest way to lose the account. The viable
lane is the intersection below, and everything in it is fully automatable:

| Works in the niche | Compliant? | Our version |
|---|---|---|
| Transformation / before-after | ✗ | never |
| Testimonials ("my results") | ✗ | never (AI avatar "reviews" doubly so) |
| Dosing / protocol content | ✗ | never |
| Compound explainers ("what is X") | ✓ | F1 Peptide File |
| Purity / fake-product exposés | ✓ | F2 Lab Verdict |
| Myth-busting the hype | ✓ | F3 Myth vs Data |
| Satisfying lab visuals | ✓ | F4 Lab Loops |
| Research news-jacking | ✓ | F5 UK Peptide Brief |
| Quizzes / comment-bait | ✓ | F6 Guess the Peptide |

## 3. The six formats

Every queue entry names one format. Hold the format constant, vary the hook.

### F1 — "The Peptide File" (compound explainer, 45–60s)
- **Why**: "what is bpc-157"-class queries are huge on TikTok search; explainer
  accounts are how faceless channels win this niche. Mirrors the blog backlog,
  so every video funnels to an article.
- **Recipe**: Higgsfield `faceless-channel-video` workflow (Explainer type).
  Narrated VO, kinetic captions, product + molecule visuals. One compound per
  episode; number them ("Peptide File #007") — series drive follows.
- **Hook pattern**: "This is the most talked-about peptide in UK research right
  now — and most people can't even say what it is."

### F2 — "Lab Verdict" (trust/purity, 30–45s)
- **Why**: fear of fake or underdosed vials is the #1 conversation in buyer
  communities. We hold real independent COAs (GHK-Cu, Retatrutide) — almost no
  competitor shows theirs. Highest conversion intent of all six.
- **Recipe**: `ugc-product-flow` (voiceover only, product is the hero) or
  faceless explainer over real COA close-ups → HPLC purity number reveal.
- **Hook pattern**: "We paid an independent UK lab to test our own stock.
  Here's the report, unedited."

### F3 — "Myth vs Data" (hype correction, 30–45s)
- **Why**: the niche runs on hype waves (retatrutide one week, BPC-157 the
  next). Correcting the hype rides the same wave while positioning us as the
  adults in the room. Strong comment-bait ("you're wrong about…").
- **Recipe**: faceless explainer; split-screen "what TikTok says / what the
  research says". Always about *research evidence*, never about what a person
  should take or expect.
- **Hook pattern**: "Half of peptide TikTok is repeating this claim. The
  research says something different."

### F4 — "Lab Loops" (satisfying macro, 8–15s)
- **Why**: the swirling blue GHK-Cu, frost on a −20°C vial, bac-water droplets
  — genuinely satisfying macro footage. Cheapest to produce, best for volume,
  and rides trending audio. This is the upgrade of what was already being
  posted — same assets, plus the two missing ingredients: a native text hook
  and a trending sound.
- **Recipe**: single Higgsfield image-to-video from a real product photo
  (see `prompts.md`). Text hook + trending audio added natively at publish —
  never baked in; native text is read by TikTok as creator content, baked
  graphics read as an ad.
- **Hook pattern (overlay)**: "Why is this the only blue peptide in the lab?" /
  "Straight out of the −20°C freezer."

### F5 — "UK Peptide Brief" (weekly news, 40–60s)
- **Why**: recurring appointment content builds follows; research news
  (new studies, MHRA/regulatory moves, counterfeit alerts) is endless and
  automatable from public sources.
- **Recipe**: faceless explainer, fixed branded intro frame, 3 headlines per
  episode, every fact from a citable public source. Same episode cross-posted
  to Shorts where news queries rank.
- **Hook pattern**: "Three things that happened in peptide research this week
  that UK labs should know."

### F6 — "Guess the Peptide" (engagement bait, 10–15s)
- **Why**: comments are the cheapest algorithm signal. A close-up + 3 clues +
  "answer in the comments tomorrow" manufactures them.
- **Recipe**: one macro image-to-video loop + native text clues. Post the
  answer as a pinned comment the next day (second touch on the same video).
- **Hook pattern**: "Clue 1: it's blue. Clue 2: it binds copper. Clue 3:
  skincare researchers won't shut up about it."

## 4. Hook rules (the 1.5-second law)

The first 1.5 seconds decide distribution. Every video must open with either a
motion hook (something already moving), a text hook (≤9 words, question or
tension, native overlay), or a voice hook (first VO sentence contains the
tension — never "welcome back").

Ban from all openings: brand name first (logo max 1s at the *end*), "in this
video…", static product shots, slow fade-ins.

## 5. UK targeting

TikTok seeds the first audience pool by account region, language and device
locale — a UK-registered account posting at UK peak times gets a UK test pool.
On top of that:

- **Post at UK peaks**: 07:00–08:30, 12:00–13:30, 18:00–21:00 (UK time). The
  evening slot is primary; queue times in `queue.md` are UK local.
- **UK-coded content**: British English spellings, UK price/postage references
  ("tracked 24"), MHRA (not FDA) framing, "UK lab tested" as the recurring
  trust phrase. F5 is UK-branded by name.
- **Hashtags**: 3–5 max, mix one broad (#labtok #sciencetok), one niche
  (#peptideresearch #biohackinguk), one UK (#ukscience #ukbiohacking). Never
  #fyp spam; never compound names TikTok moderates aggressively (anything
  GLP-1-branded — say "metabolic research compounds" instead).
- **TikTok SEO**: the caption's first line should literally contain the search
  phrase served (e.g. "what is ghk-cu"). TikTok search is now a discovery
  surface on par with the FYP for this niche.

## 6. Compliance rails (non-negotiable)

Everything the viewer can read or hear passes `caption-gate.js` before publish:
captions, on-screen text, VO scripts. The gate reuses the blog engine's
FORBIDDEN rules — no human administration, no dosing, no outcome or therapeutic
claims, no before/after, no side-effects framing — and requires the RUO line.

- Standard caption footer: `For laboratory research use only. Not for human
  consumption.`
- No AI-generated humans presented as customers or reviewers. No fake
  testimonials in any form.
- Video prompts must not depict human use (no injections, no consumption, no
  person "using" a product). Vials, labs, liquids, packaging, COAs only.
- Link in bio goes to the blog article, not the product page, on educational
  posts (F1/F3/F5). Shop link stays in the TikTok bio only.

## 7. Cadence and the experiment design

Weeks 1–2 are a **format tournament**, not a branding exercise. 2/day in week 1
(14 posts), 3/day from week 2 if production holds. Fixed split so results are
readable: F4 daily (volume arm), F1 four per week, F2 + F3 + F5 + F6 weekly.

Judge on (in order): 3-second hold rate, completion rate, saves+shares,
follows per post, comments. **Raw views are the last metric that matters** —
a 500-view post with 12 saves beats a 2,000-view post with none.

Weekly review (automatable): pull per-post stats, kill the bottom format,
double the top format's slots, refresh hooks on survivors. Log every post and
its 7-day numbers in `log.csv` so the review has data.

## 8. What we are not doing (and why)

- **No paid ads**: peptides are banned ad categories everywhere; ad accounts
  get burned fast. Organic + SEO only.
- **No engagement pods / bought views**: poisons the retention signal the whole
  experiment depends on.
- **No IG-first strategy**: account-suspension risk; IG is a mirror, nothing
  more.
- **No trend-hopping outside the niche**: a viral dance sound on a vial video
  attracts the wrong test pool and tanks watch time. Trending *audio* yes
  (F4/F6), trending *formats* only if they can carry research framing.
