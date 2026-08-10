# Autonomous daily runbook

> **REFERENCE ONLY — NOT CONTROLLING.** Daily production is governed by
> `SOCIAL-MARKETER.md`. This runbook preserves operational research and previous
> procedures; any conflict is resolved in favour of the controlling directive.

Last verified: 8 August 2026, Europe/London.

This is the previous detailed operating contract, retained for implementation
history. `SOCIAL-MARKETER.md` is the active directive. `Content Pipeline`
remains the research and legacy asset library.

## Definition of done

Two approved concepts become two 1080×1920 H.264/AAC MP4s and eight independent
OneUp records each day. A third concept may be added when the batch is already
produced and verified:

1. TikTok `northpeptidesuk`
2. Instagram `northpeptidesuk`
3. YouTube `@uhohstinky3033`
4. X `maxellison03`

Each unit is complete only when all four records appear in OneUp published
history. A platform that fails receives one re-host-and-retry attempt. A second
failure is recorded with its reason; successful platforms are never duplicated.

## Daily times

- 06:00 UK: inspect the live peptide benchmark list and select two proven
  format/hook families; watch the references and fill the visual
  reverse-engineering record; then batch the next two queue rows. The evidence
  table lives in `TIKTOK-PEPTIDE-FORMAT-AUDIT-2026-08-08.md` and the observation
  schema lives in `VISUAL-REVERSE-ENGINEERING-SPEC.md`.
- 09:00 UK: gate, QA, host and create four OneUp records for the 12:30 unit and
  four for the 18:30 unit. Use a third slot only when it is already rendered.
- After the slot: check published, failed and scheduled records. Retry only the
  failed destination.
- 21:00 UK: capture the previous day's native/Windsor metrics and update
  `log.csv`.
- Sunday: fill 7-day metrics, apply the format tournament rules and refill the
  next seven days before generating anything new.

## Proven control and selection rule

The strongest measured North Peptides execution remains the recognition-led
`Wolverine healing is real?` post: 370 TikTok views, about 5.8 seconds average
watch and about 9.5% completion. The external benchmark's simple `Limitless`
guide showed that familiar cultural framing plus useful plain-language payoff
can earn thousands of saves. These are evidence for the structure, not proof
that any new post will win.

Use one of the two proven controls below, preserving the psychological
mechanics while changing the words, source and footage. This is a
format-faithful original, not a low-effort copy:

- **Q&A control:** 30–60 seconds, real person or natural voice, a viewer
  question as the 0–1.5 second hook, large native-looking top text, readable
  lower-third captions, one answer and one source/caveat.
- **Meme control:** 10–14 seconds, one recognisable cultural/work/gym visual,
  one blunt emotional hook, one compound, and one comment/save prompt.

Do not default to cinematic product loops. Product photography is supporting
evidence; it is not a substitute for a human question or a useful payoff. At
24 hours, compare saves plus comments per 1,000 views against the median of the
previous ten posts:

- at least 2× median: make three close variants before changing format;
- people stop but do not finish: keep the subject and rewrite beats two/three;
- useful comments with weak hold: keep the insight and replace the hook/audio;
- below median three controlled times: retire the format at Sunday review.

TikTok is discovery-first for this project. Do not put a purchase, WhatsApp,
DM, or regulated-product redirect in the TikTok creative. Use compliant,
platform-appropriate landing-page acquisition on the other channels after
legal review; see the format audit for the current TikTok policy references.

Never call a winner from views alone and never invent missing metrics.

## Higgsfield budget and live capabilities

Fable 5 verified the current Higgsfield MCP on 8 August. It exposes image,
video and audio generation; image/video upscaling; reframing; outpainting;
background removal; motion control; video analysis; virality prediction;
Shorts Studio; media upload/import; voice creation/change; dubbing; generation
history and job status; plus TikTok account, music and publishing tools.

The daily ceiling is 50 credits, measured from the transaction ledger rather
than remaining balance. The current account is shared with other projects.

1. Reuse a completed paid generation before creating anything.
2. Prefer a real source photo and preserve the authentic North Peptides label.
   A visible product label is allowed; it is not a price, purchase CTA, dosing
   instruction or fabricated testimonial. Do not blur, turn away or cover a
   genuine label merely because it contains the product name, quantity or
   ordinary packaging copy.
