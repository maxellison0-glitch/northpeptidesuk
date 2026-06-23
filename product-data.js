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
      { label: "1x10mg", dose: "10mg", price: 45 },
      { label: "1x15mg", dose: "15mg", price: 65 },
      { label: "1x20mg", dose: "20mg", price: 85 }
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
      { label: "1x15mg", dose: "15mg", price: 65 },
      { label: "1x30mg", dose: "30mg", price: 120 }
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
      { label: "1x10mg", dose: "10mg", price: 23.99 }
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
      { label: "1x10mg", dose: "10mg", price: 49 }
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
      { label: "1x50mg", dose: "50mg", price: 27 }
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
      { label: "1x10mg", dose: "10mg", price: 30 }
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
      { label: "1x80mg", dose: "80mg", price: 60 }
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
      { label: "1x5mg", dose: "5mg", price: 24.99 }
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
      { label: "1x5mg", dose: "5mg", price: 32 }
    ],
    stripePaymentLink: ""
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
        ["Dispatch", "Within 24h"],
        ["Follow-up", "Email Confirmed"],
        ["Use", "Research Only"]
      ],
      chips: ["3ml Cartridge", "BAC Water", "5 Pen Tips", "Thermal Packaging Option"]
    },
    variants: [
      { label: "Kit", dose: "3ml cartridge + BAC water + x5 pen tips", price: 24.99 }
    ],
    stripePaymentLink: ""
  },
  "pen-tips": {
    name: "Sterile Disposable Pen Tips",
    category: "Research supplies",
    supply: true,
    image: "research-pen-tips.jpg",
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
    stripePaymentLink: ""
  },
  "bacteriostatic-water": {
    name: "Bacteriostatic Water",
    category: "Research supplies",
    supply: true,
    image: "research-bac-water.png",
    summary: "10ml sealed bacteriostatic mixing water for research preparation workflows.",
    details: [
      "10ml vial",
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
      { label: "10ml vial", dose: "10ml vial", price: 6.99 }
    ],
    stripePaymentLink: ""
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
    stripePaymentLink: ""
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
    stripePaymentLink: ""
  }
};
