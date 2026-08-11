import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';

const slides = [
  {
    kicker: 'THE BODY\'S SIGNAL LANGUAGE',
    title: 'WHAT CAN\nPEPTIDES ACTUALLY DO?',
    body: 'MOVE SUGAR  ·  SLOW DIGESTION  ·  HOLD WATER  ·  SIGNAL COLLAGEN  ·  TRIGGER HORMONE PULSES',
    type: 'cover',
  },
  {
    kicker: '01 / INSULIN',
    title: 'GLUT4\n→ GLUCOSE\nINTO CELLS',
    body: 'Insulin signals muscle and fat cells to pull glucose out of the bloodstream.',
    type: 'insulin',
    tag: 'PEPTIDE HORMONE  /  PANCREAS',
  },
  {
    kicker: '02 / GLP-1',
    title: 'THE\nINCRETIN\nEFFECT',
    body: 'Insulin ↑   ·   Glucagon ↓   ·   Gastric emptying ↓',
    type: 'glp1',
    tag: 'RECEPTOR SIGNAL  /  GUT–PANCREAS AXIS',
  },
  {
    kicker: '03 / GHK-Cu',
    title: 'COPPER\nTRIPEPTIDE\nSIGNALLING',
    body: 'Studied around fibroblasts, collagen expression and extracellular-matrix remodelling.',
    type: 'ghk',
    tag: 'PRECLINICAL CONNECTIVE-TISSUE RESEARCH',
  },
  {
    kicker: '04 / VASOPRESSIN',
    title: 'V2 RECEPTOR\n→ AQUAPORIN-2\n→ WATER RETENTION',
    body: 'A peptide signal that tells the kidneys to conserve water.',
    type: 'vasopressin',
    tag: 'ANTIDIURETIC HORMONE  /  KIDNEY',
  },
  {
    kicker: '05 / GHRH',
    title: 'PITUITARY\nPULSE\n→ GH → IGF-1',
    body: 'A peptide signal involved in pulsatile growth-hormone release, including the sleep-associated pulse.',
    type: 'ghrh',
    tag: 'NEUROENDOCRINE SIGNAL  /  SLEEP PHYSIOLOGY',
  },
];

const colors = {
  ink: '#171613',
  cream: '#F3EFE7',
  sand: '#D9CDBB',
  rust: '#A94B2C',
  copper: '#C57B49',
  olive: '#6D7653',
  green: '#A7B58B',
};

function DotGrid({opacity = 0.15}) {
  return <div style={{position: 'absolute', inset: 0, opacity, backgroundImage: 'radial-gradient(#F3EFE7 1px, transparent 1px)', backgroundSize: '22px 22px', pointerEvents: 'none'}} />;
}

function Glow({x, y, color, size, opacity = 0.35}) {
  return <div style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: color, opacity, filter: 'blur(70px)', pointerEvents: 'none'}} />;
}

function Diagram({type}) {
  const common = {position: 'absolute', inset: 0, pointerEvents: 'none'};
  if (type === 'insulin') return <div style={common}>
    <div style={{position: 'absolute', right: 90, top: 470, width: 290, height: 290, border: `2px solid ${colors.green}`, borderRadius: '50%', opacity: 0.35}} />
    <div style={{position: 'absolute', right: 145, top: 525, width: 180, height: 180, border: `1px solid ${colors.copper}`, borderRadius: '50%', opacity: 0.65}} />
    {[0,1,2,3,4].map((i) => <div key={i} style={{position: 'absolute', right: 240 + i * 22, top: 320 + i * 58, width: 11, height: 11, borderRadius: '50%', background: i % 2 ? colors.rust : colors.green, boxShadow: `0 0 22px ${i % 2 ? colors.rust : colors.green}`}} />)}
    <div style={{position: 'absolute', right: 88, bottom: 275, fontFamily: 'Arial, sans-serif', fontSize: 18, letterSpacing: 3, color: colors.green}}>CELL MEMBRANE</div>
  </div>;
  if (type === 'glp1') return <div style={common}>
    <div style={{position: 'absolute', right: 70, top: 260, width: 340, height: 500, border: `2px solid ${colors.copper}`, borderRadius: '48% 52% 44% 56%', transform: 'rotate(-9deg)', opacity: 0.6}} />
    <div style={{position: 'absolute', right: 170, top: 330, width: 200, height: 350, border: `1px solid ${colors.rust}`, borderRadius: '50%', transform: 'rotate(14deg)', opacity: 0.7}} />
    <div style={{position: 'absolute', right: 135, top: 820, width: 300, height: 2, background: colors.green, boxShadow: `0 0 30px ${colors.green}`}} />
    <div style={{position: 'absolute', right: 145, top: 850, fontFamily: 'Arial, sans-serif', fontSize: 16, letterSpacing: 3, color: colors.green}}>GUT–PANCREAS AXIS</div>
  </div>;
  if (type === 'ghk') return <div style={common}>
    {[0,1,2,3,4].map((i) => <div key={i} style={{position: 'absolute', right: 70 + i * 48, top: 270 + i * 110, width: 440, height: 2, background: i % 2 ? colors.copper : colors.green, transform: `rotate(${i % 2 ? 22 : -18}deg)`, opacity: 0.65, boxShadow: `0 0 18px ${i % 2 ? colors.copper : colors.green}`}} />)}
    <div style={{position: 'absolute', right: 102, bottom: 250, fontFamily: 'Arial, sans-serif', fontSize: 16, letterSpacing: 3, color: colors.green}}>FIBROBLAST / MATRIX</div>
  </div>;
  if (type === 'vasopressin') return <div style={common}>
    <div style={{position: 'absolute', right: 94, top: 340, width: 260, height: 410, border: `2px solid ${colors.green}`, borderRadius: '58% 42% 50% 50%', transform: 'rotate(-12deg)', opacity: 0.58}} />
    {[0,1,2,3,4,5].map((i) => <div key={i} style={{position: 'absolute', right: 185 + (i % 2) * 48, top: 315 + i * 75, width: 12, height: 12, borderRadius: '50%', background: colors.copper, boxShadow: `0 0 25px ${colors.copper}`}} />)}
    <div style={{position: 'absolute', right: 90, bottom: 250, fontFamily: 'Arial, sans-serif', fontSize: 16, letterSpacing: 3, color: colors.green}}>RENAL WATER BALANCE</div>
  </div>;
  if (type === 'ghrh') return <div style={common}>
    <div style={{position: 'absolute', right: 70, top: 470, width: 420, height: 120, borderTop: `3px solid ${colors.copper}`, borderRadius: '50%', transform: 'rotate(-5deg)', boxShadow: `0 0 36px ${colors.copper}`}} />
    <div style={{position: 'absolute', right: 105, top: 520, width: 330, height: 180, borderTop: `2px solid ${colors.green}`, borderRadius: '50%', transform: 'rotate(5deg)', opacity: 0.8}} />
    <div style={{position: 'absolute', right: 115, bottom: 250, fontFamily: 'Arial, sans-serif', fontSize: 16, letterSpacing: 3, color: colors.green}}>PULSATILE ENDOCRINOLOGY</div>
  </div>;
  return null;
}

