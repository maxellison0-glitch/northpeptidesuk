'use strict';
module.exports = {
  slug: 'bacteriostatic-water-vs-sterile-water',
  metaTitle: 'Bacteriostatic Water vs Sterile Water for Peptides',
  title: 'Bacteriostatic Water vs Sterile Water for Peptides',
  htmlTitle: 'Bacteriostatic Water vs Sterile Water<br><em>For Research Peptides</em>',
  description: 'The difference between bacteriostatic and sterile water for reconstituting research peptides — the preservative, shelf life, and which to use. Research use only.',
  keyword: 'bacteriostatic water vs sterile water',
  category: 'Handling & Preparation',
  datePublished: '2026-06-26',
  dateModified: '2026-06-26',
  cardSummary: 'The real difference between bacteriostatic and sterile water for peptide reconstitution, and which solvent to use for research preparation.',
  intro: 'When reconstituting lyophilised research peptides, the solvent you choose matters. Bacteriostatic water and sterile water look identical but behave very differently once a vial is opened. This guide explains the difference and which to use for laboratory research preparation.',
  relatedProducts: ['bacteriostatic-water', 'syringe-kit', 'alcohol-wipes'],

  sections: [
    {
      id: 'the-difference',
      heading: 'The Key Difference',
      html: `      <p>Both are purified water suitable for laboratory preparation. The single difference is a preservative:</p>
      <ul>
        <li><strong>Sterile water</strong> contains nothing but water. It is sterile at the moment the vial is sealed, but it has no preservative, so once opened there is nothing to suppress microbial growth.</li>
        <li><strong>Bacteriostatic water (BAC water)</strong> contains 0.9% benzyl alcohol. Benzyl alcohol is bacteriostatic — it suppresses the growth of bacteria — which lets the same vial be drawn from repeatedly over a period of days without the solution spoiling.</li>
      </ul>
      <table class="compare-table">
        <thead><tr><th>Attribute</th><th>Bacteriostatic Water</th><th>Sterile Water</th></tr></thead>
        <tbody>
          <tr><td>Preservative</td><td>0.9% benzyl alcohol</td><td>None</td></tr>
          <tr><td>Multi-draw use</td><td>Suitable</td><td>Not suitable</td></tr>
          <tr><td>Solution shelf life</td><td>Up to ~28 days refrigerated</td><td>About 24 hours</td></tr>
          <tr><td>Typical research use</td><td>Standard solvent for reconstitution</td><td>Single-use preparation only</td></tr>
        </tbody>
      </table>`,
    },
    {
      id: 'why-bac',
      heading: 'Why BAC Water Is the Standard for Reconstitution',
      html: `      <p>Most research peptides are supplied in vials that yield more material than a single preparation uses. That means the reconstituted solution needs to remain stable while it is drawn from over several days. Sterile water cannot support this — without a preservative, a reconstituted solution made with sterile water degrades within about 24 hours.</p>
      <p>Bacteriostatic water solves this. The benzyl alcohol keeps the solution viable for up to roughly 28 days when refrigerated, which is why it is the default solvent for peptide reconstitution in research settings.</p>
      <div class="callout callout-green">
        <div class="callout-title">Rule of Thumb</div>
        <p>If a reconstituted vial will be drawn from more than once, use bacteriostatic water. Sterile water is only appropriate where the entire preparation is used in one go.</p>
      </div>`,
    },
    {
      id: 'when-sterile',
      heading: 'When Sterile Water Is Used',
      html: `      <p>Sterile water still has a place. It is used where a preparation is made and consumed in a single step, or where a protocol specifically requires a solvent with no benzyl alcohol — for example, when benzyl alcohol could interfere with a particular assay. For general multi-day reconstitution, though, bacteriostatic water is the practical choice.</p>`,
    },
    {
      id: 'how-to-use',
      heading: 'How to Use It',
      html: `      <p>The technique is the same regardless of solvent. Clean both vial tops with an <a href="/products/alcohol-wipes/">alcohol wipe</a>, draw the chosen volume of <a href="/products/bacteriostatic-water/">bacteriostatic water</a> with a sterile <a href="/products/syringe-kit/">needle</a>, and add it slowly down the inside wall of the peptide vial rather than directly onto the powder. Swirl gently until dissolved. Our <a href="/blog/how-to-reconstitute-peptides.html">reconstitution guide</a> walks through the full process and the concentration arithmetic.</p>`,
    },
    {
      id: 'common-mistakes',
      heading: 'Common Mistakes',
      html: `      <ul>
        <li><strong>Using sterile water for a multi-draw vial</strong> — the solution will spoil within a day. Use bacteriostatic water for anything drawn from over time.</li>
        <li><strong>Leaving BAC water unrefrigerated after reconstitution</strong> — a prepared solution should be kept at 2–8°C, even with the preservative present.</li>
        <li><strong>Assuming "sterile" means "long-lasting"</strong> — sterility at sealing says nothing about how long an opened, reconstituted solution stays usable. The preservative is what extends shelf life.</li>
      </ul>`,
    },
  ],

  faqs: [
    { q: 'What is the difference between bacteriostatic and sterile water?',
      a: 'Bacteriostatic water contains 0.9% benzyl alcohol, a preservative that suppresses bacterial growth so a vial can be drawn from over several days. Sterile water has no preservative and is only suitable for single-use preparation.' },
    { q: 'Which water should I use to reconstitute research peptides?',
      a: 'For most reconstitution, bacteriostatic water — it keeps a prepared solution stable for up to about 28 days refrigerated. Sterile water is only appropriate when the whole preparation is used at once.' },
    { q: 'How long does a solution made with bacteriostatic water last?',
      a: 'Up to roughly 28 days when refrigerated at 2–8°C and kept out of direct light. A solution made with plain sterile water lasts only about 24 hours.' },
  ],
};
