// ---------------------------------------------------------------------------
// INDEPENDENT LABORATORY REPORTS
//
// One entry per third-party report we hold. Products reference these by object
// so a single report can be surfaced on every page it legitimately applies to
// (e.g. the GHK-Cu report covers the standard vial, the pen vial, and the
// GHK-Cu component of the KLOW Stack).
//
// Only add an entry here once the signed report is in hand.
// ---------------------------------------------------------------------------
const COA_REPORTS = {
  "ghk-cu-100016393": {
    id: "ghk-cu-100016393",
    compound: "GHK-Cu",
    lab: "Analiza Białek sp. z o.o.",
    labLocation: "Wrocław, Poland",
    labUrl: "https://www.analizabialek.com",
    orderNumber: "100016393",
    sampleName: "NORTH PEPTIDES UK GHK-CU 50MG",
    sampleForm: "Blue powder in a glass vial",
    purity: "99%",
    content: "54.75mg",
    labelClaim: "50mg",
    measurementError: "±0.05mg",
    method: "RP-HPLC — BioBasic 8 (Thermo Scientific) column, linear H₂O / acetonitrile gradient with 0.1% trifluoroacetic acid, 3µl injection",
    receivedDate: "2026-07-20",
    testStartDate: "2026-07-28",
    testEndDate: "2026-07-30",
    reportCode: "1W6J3DY2",
    technician: "mgr Arkadiusz Zając",
    page: "/coa-ghk-cu-100016393-report.png",
    images: [
      { src: "coa-ghk-cu-100016393-report.png", label: "Certificate of analysis — results & sample photo" }
    ]
  },
  "retatrutide-100016392": {
    id: "retatrutide-100016392",
    compound: "Retatrutide",
    lab: "Analiza Białek sp. z o.o.",
    labLocation: "Wrocław, Poland",
    labUrl: "https://www.analizabialek.com",
    orderNumber: "100016392",
    sampleName: "NORTH PEPTIDES UK RETATRUTIDE 15MG",
    sampleForm: "White powder in a glass vial",
    purity: "99%",
    content: "16.49mg",
    labelClaim: "15mg",
    measurementError: "±0.05mg",
    method: "RP-HPLC — BioBasic 8 (Thermo Scientific) column, linear H₂O / acetonitrile gradient with 0.1% trifluoroacetic acid, 3µl injection",
    receivedDate: "2026-07-20",
    testStartDate: "2026-07-28",
    testEndDate: "2026-07-30",
    reportCode: "2W78KU6M",
    technician: "mgr Arkadiusz Zając",
    page: "/coa-retatrutide-100016392-report.png",
    images: [
      { src: "coa-retatrutide-100016392-report.png", label: "Certificate of analysis — results & sample photo" }
    ]
  }
};

