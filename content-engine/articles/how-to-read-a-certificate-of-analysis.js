'use strict';
module.exports = {
  slug: 'how-to-read-a-certificate-of-analysis',
  metaTitle: 'How to Read a Peptide Certificate of Analysis (COA)',
  title: 'How to Read a Peptide Certificate of Analysis (COA)',
  htmlTitle: 'How to Read a Peptide<br><em>Certificate of Analysis (COA)</em>',
  description: 'Field-by-field guide to a peptide COA - sample name, method, purity %, measured content vs label claim, error and report code - using two published reports.',
  keyword: 'peptide certificate of analysis',
  category: "Buyer's Guide",
  datePublished: '2026-09-05',
  dateModified: '2026-09-05',
  cardSummary: 'What each field on a peptide COA means and how to check one, worked through on the two independent reports North Peptides UK publishes for GHK-Cu and Retatrutide.',
  intro: 'A certificate of analysis is the document that turns a purity figure from a claim into evidence. Most buyers glance at the percentage and stop there. This guide walks through every field on a real peptide COA - what it means, what it does not mean, and how to check it - using the two independent reports we publish for GHK-Cu and Retatrutide as worked examples.',
  relatedProducts: ['ghk-cu', 'retatrutide', 'klow-stack', 'bacteriostatic-water'],
  popularProducts: ['retatrutide', 'ghk-cu', 'bpc-157', 'klow-stack'],

  sections: [
    {
      id: 'what-a-coa-is',
      heading: 'What a Certificate of Analysis Is',
      html: `      <p>A certificate of analysis (COA) is a report issued by a laboratory that has tested a specific sample. It records what the sample was, which method was used, what was measured, and the result. For a research peptide the two figures that matter most are <strong>purity</strong> - how much of the material in the vial is the intended peptide - and <strong>content</strong> - how many milligrams are actually in the vial.</p>
      <p>There are two kinds of COA and the difference matters:</p>
      <ul>
        <li><strong>Supplier or manufacturer COA</strong> - issued by the company that made the peptide, usually on a bulk batch before it is portioned into vials. Useful, but the party issuing it is also the party selling it.</li>
        <li><strong>Independent third-party COA</strong> - issued by an unrelated analytical laboratory that received a sealed retail vial and tested it. This is the stronger document because the lab has no stake in the result and the sample is the same thing a customer receives.</li>
      </ul>
      <p>Both reports discussed below are independent third-party COAs: sealed vials from UK stock were sent to Analiza Białek sp. z o.o., an analytical laboratory in Wrocław, Poland, which tested them and issued its own reports. We publish them in full on the <a href="/lab-reports.html">lab reports</a> page.</p>`,
    },
    {
      id: 'the-fields',
      heading: 'The Fields on a Peptide COA, Explained',
      html: `      <p>Layouts vary between laboratories but the content is consistent. Using the GHK-Cu report (order 100016393) as the example:</p>
      <table class="compare-table">
        <tr><th>Field</th><th>Example value</th><th>What it tells you</th></tr>
        <tr><td>Laboratory</td><td>Analiza Białek sp. z o.o., Wrocław</td><td>Who did the testing. Should be a named, contactable laboratory that is not the seller.</td></tr>
        <tr><td>Order number</td><td>100016393</td><td>The lab's reference for the job. Distinct from the report code.</td></tr>
        <tr><td>Sample name</td><td>NORTH PEPTIDES UK GHK-CU 50MG</td><td>How the lab logged the sample. It should match the product and vial size you are buying.</td></tr>
        <tr><td>Sample form</td><td>Blue powder in a glass vial</td><td>A physical description on receipt. GHK-Cu is blue because of the bound copper; a white GHK-Cu sample would be a red flag.</td></tr>
        <tr><td>Method</td><td>RP-HPLC, BioBasic 8 column, water/acetonitrile gradient with 0.1% TFA, 3µl injection</td><td>The analytical technique and its key parameters. Enough detail that another lab could repeat the run.</td></tr>
        <tr><td>Purity</td><td>99%</td><td>The share of the chromatogram's total peak area attributable to the main peptide peak.</td></tr>
        <tr><td>Content</td><td>54.75mg</td><td>The measured mass of peptide in the vial.</td></tr>
        <tr><td>Label claim</td><td>50mg</td><td>What the vial says it contains, for comparison against the measured content.</td></tr>
        <tr><td>Measurement error</td><td>±0.05mg</td><td>The stated uncertainty on the content figure.</td></tr>
        <tr><td>Dates</td><td>Received 20 Jul 2026; tested 28–30 Jul 2026</td><td>When the sample arrived and when the analysis was run. Recent dates matter more than old ones.</td></tr>
        <tr><td>Report code</td><td>1W6J3DY2</td><td>A unique identifier for the issued document, used to confirm it with the lab.</td></tr>
        <tr><td>Analyst</td><td>Named technician</td><td>Who signed off the result. Anonymous reports are weaker.</td></tr>
      </table>`,
    },
    {
      id: 'worked-example-ghk-cu',
      heading: 'Worked Example 1: GHK-Cu, Report 100016393',
      html: `      <p>A sealed 50mg vial of <a href="/products/ghk-cu/">GHK-Cu</a> from UK stock was received by the laboratory on 20 July 2026 and logged as "NORTH PEPTIDES UK GHK-CU 50MG", a blue powder in a glass vial. Analysis ran from 28 to 30 July 2026 by reversed-phase HPLC on a BioBasic 8 column with a linear water/acetonitrile gradient containing 0.1% trifluoroacetic acid, using a 3µl injection.</p>
      <p>The result: <strong>99% purity</strong>, with <strong>54.75mg</strong> of peptide measured in the vial against a <strong>50mg</strong> label claim, at a stated measurement error of ±0.05mg. The report carries the code 1W6J3DY2 and is signed by the analyst.</p>
      <p>Reading it as a buyer: the sample name confirms the product and size, the method is fully specified, the purity is at the level a research-grade peptide should reach, and the vial contained more than its label states rather than less. Because the KLOW Stack uses the same GHK-Cu material, the report also covers the GHK-Cu component of <a href="/products/klow-stack/">KLOW Stack</a>.</p>`,
    },
    {
      id: 'worked-example-retatrutide',
      heading: 'Worked Example 2: Retatrutide, Report 100016392',
      html: `      <p>The <a href="/products/retatrutide/">Retatrutide</a> sample followed the same route: a sealed 15mg vial received on 20 July 2026, logged as "NORTH PEPTIDES UK RETATRUTIDE 15MG", white powder in a glass vial, tested 28–30 July 2026 by the same RP-HPLC method.</p>
      <table class="compare-table">
        <tr><th>Field</th><th>GHK-Cu (100016393)</th><th>Retatrutide (100016392)</th></tr>
        <tr><td>Sample form</td><td>Blue powder, glass vial</td><td>White powder, glass vial</td></tr>
        <tr><td>Method</td><td colspan="2">RP-HPLC, BioBasic 8, H₂O/acetonitrile gradient + 0.1% TFA, 3µl injection</td></tr>
        <tr><td>Purity</td><td>99%</td><td>99%</td></tr>
        <tr><td>Measured content</td><td>54.75mg</td><td>16.49mg</td></tr>
        <tr><td>Label claim</td><td>50mg</td><td>15mg</td></tr>
        <tr><td>Measurement error</td><td>±0.05mg</td><td>±0.05mg</td></tr>
        <tr><td>Report code</td><td>1W6J3DY2</td><td>2W78KU6M</td></tr>
        <tr><td>Tested</td><td>28–30 Jul 2026</td><td>28–30 Jul 2026</td></tr>
      </table>
      <p>Both vials were analysed in the same window by the same method, which makes the two reports directly comparable. All Retatrutide vial sizes are filled from the same material, so the 15mg result speaks to the batch rather than to one vial size only.</p>`,
    },
    {
      id: 'content-vs-label',
      heading: 'Measured Content vs Label Claim',
      html: `      <p>Purity and content are different measurements and a good COA reports both. Purity tells you what fraction of the peptide material is the right molecule; content tells you how much peptide is physically in the vial. A vial can be 99% pure and still be under-filled, and a full vial can be poorly purified.</p>
      <p>Both of our reports show measured content above the label claim - 54.75mg against 50mg, and 16.49mg against 15mg. Vial filling for lyophilised peptides is done by mass and typically targets slightly above the label figure so that the stated amount is always present. For a laboratory the practical point is that the label is a minimum, and the COA gives the actual figure to work from when preparing a solution of known concentration.</p>
      <p>The measurement error (±0.05mg on both reports) is the lab's stated uncertainty on the content figure. It is small relative to the measured mass, which is what you want to see. An error bar of several milligrams on a 15mg vial would make the content figure close to meaningless.</p>`,
    },
    {
      id: 'how-to-check',
      heading: 'How to Check a COA Before You Trust It',
      html: `      <ul>
        <li><strong>Is the laboratory real and independent?</strong> Search for it. Analiza Białek publishes its address and services at analizabialek.com. A COA from a lab that cannot be found, or that shares an address with the seller, is worth little.</li>
        <li><strong>Does the sample name match the product?</strong> The report should name the seller and the product as received. A generic "peptide sample" report could belong to anything.</li>
        <li><strong>Is the method stated?</strong> "HPLC" alone is not enough. Column, mobile phase and injection volume show a real run was performed.</li>
        <li><strong>Is there a report code and an analyst?</strong> Both allow the document to be confirmed with the lab.</li>
        <li><strong>Are the dates recent and consistent?</strong> Received before tested, tested before published.</li>
        <li><strong>Is the document published in full?</strong> Cropped screenshots that omit the header, dates or code are a warning sign. We publish the full report images, including the lab's own vial photographs.</li>
        <li><strong>Is there also a content figure?</strong> Purity alone leaves the fill weight unverified.</li>
      </ul>
      <div class="callout callout-green">
        <div class="callout-title">A report covers one sample</div>
        <p>A COA is evidence about the batch the sample came from. It is not a guarantee about every batch a supplier will ever sell, which is why the date matters and why a supplier should keep testing as stock turns over.</p>
      </div>`,
    },
    {
      id: 'what-it-does-not-tell-you',
      heading: 'What a COA Does Not Tell You',
      html: `      <p>An HPLC-based COA answers two questions: how pure is the peptide, and how much is there. It does not on its own confirm the peptide's identity by mass (that needs mass spectrometry), it does not test for endotoxin or sterility, and it says nothing about biological activity. Those are separate assays with separate reports. Our guide to <a href="/blog/how-peptide-purity-is-verified-hplc.html">how peptide purity is verified by HPLC</a> covers what the method measures and what it leaves out.</p>
      <p>For the current documentation status of every product we stock - published report, or supplier batch details on request - see the <a href="/lab-reports.html">lab reports</a> page. All products are supplied for research use only and are not for human or animal consumption.</p>`,
    },
  ],

  faqs: [
    { q: 'What is the difference between purity and content on a COA?',
      a: 'Purity is the share of the chromatogram peak area that belongs to the intended peptide, expressed as a percentage. Content is the measured mass of peptide in the vial. A good COA reports both, because a vial can be pure but under-filled or full but poorly purified.' },
    { q: 'Why is the measured content higher than the label claim?',
      a: 'Lyophilised peptide vials are filled by mass and typically target slightly above the label figure so that the stated amount is always present. Our reports show 54.75mg against a 50mg GHK-Cu label and 16.49mg against a 15mg Retatrutide label.' },
    { q: 'What is the report code for?',
      a: 'It is the unique identifier the laboratory assigns to the issued document. Our GHK-Cu report is 1W6J3DY2 and the Retatrutide report is 2W78KU6M. A code, together with the order number and analyst, lets the document be confirmed with the lab.' },
    { q: 'Does a COA cover every vial a supplier sells?',
      a: 'No. A COA is evidence about the sample tested and the batch it came from. That is why the sample name, dates and vial size on the report matter, and why suppliers should re-test as stock turns over.' },
  ],
};
