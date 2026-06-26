'use strict';
/*
 * compliance.js — the automated compliance gate for North Peptides UK content.
 *
 * Every generated page MUST pass this gate before it can be written/published.
 * It enforces UK research-use-only (RUO) positioning: no human/animal dosing,
 * no therapeutic/medical claims, no outcome claims (weight loss, muscle gain),
 * no before/after framing — and it confirms the mandatory RUO disclaimer is present.
 *
 * Design:
 *  - FAIL CLOSED. Any forbidden match or any missing required phrase = failure.
 *  - The template wraps its own mandatory compliance copy (the disclaimer, the
 *    RUO callout) in <!--compliance:ignore-start--> ... <!--compliance:ignore-end-->
 *    fences. Forbidden-pattern scanning skips fenced regions so our own boilerplate
 *    (which legitimately contains "not for human consumption", "treat", etc.) never
 *    trips the gate. Required-phrase checks run on the FULL text, so removing the
 *    disclaimer still fails the gate.
 *  - Zero dependencies. Node built-ins only. Usable as a library or a CLI.
 *
 * CLI:  node content-engine/compliance.js <file.html> [more.html ...]
 *       exit 0 = all clean, exit 1 = one or more files failed.
 */

const fs = require('fs');

// ---------------------------------------------------------------------------
// Forbidden patterns. Each: { id, message, pattern }. Case-insensitive.
// Keep patterns SPECIFIC to affirmative misuse to avoid false positives on
// legitimate research/handling prose (e.g. "freeze-thaw cycle", "down the side
// of the vial" are fine; "10 IU on your syringe", "weekly dose" are not).
// ---------------------------------------------------------------------------
const FORBIDDEN = [
  // --- Human administration / self-injection ---
  { id: 'self-inject', message: 'self-injection / human administration',
    pattern: /\bself[-\s]?inject/i },
  { id: 'inject-body', message: 'injecting into a body, not a vial',
    pattern: /\b(inject|injecting|administer|administering|jab)\s+(yourself|into\s+(your|the)\s+(body|skin|stomach|abdomen|thigh|leg|arm|muscle)|subcutaneous|sub-?q|intramuscular|\bim\b)/i },
  { id: 'pinning', message: 'bodybuilding "pinning" slang',
    pattern: /\bpinning\b/i },
  { id: 'on-cycle', message: '"on cycle" dosing-protocol slang',
    pattern: /\bon[-\s]cycle\b/i },

  // --- Dosing directed at a person ---
  { id: 'dose-descriptor', message: 'human dosing language (recommended/typical/daily dose)',
    pattern: /\b(your|the\s+recommended|a\s+typical|recommended|typical|starting|maintenance|effective|optimal|daily|weekly)\s+dos(e|age|ing)\b/i },
  { id: 'dose-for-humans', message: 'dosing framed for humans/bodyweight',
    pattern: /\bdos(e|age|ing)\s+(for|per)\s+(humans?|men|women|adults?|patients?|kg|body\s?weight|bodyweight)/i },
  { id: 'mg-per-kg', message: 'per-bodyweight dosing (mg/kg)',
    pattern: /\b(mg|mcg|iu)\s*\/\s*kg\b|\bper\s+kg\b|\bper\s+kilogram\b/i },
  { id: 'iu-on-syringe', message: 'insulin-syringe human-dosing instruction',
    pattern: /\b(iu|units?)\s+on\s+(your|the)\s+syringe\b/i },
  { id: 'take-amount', message: 'instruction to take/consume a quantity',
    pattern: /\b(take|taking|consume|consuming|ingest|ingesting|swallow|administer)\s+\d+\s?(mg|mcg|iu|ml)\b/i },
  { id: 'amount-per-period', message: 'quantity per day/week/dose schedule',
    pattern: /\b\d+\s?(mg|mcg|iu)\s+(per|a|each|every)\s+(day|week|dose|injection|application)\b/i },

  // --- Human/animal consumption & outcome claims ---
  { id: 'for-human-use', message: 'positions product FOR human use/consumption',
    // variable-length negative lookbehind (V8): no "not/never/n't" within ~14 chars before "for human"
    pattern: /(?<!\b(?:not|never|isn'?t|aren'?t|n'?t)\b[\w\s,]{0,14})\bfor\s+human\s+(use|consumption|ingestion)\b/i },
  { id: 'weight-loss', message: 'weight-loss / fat-loss outcome claim',
    pattern: /\b(weight[-\s]?loss|lose\s+weight|losing\s+weight|fat[-\s]?loss|burn(s|ing)?\s+fat|slimming|slim\s+down|shed\s+(pounds|weight))\b/i },
  { id: 'muscle-gain', message: 'muscle-growth outcome claim',
    pattern: /\b(build|building|gain|gaining|grow|growing)\s+(lean\s+)?muscle\b|\bmuscle\s+(growth|gains?)\b/i },
  { id: 'appetite', message: 'human appetite/satiety outcome claim',
    pattern: /\b(suppress(es|ing)?\s+(your\s+)?appetite|appetite\s+suppress|reduces?\s+(your\s+)?hunger|feel\s+full(er)?)\b/i },
  { id: 'anti-aging', message: 'anti-aging cosmetic outcome claim',
    pattern: /\b(anti[-\s]?aging|anti[-\s]?ageing|reverse[s]?\s+aging|reverse[s]?\s+ageing|younger[-\s]looking|reduce[s]?\s+wrinkles)\b/i },
  { id: 'before-after', message: 'before/after transformation framing',
    pattern: /\bbefore\s+and\s+after\b|\bbefore\/after\b/i },

  // --- Therapeutic / medical claims ---
  // "treat" only when it has a medical object (avoids "treat the same as", "heat treatment").
  { id: 'treat-condition', message: 'therapeutic claim (treats a condition/symptom)',
    pattern: /\b(treats?|treating)\s+(?:\w+\s+){0,2}(disease|illness|condition|disorder|syndrome|symptoms?|pain|inflammation|injur(?:y|ies)|wounds?|patients?|deficiency|dysfunction)\b|\btreatment\s+(of|for)\s+\w+/i },
  { id: 'cure-remedy', message: 'therapeutic claim (cure/remedy)',
    pattern: /\b(cures?|curing|remed(?:y|ies)|alleviat(?:e|es|ing)|relieve[s]?\s+(?:symptoms|pain))\b/i },
  // "healing" only as a benefit claim — allows "wound-healing model", "tissue-healing assay".
  { id: 'healing-claim', message: 'healing/repair benefit claim',
    pattern: /\b(promot(?:e|es|ing)|accelerat(?:e|es|ing)|speed(?:s)?\s+up|boost(?:s|ing)?|enhanc(?:e|es|ing)|improv(?:e|es|ing))\s+(?:\w+\s+){0,2}(healing|recovery|repair)\b|\bheals?\s+(?:wounds?|tissue|injur|the\s+body|faster)\b/i },
  { id: 'therapy-for', message: 'positions compound as a therapy for a condition',
    pattern: /\b(therapy|therapeutic\s+(use|benefit|effect))\s+for\b|\bas\s+a\s+(treatment|therapy|cure)\b/i },
  { id: 'prevent-disease', message: 'disease prevention/diagnosis claim',
    pattern: /\b(prevent|preventing|diagnose|diagnosing|reverse)\s+(disease|illness|diabetes|obesity|cancer|condition|disorder)/i },
  { id: 'clinically-proven', message: 'unsubstantiated "clinically/medically proven" claim',
    pattern: /\b(clinically|medically|scientifically)\s+proven\b|\bproven\s+to\s+(treat|cure|reduce|increase|boost)/i },
  { id: 'regulatory-claim', message: 'false regulatory/prescription framing',
    pattern: /\bFDA[-\s]?approved\b|\bMHRA[-\s]?approved\b|\bprescri(be|bed|ption)\b|\bover[-\s]the[-\s]counter\b/i },
  { id: 'side-effects', message: 'side-effects framing implies human use',
    pattern: /\b(side[-\s]effects?|adverse\s+(effects?|reactions?)|contraindication)/i },
];

// ---------------------------------------------------------------------------
// Required phrases. The page FAILS if any group has no match. Each group is an
// array of acceptable patterns (any one satisfies the group).
// ---------------------------------------------------------------------------
const REQUIRED = [
  { id: 'ruo-statement', message: 'a research-use-only statement',
    any: [/research\s+use\s+only/i, /for\s+(laboratory|research|scientific)\s+(use|purposes)/i] },
  { id: 'not-for-human', message: 'a "not for human/animal consumption" statement',
    any: [/not\s+(intended\s+)?for\s+human(\s+or\s+animal)?\s+(use|consumption)/i,
          /not\s+for\s+human\s+or\s+animal\s+consumption/i] },
];

// Fence markers the template uses to wrap its own mandatory compliance copy.
const IGNORE_FENCE = /<!--\s*compliance:ignore-start\s*-->[\s\S]*?<!--\s*compliance:ignore-end\s*-->/gi;

function stripToText(html, { keepFenced }) {
  let s = String(html);
  if (!keepFenced) s = s.replace(IGNORE_FENCE, ' ');
  s = s
    .replace(/<!--[\s\S]*?-->/g, ' ')               // html comments
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')    // scripts (incl JSON-LD)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')      // css
    .replace(/<[^>]+>/g, ' ')                        // remaining tags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&(lt|gt|quot|#39|apos);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return s;
}

function snippet(text, index, len) {
  const start = Math.max(0, index - 35);
  const end = Math.min(text.length, index + len + 35);
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

/**
 * Lint a page. Returns { ok, violations:[{id,message,match,context}], missing:[{id,message}] }.
 * opts.allow: array of RegExp|string phrases to exempt (rare legitimate phrasing).
 */
function lint(html, opts = {}) {
  const allow = (opts.allow || []).map(a => (a instanceof RegExp ? a : new RegExp(escapeRe(String(a)), 'i')));
  const scanText = stripToText(html, { keepFenced: false });
  const fullText = stripToText(html, { keepFenced: true });

  const violations = [];
  for (const rule of FORBIDDEN) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : rule.pattern.flags + 'g');
    let m;
    while ((m = re.exec(scanText)) !== null) {
      const matched = m[0];
      if (allow.some(a => a.test(matched))) continue;
      violations.push({ id: rule.id, message: rule.message, match: matched.trim(), context: snippet(scanText, m.index, matched.length) });
      if (m.index === re.lastIndex) re.lastIndex++; // guard zero-width
    }
  }

  const missing = [];
  for (const req of REQUIRED) {
    if (!req.any.some(p => p.test(fullText))) missing.push({ id: req.id, message: req.message });
  }

  return { ok: violations.length === 0 && missing.length === 0, violations, missing };
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function lintFile(path, opts) {
  return lint(fs.readFileSync(path, 'utf8'), opts);
}

function formatReport(path, result) {
  const lines = [];
  if (result.ok) {
    lines.push(`  PASS  ${path}`);
  } else {
    lines.push(`  FAIL  ${path}`);
    for (const v of result.violations) lines.push(`        ✗ [${v.id}] ${v.message}\n            match: "${v.match}"\n            in: ${v.context}`);
    for (const m of result.missing) lines.push(`        ✗ [${m.id}] MISSING ${m.message}`);
  }
  return lines.join('\n');
}

// CLI
if (require.main === module) {
  const files = process.argv.slice(2);
  if (!files.length) { console.error('usage: node content-engine/compliance.js <file.html> [...]'); process.exit(2); }
  let failed = 0;
  for (const f of files) {
    const res = lintFile(f);
    if (!res.ok) failed++;
    console.log(formatReport(f, res));
  }
  console.log(`\n${files.length - failed}/${files.length} passed.`);
  process.exit(failed ? 1 : 0);
}

module.exports = { lint, lintFile, formatReport, FORBIDDEN, REQUIRED };