const PRODUCT_DATA = {
  retatrutide: {
    name: "Retatrutide",
    category: "Metabolic research",
    image: "reta-50mg.png",
    coa: COA_REPORTS["retatrutide-100016392"],
    penAddon: true,
    sisterProduct: { slug: "retatrutide-pen", label: "Also available as", name: "Retatrutide Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy Retatrutide UK | 10mg, 15mg, 20mg Research Peptide | North Peptides UK",
      metaDescription: "Retatrutide research compound, UK stocked. 10mg, 15mg & 20mg lyophilised vials, independently tested at 99% purity by HPLC. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is Retatrutide supplied as?", a: "A lyophilised powder in a sealed vial, stored frozen until dispatch. A sample from our UK stock was submitted to an independent analytical laboratory and returned 99% purity by HPLC. The full report is published on our documentation page." },
        { q: "Has this Retatrutide been independently tested?", a: "Yes. A sealed 15mg vial was sent to Analiza Białek sp. z o.o., an independent analytical laboratory in Wrocław, Poland. HPLC analysis returned 99% purity, with vial content measured at 16.49mg against a 15mg label claim. The full certificate of analysis is published on the site." },
        { q: "What receptors does Retatrutide act on?", a: "It is described in the research literature as a triple receptor agonist with reported activity at the GLP-1, GIP and glucagon receptors. It is supplied only as a reference material for that research." },
        { q: "Do you stock Retatrutide in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is Retatrutide for research use only?", a: "Yes. It is supplied strictly for laboratory and scientific research and is not for human or animal consumption." }
      ]
    },
    summary: "GLP-1, GIP and glucagon receptor triple-agonist research compound supplied as a lyophilised powder.",
    longDescription: [
      "Retatrutide is a synthetic, lipidated single-chain peptide engineered as a triple receptor agonist, with activity reported in the literature at the GLP-1, GIP and glucagon receptors. It is one of the most closely followed compounds in current metabolic-research literature and is supplied here as a lyophilised powder for laboratory use.",
      "As a research compound it is studied in vitro and in preclinical models for its receptor-binding behaviour and downstream signalling across all three targets. North Peptides UK supplies it strictly as a reference material for that research; it is not a medicine and is not for human or animal consumption."
    ],
    researchAreas: [
      "Binding and signalling activity at the GLP-1, GIP and glucagon receptors, studied in vitro",
      "Comparative receptor pharmacology against single- and dual-agonist reference peptides",
      "Stability, solubility and handling characteristics of lipidated peptides in laboratory preparations",
      "Use as a reference standard in analytical method development"
    ],
    specs: [
      ["Compound type", "GLP-1 / GIP / glucagon triple receptor agonist"],
      ["Structure", "39-residue lipidated peptide"],
      ["Molecular formula", "C221H342N46O68"],
      ["Molecular weight", "~4731 g/mol"],
      ["CAS number", "2381089-83-2"],
      ["Synonyms", "LY3437943"],
      ["Purity", "99% — independently verified by HPLC (report 100016392)"],
      ["Measured content", "16.49mg against a 15mg label claim"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "99% purity — independently verified by HPLC",
      "Measured at 16.49mg against a 15mg label claim",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Full lab report published on site"
    ],
    variants: [
      { label: "1x10mg", dose: "10mg", price: 45 },
      { label: "1x15mg", dose: "15mg", price: 65 },
      { label: "1x20mg", dose: "20mg", price: 85 },
      { label: "1x50mg", dose: "50mg", price: 179.99 }
    ],
  },
  "retatrutide-pen": {
    name: "Retatrutide Pen Vial",
    category: "Metabolic research",
    image: "reta-pen-vial.png",
    coa: COA_REPORTS["retatrutide-100016392"],
    penAddon: true,
    sisterProduct: { slug: "retatrutide", label: "Also available as", name: "Retatrutide Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy Retatrutide Pen Vial UK | Pre-Reconstituted 10mg, 20mg, 50mg | North Peptides UK",
      metaDescription: "Retatrutide pre-reconstituted liquid pen vial. 10mg, 20mg & 50mg sizes. Independently tested at 99% purity by HPLC. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the Retatrutide Pen Vial?", a: "The same Retatrutide GLP-1/GIP/glucagon triple-agonist research compound, supplied pre-reconstituted as a liquid in a pen-compatible vial." },
        { q: "Has this Retatrutide been independently tested?", a: "Yes. A Retatrutide sample from our UK stock was sent to Analiza Białek sp. z o.o., an independent analytical laboratory in Wrocław, Poland. HPLC analysis returned 99% purity. The full certificate of analysis is published on the site. The report was carried out on the lyophilised material used to prepare this pen vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a frozen powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "What sizes are available?", a: "10mg, 20mg and 50mg pen vials are available. Select your size using the dropdown before adding to basket." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "Retatrutide triple-agonist research compound pre-reconstituted as a liquid in a pen-compatible vial. Available in 10mg, 20mg and 50mg.",
    longDescription: [
      "Retatrutide Pen Vial contains the same synthetic lipidated triple-agonist research compound as our standard frozen vial, supplied pre-reconstituted in a pen-compatible cartridge format.",
      "Available in 10mg, 20mg and 50mg sizes. Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "Binding and signalling activity at the GLP-1, GIP and glucagon receptors, studied in vitro",
      "Comparative receptor pharmacology against single- and dual-agonist reference peptides",
      "Stability and handling characteristics of lipidated peptides in liquid preparations",
      "Use as a reference standard in analytical method development"
    ],
    specs: [
      ["Compound type", "GLP-1 / GIP / glucagon triple receptor agonist"],
      ["Structure", "39-residue lipidated peptide"],
      ["Molecular formula", "C221H342N46O68"],
      ["Molecular weight", "~4731 g/mol"],
      ["CAS number", "2381089-83-2"],
      ["Synonyms", "LY3437943"],
      ["Purity", "99% — independently verified by HPLC (report 100016392)"],
      ["Form", "Pre-reconstituted liquid"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "99% purity — independently verified by HPLC",
      "Report covers the lyophilised material used to prepare this pen vial",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x10mg", dose: "10mg", price: 60 },
      { label: "1x20mg", dose: "20mg", price: 100 },
      { label: "1x50mg", dose: "50mg", price: 194.99 }
    ],
  },
  tirzepatide: {
    name: "Tirzepatide",
    category: "Metabolic research",
    image: "hf_20260523_171735_79bb55e1-312b-40bf-93f2-59afdd43de09.jpeg",
    penAddon: true,
    sisterProduct: { slug: "tirzepatide-pen", label: "Also available as", name: "Tirzepatide Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy Tirzepatide UK | 15mg & 30mg Research Peptide | North Peptides UK",
      metaDescription: "Tirzepatide research compound, UK stocked. 15mg & 30mg lyophilised vials. Supplier-stated purity. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is Tirzepatide supplied as?", a: "A lyophilised powder in a sealed vial with supplier-stated purity, stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "What receptors does Tirzepatide act on?", a: "It is described in the literature as a dual receptor agonist with reported activity at the GIP and GLP-1 receptors. It is supplied only as a reference material for research." },
        { q: "What purity is your Tirzepatide?", a: "Each listing reflects supplier-stated purity. Supplier documentation available on request where held." },
        { q: "Is Tirzepatide for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    summary: "Dual GIP and GLP-1 receptor agonist research compound supplied as a lyophilised powder.",
    longDescription: [
      "Tirzepatide is a synthetic 39-amino-acid peptide engineered as a dual receptor agonist, with activity reported in the literature at the GIP and GLP-1 receptors. It is among the most studied incretin-class compounds in metabolic-research literature and is supplied as a lyophilised powder for laboratory use.",
      "In a research setting it is examined in vitro and in preclinical models for its dual-receptor binding and signalling profile and as an analytical reference standard. It is provided strictly as a research reference material and is not a medicine, not for human or animal consumption."
    ],
    researchAreas: [
      "Co-agonist binding and signalling at the GIP and GLP-1 receptors, studied in vitro",
      "Comparative pharmacology against GLP-1-only reference peptides",
      "Peptide stability, solubility and handling in laboratory preparations",
      "Use as an analytical reference standard"
    ],
    specs: [
      ["Compound type", "GIP / GLP-1 dual receptor agonist"],
      ["Structure", "39-amino-acid peptide (C-terminal amide)"],
      ["Molecular formula", "C225H348N48O68"],
      ["Molecular weight", "~4814 g/mol"],
      ["CAS number", "2023788-19-2"],
      ["Synonyms", "LY3298176"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x15mg", dose: "15mg", price: 65 },
      { label: "1x30mg", dose: "30mg", price: 120 }
    ],
  },
  "tirzepatide-pen": {
    name: "Tirzepatide Pen Vial",
    category: "Metabolic research",
    image: "tirzepatide-pen-vial.png",
    penAddon: true,
    sisterProduct: { slug: "tirzepatide", label: "Also available as", name: "Tirzepatide Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy Tirzepatide Pen Vial UK | Pre-Reconstituted 15mg, 30mg | North Peptides UK",
      metaDescription: "Tirzepatide dual GIP/GLP-1 agonist pre-reconstituted as a liquid in a pen-compatible vial. 15mg and 30mg sizes. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the Tirzepatide Pen Vial?", a: "The same Tirzepatide dual GIP/GLP-1 receptor agonist research compound, supplied pre-reconstituted as a liquid in a pen-compatible vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a frozen powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "What sizes are available?", a: "15mg and 30mg pen vials are available. Select your size using the dropdown before adding to basket." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "Tirzepatide dual GIP/GLP-1 receptor agonist research compound pre-reconstituted as a liquid in a pen-compatible vial. Available in 15mg and 30mg.",
    longDescription: [
      "Tirzepatide Pen Vial contains the same dual GIP and GLP-1 receptor agonist research compound as our standard frozen vial, supplied pre-reconstituted in a pen-compatible cartridge format.",
      "Available in 15mg and 30mg sizes. Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "Co-agonist binding and signalling at the GIP and GLP-1 receptors, studied in vitro",
      "Comparative pharmacology against GLP-1-only reference peptides",
      "Peptide stability, solubility and handling in laboratory preparations",
      "Use as an analytical reference standard"
    ],
    specs: [
      ["Compound type", "GIP / GLP-1 dual receptor agonist"],
      ["Structure", "39-amino-acid peptide (C-terminal amide)"],
      ["Molecular formula", "C225H348N48O68"],
      ["Molecular weight", "~4814 g/mol"],
      ["CAS number", "2023788-19-2"],
      ["Synonyms", "LY3298176"],
      ["Purity", "Supplier stated"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "supplier-stated purity",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x15mg / 3ml", dose: "15mg / 3ml", price: 80 },
      { label: "1x30mg / 3ml", dose: "30mg / 3ml", price: 144 }
    ],
  },
  "bpc-157": {
    name: "BPC-157",
    category: "Research peptide",
    image: "hf_20260523_171828_c517069f-2388-4215-bec5-f0516a7554b1.jpeg",
    penAddon: true,
    sisterProduct: { slug: "bpc-157-pen", label: "Also available as", name: "BPC-157 Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy BPC-157 UK | 10mg Research Peptide | North Peptides UK",
      metaDescription: "BPC-157 research peptide, UK stocked. 10mg lyophilised vial. Supplier-stated purity. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is BPC-157 supplied as?", a: "A 10mg lyophilised vial with supplier-stated purity and stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "What is BPC-157?", a: "A synthetic pentadecapeptide (15 amino acids) based on a partial sequence of a protein found in gastric juice. It is one of the most frequently referenced peptides in tissue-research literature." },
        { q: "Do you stock BPC-157 in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is BPC-157 for research use only?", a: "Yes. It is supplied strictly for laboratory and scientific research and is not for human or animal consumption." }
      ]
    },
    summary: "Synthetic pentadecapeptide research compound supplied as a 10mg lyophilised vial.",
    longDescription: [
      "BPC-157 is a synthetic pentadecapeptide (15 amino acids, sequence GEPPPGKPADDAGLV) originally derived from a partial sequence of a protein found in gastric juice. It is one of the most frequently referenced peptides in the regenerative- and tissue-research literature and is supplied as a lyophilised powder for laboratory use.",
      "As a research compound it is studied in vitro and in animal models for its role in angiogenesis, cell migration and gastrointestinal and connective-tissue research. It is supplied strictly as a research reference material and is not for human or animal consumption."
    ],
    researchAreas: [
      "Angiogenesis and vascular endothelial signalling, examined in preclinical models",
      "Cell-migration and tissue-repair processes studied across tendon, ligament and gastrointestinal models",
      "Interaction with nitric oxide and dopamine signalling pathways, characterised in published research",
      "Gastrointestinal-mucosa research models"
    ],
    specs: [
      ["Compound type", "Synthetic pentadecapeptide"],
      ["Sequence", "GEPPPGKPADDAGLV"],
      ["Molecular formula", "C62H98N16O22"],
      ["Molecular weight", "~1419.5 g/mol"],
      ["CAS number", "137525-51-0"],
      ["Synonyms", "Body Protection Compound 157, PL-14736"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x10mg", dose: "10mg", price: 23.99 }
    ],
  },
  "bpc-157-pen": {
    name: "BPC-157 Pen Vial",
    category: "Research peptide",
    image: "bpc-157-pen-vial.png",
    penAddon: true,
    sisterProduct: { slug: "bpc-157", label: "Also available as", name: "BPC-157 Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy BPC-157 Pen Vial UK | Pre-Reconstituted 10mg, 20mg | North Peptides UK",
      metaDescription: "BPC-157 pre-reconstituted liquid pen vial. 10mg and 20mg sizes. Prepared in a pen-compatible research cartridge format. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the BPC-157 Pen Vial?", a: "The same BPC-157 synthetic pentadecapeptide research compound, supplied pre-reconstituted as a liquid in a pen-compatible vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a frozen powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "What sizes are available?", a: "10mg and 20mg pen vials are available. Select your size using the dropdown before adding to basket." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "BPC-157 pentadecapeptide research compound pre-reconstituted as a liquid in a pen-compatible vial. Available in 10mg and 20mg.",
    longDescription: [
      "BPC-157 Pen Vial contains the same synthetic pentadecapeptide research compound as our standard frozen vial, supplied pre-reconstituted in a pen-compatible cartridge format.",
      "Available in 10mg and 20mg sizes. Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "Angiogenesis and vascular endothelial signalling, examined in preclinical models",
      "Cell-migration and tissue-repair processes studied across tendon, ligament and gastrointestinal models",
      "Interaction with nitric oxide and dopamine signalling pathways, characterised in published research",
      "Gastrointestinal-mucosa research models"
    ],
    specs: [
      ["Compound type", "Synthetic pentadecapeptide"],
      ["Sequence", "GEPPPGKPADDAGLV"],
      ["Molecular formula", "C62H98N16O22"],
      ["Molecular weight", "~1419.5 g/mol"],
      ["CAS number", "137525-51-0"],
      ["Synonyms", "Body Protection Compound 157, PL-14736"],
      ["Purity", "Supplier stated"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "supplier-stated purity",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x10mg / 3ml", dose: "10mg / 3ml", price: 38.99 },
      { label: "1x20mg / 3ml", dose: "20mg / 3ml", price: 62.98 }
    ],
  },
  "tb-500": {
    name: "TB-500",
    category: "Research peptide",
    image: "hf_20260523_171838_139029e0-0fb2-4778-9db6-5f0470e836ae.jpeg",
    penAddon: true,
    sisterProduct: { slug: "tb-500-pen", label: "Also available as", name: "TB-500 Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy TB-500 UK | 10mg Thymosin Beta-4 Fragment Research Peptide | North Peptides UK",
      metaDescription: "TB-500 (Thymosin Beta-4 fragment) research peptide, UK stocked. 10mg lyophilised vial. Supplier-stated purity. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is TB-500?", a: "The synthetic, N-acetylated heptapeptide fragment Ac-LKKTETQ, corresponding to the actin-binding region of the protein Thymosin Beta-4. It is supplied as a 10mg lyophilised vial with supplier-stated purity." },
        { q: "What is TB-500 supplied as?", a: "A 10mg lyophilised vial with supplier-stated purity and stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "Do you stock TB-500 in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is TB-500 for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    summary: "Thymosin Beta-4 fragment (Ac-LKKTETQ) research compound supplied as a 10mg lyophilised vial.",
    longDescription: [
      "TB-500 is the synthetic, N-acetylated heptapeptide fragment Ac-LKKTETQ, corresponding to the actin-binding region (residues 17-23) of the naturally occurring protein Thymosin Beta-4. It is supplied as a lyophilised powder for laboratory research.",
      "In research settings the fragment is studied in vitro and in animal models for actin regulation, cell migration, angiogenesis and inflammation-related signalling across multiple tissue types. It is supplied as a research reference material only and is not for human or animal consumption."
    ],
    researchAreas: [
      "Actin-binding and actin-sequestering activity, studied in vitro",
      "Cell migration and angiogenesis, examined in preclinical models",
      "Pro-inflammatory cytokine signalling in tissue-research models",
      "Comparative studies alongside other tissue-research peptides"
    ],
    specs: [
      ["Compound type", "Thymosin Beta-4 fragment"],
      ["Sequence", "Ac-Leu-Lys-Lys-Thr-Glu-Thr-Gln-OH"],
      ["Molecular formula", "C38H68N10O14"],
      ["Molecular weight", "~889 g/mol"],
      ["CAS number", "885340-08-9"],
      ["Synonyms", "TB500, Tb4 (17-23)"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x10mg", dose: "10mg", price: 49 }
    ],
  },
  "tb-500-pen": {
    name: "TB-500 Pen Vial",
    category: "Research peptide",
    image: "tb-500-pen-vial.png",
    penAddon: true,
    sisterProduct: { slug: "tb-500", label: "Also available as", name: "TB-500 Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy TB-500 Pen Vial UK | Pre-Reconstituted 10mg/3ml | North Peptides UK",
      metaDescription: "TB-500 Thymosin Beta-4 fragment pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the TB-500 Pen Vial?", a: "The same TB-500 Thymosin Beta-4 fragment research compound, supplied pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a frozen powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "TB-500 Thymosin Beta-4 fragment research compound pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial.",
    longDescription: [
      "TB-500 Pen Vial contains the same synthetic Thymosin Beta-4 fragment (Ac-LKKTETQ) research compound as our standard frozen vial, supplied pre-reconstituted in a pen-compatible cartridge format — 10mg dissolved in 3ml solution.",
      "Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "Actin-binding and actin-sequestering activity, studied in vitro",
      "Cell migration and angiogenesis, examined in preclinical models",
      "Pro-inflammatory cytokine signalling in tissue-research models",
      "Comparative studies alongside other tissue-research peptides"
    ],
    specs: [
      ["Compound type", "Thymosin Beta-4 fragment"],
      ["Sequence", "Ac-Leu-Lys-Lys-Thr-Glu-Thr-Gln-OH"],
      ["Molecular formula", "C38H68N10O14"],
      ["Molecular weight", "~889 g/mol"],
      ["CAS number", "885340-08-9"],
      ["Synonyms", "TB500, Tb4 (17-23)"],
      ["Purity", "Supplier stated"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "supplier-stated purity",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x10mg / 3ml", dose: "10mg / 3ml", price: 64 }
    ],
  },
  "ghk-cu": {
    name: "GHK-Cu",
    category: "Research peptide",
    image: "ghk-cu-blue-powder.webp",
    coa: COA_REPORTS["ghk-cu-100016393"],
    penAddon: true,
    sisterProduct: { slug: "ghk-cu-pen", label: "Also available as", name: "GHK-Cu Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy GHK-Cu UK | 50mg Copper Peptide Research Compound | North Peptides UK",
      metaDescription: "GHK-Cu (copper tripeptide) research compound, UK stocked. 50mg lyophilised vial, independently tested at 99% purity by HPLC. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is GHK-Cu?", a: "The copper(II) complex of the tripeptide glycyl-L-histidyl-L-lysine (Gly-His-Lys), a naturally occurring copper-binding peptide, supplied as a 50mg lyophilised vial for research." },
        { q: "What is GHK-Cu supplied as?", a: "A 50mg lyophilised vial, stored frozen until dispatch. A sample from our UK stock was submitted to an independent analytical laboratory and returned 99% purity by HPLC. The full report is published on our documentation page." },
        { q: "Has this GHK-Cu been independently tested?", a: "Yes. A sample was sent to Analiza Białek sp. z o.o., an independent analytical laboratory in Wrocław, Poland. HPLC analysis returned 99% purity, with vial content measured at 54.75mg against a 50mg label claim. The original certificate of analysis is published on the site and opens at full size." },
        { q: "Do you stock GHK-Cu in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is GHK-Cu for research use only?", a: "Yes. It is supplied strictly for laboratory research, is not a cosmetic, and is not for human or animal consumption." }
      ]
    },
    summary: "Copper(II) tripeptide research compound supplied as a 50mg lyophilised vial.",
    longDescription: [
      "GHK-Cu is the copper(II) complex of the tripeptide glycyl-L-histidyl-L-lysine (Gly-His-Lys), a naturally occurring copper-binding peptide. It is supplied as a lyophilised powder for laboratory use.",
      "As a research compound it is studied in vitro for its copper-binding chemistry and its role in collagen- and extracellular-matrix research. It is supplied strictly as a research reference material; it is not a cosmetic and is not for human or animal consumption."
    ],
    researchAreas: [
      "Copper(II) coordination chemistry of the GHK tripeptide, studied in vitro",
      "Collagen-synthesis and extracellular-matrix research models",
      "Fibroblast and skin-cell research models",
      "Comparative studies of copper-peptide complexes"
    ],
    specs: [
      ["Compound type", "Copper(II) tripeptide complex (Copper Tripeptide-1)"],
      ["Sequence", "Gly-His-Lys (Cu2+-chelated)"],
      ["Molecular formula", "C14H22CuN6O4"],
      ["Molecular weight", "~401.9 g/mol"],
      ["CAS number", "89030-95-5"],
      ["Synonyms", "Copper peptide, prezatide copper"],
      ["Purity", "99% — independently verified by HPLC (report 100016393)"],
      ["Measured content", "54.75mg against a 50mg label claim"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "99% purity — independently verified by HPLC",
      "Measured at 54.75mg against a 50mg label claim",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Full lab report published on site"
    ],
    variants: [
      { label: "1x50mg", dose: "50mg", price: 27 }
    ],
  },
  "ghk-cu-pen": {
    name: "GHK-Cu Pen Vial",
    category: "Research peptide",
    image: "ghk-cu-pen-vial.png",
    coa: COA_REPORTS["ghk-cu-100016393"],
    penAddon: true,
    sisterProduct: { slug: "ghk-cu", label: "Also available as", name: "GHK-Cu Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy GHK-Cu Pen Vial UK | 50mg/3ml Pre-Reconstituted | North Peptides UK",
      metaDescription: "GHK-Cu copper tripeptide pre-reconstituted as a 50mg/3ml liquid in a pen-compatible vial. Independently tested at 99% purity by HPLC. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the GHK-Cu Pen Vial?", a: "The same GHK-Cu copper tripeptide research compound, supplied pre-reconstituted as a 50mg/3ml liquid in a pen-compatible cartridge vial." },
        { q: "Has this GHK-Cu been independently tested?", a: "Yes. A GHK-Cu sample from our UK stock was sent to Analiza Białek sp. z o.o., an independent analytical laboratory in Wrocław, Poland. HPLC analysis returned 99% purity. The original certificate of analysis is published on the site and opens at full size. The report was carried out on the lyophilised material used to prepare this pen vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied lyophilised (frozen powder). This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "GHK-Cu copper tripeptide pre-reconstituted as a 50mg/3ml liquid in a pen-compatible vial.",
    longDescription: [
      "GHK-Cu Pen Vial contains the same copper(II) tripeptide research compound as our standard frozen vial, supplied pre-reconstituted in a pen-compatible cartridge format — 50mg dissolved in 3ml solution.",
      "Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "Copper(II) coordination chemistry of the GHK tripeptide, studied in vitro",
      "Collagen-synthesis and extracellular-matrix research models",
      "Fibroblast and skin-cell research models",
      "Comparative studies of copper-peptide complexes"
    ],
    specs: [
      ["Compound type", "Copper(II) tripeptide complex (Copper Tripeptide-1)"],
      ["Sequence", "Gly-His-Lys (Cu2+-chelated)"],
      ["Molecular formula", "C14H22CuN6O4"],
      ["Molecular weight", "~401.9 g/mol"],
      ["CAS number", "89030-95-5"],
      ["Synonyms", "Copper peptide, prezatide copper"],
      ["Purity", "99% — independently verified by HPLC (report 100016393)"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "99% purity — independently verified by HPLC",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x50mg / 3ml", dose: "50mg / 3ml", price: 42 }
    ],
  },
  kpv: {
    name: "KPV",
    category: "Research peptide",
    image: "hf_20260523_171852_e8a239be-4a76-4958-930e-b68b87cbc701.png",
    penAddon: true,
    sisterProduct: { slug: "kpv-pen", label: "Also available as", name: "KPV Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy KPV UK | 10mg Research Peptide | North Peptides UK",
      metaDescription: "KPV (Lys-Pro-Val) research peptide, UK stocked. 10mg lyophilised vial. Supplier-stated purity. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is KPV?", a: "The tripeptide lysine-proline-valine (Lys-Pro-Val), corresponding to the C-terminal fragment of the hormone alpha-MSH, supplied as a 10mg lyophilised vial for research." },
        { q: "What is KPV supplied as?", a: "A 10mg lyophilised vial with supplier-stated purity, stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "Do you stock KPV in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is KPV for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    summary: "Alpha-MSH fragment tripeptide research compound supplied as a 10mg lyophilised vial.",
    longDescription: [
      "KPV is the tripeptide lysine-proline-valine (Lys-Pro-Val), corresponding to the C-terminal fragment of the larger hormone alpha-MSH. It is supplied as a lyophilised powder for laboratory research.",
      "In research it is studied in vitro and in preclinical models for its role in inflammation-related signalling, including NF-kB pathway activity, and in antimicrobial research. It is supplied as a research reference material only and is not for human or animal consumption."
    ],
    researchAreas: [
      "NF-kB signalling pathway activity, characterised in inflammation research models",
      "Pro-inflammatory cytokine (IL-6, TNF-alpha) signalling, studied in vitro",
      "Antimicrobial-activity research models",
      "Gastrointestinal inflammation research models"
    ],
    specs: [
      ["Compound type", "Alpha-MSH C-terminal fragment tripeptide"],
      ["Sequence", "Lys-Pro-Val"],
      ["Molecular formula", "C16H30N4O4"],
      ["Molecular weight", "~342.4 g/mol"],
      ["CAS number", "67727-97-3"],
      ["Synonyms", "Lysyl-prolyl-valine"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x10mg", dose: "10mg", price: 30 }
    ],
  },
  "kpv-pen": {
    name: "KPV Pen Vial",
    category: "Research peptide",
    image: "kpv-pen-vial.png",
    penAddon: true,
    sisterProduct: { slug: "kpv", label: "Also available as", name: "KPV Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy KPV Pen Vial UK | Pre-Reconstituted 10mg/3ml | North Peptides UK",
      metaDescription: "KPV alpha-MSH fragment tripeptide pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the KPV Pen Vial?", a: "The same KPV (Lys-Pro-Val) alpha-MSH fragment tripeptide research compound, supplied pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a frozen powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "KPV alpha-MSH fragment tripeptide research compound pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial.",
    longDescription: [
      "KPV Pen Vial contains the same KPV (Lys-Pro-Val) tripeptide research compound as our standard frozen vial, supplied pre-reconstituted in a pen-compatible cartridge format — 10mg dissolved in 3ml solution.",
      "Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "NF-kB signalling pathway activity, characterised in inflammation research models",
      "Pro-inflammatory cytokine (IL-6, TNF-alpha) signalling, studied in vitro",
      "Antimicrobial-activity research models",
      "Gastrointestinal inflammation research models"
    ],
    specs: [
      ["Compound type", "Alpha-MSH C-terminal fragment tripeptide"],
      ["Sequence", "Lys-Pro-Val"],
      ["Molecular formula", "C16H30N4O4"],
      ["Molecular weight", "~342.4 g/mol"],
      ["CAS number", "67727-97-3"],
      ["Synonyms", "Lysyl-prolyl-valine"],
      ["Purity", "Supplier stated"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "supplier-stated purity",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x10mg / 3ml", dose: "10mg / 3ml", price: 45 }
    ],
  },
  "klow-stack": {
    name: "KLOW Stack",
    category: "Research blend",
    image: "klow-stack-blue-powder.webp",
    coa: COA_REPORTS["ghk-cu-100016393"],
    coaScope: "component",
    coaScopeNote: "This report covers the 50mg GHK-Cu component only. It was tested standalone, not as the finished blend. The report does not test the KLOW Stack's TB-500, BPC-157 or KPV components.",
    penAddon: true,
    sisterProduct: { slug: "klow-stack-pen", label: "Also available as", name: "KLOW Stack Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy KLOW Stack UK | 80mg 4-Peptide Research Blend | North Peptides UK",
      metaDescription: "KLOW Stack research blend (GHK-Cu, TB-500, BPC-157, KPV), UK stocked. 80mg lyophilised vial. Supplier-stated purity. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is in the KLOW Stack?", a: "A single lyophilised vial combining GHK-Cu 50mg, TB-500 10mg, BPC-157 10mg and KPV 10mg — 80mg of peptide in total, at a fixed research ratio." },
        { q: "What is the KLOW Stack supplied as?", a: "An 80mg lyophilised vial with supplier-stated purity, stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "Do you stock the KLOW Stack in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is the KLOW Stack for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    summary: "Four-compound research blend containing GHK-Cu, TB-500, BPC-157 and KPV in a single 80mg lyophilised vial.",
    longDescription: [
      "The KLOW Stack is a pre-blended, four-compound research vial combining GHK-Cu, TB-500, BPC-157 and KPV at a fixed, single-vial ratio. It brings four of the most frequently studied tissue-research peptides together in one lyophilised preparation for laboratory use.",
      "Each component carries its own independent body of research. Combination preparations such as this are studied in preclinical models for whether complementary mechanisms produce additive effects. The blend is supplied as a research reference material only and is not for human or animal consumption."
    ],
    researchAreas: [
      "Combined collagen, extracellular-matrix and cell-migration research models",
      "Comparative study of single compounds versus a fixed-ratio blend",
      "Angiogenesis and tissue-research endpoints across the four components",
      "Inflammation-related signalling contributed by the KPV component"
    ],
    specs: [
      ["Composition", "GHK-Cu 50mg + TB-500 10mg + BPC-157 10mg + KPV 10mg"],
      ["Total peptide", "80mg per vial"],
      ["Blend type", "Four-compound tissue-research blend"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "GHK-Cu component independently verified at 99% purity",
      "Remaining components: supplier stated",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x80mg", dose: "80mg", price: 60 }
    ],
  },
  "klow-stack-pen": {
    name: "KLOW Stack Pen Vial",
    category: "Research blend",
    image: "klow-stack-pen-vial.png",
    coa: COA_REPORTS["ghk-cu-100016393"],
    coaScope: "component",
    coaScopeNote: "This report covers the 50mg GHK-Cu component only. It was tested standalone, not as the finished blend. The report does not test the KLOW Stack's TB-500, BPC-157 or KPV components.",
    penAddon: true,
    sisterProduct: { slug: "klow-stack", label: "Also available as", name: "KLOW Stack Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy KLOW Stack Pen Vial UK | Pre-Reconstituted 80mg/3ml | North Peptides UK",
      metaDescription: "KLOW Stack 4-peptide research blend (GHK-Cu, TB-500, BPC-157, KPV) pre-reconstituted as an 80mg/3ml liquid in a pen-compatible vial. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is in the KLOW Stack Pen Vial?", a: "The same four-compound blend — GHK-Cu 50mg, TB-500 10mg, BPC-157 10mg and KPV 10mg — pre-reconstituted as an 80mg/3ml liquid in a pen-compatible vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a lyophilised powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "KLOW Stack four-compound research blend pre-reconstituted as an 80mg/3ml liquid in a pen-compatible vial.",
    longDescription: [
      "KLOW Stack Pen Vial contains the same four-compound research blend — GHK-Cu, TB-500, BPC-157 and KPV at a fixed ratio — as our standard lyophilised vial, supplied pre-reconstituted in a pen-compatible cartridge format.",
      "Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "Combined collagen, extracellular-matrix and cell-migration research models",
      "Comparative study of single compounds versus a fixed-ratio blend",
      "Angiogenesis and tissue-research endpoints across the four components",
      "Inflammation-related signalling contributed by the KPV component"
    ],
    specs: [
      ["Composition", "GHK-Cu 50mg + TB-500 10mg + BPC-157 10mg + KPV 10mg"],
      ["Total peptide", "80mg per vial"],
      ["Blend type", "Four-compound tissue-research blend"],
      ["Purity", "Supplier stated"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "GHK-Cu component independently verified at 99% purity",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x80mg / 3ml", dose: "80mg / 3ml", price: 75 }
    ],
  },
  ipamorelin: {
    name: "Ipamorelin",
    category: "Research peptide",
    image: "hf_20260523_171904_baaf1708-79ff-4396-8a78-76018f3acdc4.jpeg",
    penAddon: true,
    sisterProduct: { slug: "ipamorelin-pen", label: "Also available as", name: "Ipamorelin Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy Ipamorelin UK | 5mg Research Peptide | North Peptides UK",
      metaDescription: "Ipamorelin research peptide, UK stocked. 5mg lyophilised vial. Supplier-stated purity. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is Ipamorelin?", a: "A synthetic pentapeptide and selective growth-hormone secretagogue acting at the ghrelin/GHS receptor, supplied as a 5mg lyophilised vial for research." },
        { q: "What is Ipamorelin supplied as?", a: "A 5mg lyophilised vial with supplier-stated purity, stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "Do you stock Ipamorelin in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is Ipamorelin for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    summary: "Selective growth-hormone secretagogue research compound supplied as a 5mg lyophilised vial.",
    longDescription: [
      "Ipamorelin is a synthetic pentapeptide (Aib-His-D-2-Nal-D-Phe-Lys-NH2) and a selective growth-hormone secretagogue acting at the ghrelin/GHS receptor. It is supplied as a lyophilised powder for laboratory research.",
      "It is studied in vitro and in preclinical models for growth-hormone-release dynamics and for its receptor selectivity relative to other secretagogues such as GHRP-2 and GHRP-6. It is supplied as a research reference material only and is not for human or animal consumption."
    ],
    researchAreas: [
      "Growth-hormone secretagogue (ghrelin/GHS receptor) signalling, studied in vitro",
      "Receptor selectivity relative to GHRP-2 and GHRP-6, characterised in research",
      "Pituitary growth-hormone pulse patterns in preclinical models",
      "Comparative studies alongside GHRH-analogue peptides"
    ],
    specs: [
      ["Compound type", "Selective growth-hormone secretagogue (pentapeptide)"],
      ["Sequence", "Aib-His-D-2-Nal-D-Phe-Lys-NH2"],
      ["Molecular formula", "C38H49N9O5"],
      ["Molecular weight", "~711.9 g/mol"],
      ["CAS number", "170851-70-4"],
      ["Synonyms", "NNC 26-0161"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x5mg", dose: "5mg", price: 24.99 }
    ],
  },
  "ipamorelin-pen": {
    name: "Ipamorelin Pen Vial",
    category: "Research peptide",
    image: "ipamorelin-pen-vial.png",
    penAddon: true,
    sisterProduct: { slug: "ipamorelin", label: "Also available as", name: "Ipamorelin Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy Ipamorelin Pen Vial UK | Pre-Reconstituted 5mg/3ml | North Peptides UK",
      metaDescription: "Ipamorelin selective GH secretagogue pre-reconstituted as a 5mg/3ml liquid in a pen-compatible vial. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the Ipamorelin Pen Vial?", a: "The same Ipamorelin selective growth-hormone secretagogue research compound, supplied pre-reconstituted as a 5mg/3ml liquid in a pen-compatible vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a frozen powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "Ipamorelin selective GH secretagogue research compound pre-reconstituted as a 5mg/3ml liquid in a pen-compatible vial.",
    longDescription: [
      "Ipamorelin Pen Vial contains the same selective growth-hormone secretagogue research compound as our standard frozen vial, supplied pre-reconstituted in a pen-compatible cartridge format — 5mg dissolved in 3ml solution.",
      "Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "Growth-hormone secretagogue (ghrelin/GHS receptor) signalling, studied in vitro",
      "Receptor selectivity relative to GHRP-2 and GHRP-6, characterised in research",
      "Pituitary growth-hormone pulse patterns in preclinical models",
      "Comparative studies alongside GHRH-analogue peptides"
    ],
    specs: [
      ["Compound type", "Selective growth-hormone secretagogue (pentapeptide)"],
      ["Sequence", "Aib-His-D-2-Nal-D-Phe-Lys-NH2"],
      ["Molecular formula", "C38H49N9O5"],
      ["Molecular weight", "~711.9 g/mol"],
      ["CAS number", "170851-70-4"],
      ["Synonyms", "NNC 26-0161"],
      ["Purity", "Supplier stated"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "supplier-stated purity",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x5mg / 3ml", dose: "5mg / 3ml", price: 39.99 }
    ],
  },
  "cjc-1295": {
    name: "CJC-1295 (No DAC)",
    category: "Research peptide",
    image: "hf_20260523_171921_abfd9afd-aa38-48a9-bba3-538df7508dd2.jpeg",
    penAddon: true,
    sisterProduct: { slug: "cjc-1295-pen", label: "Also available as", name: "CJC-1295 Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy CJC-1295 No DAC UK | 5mg Mod GRF 1-29 Research Peptide | North Peptides UK",
      metaDescription: "CJC-1295 No DAC (Mod GRF 1-29) research peptide, UK stocked. 5mg lyophilised vial. Supplier-stated purity. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is CJC-1295 (No DAC)?", a: "A synthetic 29-amino-acid analogue of growth-hormone-releasing hormone (GHRH), also known as Modified GRF (1-29), supplied as a 5mg lyophilised vial for research." },
        { q: "How does the No DAC form differ from the DAC version?", a: "Without the drug-affinity complex (DAC), it is characterised in research for shorter, more defined growth-hormone pulses and a comparatively brief half-life. Both are supplied only as reference materials." },
        { q: "Do you stock CJC-1295 in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is CJC-1295 for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    summary: "GHRH (1-29) analogue research compound (Mod GRF 1-29) supplied as a 5mg lyophilised vial.",
    longDescription: [
      "CJC-1295 (No DAC), also known as Modified GRF (1-29), is a synthetic 29-amino-acid analogue of growth-hormone-releasing hormone (GHRH). It is supplied as a lyophilised powder for laboratory research.",
      "Without the drug-affinity complex (DAC), it is characterised in research for short, defined growth-hormone pulses and a comparatively brief half-life. It is studied in vitro and in preclinical models, frequently alongside GHS peptides such as Ipamorelin, to examine complementary GHRH/GHS pathway activity. It is supplied as a research reference material only and is not for human or animal consumption."
    ],
    researchAreas: [
      "GHRH-receptor signalling and growth-hormone pulse dynamics, studied in vitro",
      "Half-life and clearance characteristics of the no-DAC analogue",
      "Combination research with GHS peptides acting at distinct receptors",
      "Comparative studies against the DAC-modified variant"
    ],
    specs: [
      ["Compound type", "GHRH (1-29) analogue — Mod GRF 1-29"],
      ["Structure", "29-amino-acid peptide (D-Ala2, C-terminal amide)"],
      ["Molecular formula", "C152H252N44O42"],
      ["Molecular weight", "~3368 g/mol"],
      ["Synonyms", "Modified GRF 1-29, CJC-1295 without DAC"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x5mg", dose: "5mg", price: 32 }
    ],
  },
  "cjc-1295-pen": {
    name: "CJC-1295 Pen Vial",
    category: "Research peptide",
    image: "cjc-1295-pen-vial.png",
    penAddon: true,
    sisterProduct: { slug: "cjc-1295", label: "Also available as", name: "CJC-1295 Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy CJC-1295 Pen Vial UK | Pre-Reconstituted 5mg/3ml | North Peptides UK",
      metaDescription: "CJC-1295 No DAC (Mod GRF 1-29) GHRH analogue pre-reconstituted as a 5mg/3ml liquid in a pen-compatible vial. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the CJC-1295 Pen Vial?", a: "The same CJC-1295 (No DAC) GHRH analogue research compound, supplied pre-reconstituted as a 5mg/3ml liquid in a pen-compatible vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a frozen powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "CJC-1295 (No DAC) GHRH analogue research compound pre-reconstituted as a 5mg/3ml liquid in a pen-compatible vial.",
    longDescription: [
      "CJC-1295 Pen Vial contains the same Modified GRF (1-29) GHRH analogue research compound as our standard frozen vial, supplied pre-reconstituted in a pen-compatible cartridge format — 5mg dissolved in 3ml solution.",
      "Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "GHRH-receptor signalling and growth-hormone pulse dynamics, studied in vitro",
      "Half-life and clearance characteristics of the no-DAC analogue",
      "Combination research with GHS peptides acting at distinct receptors",
      "Comparative studies against the DAC-modified variant"
    ],
    specs: [
      ["Compound type", "GHRH (1-29) analogue — Mod GRF 1-29"],
      ["Structure", "29-amino-acid peptide (D-Ala2, C-terminal amide)"],
      ["Molecular formula", "C152H252N44O42"],
      ["Molecular weight", "~3368 g/mol"],
      ["Synonyms", "Modified GRF 1-29, CJC-1295 without DAC"],
      ["Purity", "Supplier stated"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "supplier-stated purity",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x5mg / 3ml", dose: "5mg / 3ml", price: 47 }
    ],
  },
  "nad-plus": {
    name: "NAD+",
    category: "Cellular research",
    image: "nad-plus.png",
    penAddon: true,
    sisterProduct: { slug: "nad-plus-pen", label: "Also available as", name: "NAD+ Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy NAD+ UK | 1000mg Research Compound | North Peptides UK",
      metaDescription: "NAD+ (nicotinamide adenine dinucleotide) research compound, UK stocked. 1000mg lyophilised powder. Supplier-stated purity. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is NAD+?", a: "Nicotinamide adenine dinucleotide, a coenzyme central to hundreds of enzymatic reactions including cellular energy metabolism, supplied as a 1000mg lyophilised powder for research." },
        { q: "What is NAD+ supplied as?", a: "A 1000mg lyophilised powder with supplier-stated purity, stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "Do you stock NAD+ in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is NAD+ for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    summary: "Nicotinamide Adenine Dinucleotide coenzyme research compound supplied as a 1000mg lyophilised powder.",
    longDescription: [
      "NAD+ (nicotinamide adenine dinucleotide) is a coenzyme present in every living cell and central to hundreds of enzymatic reactions, including those of cellular energy metabolism. It is supplied here as a lyophilised powder for laboratory research.",
      "As a research material it is studied in vitro for its role as a substrate and cofactor in redox reactions, sirtuin and PARP enzyme activity, and mitochondrial research. It is supplied as a research reference material only and is not for human or animal consumption."
    ],
    researchAreas: [
      "Redox cofactor activity (NAD+/NADH) in enzymatic research, studied in vitro",
      "Sirtuin and PARP enzyme research models",
      "Mitochondrial energy-metabolism research",
      "Cellular NAD+ pool measurement and assay development"
    ],
    specs: [
      ["Compound type", "Pyridine dinucleotide coenzyme (not a peptide)"],
      ["Molecular formula", "C21H27N7O14P2 (free acid)"],
      ["Molecular weight", "~663.4 g/mol"],
      ["CAS number", "53-84-9"],
      ["Synonyms", "beta-NAD, Coenzyme I, nadide"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution, solutions are generally kept refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x1000mg", dose: "1000mg", price: 84.99 }
    ],
  },
  "nad-plus-pen": {
    name: "NAD+ Pen Vial",
    category: "Cellular research",
    image: "nad-plus-pen-vial.png",
    penAddon: true,
    sisterProduct: { slug: "nad-plus", label: "Also available as", name: "NAD+ Standard Vial — Lyophilised Powder" },
    seo: {
      title: "Buy NAD+ Pen Vial UK | Pre-Reconstituted 1000mg/3ml | North Peptides UK",
      metaDescription: "NAD+ nicotinamide adenine dinucleotide pre-reconstituted as a 1000mg/3ml liquid in a pen-compatible vial. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the NAD+ Pen Vial?", a: "The same NAD+ nicotinamide adenine dinucleotide research compound, supplied pre-reconstituted as a 1000mg/3ml liquid in a pen-compatible vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a lyophilised powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "NAD+ nicotinamide adenine dinucleotide coenzyme pre-reconstituted as a 1000mg/3ml liquid in a pen-compatible vial.",
    longDescription: [
      "NAD+ Pen Vial contains the same nicotinamide adenine dinucleotide research compound as our standard lyophilised vial, supplied pre-reconstituted in a pen-compatible cartridge format — 1000mg dissolved in 3ml solution.",
      "Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "Redox cofactor activity (NAD+/NADH) in enzymatic research, studied in vitro",
      "Sirtuin and PARP enzyme research models",
      "Mitochondrial energy-metabolism research",
      "Cellular NAD+ pool measurement and assay development"
    ],
    specs: [
      ["Compound type", "Pyridine dinucleotide coenzyme (not a peptide)"],
      ["Molecular formula", "C21H27N7O14P2 (free acid)"],
      ["Molecular weight", "~663.4 g/mol"],
      ["CAS number", "53-84-9"],
      ["Synonyms", "beta-NAD, Coenzyme I, nadide"],
      ["Purity", "Supplier stated"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "supplier-stated purity",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x1000mg / 3ml", dose: "1000mg / 3ml", price: 102 }
    ],
  },
  "ss-31": {
    name: "SS-31",
    category: "Research peptide",
    image: "ss-31.png",
    penAddon: true,
    sisterProduct: { slug: "ss-31-pen", label: "Also available as", name: "SS-31 Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy SS-31 UK | 10mg Elamipretide Research Peptide | North Peptides UK",
      metaDescription: "SS-31 (elamipretide) mitochondria-targeted research peptide, UK stocked. 10mg lyophilised vial. Supplier-stated purity. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is SS-31?", a: "A synthetic, mitochondria-targeting tetrapeptide (elamipretide) that selectively associates with cardiolipin on the inner mitochondrial membrane, supplied as a 10mg lyophilised vial for research." },
        { q: "What is SS-31 supplied as?", a: "A 10mg lyophilised vial with supplier-stated purity, stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "Do you stock SS-31 in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is SS-31 for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    summary: "Mitochondria-targeted tetrapeptide research compound (elamipretide) supplied as a 10mg lyophilised vial.",
    longDescription: [
      "SS-31 (elamipretide) is a synthetic, mitochondria-targeting tetrapeptide (D-Arg-Dmt-Lys-Phe-NH2) that selectively associates with cardiolipin on the inner mitochondrial membrane. It is supplied as a lyophilised powder for laboratory research.",
      "It is studied in vitro and in preclinical models for mitochondrial endpoints measured at the source of reactive-oxygen-species generation, including electron-transport-chain efficiency, membrane potential and ATP production. It is supplied as a research reference material only and is not for human or animal consumption."
    ],
    researchAreas: [
      "Cardiolipin binding on the inner mitochondrial membrane, studied in vitro",
      "Reactive-oxygen-species generation measured at source in research models",
      "Electron-transport-chain efficiency and membrane-potential endpoints",
      "ATP-production research models"
    ],
    specs: [
      ["Compound type", "Mitochondria-targeted tetrapeptide (elamipretide)"],
      ["Sequence", "D-Arg-Dmt-Lys-Phe-NH2"],
      ["Molecular formula", "C32H49N9O5 (free base)"],
      ["Molecular weight", "~639.8 g/mol"],
      ["CAS number", "736992-21-5"],
      ["Synonyms", "Elamipretide, MTP-131, Bendavia"],
      ["Salt form", "Commonly supplied as acetate"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x10mg", dose: "10mg", price: 24.99 }
    ],
  },
  "ss-31-pen": {
    name: "SS-31 Pen Vial",
    category: "Research peptide",
    image: "ss-31-pen-vial.png",
    penAddon: true,
    sisterProduct: { slug: "ss-31", label: "Also available as", name: "SS-31 Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy SS-31 Pen Vial UK | Pre-Reconstituted 10mg/3ml | North Peptides UK",
      metaDescription: "SS-31 (elamipretide) mitochondria-targeted tetrapeptide pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the SS-31 Pen Vial?", a: "The same SS-31 (elamipretide) mitochondria-targeted tetrapeptide research compound, supplied pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a frozen powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "SS-31 (elamipretide) mitochondria-targeted tetrapeptide research compound pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial.",
    longDescription: [
      "SS-31 Pen Vial contains the same elamipretide mitochondria-targeted tetrapeptide research compound as our standard frozen vial, supplied pre-reconstituted in a pen-compatible cartridge format — 10mg dissolved in 3ml solution.",
      "Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "Cardiolipin binding on the inner mitochondrial membrane, studied in vitro",
      "Reactive-oxygen-species generation measured at source in research models",
      "Electron-transport-chain efficiency and membrane-potential endpoints",
      "ATP-production research models"
    ],
    specs: [
      ["Compound type", "Mitochondria-targeted tetrapeptide (elamipretide)"],
      ["Sequence", "D-Arg-Dmt-Lys-Phe-NH2"],
      ["Molecular formula", "C32H49N9O5 (free base)"],
      ["Molecular weight", "~639.8 g/mol"],
      ["CAS number", "736992-21-5"],
      ["Synonyms", "Elamipretide, MTP-131, Bendavia"],
      ["Purity", "Supplier stated"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "supplier-stated purity",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x10mg / 3ml", dose: "10mg / 3ml", price: 39.99 }
    ],
  },
  semax: {
    name: "Semax",
    category: "Nootropic research",
    image: "semax.png",
    seo: {
      title: "Buy Semax UK | 30mg Nootropic Research Peptide | North Peptides UK",
      metaDescription: "Semax research peptide, UK stocked. 30mg lyophilised vial. Supplier-stated purity. 24-48h dispatch after payment. Intranasal research kit available. Research use only — not for human consumption.",
      faq: [
        { q: "What is Semax?", a: "A synthetic heptapeptide derived from a fragment of ACTH (4-7) with a Pro-Gly-Pro extension that increases stability, supplied as a 30mg lyophilised vial for research." },
        { q: "What is Semax supplied as?", a: "A 30mg lyophilised vial with supplier-stated purity and stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "Do you stock Semax in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is Semax for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    secondaryImage: "research-intranasal-kit.jpg",
    intranasalAddon: true,
    summary: "Nootropic research peptide (ACTH(4-7) analogue) supplied as a 30mg lyophilised vial.",
    longDescription: [
      "Semax is a synthetic heptapeptide (Met-Glu-His-Phe-Pro-Gly-Pro) derived from a fragment of ACTH (4-7) with a Pro-Gly-Pro extension that increases its stability. It is supplied as a lyophilised powder for laboratory research.",
      "It is studied in vitro and in preclinical models for neurotrophic signalling, including BDNF and NGF expression, and for neuroprotection in oxidative-stress models. Cognition-related variables appear in the literature as measured research endpoints. It is supplied as a research reference material only and is not for human or animal consumption."
    ],
    researchAreas: [
      "BDNF and NGF expression, examined in research models",
      "Neuroprotection in oxidative-stress models, studied in vitro",
      "Modulation of multiple neurotransmitter systems",
      "Memory, attention and learning as measured endpoints in preclinical studies"
    ],
    specs: [
      ["Compound type", "Synthetic heptapeptide (ACTH(4-7) analogue)"],
      ["Sequence", "Met-Glu-His-Phe-Pro-Gly-Pro"],
      ["Molecular formula", "C37H51N9O10S"],
      ["Molecular weight", "~813.9 g/mol"],
      ["CAS number", "80714-61-0"],
      ["Synonyms", "Semax"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x30mg", dose: "30mg", price: 20.99 }
    ],
  },
  selank: {
    name: "Selank",
    category: "Nootropic research",
    image: "selank.png",
    seo: {
      title: "Buy Selank UK | 30mg Nootropic Research Peptide | North Peptides UK",
      metaDescription: "Selank research peptide, UK stocked. 30mg lyophilised vial. Supplier-stated purity. 24-48h dispatch after payment. Intranasal research kit available. Research use only — not for human consumption.",
      faq: [
        { q: "What is Selank?", a: "A synthetic heptapeptide analogue of the immunomodulatory peptide tuftsin, supplied as a 30mg lyophilised vial for research." },
        { q: "What is Selank supplied as?", a: "A 30mg lyophilised vial with supplier-stated purity and stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "Do you stock Selank in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is Selank for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    secondaryImage: "research-intranasal-kit.jpg",
    intranasalAddon: true,
    summary: "Anxiolytic nootropic research peptide (tuftsin analogue) supplied as a 30mg lyophilised vial.",
    longDescription: [
      "Selank is a synthetic heptapeptide (Thr-Lys-Pro-Arg-Pro-Gly-Pro), an analogue of the immunomodulatory peptide tuftsin. It is supplied as a lyophilised powder for laboratory research.",
      "It is studied in vitro and in preclinical models for anxiolytic activity, GABAergic and monoamine signalling, BDNF expression and cytokine balance, with no tolerance reported in those models. It is supplied as a research reference material only and is not for human or animal consumption."
    ],
    researchAreas: [
      "Anxiolytic activity documented in preclinical models",
      "GABAergic and serotonergic signalling, studied in vitro",
      "BDNF expression in neuroplasticity research models",
      "Cytokine balance (e.g. IL-6) in immunological research"
    ],
    specs: [
      ["Compound type", "Synthetic heptapeptide (tuftsin analogue)"],
      ["Sequence", "Thr-Lys-Pro-Arg-Pro-Gly-Pro"],
      ["Molecular formula", "C33H57N11O9"],
      ["Molecular weight", "~751.9 g/mol"],
      ["CAS number", "129954-34-3"],
      ["Synonyms", "TP-7"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x30mg", dose: "30mg", price: 20.99 }
    ],
  },
  epitalon: {
    name: "Epitalon",
    category: "Research peptide",
    image: "epitalon.png",
    penAddon: true,
    sisterProduct: { slug: "epitalon-pen", label: "Also available as", name: "Epitalon Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy Epitalon UK | 10mg Research Peptide | North Peptides UK",
      metaDescription: "Epitalon (Epithalon, AEDG) research peptide, UK stocked. 10mg lyophilised vial. Supplier-stated purity. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is Epitalon?", a: "A synthetic tetrapeptide (Ala-Glu-Asp-Gly, AEDG) modelled on a fragment of the pineal-gland peptide epithalamin, supplied as a 10mg lyophilised vial for research." },
        { q: "What is Epitalon supplied as?", a: "A 10mg lyophilised vial with supplier-stated purity, stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "Do you stock Epitalon in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is Epitalon for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    summary: "Pineal tetrapeptide research compound (AEDG) supplied as a 10mg lyophilised vial.",
    longDescription: [
      "Epitalon (also written Epithalon) is a synthetic tetrapeptide (Ala-Glu-Asp-Gly, AEDG) modelled on a fragment of the pineal-gland peptide epithalamin. It is supplied as a lyophilised powder for laboratory research.",
      "It is studied in vitro and in animal models for telomerase activity, telomere biology, and pineal and circadian research. It is supplied as a research reference material only and is not for human or animal consumption."
    ],
    researchAreas: [
      "Telomerase enzyme activity, studied in vitro",
      "Telomere-length and replicative-senescence research models",
      "Pineal-gland and melatonin-rhythm research",
      "Circadian-biology research models"
    ],
    specs: [
      ["Compound type", "Synthetic pineal tetrapeptide (AEDG)"],
      ["Sequence", "Ala-Glu-Asp-Gly"],
      ["Molecular formula", "C14H22N4O9"],
      ["Molecular weight", "~390.4 g/mol"],
      ["CAS number", "307297-39-8"],
      ["Synonyms", "Epithalon, AEDG"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x10mg", dose: "10mg", price: 13.99 }
    ],
  },
  "epitalon-pen": {
    name: "Epitalon Pen Vial",
    category: "Research peptide",
    image: "epitalon-pen-vial.png",
    penAddon: true,
    sisterProduct: { slug: "epitalon", label: "Also available as", name: "Epitalon Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy Epitalon Pen Vial UK | Pre-Reconstituted 10mg/3ml | North Peptides UK",
      metaDescription: "Epitalon (AEDG) pineal tetrapeptide pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the Epitalon Pen Vial?", a: "The same Epitalon (Ala-Glu-Asp-Gly, AEDG) pineal tetrapeptide research compound, supplied pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a frozen powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "Epitalon (AEDG) pineal tetrapeptide research compound pre-reconstituted as a 10mg/3ml liquid in a pen-compatible vial.",
    longDescription: [
      "Epitalon Pen Vial contains the same synthetic pineal tetrapeptide (Ala-Glu-Asp-Gly, AEDG) research compound as our standard frozen vial, supplied pre-reconstituted in a pen-compatible cartridge format — 10mg dissolved in 3ml solution.",
      "Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "Telomerase enzyme activity, studied in vitro",
      "Telomere-length and replicative-senescence research models",
      "Pineal-gland and melatonin-rhythm research",
      "Circadian-biology research models"
    ],
    specs: [
      ["Compound type", "Synthetic pineal tetrapeptide (AEDG)"],
      ["Sequence", "Ala-Glu-Asp-Gly"],
      ["Molecular formula", "C14H22N4O9"],
      ["Molecular weight", "~390.4 g/mol"],
      ["CAS number", "307297-39-8"],
      ["Synonyms", "Epithalon, AEDG"],
      ["Purity", "Supplier stated"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "supplier-stated purity",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x10mg / 3ml", dose: "10mg / 3ml", price: 28.99 }
    ],
  },
  pinealon: {
    name: "Pinealon",
    category: "Research peptide",
    image: "pinealon.png",
    penAddon: true,
    sisterProduct: { slug: "pinealon-pen", label: "Also available as", name: "Pinealon Pen Vial — Pre-Reconstituted" },
    seo: {
      title: "Buy Pinealon UK | 20mg Research Peptide | North Peptides UK",
      metaDescription: "Pinealon (Glu-Asp-Arg) research peptide, UK stocked. 20mg lyophilised vial. Supplier-stated purity. 24-48h dispatch after payment. Research use only — not for human consumption.",
      faq: [
        { q: "What is Pinealon?", a: "A synthetic tripeptide (Glu-Asp-Arg, EDR) belonging to the family of short regulatory peptides studied in neurobiology, supplied as a 20mg lyophilised vial for research." },
        { q: "What is Pinealon supplied as?", a: "A 20mg lyophilised vial with supplier-stated purity, stored frozen until dispatch. Supplier documentation is available on request where held." },
        { q: "Do you stock Pinealon in the UK?", a: "Yes. It is UK stocked with dispatch within 24–48 hours of confirmed payment on business days via tracked delivery." },
        { q: "Is Pinealon for research use only?", a: "Yes. It is supplied strictly for laboratory research and is not for human or animal consumption." }
      ]
    },
    summary: "Short regulatory tripeptide research compound (EDR) supplied as a 20mg lyophilised vial.",
    longDescription: [
      "Pinealon is a synthetic tripeptide (Glu-Asp-Arg, EDR) belonging to the family of short regulatory peptides studied in neurobiology. It is supplied as a lyophilised powder for laboratory research.",
      "It is studied in vitro and in animal models for blood-brain-barrier permeability, neuroprotection in oxidative-stress and hypoxia models, and cognitive-aging research. It is supplied as a research reference material only and is not for human or animal consumption."
    ],
    researchAreas: [
      "Blood-brain-barrier permeability of short peptides, studied in research models",
      "Neuroprotection in hypoxia and oxidative-stress models",
      "Transcriptional and epigenetic regulation in neuronal research models",
      "Cognitive function as a measured endpoint in aged-animal models"
    ],
    specs: [
      ["Compound type", "Synthetic regulatory tripeptide (EDR)"],
      ["Sequence", "Glu-Asp-Arg"],
      ["Molecular formula", "C15H26N6O8"],
      ["Molecular weight", "~418.4 g/mol"],
      ["CAS number", "175175-23-2"],
      ["Synonyms", "Pinealon"],
      ["Purity", "Supplier stated"],
      ["Form", "Lyophilised powder"],
      ["Storage", "-20°C long-term; 2-8°C short-term"]
    ],
    storage: "Supplied as a lyophilised powder in a sealed vial and kept frozen until dispatch. Unopened vials are typically stored at -20°C for the long term and 2-8°C for short periods. After reconstitution with bacteriostatic water, vials are generally refrigerated at 2-8°C, protected from light, and not subjected to repeated freeze-thaw cycles.",
    details: [
      "supplier-stated purity",
      "UK stocked, 24-48h dispatch after payment",
      "Stored frozen until dispatch",
      "Supplier documentation on request"
    ],
    variants: [
      { label: "1x20mg", dose: "20mg", price: 29.99 }
    ],
  },
  "pinealon-pen": {
    name: "Pinealon Pen Vial",
    category: "Research peptide",
    image: "pinealon-pen-vial.png",
    penAddon: true,
    sisterProduct: { slug: "pinealon", label: "Also available as", name: "Pinealon Standard Vial — Frozen / Lyophilised" },
    seo: {
      title: "Buy Pinealon Pen Vial UK | Pre-Reconstituted 20mg/3ml | North Peptides UK",
      metaDescription: "Pinealon (EDR tripeptide) pre-reconstituted as a 20mg/3ml liquid in a pen-compatible vial. UK stocked, 24-48h dispatch after payment. Research use only.",
      faq: [
        { q: "What is the Pinealon Pen Vial?", a: "The same Pinealon (Glu-Asp-Arg, EDR) regulatory tripeptide research compound, supplied pre-reconstituted as a 20mg/3ml liquid in a pen-compatible vial." },
        { q: "How is this different from the standard vial?", a: "The standard vial is supplied as a frozen powder. This version is pre-reconstituted into solution and supplied in a vial sized for pen-style research cartridge systems." },
        { q: "Do I need a pen separately?", a: "No. Each pen-vial order includes a pre-filled disposable research pen, sterile disposable needle tips and alcohol wipes. No separate pen hardware or reconstitution supplies are required for laboratory handling." },
        { q: "Is this for research use only?", a: "Yes. Supplied strictly for laboratory research, not for human or animal consumption." }
      ]
    },
    summary: "Pinealon EDR regulatory tripeptide research compound pre-reconstituted as a 20mg/3ml liquid in a pen-compatible vial.",
    longDescription: [
      "Pinealon Pen Vial contains the same Pinealon (Glu-Asp-Arg, EDR) synthetic regulatory tripeptide research compound as our standard frozen vial, supplied pre-reconstituted in a pen-compatible cartridge format — 20mg dissolved in 3ml solution.",
      "Supplied as a complete disposable pen kit with sterile disposable needle tips and alcohol wipes included. No separate pen hardware or reconstitution supplies are required for laboratory handling. Supplied strictly as a research reference material; not for human or animal consumption."
    ],
    researchAreas: [
      "Blood-brain-barrier permeability of short peptides, studied in research models",
      "Neuroprotection in hypoxia and oxidative-stress models",
      "Transcriptional and epigenetic regulation in neuronal research models",
      "Cognitive function as a measured endpoint in aged-animal models"
    ],
    specs: [
      ["Compound type", "Synthetic regulatory tripeptide (EDR)"],
      ["Sequence", "Glu-Asp-Arg"],
      ["Molecular formula", "C15H26N6O8"],
      ["Molecular weight", "~418.4 g/mol"],
      ["CAS number", "175175-23-2"],
      ["Synonyms", "Pinealon"],
      ["Purity", "Supplier stated"],
      ["Form", "Pre-reconstituted liquid"],
      ["Volume", "3ml"],
      ["Storage", "2–8°C; do not freeze once reconstituted"]
    ],
    storage: "Supplied as a pre-reconstituted liquid in a sealed pen-compatible vial. Store at 2–8°C. Do not freeze once reconstituted. Protect from light.",
    details: [
      "supplier-stated purity",
      "Pre-reconstituted research liquid",
      "UK stocked, 24-48h dispatch after payment",
      "Disposable pen, sterile tips and wipes included"
    ],
    variants: [
      { label: "1x20mg / 3ml", dose: "20mg / 3ml", price: 44.99 }
    ],
  },
  "intranasal-research-kit": {
    name: "Intranasal Research Kit",
    category: "Research supplies",
    supply: true,
    image: "research-intranasal-kit.jpg",
    summary: "A compact intranasal research preparation kit designed for use alongside compatible research compounds. Includes a 10ml nasal spray bottle, sterile 0.9% saline ampoule, transfer syringe, transfer adaptor, alcohol wipes, and blank label.",
    details: [
      "1 x 10ml nasal spray bottle",
      "1 x sterile 0.9% saline ampoule",
      "1 x transfer syringe",
      "1 x blunt fill needle or transfer adaptor",
      "2 x alcohol wipes",
      "1 x blank label",
      "Research use only"
    ],
    trust: {
      items: [
        ["Bottle", "10ml Nasal Spray"],
        ["Saline", "0.9% Sterile"],
        ["Includes", "Transfer Syringe"],
        ["Extras", "Wipes + Label"],
        ["Category", "Research Supply"],
        ["Use", "Research Only"]
      ],
      chips: ["10ml Bottle", "Sterile Saline", "Transfer Kit", "Research Supply"]
    },
    variants: [
      { label: "Kit", dose: "10ml nasal spray + saline + syringe + adaptor + wipes + label", price: 6.99 }
    ],
  },
  "pen-style-research-kit": {
    name: "Pen-Style Research Kit",
    category: "Research supplies",
    supply: true,
    image: "research-pen-kit-style.png",
    summary: "A cleaner pen-style setup for repeatable measured research handling, supplied with the cartridge, BAC water and sterile pen tips needed to build the setup.",
    details: [
      "Includes 3ml cartridge, sealed bacteriostatic water and 6mm sterile pen tips x5",
      "Pairs with the research vial you select at checkout",
      "Built for cleaner handling and repeatable measured volumes",
      "Select a research product separately where required",
      "Thermal cooled packaging available at checkout",
      "Research use only"
    ],
    trust: {
      items: [
        ["Contents", "Cartridge Kit"],
        ["Format", "Pen-Style"],
        ["Handling", "Measured"],
        ["Dispatch", "Within 24?48h"],
        ["Follow-up", "Email Confirmed"],
        ["Use", "Research Only"]
      ],
      chips: ["3ml Cartridge", "BAC Water", "5 Pen Tips", "Thermal Packaging Option"]
    },
    variants: [
      { label: "Kit", dose: "3ml cartridge + BAC water + x5 pen tips", price: 24.99 }
    ],
  },
  "pen-tips": {
    name: "Sterile Disposable Pen Tips",
    category: "Research supplies",
    supply: true,
    image: "research-pen-tips.png",
    summary: "Disposable pen tips for compatible pen-style research kits.",
    details: [
      "Available in 5 or 10 tip packs",
      "Sealed pack",
      "Compatible with pen-style research kits",
      "Research use only"
    ],
    trust: {
      items: [["Pack", "5 Tips"], ["Options", "5 or 10"], ["Format", "Disposable"], ["Packaging", "Sealed"], ["Compatibility", "Pen-Style Kits"], ["Use", "Research Only"]],
      chips: ["Disposable Tips", "Sealed Pack", "Research Supply"]
    },
    variants: [
      { label: "5 tips", dose: "6mm x5", price: 3.99 },
      { label: "10 tips", dose: "6mm x10", price: 6.99 }
    ],
  },
  "bacteriostatic-water": {
    name: "Bacteriostatic Water",
    category: "Research supplies",
    supply: true,
    image: "research-bac-water.png",
    summary: "Sealed bacteriostatic mixing water for research preparation workflows, in 10ml and compact 3ml vials.",
    details: [
      "10ml or 3ml vial",
      "Supplied sealed",
      "0.9% benzyl alcohol",
      "Preparation supply",
      "Research use only"
    ],
    trust: {
      items: [["Volume", "10ml"], ["Format", "Liquid"], ["Contents", "0.9% Benzyl Alcohol"], ["Packaging", "Sealed Vial"], ["Category", "Research Supply"], ["Use", "Research Only"]],
      chips: ["10ml Vial", "Sealed", "Research Supply"]
    },
    variants: [
      { label: "10ml vial", dose: "10ml vial", price: 6.99 },
      { label: "3ml vial", dose: "3ml vial", price: 4.99 }
    ],
  },
  "syringe-kit": {
    name: "Insulin Needle Pack",
    category: "Research supplies",
    supply: true,
    image: "research-insulin-needles.png",
    summary: "Pack of 1ml sterile disposable insulin needles for research preparation use.",
    details: [
      "1ml insulin needles x10",
      "31G 1/4 inch",
      "Supplied sealed",
      "Research use only"
    ],
    trust: {
      items: [["Pack", "10 Needles"], ["Capacity", "1ml"], ["Gauge", "31G"], ["Length", "1/4 Inch"], ["Packaging", "Sealed"], ["Use", "Research Only"]],
      chips: ["10 Pack", "1ml", "Research Supply"]
    },
    variants: [
      { label: "10 pack", dose: "10 pack, 1ml insulin needles", price: 6.99 }
    ],
  },
  "alcohol-wipes": {
    name: "Alcohol Wipes",
    category: "Research supplies",
    supply: true,
    image: "research-alcohol-wipes.png",
    summary: "Single-use alcohol wipe pack for research preparation workflows.",
    details: [
      "10 pack",
      "Single-use wipes",
      "Preparation supply",
      "Research use only"
    ],
    trust: {
      items: [["Pack", "10 Wipes"], ["Format", "Single-Use"], ["Category", "Preparation Supply"], ["Packaging", "Sealed Pack"], ["Availability", "UK Stocked"], ["Use", "Research Only"]],
      chips: ["10 Pack", "Single-Use", "Research Supply"]
    },
    variants: [
      { label: "10 pack", dose: "10 pack", price: 2.99 }
    ],
  }
};

// Expose to Node tooling (content engine) without affecting browser usage,
// where PRODUCT_DATA remains a normal global.
if (typeof module !== "undefined" && module.exports) { module.exports = PRODUCT_DATA; }
