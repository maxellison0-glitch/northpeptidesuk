'use strict';
module.exports = {
  slug: 'how-peptide-purity-is-verified-hplc',
  metaTitle: 'How Peptide Purity Is Verified: HPLC Explained',
  title: 'How Peptide Purity Is Verified: HPLC Explained',
  htmlTitle: 'How Peptide Purity Is Verified<br><em>HPLC Explained</em>',
  description: 'How reversed-phase HPLC measures peptide purity - gradient, retention time, peak-area purity - and what a 99% result does and does not tell a laboratory buyer.',
  keyword: 'peptide purity hplc',
  category: 'Analytical Guide',
  datePublished: '2026-09-05',
  dateModified: '2026-09-05',
  cardSummary: 'Reversed-phase HPLC from first principles - stationary phase, gradient, retention, peak-area purity - and the limits of a purity figure. Written for laboratory buyers.',
  intro: 'Almost every research peptide is sold with a purity figure, and almost every purity figure comes from the same technique: reversed-phase high-performance liquid chromatography. This guide explains how RP-HPLC separates a peptide from its impurities, how the percentage is calculated, what the method cannot see, and why the laboratory running it should be independent of the seller.',
  relatedProducts: ['retatrutide', 'ghk-cu', 'klow-stack', 'syringe-kit'],
  popularProducts: ['retatrutide', 'ghk-cu', 'bpc-157', 'klow-stack'],

  sections: [
    {
      id: 'what-hplc-is',
      heading: 'What HPLC Is',
      html: `      <p>High-performance liquid chromatography (HPLC) is a separation technique. A small volume of dissolved sample is pushed at high pressure through a narrow steel column packed with fine particles. Different molecules in the sample interact with those particles to different degrees, so they travel through the column at different speeds and come out - <em>elute</em> - at different times. A detector at the column outlet records what comes out and when, producing a trace called a chromatogram.</p>
      <p>For peptides the standard variant is <strong>reversed-phase</strong> HPLC (RP-HPLC). It is the method used in both independent reports we publish for <a href="/products/ghk-cu/">GHK-Cu</a> and <a href="/products/retatrutide/">Retatrutide</a>, and it is the method behind virtually every peptide purity figure you will see on a certificate of analysis.</p>`,
    },
    {
      id: 'reversed-phase-separation',
      heading: 'How Reversed-Phase Separation Works',
      html: `      <p>"Reversed-phase" describes the pairing of a non-polar stationary phase with a polar mobile phase. The column packing is silica coated with hydrocarbon chains: C18 (octadecyl) is the most common, and C8 (octyl) is a shorter-chain alternative often preferred for larger or more hydrophobic peptides. The BioBasic 8 column named on our reports is a C8 column from Thermo Scientific.</p>
      <p>The mobile phase is a mixture of water and an organic solvent, almost always acetonitrile, with a small amount of acid. The 0.1% trifluoroacetic acid (TFA) named on the reports does two jobs: it keeps the peptide protonated and its peaks sharp, and it pairs with the peptide's positive charges so the molecule interacts with the hydrocarbon chains in a consistent way.</p>
      <p>When the sample is injected in a mostly aqueous mobile phase, the peptide sticks to the hydrophobic stationary phase. The more hydrophobic a molecule is, the more strongly it is retained. Impurities - truncated sequences missing a residue, deletion products, oxidised forms, incompletely deprotected material from synthesis - differ in hydrophobicity from the target peptide, so they are retained to a different degree.</p>`,
    },
    {
      id: 'gradient-and-retention',
      heading: 'The Gradient and Retention Time',
      html: `      <p>If the mobile phase composition were held constant, strongly retained peptides would take a very long time to elute and their peaks would spread. Instead the run uses a <strong>gradient</strong>: the proportion of acetonitrile is increased steadily over the run, typically from a few percent to somewhere over half. As the mobile phase becomes more organic, molecules are progressively released from the stationary phase in order of increasing hydrophobicity. Our reports specify a linear water/acetonitrile gradient.</p>
      <p>The time at which a given molecule elutes is its <strong>retention time</strong>. Under fixed conditions - same column, same gradient, same flow rate, same temperature - retention time is reproducible. The target peptide gives a main peak at a characteristic retention time; anything eluting earlier or later is something else.</p>
      <table class="compare-table">
        <tr><th>Parameter</th><th>On our reports</th><th>Why it matters</th></tr>
        <tr><td>Stationary phase</td><td>BioBasic 8 (C8), Thermo Scientific</td><td>Determines how strongly the peptide and its impurities are retained.</td></tr>
        <tr><td>Mobile phase</td><td>Water / acetonitrile with 0.1% TFA</td><td>Controls elution and peak shape.</td></tr>
        <tr><td>Elution mode</td><td>Linear gradient</td><td>Releases components in order of hydrophobicity with sharp peaks.</td></tr>
        <tr><td>Injection volume</td><td>3µl</td><td>Small enough to avoid overloading the column and distorting peaks.</td></tr>
      </table>`,
    },
    {
      id: 'peak-area-purity',
      heading: 'How the Purity Percentage Is Calculated',
      html: `      <p>Peptides are detected by ultraviolet absorbance. The peptide backbone absorbs strongly at short wavelengths (around 210–220nm), so a UV detector set there responds to essentially every peptide-like species in the sample. Each component produces a peak in the chromatogram, and the area under each peak is proportional to how much of that component passed the detector.</p>
      <p>Peak-area purity is then a straightforward ratio:</p>
      <div class="callout callout-dark">
        <div class="callout-title">Peak-area purity</div>
        <p>Purity (%) = area of the main peptide peak ÷ total area of all peaks × 100</p>
      </div>
      <p>A result of 99% means that 99% of the UV-absorbing material that eluted during the run was the main peak. The remaining 1% is spread across minor peaks - usually closely related sequences from synthesis. This is the figure reported on both of our certificates: 99% for the GHK-Cu sample (report 100016393) and 99% for the Retatrutide sample (report 100016392).</p>
      <p>Two details worth knowing. First, peak-area purity assumes impurities absorb UV about as strongly as the main peptide, which is a reasonable assumption for sequence-related impurities but not for everything. Second, the figure is only as good as the separation: a poorly resolved run can hide an impurity under the main peak. A well-specified method with a named column and gradient, as on our reports, is the buyer's assurance that the separation was real.</p>`,
    },
    {
      id: 'content-quantitation',
      heading: 'Purity Is Not the Same as Content',
      html: `      <p>The purity percentage describes the peptide material relative to itself. It does not tell you how many milligrams are in the vial, because a lyophilised powder also contains water, counter-ions (TFA salts from purification) and sometimes a bulking agent, none of which show up as peptide peaks. A vial at 99% peptide purity might carry a net peptide content anywhere from about 70% to 90% of its gross weight.</p>
      <p>That is why a complete certificate reports <strong>content</strong> as a separate figure. Quantitation compares the sample's main-peak response against a calibrated reference of known concentration, or uses a validated mass-based method, and gives the result as an absolute mass with a stated uncertainty. On our reports the GHK-Cu vial measured 54.75mg against a 50mg label claim and the Retatrutide vial 16.49mg against 15mg, each with a stated error of ±0.05mg. Our <a href="/blog/how-to-read-a-certificate-of-analysis.html">guide to reading a certificate of analysis</a> goes through those fields line by line.</p>`,
    },
    {
      id: 'what-hplc-does-not-measure',
      heading: 'What HPLC Does Not Measure',
      html: `      <p>RP-HPLC is the right tool for purity, but a purity figure is one line of evidence, not a full characterisation. It does not establish:</p>
      <ul>
        <li><strong>Identity.</strong> A single clean peak shows the sample is homogeneous; it does not prove the peak is the intended sequence. Confirming molecular mass needs mass spectrometry (LC-MS or MALDI-TOF), and confirming sequence needs MS/MS or amino-acid analysis.</li>
        <li><strong>Endotoxin.</strong> Bacterial endotoxin is not a peptide and is invisible to a UV chromatogram. It is measured separately by a LAL or recombinant factor C assay.</li>
        <li><strong>Sterility.</strong> HPLC says nothing about microbial contamination. Sterility is a distinct microbiological test.</li>
        <li><strong>Biological activity.</strong> A peptide can be 99% pure and inactive if it is misfolded, aggregated or has been degraded in a way that does not change its retention time. Activity is measured in a functional assay.</li>
        <li><strong>Water, salt and counter-ion content.</strong> These determine net peptide content and are measured by Karl Fischer titration, ion chromatography or elemental analysis.</li>
      </ul>
      <p>A supplier claiming that a single HPLC report proves identity, sterility and activity is overstating it. What the report proves is that the sample was pure and full to the stated mass, which is exactly the claim a research supplier should be making.</p>`,
    },
    {
      id: 'why-independent-labs-matter',
      heading: 'Why Independent Laboratories Matter',
      html: `      <p>A manufacturer's own COA is generated by the party with the strongest interest in a good result, on a bulk batch that may have been portioned, shipped and stored many times before it reached a vial. An independent report from a laboratory with no commercial link to the seller, run on a sealed retail vial, tests the actual product a customer receives, by a lab whose only incentive is to report what it found.</p>
      <p>Three things make an independent report worth more than the paper it is printed on:</p>
      <ul>
        <li><strong>The lab is named and findable.</strong> Analiza Białek sp. z o.o. in Wrocław publishes its address and services, so anyone can confirm the report exists.</li>
        <li><strong>The sample is traceable.</strong> The report names the seller and the product as received ("NORTH PEPTIDES UK GHK-CU 50MG"), with receipt and test dates, an order number and a report code.</li>
        <li><strong>The document is published whole.</strong> We publish the full report images, including the lab's own vial photographs, rather than a purity figure lifted from them.</li>
      </ul>
      <p>Independent testing costs money and takes time. We currently hold independent reports for GHK-Cu (which also covers the GHK-Cu component of <a href="/products/klow-stack/">KLOW Stack</a>) and Retatrutide, with supplier batch details available on request for the rest of the range. The full documentation status of every product is on the <a href="/lab-reports.html">lab reports</a> page. All products are supplied for laboratory research use only and are not for human or animal consumption.</p>`,
    },
  ],

  faqs: [
    { q: 'What does 99% purity by HPLC actually mean?',
      a: 'That 99% of the total peak area in the reversed-phase HPLC chromatogram belonged to the main peptide peak, with the remaining 1% spread across minor peaks, usually sequence-related impurities from synthesis. It is a measure of the peptide material relative to itself, not of how many milligrams are in the vial.' },
    { q: 'Why is reversed-phase HPLC used for peptides?',
      a: 'Peptides and their synthesis impurities differ in hydrophobicity, and reversed-phase chromatography separates on exactly that property. A C8 or C18 column with a water/acetonitrile gradient and 0.1% TFA resolves the target peptide from truncated, deletion and oxidised variants with sharp, reproducible peaks.' },
    { q: 'Does an HPLC report confirm the peptide is the right one?',
      a: 'Not on its own. HPLC shows the sample is homogeneous and how pure it is. Confirming molecular mass and sequence requires mass spectrometry. Endotoxin, sterility and biological activity are also separate tests that an HPLC report does not cover.' },
    { q: 'Which North Peptides UK products have independent HPLC reports?',
      a: 'GHK-Cu (report 100016393, 99% purity, 54.75mg measured against a 50mg label) and Retatrutide (report 100016392, 99% purity, 16.49mg against 15mg), both by Analiza Białek sp. z o.o. in Wrocław. The GHK-Cu report also covers the GHK-Cu component of the KLOW Stack. Supplier batch details are available on request for the rest of the range.' },
  ],
};
