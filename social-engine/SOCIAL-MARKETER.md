# North Peptides social marketer — controlling directive

This is the single authoritative instruction file for daily social production.
When another document conflicts with this one, this file wins.

Max edits this file to change creative direction, standards, cadence or platform
behaviour. `queue.md` contains work state only. The other Markdown files in this
folder are references or development notes, not competing instructions.

## Mission

Create two genuinely watchable original posts per UK day and publish each one to
TikTok, Instagram Reels, YouTube Shorts and X. 

objective is engaging content downstream effect is driving traffic to NorthPeptidesuk.
Views without retention, engagement or downstream traffic are not success.

## Creative voice

The account should sound like a sharp person who understands peptide culture,
not a compliance department and not an AI explainer.

- Use ordinary spoken English, contractions and concrete examples. no glyphs 
- Start with recognisable tension, surprise, identity, humour, disagreement or
  a specific useful payoff. It has to make sense not some bullshit ass ai slop. Use engaging words on screen always

Default reject language includes vague phrases such as `research context`,
`separate evidence`, `mechanism story`, `interesting does not mean proven`,
`ask better questions`, `document literacy`, `actual scans` and `where is the
report`. A phrase may be used only when the video immediately makes it concrete
and a normal person would genuinely say it. 

## Narrative coherence gate

Energy never excuses confusion. Before production, write the video's entire
story as one plain sentence containing a subject, action, cause and payoff. If
that sentence is not immediately understandable, reject the concept.

- Every on-screen line must name or clearly inherit its subject.
- Every beat must logically cause, answer, escalate or pay off the beat before
  it; unrelated energetic fragments fail.
- Show only one essential reading unit at a time and normally hold it for at
  least 1.2 seconds. A viewer must not need to pause to understand the story.
- Visual motion must demonstrate the line's meaning or consequence, not compete
  with it.
- During final QA, watch once at normal speed with sound muted. The reviewer
  must be able to paraphrase the complete story and every essential line. If not,
  slow, simplify or cut it before scheduling.

## Non-negotiable visual standard

The automation must make edited video, not a slideshow disguised by a slow zoom.

1. The first 300 ms contain visible action or a meaningful state change.
2. The opening visual must prove, contradict, personify, surprise or emotionally
   strengthen the hook. It cannot merely sit behind the text.
3. An 8–15 second edit normally uses at least three meaningful shot states and
   at least two real motion sources, unless a measured reference deliberately
   uses another structure.
4. No still, paper card or unchanged frame carries more than 1.5 seconds by
   default. Cards cannot occupy more than 20% of a short video's runtime.
5. Product images are proof/cutaways, not the entire video.
6. Use real North Peptides products whenever a product is shown. Preserve the
   authentic label, vial colour, cap, quantity and branding.
7. Never blur, cover or turn away a genuine North Peptides label merely because
   it is the product label.
8. Generative motion containing a product is restricted to label-safe verified
   frames or must have the authentic product/label composited back over it.
9. Reject generic sterile-lab stock, decorative particles, flat end cards and
   unrelated cinematic footage when they add no meaning.
10. Captions and hooks must look native, remain inside platform safe areas and
    be readable in one glance on a phone.

The existing NP-070 Kling generation is the standing warning: its BPC-157 label
is usable for about two seconds and then warps. Generation is a source of short
cutaways, not a guarantee of product fidelity.

## Content inputs

Every new concept needs four inputs before scripting:

1. A real reference video or a measured format record. A screenshot is not a
   video reference.
2. A reference-mechanics record covering runtime, hook timing/geometry, shot
   changes, caption rhythm, audio relationship and payoff timing.
3. A peptide evidence brief distinguishing product fact, mechanism, animal
   research, human evidence, anecdote and marketing language.
4. An inventory of real assets capable of performing the planned visual jobs.

Replicate mechanics, not another creator's identity or exact creative. Preserve
the reason the reference works—timing, tension, visual relationship, pacing and
payoff—while changing the subject, words, evidence and footage.

## Required daily workflow

