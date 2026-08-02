'use strict';
module.exports = {
  slug: 'peptide-solubility-guide',
  metaTitle: 'Peptide Solubility: Which Research Compounds Dissolve How | UK',
  title: 'Peptide Solubility: Which Research Compounds Dissolve How',
  htmlTitle: 'Peptide Solubility:<br><em>Which Research Compounds Dissolve How</em>',
  description: 'A practical guide to peptide solubility for UK researchers — which compounds dissolve in bacteriostatic water, which need acetic acid or DMSO, and how to handle difficult peptides in the lab.',
  keyword: 'peptide solubility',
  category: 'Handling Guide',
  datePublished: '2026-08-01',
  cardSummary: 'Which research peptides dissolve readily in bacteriostatic water, which require a co-solvent, and how to handle compounds that are slow to dissolve.',
  intro: 'Solubility is one of the first practical questions when preparing a research peptide for use in an experiment. Most peptides supplied for research dissolve readily in bacteriostatic or sterile water, but some require a co-solvent — and using the wrong approach can leave peptide undissolved or degrade the compound. This guide covers the underlying principles, the available solvent options, and the handling steps for the compounds most commonly used in UK research settings.',
  relatedProducts: ['bacteriostatic-water', 'intranasal-research-kit', 'bpc-157', 'ghk-cu'],

  sections: [
    {
      id: 'what-is-solubility',
      heading: 'What Is Peptide Solubility?',
      html: `      <p>Solubility describes the maximum amount of a substance that can be dissolved in a given volume of solvent at a specified temperature — typically expressed as mg/mL for research peptides. A compound is described as <em>freely soluble</em> when it dissolves completely at concentrations relevant to laboratory preparation, and as <em>sparingly soluble</em> or <em>poorly soluble</em> when it requires particular handling or a specialised solvent to achieve a clear, homogeneous solution.</p>
      <p>For peptides, solubility is not a fixed property: it depends on the amino acid sequence, the net charge of the compound at the working pH, the choice of solvent, and temperature. Understanding these factors gives researchers a systematic way to handle even difficult compounds rather than assuming a vial is defective when dissolution is slow.</p>`,
    },
    {
      id: 'amino-acid-composition',
      heading: 'How Amino Acid Composition Determines Solubility',
      html: `      <p>Each amino acid carries a side chain that is hydrophilic (water-attracting), hydrophobic (water-repelling), positively charged, or negatively charged under typical aqueous conditions. Peptides with a high proportion of charged or polar residues — such as glutamic acid, aspartic acid, lysine, arginine, or histidine — tend to be freely water-soluble. Peptides dominated by hydrophobic residues — leucine, isoleucine, valine, phenylalanine, tryptophan — often require a co-solvent to dissolve fully.</p>
      <p>Net charge at the working pH also matters. A peptide whose isoelectric point (pI) is far from neutral pH carries a net charge at physiological conditions and typically dissolves well. A peptide whose pI is close to 7 carries little net charge and may aggregate. Shifting pH by using an acidic or basic solvent changes the charge distribution and can substantially improve dissolution without altering the compound's structure at research concentrations.</p>
      <p>For context: <a href="/product.html?product=bpc-157">BPC-157</a> contains a high proportion of polar residues and is among the most straightforwardly soluble research peptides; <a href="/product.html?product=ghk-cu">GHK-Cu</a> is likewise freely soluble — in part because the copper ion contributes to the complex's overall polarity.</p>`,
    },
    {
      id: 'solvent-options',
      heading: 'Solvent Options for Research Preparation',
      html: `      <p>The following solvents are routinely used in research peptide preparation, presented in the order most researchers work through them:</p>
      <ul>
        <li><strong>Bacteriostatic water (BAC water).</strong> The standard first choice for the majority of research peptides. Sterile water containing 0.9% benzyl alcohol, which acts as a preservative extending the stability of the prepared solution. <a href="/product.html?product=bacteriostatic-water">BAC water</a> is compatible with most peptides supplied by North Peptides UK and is the solvent used in the worked examples in the <a href="/blog/how-to-reconstitute-peptides.html">reconstitution guide</a>.</li>
        <li><strong>Sterile water for injection (SWFI).</strong> A suitable alternative where BAC water is unavailable. Because it contains no preservative, the prepared solution should be used promptly — stability is shorter, typically 7–14 days when refrigerated.</li>
        <li><strong>Dilute acetic acid (0.1–1% v/v in water).</strong> Useful for peptides that aggregate near neutral pH. The mild acid protonates basic residues such as arginine and lysine, increasing positive charge and reducing self-association. TB-500 (Thymosin β4) is the most common example of a research peptide that dissolves more readily in dilute acetic acid than in plain water at higher concentrations. Prepare fresh each time — acetic acid solutions should not be stored.</li>
        <li><strong>DMSO (dimethyl sulfoxide).</strong> A polar aprotic solvent used for highly hydrophobic peptides that cannot be dissolved in aqueous systems. Typically used at 10% or less in the final preparation: dissolve the powder in a small volume of DMSO first, then dilute into buffer or water while swirling. DMSO is absorbed through skin and should be handled with gloves and in a well-ventilated area.</li>
        <li><strong>Phosphate-buffered saline (PBS).</strong> Useful where pH buffering is required alongside the solvent. Most appropriate for freely water-soluble peptides; not recommended for compounds that aggregate near neutral pH, as PBS is pH 7.4.</li>
      </ul>`,
    },
    {
      id: 'solubility-table',
      heading: 'Solubility Characteristics of Common Research Peptides',
      html: `      <p>The table below summarises the solubility characteristics of the peptides most commonly requested by UK researchers. All guidance is for laboratory preparation only. Actual behaviour may vary with batch, concentration, and temperature.</p>
      <div style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>Peptide</th>
              <th>Solubility</th>
              <th>Recommended first solvent</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>BPC-157</td>
              <td>Freely soluble</td>
              <td>Bacteriostatic water</td>
              <td>Dissolves quickly and cleanly. One of the most straightforward peptides to prepare in the laboratory.</td>
            </tr>
            <tr>
              <td>TB-500 (Thymosin β4)</td>
              <td>Moderately soluble</td>
              <td>Bacteriostatic water; dilute acetic acid (0.1%) if needed</td>
              <td>Can aggregate at higher concentrations. Gentle warming of the solvent to 37°C assists dissolution. Dilute acetic acid is the recommended second step if plain water is insufficient.</td>
            </tr>
            <tr>
              <td>GHK-Cu</td>
              <td>Freely soluble</td>
              <td>Bacteriostatic water</td>
              <td>The copper ion imparts a characteristic blue-green colour to the solution — this is normal and expected, not a sign of contamination.</td>
            </tr>
            <tr>
              <td>KPV</td>
              <td>Freely soluble</td>
              <td>Bacteriostatic water</td>
              <td>A small, highly polar tripeptide. Dissolves readily at all research concentrations.</td>
            </tr>
            <tr>
              <td>Ipamorelin</td>
              <td>Freely soluble</td>
              <td>Bacteriostatic water</td>
              <td>Dissolves cleanly. Avoid vigorous shaking after reconstitution.</td>
            </tr>
            <tr>
              <td>CJC-1295</td>
              <td>Freely soluble</td>
              <td>Bacteriostatic water</td>
              <td>Dissolves readily. A longer peptide (30 amino acids) — allow a little extra time and swirl gently.</td>
            </tr>
            <tr>
              <td>Semax</td>
              <td>Freely soluble</td>
              <td>Bacteriostatic water or sterile saline</td>
              <td>Typically prepared for intranasal research applications. Dissolves quickly in aqueous solution.</td>
            </tr>
            <tr>
              <td>Selank</td>
              <td>Freely soluble</td>
              <td>Bacteriostatic water or sterile saline</td>
              <td>Similar solubility profile to Semax. Used extensively in intranasal research model preparation.</td>
            </tr>
            <tr>
              <td>Epitalon</td>
              <td>Freely soluble</td>
              <td>Bacteriostatic water</td>
              <td>A short tetrapeptide (Ala-Glu-Asp-Gly). Dissolves without difficulty at research concentrations.</td>
            </tr>
            <tr>
              <td>Pinealon</td>
              <td>Freely soluble</td>
              <td>Bacteriostatic water</td>
              <td>Short tripeptide. Similar preparation profile to KPV and Epitalon.</td>
            </tr>
            <tr>
              <td>NAD+</td>
              <td>Highly soluble</td>
              <td>Sterile water or bacteriostatic water</td>
              <td>A nucleotide rather than a peptide. Dissolves rapidly and completely. No co-solvent required.</td>
            </tr>
            <tr>
              <td>Retatrutide</td>
              <td>Freely soluble</td>
              <td>Bacteriostatic water</td>
              <td>A larger peptide. Introduce solvent using the side-of-vial technique and swirl gently — dissolution is complete within 1–2 minutes.</td>
            </tr>
            <tr>
              <td>Tirzepatide</td>
              <td>Freely soluble</td>
              <td>Bacteriostatic water</td>
              <td>Dissolves well with correct handling. Do not shake aggressively; swirling is sufficient.</td>
            </tr>
          </tbody>
        </table>
      </div>`,
    },
    {
      id: 'handling-difficult-peptides',
      heading: 'Handling Peptides That Are Slow to Dissolve',
      html: `      <p>If a peptide does not dissolve fully in bacteriostatic water after gentle swirling, work through the following steps systematically before drawing any conclusions about the compound:</p>
      <ol>
        <li><strong>Allow more time.</strong> Some peptides dissolve slowly, particularly at higher research concentrations. Leave the vial for 10–15 minutes at room temperature with occasional swirling before moving to the next step.</li>
        <li><strong>Warm the solvent gently.</strong> Heating bacteriostatic water to 37°C in a water bath before adding it to the vial can substantially improve dissolution for compounds like TB-500 that are borderline soluble at room temperature. Do not boil or microwave — heat must be applied uniformly and gently.</li>
        <li><strong>Reduce the concentration.</strong> Add a larger volume of solvent. Solubility is concentration-dependent — a compound that will not dissolve at 5 mg/mL may dissolve completely at 2 mg/mL. Adjust the working concentration in the experimental protocol accordingly.</li>
        <li><strong>Switch to dilute acetic acid.</strong> For peptides that aggregate near neutral pH, prepare a 0.1% v/v solution of glacial acetic acid in sterile water. Acetic acid protonates basic residues, increases net positive charge, and reduces aggregation. This is the recommended next step for TB-500 and other high-Lys or high-Arg peptides.</li>
        <li><strong>Use a small volume of DMSO as a co-solvent.</strong> For truly hydrophobic peptides, dissolve the powder in the minimum possible volume of DMSO (aim for no more than 10% of the final working volume), then dilute into buffer or aqueous solvent dropwise while swirling. Adding aqueous solvent too quickly can cause the peptide to precipitate as the DMSO is diluted out.</li>
        <li><strong>Avoid sonication unless necessary.</strong> Ultrasonic agitation can assist dissolution of stubborn aggregates, but prolonged sonication can also degrade sensitive peptide structures. If used, limit the duration to short bursts and monitor the solution.</li>
      </ol>`,
    },
    {
      id: 'intranasal-prep',
      heading: 'Solubility in Intranasal Research Preparations',
      html: `      <p>Semax and Selank are frequently used in intranasal research models. For intranasal preparation in a laboratory setting, both peptides are dissolved in sterile isotonic saline (0.9% NaCl) or bacteriostatic water, both of which are compatible with the conditions used in preclinical intranasal research. The <a href="/product.html?product=intranasal-research-kit">intranasal research kit</a> from North Peptides UK includes everything required to prepare and deliver compounds in this format.</p>
      <p>Because both Semax and Selank are freely water-soluble, preparation is straightforward. The key variables in this type of preparation are sterility, concentration accuracy, and delivery volume — not solubility. The full protocol, including concentration calculations and delivery technique for intranasal research models, is in the <a href="/blog/intranasal-research-peptide-preparation.html">intranasal preparation guide</a>.</p>`,
    },
  ],

  faqs: [
    {
      q: 'What solvent is used to dissolve research peptides?',
      a: 'Bacteriostatic water is the standard first choice for the majority of research peptides. For compounds that aggregate near neutral pH — such as TB-500 at higher concentrations — dilute acetic acid (0.1–1% in sterile water) is the recommended next step. Highly hydrophobic peptides may require a small volume of DMSO as a co-solvent before dilution into water.',
    },
    {
      q: 'Why is my peptide not dissolving?',
      a: 'The most common causes are insufficient time, the wrong pH for the compound, or a concentration above the solubility limit. Try allowing more time with occasional swirling, warming the solvent to 37°C, reducing the working concentration, or switching to dilute acetic acid. Check the solubility table above for the recommended first solvent for your specific compound.',
    },
    {
      q: 'Can bacteriostatic water dissolve all research peptides?',
      a: 'Most, but not all. Bacteriostatic water is the correct starting point for the majority of peptides and works without issue for compounds such as BPC-157, GHK-Cu, KPV, Ipamorelin, and Epitalon. Moderately soluble peptides such as TB-500 at higher concentrations may require gentle warming or a switch to dilute acetic acid.',
    },
    {
      q: 'Can these peptides or solvents be used in humans?',
      a: 'No. All compounds stocked by North Peptides UK are supplied strictly for laboratory and scientific research. They are not for human or animal consumption.',
    },
  ],
};
