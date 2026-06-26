'use strict';
/*
 * Migrated + remediated from the original hand-written page. The insulin-syringe
 * human-dosing table/section and stale product references (Melanotan II,
 * Essentials Bundle) were removed so the page passes the compliance gate and
 * links only to products that exist. Slug is unchanged to preserve the indexed URL.
 */
module.exports = {
  slug: 'how-to-reconstitute-peptides',
  metaTitle: 'How to Reconstitute Peptides | UK Researcher Guide',
  title: 'How to Reconstitute Peptides: A UK Researcher Guide',
  htmlTitle: 'How to Reconstitute Peptides<br><em>A UK Researcher Guide</em>',
  description: 'Step-by-step guide to reconstituting lyophilised research peptides with bacteriostatic water — concentration arithmetic, storage and common mistakes, for laboratory use only.',
  keyword: 'how to reconstitute peptides',
  category: 'Handling & Preparation',
  datePublished: '2026-06-20',
  dateModified: '2026-06-26',
  cardSummary: 'How to reconstitute lyophilised research peptides with bacteriostatic water, including concentration arithmetic and storage, for laboratory handling.',
  intro: 'Lyophilised research peptides are reconstituted before use in the laboratory. This guide covers how to do it correctly — the right solvent, the right ratios, and how to store the prepared solution — written for UK researchers handling research compounds in a vial.',
  relatedProducts: ['bacteriostatic-water', 'syringe-kit', 'alcohol-wipes', 'pen-style-research-kit'],

  sections: [
    {
      id: 'what-is-reconstitution',
      heading: 'What Is Reconstitution?',
      html: `      <p>Peptides are supplied in lyophilised form — freeze-dried powder — because this is the most stable way to store them. Lyophilisation removes water from the compound so it can be transported at room temperature for short periods, then kept frozen for longer-term storage.</p>
      <p>Reconstitution is the process of adding a solvent back to the powder to create a liquid solution at a known concentration, ready for use in laboratory research. Done correctly, it preserves the integrity of the peptide. Done incorrectly, it can degrade the compound before research even begins.</p>`,
    },
    {
      id: 'what-you-need',
      heading: 'What You Need',
      html: `      <p>Before starting, make sure you have the following to hand:</p>
      <ul>
        <li><strong><a href="/product.html?product=bacteriostatic-water">Bacteriostatic water (BAC water)</a></strong> — the preferred solvent for most peptides. It contains 0.9% benzyl alcohol, which suppresses bacterial growth and extends the usable life of a reconstituted solution.</li>
        <li><strong><a href="/product.html?product=syringe-kit">Sterile transfer needles</a></strong> — 1ml needles are ideal for measuring the solvent accurately and transferring it gently into the vial.</li>
        <li><strong><a href="/product.html?product=alcohol-wipes">Alcohol wipes</a></strong> — to clean the rubber stoppers of both the BAC water vial and the peptide vial before drawing or transferring.</li>
        <li><strong>The lyophilised peptide vial</strong> — kept at the correct storage temperature until use.</li>
      </ul>
      <div class="callout callout-green">
        <div class="callout-title">Why Bacteriostatic Water?</div>
        <p>Plain sterile water has no preservative, so a solution made with it degrades within about 24 hours. BAC water suppresses microbial contamination and keeps a reconstituted solution stable for up to 28 days when refrigerated. It is the standard solvent choice for peptide research preparation.</p>
      </div>`,
    },
    {
      id: 'step-by-step',
      heading: 'Step-by-Step Reconstitution',
      html: `      <ol>
        <li><strong>Allow the peptide to reach room temperature.</strong> Remove the vial from the freezer and let it sit for 15–20 minutes before opening. This prevents condensation forming inside the vial and stops the powder clumping.</li>
        <li><strong>Sterilise both vial tops.</strong> Wipe the rubber stopper of both the BAC water vial and the peptide vial with an alcohol wipe, and allow 10 seconds to air dry.</li>
        <li><strong>Draw up the BAC water.</strong> Using a sterile needle, draw the volume of bacteriostatic water you have chosen for your target concentration (see the table below).</li>
        <li><strong>Add it slowly down the side of the vial.</strong> This is the most important step. Do not direct the solvent straight onto the powder — angle it so the BAC water runs slowly down the inside wall of the vial. This prevents the peptide foaming or denaturing on contact.</li>
        <li><strong>Swirl gently — never shake.</strong> Once all the solvent is in, roll the vial gently between your palms or swirl slowly until the powder fully dissolves and the solution turns clear. Shaking creates bubbles and mechanical stress that can break peptide bonds.</li>
        <li><strong>Store correctly straight away.</strong> Refrigerate the vial at 2–8°C and label it with the preparation date.</li>
      </ol>`,
    },
    {
      id: 'concentration-calculations',
      heading: 'Concentration Calculations',
      html: `      <p>The volume of BAC water you add determines the concentration of the prepared solution. Adding 1–2ml per vial gives a clean concentration that is easy to measure. The table shows the concentration produced for common vial sizes:</p>
      <table class="compare-table">
        <thead>
          <tr><th>Vial Size</th><th>BAC Water Added</th><th>Resulting Concentration</th></tr>
        </thead>
        <tbody>
          <tr><td>5mg</td><td>1ml</td><td>5mg/ml (5000mcg/ml)</td></tr>
          <tr><td>5mg</td><td>2ml</td><td>2.5mg/ml (2500mcg/ml)</td></tr>
          <tr><td>10mg</td><td>1ml</td><td>10mg/ml (10,000mcg/ml)</td></tr>
          <tr><td>10mg</td><td>2ml</td><td>5mg/ml (5000mcg/ml)</td></tr>
          <tr><td>20mg</td><td>2ml</td><td>10mg/ml (10,000mcg/ml)</td></tr>
          <tr><td>50mg</td><td>5ml</td><td>10mg/ml (10,000mcg/ml)</td></tr>
        </tbody>
      </table>
      <div class="callout callout-amber">
        <div class="callout-title">Concentration, Not Dosage</div>
        <p>These figures describe preparing research material at a known concentration in a vial for laboratory use. They are a property of the solution itself and are not guidance for human or animal use.</p>
      </div>`,
    },
    {
      id: 'storage',
      heading: 'Storage After Reconstitution',
      html: `      <p>Once reconstituted, a peptide solution needs different storage conditions from the lyophilised powder:</p>
      <ul>
        <li><strong>Refrigerate at 2–8°C</strong> — a standard fridge works well. Avoid the door, where the temperature fluctuates.</li>
        <li><strong>Keep away from light</strong> — UV degrades peptides. Keep the vial in its original box or wrapped in foil.</li>
        <li><strong>Use within 28 days</strong> — with bacteriostatic water, most reconstituted solutions stay stable for up to four weeks. Discard after that.</li>
        <li><strong>Never refreeze a reconstituted solution</strong> — freeze–thaw cycles damage the peptide. For long-term storage, keep the compound as lyophilised powder.</li>
      </ul>`,
    },
    {
      id: 'common-mistakes',
      heading: 'Common Mistakes to Avoid',
      html: `      <ul>
        <li><strong>Using plain sterile water instead of BAC water</strong> — with no preservative, the solution degrades within 24 hours. Use bacteriostatic water for anything you will draw from over several days.</li>
        <li><strong>Directing the solvent onto the powder</strong> — always run the BAC water down the side wall of the vial. Direct contact causes foaming and can denature the compound.</li>
        <li><strong>Shaking the vial</strong> — the single most common mistake. Shaking introduces bubbles and mechanical stress that break peptide bonds. Swirl gently only.</li>
        <li><strong>Skipping the room-temperature step</strong> — cold powder can clump when it meets liquid, making it harder to dissolve fully.</li>
        <li><strong>Freezing after reconstitution</strong> — a prepared solution should be refrigerated, not frozen. Freezing forms ice crystals that damage the peptide structure.</li>
      </ul>`,
    },
    {
      id: 'specific-peptides',
      heading: 'Notes on Specific Compounds',
      html: `      <p>Most peptides reconstitute cleanly in BAC water at room temperature. A few notes on compounds available from North Peptides UK:</p>
      <ul>
        <li><strong><a href="/product.html?product=retatrutide">Retatrutide</a> and <a href="/product.html?product=tirzepatide">Tirzepatide</a></strong> — dissolve readily. A 2–4ml dilution is common for working concentrations used in research models.</li>
        <li><strong><a href="/product.html?product=bpc-157">BPC-157</a></strong> — highly soluble. Dissolves quickly and cleanly; 1ml of BAC water per 10mg vial is typical.</li>
        <li><strong><a href="/product.html?product=tb-500">TB-500</a></strong> — also highly soluble. May look slightly cloudy at first but clears with gentle swirling.</li>
        <li><strong><a href="/product.html?product=ghk-cu">GHK-Cu</a></strong> — dissolves well. The solution carries a slight blue-green tint from the copper, which is normal.</li>
        <li><strong><a href="/product.html?product=klow-stack">KLOW Stack</a></strong> — four compounds in one vial, all water soluble. Treat it the same as any single peptide; 2ml of BAC water is a good starting volume.</li>
      </ul>
      <div class="callout callout-dark">
        <div class="callout-title">// Questions?</div>
        <p>For questions about reconstituting any compound from North Peptides UK, message the team directly on Telegram at @NORTHPEPTIDESUK. Happy to help with the concentration arithmetic or anything else research-related.</p>
      </div>`,
    },
  ],

  faqs: [
    { q: 'What water should I use to reconstitute research peptides?',
      a: 'Bacteriostatic water (BAC water), which contains 0.9% benzyl alcohol. It suppresses microbial growth and keeps a reconstituted solution stable for up to 28 days when refrigerated, unlike plain sterile water.' },
    { q: 'How long does a reconstituted peptide solution last?',
      a: 'Prepared with bacteriostatic water and refrigerated at 2–8°C away from light, most reconstituted peptide solutions remain stable for up to 28 days. Discard after that.' },
    { q: 'Why should the vial be swirled and not shaken?',
      a: 'Shaking introduces air bubbles and mechanical stress that can break peptide bonds and denature the compound. Gentle swirling dissolves the powder without damaging it.' },
  ],
};