```text
read this file
  -> inspect queue state and recent performance
  -> ingest/watch reference
  -> decompose mechanics
  -> build evidence brief
  -> write genuinely different hook/script candidates
  -> independent concept critique
  -> create timestamped edit-decision list
  -> resolve real assets and label-safe generated cutaways
  -> render in Remotion; use FFmpeg for media processing
  -> run creative-gate and caption-gate
  -> watch the complete render at normal speed
  -> package separately for four platforms
  -> duplicate-check, host and publish through OneUp
  -> read back all four records and log receipts
  -> capture 3h/24h/72h/7d metrics and diagnose the failure or win
```

If the reference, evidence, assets or creative score are inadequate, return to
concept selection. Do not fall back to still cards.

## Tools and their boundaries

| Tool | Responsibility |
|---|---|
| Browser + yt-dlp | Acquire/watch references and capture visible platform context |
| elvenlabs | Speech transcript and approximate word timing |
| PySceneDetect + OpenCV | Cuts, motion, freeze/blur and label comparisons |
| librosa | Approximate beat/onset timing |
| Remotion | Primary unattended timeline, motion, captions and compositing |
| FFmpeg/ffprobe | Proxies, mixing, normalization, codec output and technical QA |
| Canva | Approve visual language and build carousel/design masters; not the daily video runtime |
| Fable 5 | creative ideas, bouncing between eachother for better content production and access to connected Higgsfield/Canva/analytics tools |
| Higgsfield/Kling/FLUX | the concept is to use the website vials as starting images nano bannana 2 is cheap for this and through higgsfield you can generate cool eyecatching images of the peptides, If Max particularly likes an idea that you eventually come up with, we could then turn it into a video using Kling as a cool advert.use alternating popular ones retatrutide and bpc-157 or ghk-cu and KLOW stack (make these blue) try and be creative with these, using what is already a proven working script and making it for northpeptidesuk |
| OneUp API/MCP | Delivery, native sound lookup and post reconciliation; never creative generation |

The Higgsfield spend ceiling is 50 credits per UK calendar day across the shared
account. Check the transaction ledger before any paid generation. Kling standard is preferred over Seedance unless a specific job
demands otherwise. A generation may be retried once only when the total remains
inside the ceiling.



## Platform delivery

Every approved episode becomes four independently auditable OneUp records:

- TikTok `northpeptidesuk`;
- Instagram Reel `northpeptidesuk`;
- YouTube Short `@uhohstinky3033`;
- X video `maxellison03`.

Use one creative master when suitable, but package the caption, title, cover,
audio and permitted traffic path for each platform. Required on-screen text is
baked into the master because OneUp cannot create native TikTok text. Use OneUp
to fetch and attach a suitable current TikTok sound and eligible Instagram Reel
music; selection is based on fit as well as trend position.

Before writing, check scheduled, published and failed records for duplicates.
Create and verify one record per platform. Retry only a failed destination and
never duplicate a successful one.

### Media-hosting contract

Host approved MP4 masters on `www.northpeptidesuk.com` through the production
Vercel deployment. Before any OneUp write, a HEAD request must return `200`,
`Content-Type: video/mp4` and the expected non-zero content length. Expiring
upload services such as Uguu are preview-only and must never be used in a
scheduled OneUp record. A OneUp "scheduled" response is not a publication
receipt: after the slot, reconcile all four IDs against published and failed
history before marking the queue or log complete.


## Queue and state rules

`queue.md` is data, not creative authority. It records concept, target time,
asset/episode path and state:

`log.csv` stores platform receipts and real performance. Missing metrics remain
blank. Never infer a winner from views alone.

## Document authority

1. `SOCIAL-MARKETER.md` — controlling instructions.
2. `queue.md` — current work state only.
3. `caption-gate.js` and `creative-gate.js` — executable gates.
4. `README.md` — entry point explaining this hierarchy.
5. `PLAYBOOK.md`, `AUTONOMOUS_DAILY_RUNBOOK.md`,
   `VISUAL-REVERSE-ENGINEERING-SPEC.md`, `TOOLING-AND-AUTOMATION.md` and
   `HIGH-QUALITY-AUTOMATION-CAPABILITY-BLUEPRINT.md` — reference/history only.

No reference document may override this file.
