# Higgsfield production templates

Reusable prompt patterns per format. Source imagery is always a real product
photo from the repo root (upload via `media_upload`, role `image_references`,
model `seedance_2_0`, `aspect_ratio: 9:16`, `duration: 8`). Never depict
people using products; never bake text or logos into the video.

## F4 Lab Loop — image-to-video template

> Use the uploaded image as the exact first frame. One continuous
> photorealistic 8-second vertical macro shot, no cuts, no transitions, no
> text, no logos. [SUBJECT — e.g. "The glass vial of luminous blue liquid
> stands on a clean laboratory bench."] From 0.0–2.0s [PRIMARY MOTION — the
> hook: swirling liquid / rolling cold vapour / a droplet track]. From
> 2.0–5.0s the camera performs an extremely slow [5-degree orbital drift /
> 6% dolly-in] while [SECONDARY DETAIL — condensation forming / frost turning
> glossy / dust motes]. From 5.0–8.0s [SETTLE — motion resolves into a calm
> loopable end state]. Shallow depth of field, cold clinical laboratory
> lighting, satisfying ASMR-like macro detail, premium scientific aesthetic,
> photoreal.

Rules: something must already be moving at frame 0 (the 1.5-second law);
the shot should loop plausibly; one subject per video.

### Proven variants (pilots, 2026-08-08)
- **GHK-Cu swirl** — blue liquid slow swirl, caustic reflections, condensation
  droplet, backlit settle. Source: `ghk-cu-reconstituted.png`.
- **Reta cold chain** — frost-covered vial, cold vapour rolls off, frost beads
  to droplets, rack focus to label. Source: `reta-50mg-frozen.png`.

## F6 Guess the Peptide — same template, plus

End the prompt with: "The label on the vial is turned away from camera so the
product name is not readable." Clues go in native overlay text, answer as next-day
pinned comment.

## F1 / F3 / F5 — narrated formats

Run the Higgsfield `faceless-channel-video` workflow (Explainer type) per its
own instructions (`get_workflow_instructions {workflow:"faceless-channel-video"}`).
Constraints to carry into the brief:

- Visual style: clean clinical-lab aesthetic matching the product photos;
  reuse real product/COA imagery as scene references where relevant.
- VO tone: calm, precise, British English, no hype words; every claim
  research-framed ("in cell-model studies…", "researchers report…").
- Script must pass `caption-gate.js` BEFORE audio generation (saves credits).
- 45–60s for F1/F5, 30–45s for F3. Hook sentence first, series ident last.

## F2 Lab Verdict

Either `ugc-product-flow` (product-only, voiceover, no on-camera creator) or
the faceless explainer over stills of the real COA PNGs
(`coa-ghk-cu-100016393-report.png`, `coa-retatrutide-100016392-report.png`)
with slow zoom/pan (Ken Burns) on the purity figure. The purity number is the
climax — hold it on screen for the final 3 seconds.
