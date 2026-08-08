#!/usr/bin/env node
'use strict';

// Compliance gate for social captions, on-screen text, and voiceover scripts.
// Thin wrapper over the blog engine's linter so social copy obeys the exact
// same FORBIDDEN rules (no human use, no dosing, no outcome/therapeutic
// claims) and carries the required RUO statements. Fails closed.
//
// Usage:
//   node social-engine/caption-gate.js --text "caption text ..."
//   node social-engine/caption-gate.js file1.txt [file2.txt ...]
//   echo "caption" | node social-engine/caption-gate.js --stdin

const fs = require('fs');
const path = require('path');
const { lint, formatReport } = require(path.join(__dirname, '..', 'content-engine', 'compliance.js'));

const RUO_FOOTER = 'For laboratory research use only. Not for human consumption.';

// Social-only forbidden patterns, on top of content-engine's FORBIDDEN set.
// These target short-form platform triggers rather than page copy.
const SOCIAL_FORBIDDEN = [
  { id: 'social-results-claim', message: 'personal results/testimonial framing',
    pattern: /\b(my|his|her|their)\s+(results?|progress|transformation|journey)\b/i },
  { id: 'social-glp1-branding', message: 'GLP-1 branding (platform-moderated term)',
    pattern: /\bglp[-\s]?1s?\b/i },
  { id: 'social-discount-dm', message: 'DM/code-word selling pattern (moderation trigger)',
    pattern: /\b(dm\s+(me|us)|link\s+below|check\s+my\s+bio\s+for\s+(code|discount))\b/i },
  { id: 'social-stock-language', message: 'stock or availability language',
    pattern: /\b(uk\s+stock(?:ed)?|in\s+stock|stock\s+available|our\s+stock)\b/i },
  { id: 'social-site-route', message: 'route-to-purchase or on-site document language',
    pattern: /\b(coa\s+on\s+our\s+(site|website)|our\s+(site|website)|shop\s+now|buy\s+now)\b/i },
  { id: 'social-purity-marketing', message: 'purity-as-marketing language',
    pattern: /\b(purity\s+(verified|guaranteed)|independently\s+tested\s+at\s+\d{2,3}(?:\.\d+)?%|\d{2,3}(?:\.\d+)?%\s+pure)\b/i },
];

function gate(text) {
  const base = lint(text);
  const violations = [...base.violations];
  for (const rule of SOCIAL_FORBIDDEN) {
    const m = text.match(rule.pattern);
    if (m) violations.push({ id: rule.id, message: rule.message, match: m[0], context: m[0] });
  }
  return { ok: violations.length === 0 && base.missing.length === 0, violations, missing: base.missing };
}

module.exports = { gate, RUO_FOOTER };

if (require.main === module) {
  const args = process.argv.slice(2);
  const inputs = [];
  if (args[0] === '--text') {
    inputs.push({ label: '(inline text)', text: args.slice(1).join(' ') });
  } else if (args[0] === '--stdin') {
    inputs.push({ label: '(stdin)', text: fs.readFileSync(0, 'utf8') });
  } else if (args.length) {
    for (const f of args) inputs.push({ label: f, text: fs.readFileSync(f, 'utf8') });
  } else {
    console.error('usage: caption-gate.js --text "..." | --stdin | <file...>');
    process.exit(2);
  }

  let failed = 0;
  for (const { label, text } of inputs) {
    const res = gate(text);
    if (!res.ok) failed++;
    console.log(formatReport(label, res));
    if (res.missing.length) console.log(`        hint: append the standard footer: "${RUO_FOOTER}"`);
  }
  process.exit(failed ? 1 : 0);
}
