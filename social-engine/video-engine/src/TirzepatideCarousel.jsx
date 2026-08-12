import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';

const slides = [
  {kicker: 'THE NUMBER EVERYONE QUOTES', title: '20.9%\nIS NOT A\nBEFORE / AFTER.', body: 'It is the mean body-weight change reported at 72 weeks in one dose group of a large phase 3 trial.', type: 'cover'},
  {kicker: 'SURMOUNT-1  /  72 WEEKS', title: '2,539\nADULTS.', body: 'Adults with obesity or overweight plus a weight-related condition — without diabetes — were randomised to tirzepatide or placebo.', type: 'trial', tag: 'PHASE 3  ·  DOUBLE-BLIND  ·  RANDOMISED'},
  {kicker: 'THE PRIMARY ENDPOINT', title: '−20.9%\nMEAN WEIGHT', body: 'That was the 15 mg treatment-regimen estimate at week 72. Placebo was −3.1% in the same analysis.', type: 'endpoint', tag: '15 MG GROUP  ·  WEEK 72  ·  MEAN RESULT'},
  {kicker: 'THE DETAIL THAT CHANGES THE STORY', title: 'NOT A\n4-WEEK HACK.', body: 'The trial included a 20-week dose-escalation period, then followed participants out to week 72. Time is part of the result.', type: 'timeline', tag: '20-WEEK ESCALATION  →  72-WEEK ENDPOINT'},
  {kicker: 'SO WHAT DOES −20.9% MEAN?', title: '100 KG →\n79.1 KG', body: 'A simple maths illustration of the trial mean — not a prediction for one person. The endpoint matters more than the hype.', type: 'math', tag: 'TRIAL MEAN  ·  NOT A GUARANTEE'},
];

const C = {ink:'#171613', cream:'#F3EFE7', sand:'#D9CDBB', copper:'#C57B49', rust:'#A94B2C', green:'#A7B58B'};

function Glow({x,y,size,color,opacity=.28}) { return <div style={{position:'absolute',left:x,top:y,width:size,height:size,borderRadius:'50%',background:color,opacity,filter:'blur(75px)'}}/>; }
function Grid() { return <div style={{position:'absolute',inset:0,opacity:.08,backgroundImage:'radial-gradient(#F3EFE7 1px, transparent 1px)',backgroundSize:'22px 22px'}}/>; }

function Art({type}) {
  const base={position:'absolute',inset:0,pointerEvents:'none'};
  if(type==='cover') return <div style={base}><div style={{position:'absolute',right:40,top:280,width:510,height:510,border:`1px solid ${C.copper}`,borderRadius:'50%',boxShadow:`0 0 100px rgba(197,123,73,.38)`}}/><div style={{position:'absolute',right:120,top:360,width:350,height:350,border:`10px solid ${C.green}`,borderLeftColor:'transparent',borderBottomColor:'transparent',borderRadius:'50%',transform:'rotate(28deg)'}}/><div style={{position:'absolute',right:190,top:495,color:C.cream,font:'700 64px Arial'}}>20.9%</div></div>;
  if(type==='trial') return <div style={base}><div style={{position:'absolute',right:95,top:330,width:420,height:420,border:`2px solid ${C.green}`,borderRadius:'50%',opacity:.7}}/>{[0,1,2,3,4,5,6,7].map(i=><div key={i} style={{position:'absolute',right:265+(i%2)*70,top:360+i*45,width:14,height:14,borderRadius:'50%',background:i%3?C.copper:C.rust,boxShadow:`0 0 22px ${i%3?C.copper:C.rust}`}}/>)}<div style={{position:'absolute',right:118,bottom:275,color:C.green,font:'700 16px Arial',letterSpacing:3}}>RANDOMISED COHORT</div></div>;
  if(type==='endpoint') return <div style={base}><div style={{position:'absolute',right:92,top:430,width:360,height:360,border:`1px solid ${C.sand}`,borderRadius:'50%'}}/><div style={{position:'absolute',right:195,top:520,width:155,height:270,background:`linear-gradient(to top,${C.rust},${C.copper})`,borderRadius:'8px 8px 0 0'}}/><div style={{position:'absolute',right:390,top:620,width:84,height:170,background:C.green,borderRadius:'8px 8px 0 0'}}/><div style={{position:'absolute',right:118,bottom:275,color:C.green,font:'700 16px Arial',letterSpacing:3}}>TIRZEPATIDE  /  PLACEBO</div></div>;
  if(type==='timeline') return <div style={base}><div style={{position:'absolute',right:70,top:570,width:470,height:6,background:C.sand}}/><div style={{position:'absolute',right:70,top:548,width:12,height:50,background:C.copper}}/><div style={{position:'absolute',right:300,top:548,width:12,height:50,background:C.rust}}/><div style={{position:'absolute',right:520,top:548,width:12,height:50,background:C.green}}/><div style={{position:'absolute',right:470,top:630,color:C.green,font:'700 16px Arial',letterSpacing:3}}>START</div><div style={{position:'absolute',right:260,top:630,color:C.copper,font:'700 16px Arial',letterSpacing:3}}>ESCALATION</div><div style={{position:'absolute',right:68,top:630,color:C.sand,font:'700 16px Arial',letterSpacing:3}}>WEEK 72</div></div>;
  if(type==='math') return <div style={base}><div style={{position:'absolute',right:90,top:360,color:C.sand,font:'700 42px Arial'}}>100 KG</div><div style={{position:'absolute',right:185,top:440,width:250,height:3,background:C.copper,transform:'rotate(-28deg)',boxShadow:`0 0 18px ${C.copper}`}}/><div style={{position:'absolute',right:95,top:560,color:C.green,font:'700 54px Arial'}}>79.1 KG</div><div style={{position:'absolute',right:110,bottom:275,color:C.green,font:'700 16px Arial',letterSpacing:3}}>−20.9% ILLUSTRATION</div></div>;
  return null;
}

