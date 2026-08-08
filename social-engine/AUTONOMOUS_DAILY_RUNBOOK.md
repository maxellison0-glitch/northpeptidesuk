# Autonomous daily runbook

Last verified: 8 August 2026, Europe/London.

This is the active operating contract for unattended North Peptides social
production. `Content Pipeline` remains the research and legacy asset library;
`social-engine` controls the daily queue, production state, delivery and log.

## Definition of done

One approved concept becomes one 1080×1920 H.264/AAC MP4 and four independent
OneUp records:

1. TikTok `northpeptidesuk`
2. Instagram `northpeptidesuk`
3. YouTube `@uhohstinky3033`
4. X `maxellison03`

The unit is complete only when all four records appear in OneUp published
history. A platform that fails receives one re-host-and-retry attempt. A second
failure is recorded with its reason; successful platforms are never duplicated.

## Daily times

- 06:00 UK: read the next unposted queue row, inspect reusable Higgsfield
  generations and build the asset.
- 09:00 UK: gate, QA, host and create four OneUp records for the selected peak
  slot.
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

Use the F4 macro loop as the daily control: motion at frame zero, a complete
question in the first 1.5 seconds, no more than three short beats, and one
commentable ending. At 24 hours, compare saves plus comments per 1,000 views
against the median of the previous ten posts:

- at least 2× median: make three close variants before changing format;
- people stop but do not finish: keep the subject and rewrite beats two/three;
- useful comments with weak hold: keep the insight and replace the hook/audio;
- below median three controlled times: retire the format at Sunday review.

Never call a winner from views alone and never invent missing metrics.

## Higgsfield budget and live capabilities

Fable 5 verified the current Higgsfield MCP on 8 August. It exposes image,
video and audio generation; image/video upscaling; reframing; outpainting;
background removal; motion control; video analysis; virality prediction;
Shorts Studio; media upload/import; voice creation/change; dubbing; generation
history and job status; plus TikTok account, music and publishing tools.

The daily ceiling is 30 credits, measured from the transaction ledger rather
than remaining balance. The current account is shared with other projects.

1. Reuse a completed paid generation before creating anything.
2. Prefer a real source photo. Generate a still only when no real asset fits.
3. Use a low-cost 4–5 second video model first and verify the price before the
   first job. Never use Seedance 2.0 standard for routine F4 posts: the verified
   cost was 36 credits per eight-second job.
4. Allow one generation retry only if the day's total will remain at or below
   30 credits.
5. At the ceiling, ship the zero-credit fallback: ffmpeg macro crop/zoom,
   Playwright/HTML motion, or a brand carousel converted into an MP4.
6. Flag the shared balance below 120 credits, but do not break cadence when a
   local fallback exists.

The deterministic F4 editor is `assemble-lab-loop.mjs`. It scales, masks unsafe
source-label copy, applies timed centre-safe overlays, normalises audio and emits
an 8-second fast-start MP4 without third-party JavaScript packages.

## Pre-OneUp gate

All items below are mandatory in the same run:

1. Final MP4, four caption files, YouTube title, source/safety notes and manifest
   exist in the episode folder.
2. `ffprobe` reports 1080×1920, H.264, yuv420p, AAC, 8–15 seconds and 30 fps.
3. Frame 0 contains motion and a complete hook; contact-sheet QA confirms no
   product price, stock, quantity, purity or route-to-purchase copy remains
   readable.
4. `caption-gate.js` passes every platform caption plus a combined file that
   contains every overlay and the YouTube title.
5. Published, scheduled and failed OneUp records contain no duplicate for the
   asset URL or episode ID.
6. The hosted MP4 URL is public and fetchable. OneUp's Upload Media endpoint is
   unavailable on the Basic plan, so use durable public hosting. A temporary
   host is acceptable only for immediate publication and must remain available
   until all four records are published.
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
