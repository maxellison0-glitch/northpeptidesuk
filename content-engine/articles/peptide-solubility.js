'use strict';
module.exports = {
  slug: 'peptide-solubility',
  metaTitle: 'Peptide Solubility: Which Compounds Dissolve How | UK',
  title: 'Peptide Solubility: Which Compounds Dissolve How',
  htmlTitle: 'Peptide Solubility:<br><em>Which Compounds Dissolve How</em>',
  description: 'A practical guide to peptide solubility for UK researchers — which solvents to use, which compounds dissolve readily and which need extra steps, and how to handle difficult reconstitutions.',
  keyword: 'peptide solubility',
  category: 'Handling Guide',
  datePublished: '2026-08-15',
  dateModified: '2026-08-15',
  cardSummary: 'Which solvents work for which research peptides, why some compounds dissolve more readily than others, and practical steps for successful reconstitution in the laboratory.',
  intro: 'Reconstituting a peptide correctly begins with understanding its solubility — how readily the compound dissolves in a given solvent, at what concentration, and what steps help when dissolution is slow. This guide covers the solubility characteristics of the research compounds stocked by North Peptides UK, explains the structural chemistry behind the differences, and sets out practical approaches used in the laboratory. All compounds are supplied for research use only.',
  relatedProducts: ['bacteriostatic-water', 'bpc-157', 'tb-500', 'ghk-cu'],

  sections: [
    {
      id: 'why-solubility-matters',
      heading: 'Why Solubility Matters in Peptide Research',
      html: `      <p>Solubility determines which solvents can be used, what working concentrations are achievable, and whether a compound can be prepared at the concentrations a given assay or model requires. A compound that is poorly soluble may produce turbid (cloudy) solutions, particulates, or precipitates — all of which compromise experimental reproducibility and can clog fine laboratory equipment.</p>
      <p>Understanding solubility before reconstitution also conserves material. If a peptide requires a co-solvent or a specific preparation technique and this is not known in advance, a researcher may misjudge the result — for example, interpreting a turbid solution as dissolved when the compound has in fact aggregated. In a research context where vials are a finite resource, getting reconstitution right on the first attempt matters.</p>
      <p>Solubility is distinct from stability. A compound may dissolve readily but degrade quickly in solution, or dissolve slowly but remain stable once in solution. Both properties are relevant to the choice of solvent, preparation technique, and storage conditions.</p>`,
    },
    {
      id: 'what-affects-solubility',
      heading: 'What Affects Peptide Solubility?',
      html: `      <p>Several structural properties govern how readily a peptide dissolves in aqueous solvents:</p>
      <ul>
        <li><strong>Amino acid composition:</strong> Peptides rich in hydrophilic, charged residues — lysine (Lys), arginine (Arg), aspartate (Asp), glutamate (Glu) — dissolve readily in water. Sequences dominated by hydrophobic residues — leucine (Leu), isoleucine (Ile), phenylalanine (Phe), valine (Val) — tend to aggregate in aqueous media and may require co-solvents or pH adjustment.</li>
        <li><strong>Net charge at working pH:</strong> A peptide's aqueous solubility is strongly influenced by its isoelectric point (pI). At pH values far from the pI — either more acidic or more alkaline — the peptide carries a net charge that keeps molecules repelled from one another and in solution. Near the pI, net charge approaches zero and solubility often drops sharply. This is why dilute acetic acid aids dissolution of some peptides: it shifts the pH to give the molecule a net positive charge.</li>
        <li><strong>Molecular weight and chain length:</strong> Longer peptides have more surface area for hydrophobic interactions and a higher probability of self-assembly into aggregates. Short fragments (di-, tri-, and tetrapeptides) are generally more straightforward to dissolve than longer sequences, all else being equal.</li>
        <li><strong>Lipidation:</strong> Lipidated peptides — those with a fatty acid chain covalently attached, such as Retatrutide and Tirzepatide — have sharply reduced water solubility. The lipid chain promotes self-assembly into micelles and bilayer structures, making dissolution from dry powder in standard aqueous solvents impractical without specialist formulation buffers.</li>
        <li><strong>Salt form:</strong> The same peptide supplied as a free base versus a TFA (trifluoroacetate) salt versus an acetate salt can show meaningfully different solubility characteristics. Certificate-of-analysis documentation from the supplier will indicate the salt form where known.</li>
      </ul>`,
    },
    {
      id: 'common-solvents',
      heading: 'Common Reconstitution Solvents',
      html: `      <p>The right solvent depends on the compound. The following are used in research peptide preparation:</p>
      <table>
        <thead><tr><th>Solvent</th><th>When used</th><th>Notes</th></tr></thead>
        <tbody>
          <tr>
            <td><a href="/product.html?product=bacteriostatic-water">Bacteriostatic water</a></td>
            <td>Most aqueous-soluble research peptides</td>
            <td>Contains benzyl alcohol (typically 0.9%) as an antimicrobial agent. Extends the working life of the reconstituted solution to approximately 28 days under refrigeration. The standard first choice for most peptides in the North Peptides UK range.</td>
          </tr>
          <tr>
            <td>Sterile water for injection</td>
            <td>When benzyl alcohol compatibility is a concern for a specific assay</td>
            <td>No preservative. Once opened, solutions should be used promptly. Shorter working life than bacteriostatic preparations.</td>
          </tr>
          <tr>
            <td>Dilute acetic acid (0.1–1% v/v)</td>
            <td>Peptides with high hydrophobic character or those that aggregate near neutral pH</td>
            <td>The acid shifts the pH to give the peptide a net positive charge, which aids dissolution. Use at the minimum concentration that produces a clear solution; dilute further into buffer or sterile water after initial dissolution.</td>
          </tr>
          <tr>
            <td>DMSO (dimethyl sulfoxide)</td>
            <td>Highly hydrophobic compounds; rarely required for peptides</td>
            <td>Use research-grade DMSO. Dissolve the compound in a small volume of DMSO and dilute further into an aqueous buffer. The final DMSO proportion in an assay should generally remain below 0.5–1% to avoid confounding results in cell-based experimental models.</td>
          </tr>
        </tbody>
      </table>`,
    },
    {
      id: 'solubility-by-compound',
      heading: 'Solubility Profiles of Key Research Compounds',
      html: `      <p>The table below summarises the practical solubility characteristics of research compounds stocked by North Peptides UK. All figures relate to laboratory preparation conditions. These compounds are for laboratory research use only — not for human or animal consumption.</p>
      <table>
        <thead><tr><th>Compound</th><th>Aqueous solubility</th><th>Recommended primary solvent</th><th>Notes</th></tr></thead>
        <tbody>
          <tr>
            <td><a href="/product.html?product=bpc-157">BPC-157</a></td>
            <td>High</td>
            <td>Bacteriostatic water</td>
            <td>15-residue pentadecapeptide with several hydrophilic residues. Dissolves quickly and cleanly. 1ml per 10mg vial is a standard preparation volume in published preclinical research.</td>
          </tr>
          <tr>
            <td><a href="/product.html?product=ghk-cu">GHK-Cu</a></td>
            <td>High</td>
            <td>Bacteriostatic water</td>
            <td>Copper(II) tripeptide complex (Gly-His-Lys-Cu²⁺). Dissolves readily; the characteristic blue colour of the powder is retained in solution. Highly water-soluble at normal research concentrations.</td>
          </tr>
          <tr>
            <td><a href="/product.html?product=tb-500">TB-500</a></td>
            <td>Good</td>
            <td>Bacteriostatic water</td>
            <td>Heptapeptide (Ac-LKKTETQ). Generally dissolves well with gentle swirling. Warming the solvent to 35–37°C before addition can assist if the powder takes several minutes to clear.</td>
          </tr>
          <tr>
            <td>KPV</td>
            <td>High</td>
            <td>Bacteriostatic water</td>
            <td>Tripeptide (Lys-Pro-Val). Short chain with a charged lysine residue; highly water-soluble across a wide concentration range.</td>
          </tr>
          <tr>
            <td>Ipamorelin</td>
            <td>Good–High</td>
            <td>Bacteriostatic water</td>
            <td>Synthetic pentapeptide (Aib-His-D-2-Nal-D-Phe-Lys-NH₂). Dissolves well at standard research concentrations.</td>
          </tr>
          <tr>
            <td>CJC-1295 (No DAC)</td>
            <td>Good</td>
            <td>Bacteriostatic water</td>
            <td>29-residue GHRH analogue; one of the larger peptides in this range. Allow adequate time for complete dissolution and swirl rather than shake.</td>
          </tr>
          <tr>
            <td>Semax</td>
            <td>High</td>
            <td>Bacteriostatic water or sterile saline</td>
            <td>Heptapeptide with a Pro-Gly-Pro extension; designed for aqueous intranasal research preparations. Highly water-soluble.</td>
          </tr>
          <tr>
            <td>Selank</td>
            <td>High</td>
            <td>Bacteriostatic water or sterile saline</td>
            <td>Heptapeptide with similar aqueous properties to Semax. Dissolves readily at concentrations used in intranasal research preparations.</td>
          </tr>
          <tr>
            <td>Epitalon</td>
            <td>Moderate–Good</td>
            <td>Bacteriostatic water</td>
            <td>Tetrapeptide (Ala-Glu-Asp-Gly). Generally dissolves at normal research concentrations; gentle warming of the solvent may assist if the solution remains slightly hazy.</td>
          </tr>
          <tr>
            <td>Pinealon</td>
            <td>Moderate</td>
            <td>Bacteriostatic water or dilute acetic acid (0.1%)</td>
            <td>Short tripeptide with some hydrophobic character. May benefit from an initial dissolution in dilute acetic acid before diluting into buffer or bacteriostatic water.</td>
          </tr>
          <tr>
            <td>NAD+</td>
            <td>High</td>
            <td>Bacteriostatic water or sterile water</td>
            <td>Pyridine dinucleotide coenzyme, not a peptide. Dissolves rapidly at high concentrations; widely used in assay work.</td>
          </tr>
          <tr>
            <td>Retatrutide</td>
            <td>Low (lipidated)</td>
            <td>Available pre-reconstituted</td>
            <td>39-residue lipidated GLP-1/GIP/glucagon agonist. Dissolution of lipidated peptides from dry powder requires specialist formulation; North Peptides UK offers this compound as a pre-reconstituted pen vial as the standard laboratory format.</td>
          </tr>
          <tr>
            <td>Tirzepatide</td>
            <td>Low (lipidated)</td>
            <td>Available pre-reconstituted</td>
            <td>Same compound class as Retatrutide. Lipidation sharply limits aqueous solubility from dry powder. Available as a pre-reconstituted pen vial.</td>
          </tr>
        </tbody>
      </table>`,
    },
    {
      id: 'practical-tips',
      heading: 'Practical Reconstitution Considerations for Researchers',
      html: `      <p>Several laboratory practices produce better reconstitution outcomes regardless of the specific compound:</p>
      <ul>
        <li><strong>Bring the vial to room temperature first.</strong> Introducing solvent into a cold vial can cause localised condensation and uneven wetting of the powder. Allow sealed vials to equilibrate to ambient temperature before opening.</li>
        <li><strong>Introduce solvent slowly and down the vial wall.</strong> Direct the stream down the inside wall of the vial rather than onto the powder directly. This wets the powder gradually from beneath and prevents clumping on the glass surface.</li>
        <li><strong>Swirl — do not shake.</strong> Vigorous shaking introduces air bubbles and can cause some peptides — particularly those prone to aggregation — to form foam or partially precipitate. Gentle swirling is sufficient for most compounds.</li>
        <li><strong>Allow adequate time.</strong> Some compounds need several minutes to dissolve fully. If the solution appears slightly hazy after initial mixing, continue swirling or set the vial aside at room temperature for a few minutes before rechecking.</li>
        <li><strong>Gentle warming as a secondary option.</strong> For compounds with moderate solubility, warming the solvent to 35–37°C before addition can assist dissolution. Do not overheat, as sustained elevated temperatures degrade peptide bonds over time.</li>
        <li><strong>Confirm full dissolution visually.</strong> A clear solution indicates complete dissolution. A translucent or milky appearance, visible particles, or a film on the glass wall indicate incomplete dissolution or aggregation — do not assume turbid solutions are ready for use.</li>
        <li><strong>Label every vial.</strong> Record the compound name, solvent, concentration, and preparation date on each vial. Our <a href="/blog/how-to-reconstitute-peptides.html">reconstitution guide</a> covers the full procedure and concentration arithmetic in detail, and our <a href="/blog/how-to-store-peptides.html">storage guide</a> covers post-reconstitution conditions.</li>
      </ul>
      <p>For compounds where aqueous solubility is insufficient at the required concentration, consult the supplier documentation or the published literature for validated reconstitution protocols specific to that compound and assay system. Each compound in the North Peptides UK range is supplied strictly as a reference research material and is not for human or animal use.</p>`,
    },
  ],

  faqs: [
    { q: 'What does peptide solubility mean in a research context?',
      a: 'Solubility describes how readily a peptide dissolves in a given solvent at a given concentration. In practice it determines which solvents to use, the maximum achievable working concentrations, and whether the prepared solution is suitable for the assay or research model in use.' },
    { q: 'Is bacteriostatic water the right solvent for all peptides?',
      a: 'For most aqueous-soluble research peptides — including BPC-157, GHK-Cu, TB-500, KPV, Ipamorelin, CJC-1295, Semax, Selank, Epitalon and NAD+ — bacteriostatic water is the standard first choice. Lipidated peptides such as Retatrutide and Tirzepatide require specialist reconstitution conditions and are generally supplied pre-reconstituted.' },
    { q: 'What should I do if a peptide does not dissolve easily?',
      a: 'Try gentle warming of the solvent (to ~35–37°C) before addition, extend swirling time, or use dilute acetic acid (0.1%) as the primary solvent before diluting into bacteriostatic water or buffer. Always confirm dissolution visually by checking for a clear, particle-free solution before use.' },
    { q: 'Can reconstituted peptide solutions be used in humans?',
      a: 'No. All research peptides supplied by North Peptides UK are for laboratory and scientific research only. They are not for human or animal consumption, regardless of whether they are in lyophilised or reconstituted form.' },
  ],
};