3. Generate a still only when no real asset fits. The live catalogue exposes
   `flux_2` (FLUX.2: pro, flex and max variants), but no separate model named
   `Flux Free`; unlimited mode was unavailable at the last audit. Use FLUX.2
   when the live job/cost check reports it as free or zero-credit. Otherwise use
   the real source photo or another still route that fits the budget.
4. Kling v3.0 standard (`kling3_0`, `mode: std`, `sound: off`) is the default
   image-to-video route. Use 4–5 seconds and extend/loop locally. Seedance 2.0
   standard is not the routine default: the verified cost was 36 credits per
   eight-second job.
5. Allow one generation retry only if the day's total will remain at or below
   50 credits.
6. At the ceiling, ship the zero-credit fallback: ffmpeg macro crop/zoom,
   Playwright/HTML motion, or a brand carousel converted into an MP4.
7. Flag the shared balance below 120 credits, but do not break cadence when a
   local fallback exists.

The deterministic F4 editor is `assemble-lab-loop.mjs`. It scales, applies timed
overlays, normalises audio and emits an eight-second fast-start MP4 without
third-party JavaScript packages. Source-label masking is opt-in and off by
default. It exists only for a specific creative instruction or a damaged/fake
source—not as a compliance requirement.

## Pre-OneUp gate

All items below are mandatory in the same run:

1. Final MP4, four caption files, YouTube title, source/safety notes and manifest
   exist in the episode folder.
2. `ffprobe` reports 1080×1920, H.264, yuv420p, AAC, 8–15 seconds and 30 fps.
3. Frame 0 contains motion and a complete hook. Contact-sheet QA confirms the
   authentic product label is sharp and readable when it is the subject. Prices,
   checkout prompts, dosing instructions and fabricated claims must not be added
   to the edit.
4. `caption-gate.js` passes every platform caption plus a combined file that
   contains every overlay and the YouTube title.
5. Published, scheduled and failed OneUp records contain no duplicate for the
   asset URL or episode ID.
6. The hosted MP4 URL is on `www.northpeptidesuk.com` and a HEAD request returns
   `200`, `Content-Type: video/mp4` and the expected non-zero content length.
   OneUp's Upload Media endpoint is unavailable on the Basic plan, so deploy the
   approved master through the production Vercel site before scheduling. Uguu
   and other expiring upload services are preview-only and are prohibited in
   OneUp records.
7. TikTok: set `is_ai_generated` when applicable. Attempt UK / seven-day /
   dance-electronic trending audio; select autonomously and log it. If the
   endpoint returns 500, retain baked audio and continue.
8. Instagram: publish the video as a Reel/add to feed. The current account is
   `account_type=3`, so OneUp's Instagram trending-sound endpoint is not
   available; use baked audio.
9. YouTube: provide a specific title. A portrait video under three minutes is
   delivered as a Short.
10. X: use the platform caption and the same native video.
11. Read all four records back, record their OneUp IDs and verify their final
    state after the slot.

## OneUp capability boundary

The active API can list accounts/categories; create text, image and video posts;
target multiple networks; set platform-specific titles/options; attach TikTok
or eligible Instagram music; add first comments on supported networks; list,
edit and delete scheduled posts; list published/failed posts; and reschedule a
failed post. It supports native video delivery to TikTok, Instagram Reels,
YouTube Shorts and X.

On the current Basic plan, analytics, comments and OneUp-hosted media upload are
blocked. The API also cannot add native TikTok text. Unattended production must
therefore bake the overlay, use external/durable media hosting and pull metrics
from platform-native or Windsor sources.

## Failure policy

- Generation fails twice: use the zero-credit fallback; do not publish a broken
  asset.
- Sound endpoint fails: keep baked audio and continue.
- OneUp record remains pending: wait; never double-submit.
- One platform fails: re-host once, retry only that platform and verify.
- Two failures on the same destination: record the reason in `log.csv` and the
  learning log, then continue the next day's production.
- Connected account name or ID changes: stop writes to that destination until
  the exact OneUp account is reconciled; never guess from a browser session.