export const TirzepatideCarousel = () => {
  const frame=useCurrentFrame(); const index=Math.min(slides.length-1,Math.floor(frame/45)); const s=slides[index];
  return <div style={{width:1080,height:1350,position:'relative',overflow:'hidden',background:`linear-gradient(145deg,${C.ink} 0%,#2A251E 56%,#4B3327 100%)`,color:C.cream,fontFamily:'Georgia,serif'}}>
    <Glow x={-180} y={-100} size={650} color={C.rust}/><Glow x={760} y={700} size={500} color={C.green} opacity={.2}/><Grid/><Art type={s.type}/>
    <Img src={staticFile('tirzepatide-pen-vial.png')} style={{position:'absolute',right:-100,bottom:-60,width:600,height:760,objectFit:'cover',opacity:.15,mixBlendMode:'screen',filter:'grayscale(.8) sepia(.5) contrast(1.15)',maskImage:'radial-gradient(ellipse at 52% 52%,black 22%,rgba(0,0,0,.75) 58%,transparent 84%)',WebkitMaskImage:'radial-gradient(ellipse at 52% 52%,black 22%,rgba(0,0,0,.75) 58%,transparent 84%)'}}/>
    <div style={{position:'absolute',inset:66,border:'1px solid rgba(243,239,231,.24)',borderRadius:4}}/>
    <div style={{position:'absolute',left:112,top:112,right:112,bottom:112,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
      <div><div style={{font:'700 18px Arial',letterSpacing:5,color:C.green}}>{s.kicker}</div><div style={{width:62,height:5,background:C.copper,marginTop:24,marginBottom:66}}/><div style={{fontSize:s.type==='cover'?86:78,lineHeight:.98,fontWeight:700,letterSpacing:-2,whiteSpace:'pre-line',maxWidth:700,textShadow:'0 3px 18px rgba(0,0,0,.3)'}}>{s.title}</div><div style={{font:'28px/1.32 Arial',maxWidth:635,marginTop:58,color:C.cream}}>{s.body}</div></div>
      <div>{s.tag&&<div style={{font:'700 16px Arial',letterSpacing:2.3,color:C.sand,marginBottom:28}}>{s.tag}</div>}<div style={{display:'flex',justifyContent:'space-between',font:'16px Arial',letterSpacing:3,color:'rgba(243,239,231,.72)'}}><span>NORTH PEPTIDES UK  /  RESEARCH CONTEXT</span><span>{String(index+1).padStart(2,'0')} / 05</span></div><div style={{height:4,background:'rgba(243,239,231,.18)',marginTop:20}}><div style={{height:4,width:`${((index+1)/slides.length)*100}%`,background:C.copper}}/></div></div>
    </div>
  </div>;
};