function Vial({type}) {
  const fade = {maskImage: 'radial-gradient(ellipse at 52% 52%, black 22%, rgba(0,0,0,.78) 58%, transparent 84%)', WebkitMaskImage: 'radial-gradient(ellipse at 52% 52%, black 22%, rgba(0,0,0,.78) 58%, transparent 84%)', mixBlendMode: 'screen'};
  if (type === 'cover') return <Img src={staticFile('peptide-signals/vial-editorial.jpeg')} style={{position: 'absolute', right: -80, bottom: -30, width: 640, height: 820, objectFit: 'cover', objectPosition: 'center', opacity: 0.27, filter: 'sepia(0.6) saturate(0.55) contrast(1.08)', ...fade}} />;
  if (type === 'ghk') return <Img src={staticFile('peptide-signals/ghk-cu-vial.png')} style={{position: 'absolute', right: -40, bottom: -30, width: 600, height: 780, objectFit: 'cover', objectPosition: 'center', opacity: 0.23, filter: 'sepia(0.6) saturate(0.55) contrast(1.12)', ...fade}} />;
  return null;
}

export const PeptideSignalsCarousel = () => {
  const frame = useCurrentFrame();
  const slide = slides[Math.min(slides.length - 1, Math.floor(frame / 30))];
  const index = Math.min(slides.length - 1, Math.floor(frame / 30));
  const progress = (index + 1) / slides.length;
  return <div style={{width: 1080, height: 1350, background: `linear-gradient(145deg, ${colors.ink} 0%, #2A251E 50%, #4B3327 100%)`, color: colors.cream, fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden'}}>
    <Glow x={-160} y={-100} color={colors.rust} size={650} opacity={0.28} />
    <Glow x={720} y={700} color={colors.olive} size={520} opacity={0.22} />
    <DotGrid opacity={0.08} />
    <Vial type={slide.type} />
    <Diagram type={slide.type} />
    <div style={{position: 'absolute', inset: 66, border: `1px solid rgba(243,239,231,0.24)`, borderRadius: 4}} />
    <div style={{position: 'absolute', left: 112, top: 112, right: 112, bottom: 112, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div>
        <div style={{fontFamily: 'Arial, sans-serif', fontSize: 18, letterSpacing: 5, color: colors.green, fontWeight: 700}}>{slide.kicker}</div>
        <div style={{width: 62, height: 5, background: colors.copper, marginTop: 24, marginBottom: 66}} />
        <div style={{fontSize: slide.type === 'cover' ? 82 : 78, lineHeight: 0.98, fontWeight: 700, letterSpacing: -1, whiteSpace: 'pre-line', maxWidth: slide.type === 'cover' ? 750 : 680, textShadow: '0 3px 18px rgba(0,0,0,.28)'}}>{slide.title}</div>
        {slide.type === 'cover' ? <div style={{fontFamily: 'Arial, sans-serif', fontSize: 22, lineHeight: 1.35, letterSpacing: 2.4, maxWidth: 730, marginTop: 54, color: colors.sand, fontWeight: 700}}>{slide.body}</div> : <div style={{fontFamily: 'Arial, sans-serif', fontSize: 28, lineHeight: 1.32, maxWidth: 620, marginTop: 58, color: colors.cream}}>{slide.body}</div>}
      </div>
      <div>
        {slide.tag && <div style={{fontFamily: 'Arial, sans-serif', fontSize: 16, letterSpacing: 2.3, color: colors.sand, marginBottom: 28}}>{slide.tag}</div>}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Arial, sans-serif', fontSize: 16, letterSpacing: 3, color: 'rgba(243,239,231,.72)'}}><span>NORTH PEPTIDES UK  /  RESEARCH CONTEXT</span><span>{String(index + 1).padStart(2, '0')} / 06</span></div>
        <div style={{height: 4, background: 'rgba(243,239,231,.18)', marginTop: 20}}><div style={{height: 4, width: `${progress * 100}%`, background: colors.copper}} /></div>
      </div>
    </div>
  </div>;
};
