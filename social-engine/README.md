# Social Engine — automated short-form pipeline

Turns the playbook into 2–3 gated posts per day with no human production work.
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
4. PUBLISH   At the slot's UK time, TikTok first (native text overlay + trending
   │         audio for F4/F6), then cross-post YouTube Shorts + IG Reels.
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

Metrics come from the platform analytics (TikTok Studio / YT Studio). Fill what
is available; blank beats guessed.

## Publishing paths

- **TikTok**: Higgsfield `tiktok_prepare_publish` / `tiktok_publish` (account
  already connected), or the existing Codex API connector. Native text overlays
  and sounds must be added at publish time — see PLAYBOOK F4.
- **YouTube Shorts / Instagram**: Codex API connector (existing setup). Same
  video file, same gated caption, drop TikTok-specific hashtags.

## Hard rules for the automation

1. Nothing publishes without a `caption-gate.js` pass in the same run.
2. VO scripts are gated too, not just captions.
3. No AI humans presented as customers/reviewers; no depiction of human use.
4. One video = one format = one queue slot. No improvised extra posts.
5. If a generation fails twice, skip the slot and log it — never publish a
   degraded video to hit cadence.
6. Credits guard: stop producing (not posting) if Higgsfield balance < 50.

## Setting up the recurring run

A Claude Code routine (or cron for Codex) should fire twice daily at ~06:00 and
~16:30 UK time to produce and schedule that day's slots, plus the Sunday review
run. Keep production runs and publish times decoupled: produce in the morning,
publish at the slot times.
