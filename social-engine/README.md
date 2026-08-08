# Social Engine — autonomous four-platform short-form pipeline

Turns the playbook into at least one gated four-platform post per day with no
human production work. A second daily post is allowed only after 4/4 delivery
for the first unit is verified.
Strategy lives in `PLAYBOOK.md`; this file is the operating manual for whichever
agent (Claude Code routine or Codex) runs the daily cycle.

## Daily cycle

```
queue.md (next unposted slot)
   │
   ▼
1. SCRIPT    Write caption + on-screen text (+ VO script for narrated formats)
   │         from the slot's format card and hook.
   ▼
2. GATE      node social-engine/caption-gate.js --text "<caption>" [--vo file]
   │         FAILS CLOSED. A violation means rewrite, never override.
   ▼
3. PRODUCE   Higgsfield, by format:
   │           F1/F3/F5 → faceless-channel-video workflow (Explainer)
   │           F2       → ugc-product-flow (voiceover only) or explainer
   │           F4/F6    → single image-to-video job (templates in prompts.md)
   │         Source images: real product photos in the repo root, or new
   │         stills generated from them (never invent products or people).
   ▼
4. PUBLISH   At the slot's UK time, create and verify four independent OneUp
   │         API records: TikTok, Instagram Reel, YouTube Short and X video.
   │         Use a baked, centre-safe overlay for unattended runs. Add TikTok
   │         trending audio when the OneUp endpoint is healthy; log a 500 and
   │         keep the post moving when it is not.
   ▼
5. LOG       Append a row to log.csv (see header below) with post URL + format.
```

Weekly (Sunday evening): pull 7-day stats for every logged post, update
`log.csv`, apply the tournament rules from PLAYBOOK §7, and refill `queue.md`
with the next week of slots.

## log.csv header

```
date,platform,format,compound,hook,post_url,views_7d,hold_3s_pct,completion_pct,saves,shares,comments,follows
```

OneUp's Basic plan does not expose analytics or comments. Metrics therefore come
from platform-native analytics or Windsor.ai. Fill what is available; blank
beats guessed.

## Publishing paths

- **All four destinations**: the OneUp API connector is the delivery layer.
  Target the explicit connected account ID and create one record per platform so
  captions, the YouTube title, TikTok disclosure/music and retries remain
  independently auditable.
- **TikTok audio**: select the best suitable UK / 7-day / dance-electronic sound
  autonomously. If OneUp's sound endpoint fails, keep the baked audio and record
  the endpoint failure; do not switch to TikTok Studio or another account.
- **Media**: OneUp's Basic plan cannot ingest a local file through the Upload
  Media endpoint. Host the final MP4 at a durable public URL before scheduling.

## Hard rules for the automation

1. Nothing publishes without a `caption-gate.js` pass in the same run.
2. VO scripts are gated too, not just captions.
3. No AI humans presented as customers/reviewers; no depiction of human use.
4. One video = one format = one queue slot = four platform records. A run is not
   complete until all four succeed or each remaining failure is logged for retry.
5. If a generation fails twice, skip the slot and log it — never publish a
   degraded video to hit cadence.
6. Credits guard: total Higgsfield generation spend must not exceed 30 credits in
   a UK calendar day. Check transactions, reuse completed generations first and
   switch to the zero-credit ffmpeg/HTML fallback before crossing the limit.
7. Before every OneUp write, check published, scheduled and failed records for a
   duplicate. Never retry a platform that already succeeded.

## Setting up the recurring run

A Claude Code routine (or Codex recurring task) should run at 06:00 to produce,
09:00 to schedule, after the publish window to verify all four destinations, and
21:00 to capture yesterday's native metrics. The Sunday run performs the 7-day
review and refills the queue. Full details are in
`AUTONOMOUS_DAILY_RUNBOOK.md`.
