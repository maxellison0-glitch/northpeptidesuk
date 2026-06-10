const PRODUCT_DATA = {
  retatrutide: {
    name: "Retatrutide",
    category: "Metabolic research",
    image: "hf_20260523_171709_476460c3-db51-4ebf-b0ce-dce6b2f29382.jpeg",
    summary: "GLP-1, GIP and glucagon receptor research compound supplied as lyophilised powder.",
    details: [
      "99%+ purity — verified",
      "UK stocked, 24h dispatch",
      "Stored frozen until dispatch",
      "Purity certificate on request"
    ],
    variants: [
      { label: "1x 10mg", dose: "10mg", price: 40 },
      { label: "1x 15mg", dose: "15mg", price: 58 },
      { label: "1x 20mg", dose: "20mg", price: 76 },
      { label: "2x 10mg", dose: "2x 10mg", price: 73 },
      { label: "2x 15mg", dose: "2x 15mg", price: 105 },
      { label: "2x 20mg", dose: "2x 20mg", price: 138 },
      { label: "3x 10mg", dose: "3x 10mg", price: 97 },
      { label: "3x 15mg", dose: "3x 15mg", price: 140 },
      { label: "3x 20mg", dose: "3x 20mg", price: 184 }
    ],
    stripePaymentLink: ""
  },
  tirzepatide: {
    name: "Tirzepatide",
    category: "Metabolic research",
    image: "hf_20260523_171735_79bb55e1-312b-40bf-93f2-59afdd43de09.jpeg",
    summary: "Dual GIP and GLP-1 receptor agonist research compound supplied as lyophilised powder.",
    details: [
      "99%+ purity — verified",
      "UK stocked, 24h dispatch",
      "Stored frozen until dispatch",
      "Purity certificate on request"
    ],
    variants: [
      { label: "1x 15mg", dose: "15mg", price: 58 },
      { label: "1x 30mg", dose: "30mg", price: 108 },
      { label: "2x 15mg", dose: "2x 15mg", price: 105 },
      { label: "2x 30mg", dose: "2x 30mg", price: 194 },
      { label: "3x 15mg", dose: "3x 15mg", price: 140 },
      { label: "3x 30mg", dose: "3x 30mg", price: 259 }
    ],
    stripePaymentLink: ""
  },
  "bpc-157": {
    name: "BPC-157",
    category: "Research peptide",
    image: "hf_20260523_171828_c517069f-2388-4215-bec5-f0516a7554b1.jpeg",
    summary: "Research peptide supplied as a 10mg lyophilised vial.",
    details: [
      "99%+ purity — verified",
      "UK stocked, 24h dispatch",
      "Stored frozen until dispatch",
      "Purity certificate on request"
    ],
    variants: [
      { label: "1x 10mg", dose: "10mg", price: 17 },
      { label: "2x 10mg", dose: "2x 10mg", price: 31 },
      { label: "3x 10mg", dose: "3x 10mg", price: 41 }
    ],
    stripePaymentLink: ""
  },
  "tb-500": {
    name: "TB-500",
    category: "Research peptide",
    image: "hf_20260523_171838_139029e0-0fb2-4778-9db6-5f0470e836ae.jpeg",
    summary: "Thymosin Beta-4 fragment research compound supplied as a 10mg lyophilised vial.",
    details: [
      "99%+ purity — verified",
      "UK stocked, 24h dispatch",
      "Stored frozen until dispatch",
      "Purity certificate on request"
    ],
    variants: [
      { label: "1x 10mg", dose: "10mg", price: 44 },
      { label: "2x 10mg", dose: "2x 10mg", price: 79 },
      { label: "3x 10mg", dose: "3x 10mg", price: 106 }
    ],
    stripePaymentLink: ""
  },
  "ghk-cu": {
    name: "GHK-Cu",
    category: "Research peptide",
    image: "hf_20260523_171846_eb6a53a7-44d0-4dca-9c3a-bac61701229d.jpeg",
    summary: "Copper peptide research compound supplied as a 50mg lyophilised vial.",
    details: [
      "99%+ purity — verified",
      "UK stocked, 24h dispatch",
      "Stored frozen until dispatch",
      "Purity certificate on request"
    ],
    variants: [
      { label: "1x 50mg", dose: "50mg", price: 15 },
      { label: "2x 50mg", dose: "2x 50mg", price: 28 },
      { label: "3x 50mg", dose: "3x 50mg", price: 37 }
    ],
    stripePaymentLink: ""
  },
  kpv: {
    name: "KPV",
    category: "Research peptide",
    image: "hf_20260523_171852_e8a239be-4a76-4958-930e-b68b87cbc701.png",
    summary: "KPV research peptide supplied as a 10mg lyophilised vial.",
    details: [
      "99%+ purity — verified",
      "UK stocked, 24h dispatch",
      "Stored frozen until dispatch",
      "Purity certificate on request"
    ],
    variants: [
      { label: "1x 10mg", dose: "10mg", price: 20 },
      { label: "2x 10mg", dose: "2x 10mg", price: 36 },
      { label: "3x 10mg", dose: "3x 10mg", price: 48 }
    ],
    stripePaymentLink: ""
  },
  "klow-stack": {
    name: "KLOW Stack",
    category: "Research blend",
    image: "hf_20260523_171756_e0946bdc-4f47-4100-b4ea-b3a5094a1afb.jpeg",
    summary: "Four-compound research blend containing GHK-Cu, TB-500, BPC-157 and KPV.",
    details: [
      "99%+ purity — verified",
      "UK stocked, 24h dispatch",
      "Stored frozen until dispatch",
      "Purity certificate on request"
    ],
    variants: [
      { label: "1x 80mg", dose: "80mg", price: 54 },
      { label: "2x 80mg", dose: "2x 80mg", price: 97 },
      { label: "3x 80mg", dose: "3x 80mg", price: 130 }
    ],
    stripePaymentLink: ""
  },
  ipamorelin: {
    name: "Ipamorelin",
    category: "Research peptide",
    image: "hf_20260523_171904_baaf1708-79ff-4396-8a78-76018f3acdc4.jpeg",
    summary: "Research peptide supplied as a 5mg lyophilised vial.",
    details: [
      "99%+ purity — verified",
      "UK stocked, 24h dispatch",
      "Stored frozen until dispatch",
      "Purity certificate on request"
    ],
    variants: [
      { label: "1x 5mg", dose: "5mg", price: 17 },
      { label: "2x 5mg", dose: "2x 5mg", price: 31 },
      { label: "3x 5mg", dose: "3x 5mg", price: 41 }
    ],
    stripePaymentLink: ""
  },
  "cjc-1295": {
    name: "CJC-1295 (No DAC)",
    category: "Research peptide",
    image: "hf_20260523_171921_abfd9afd-aa38-48a9-bba3-538df7508dd2.jpeg",
    summary: "Modified GRF 1-29 research compound supplied as a 5mg lyophilised vial.",
    details: [
      "99%+ purity — verified",
      "UK stocked, 24h dispatch",
      "Stored frozen until dispatch",
      "Purity certificate on request"
    ],
    variants: [
      { label: "1x 5mg", dose: "5mg", price: 29 },
      { label: "2x 5mg", dose: "2x 5mg", price: 52 },
      { label: "3x 5mg", dose: "3x 5mg", price: 69 }
    ],
    stripePaymentLink: ""
  }
};
