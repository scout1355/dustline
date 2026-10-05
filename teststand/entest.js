const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__E={get W(){return W},get IN(){return INPUT}};\nfunction spawnBoss(){');
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const errs=[];
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w); w.console.error=(...a)=>errs.push(a.join(' '));}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(400);
  click(d.querySelectorAll('#clsGrid .opt')[0]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  click(d.querySelector('#misGrid .opt:not(.locked)')); await step(50);
  click(d.getElementById('startBtn')); await step(200);
  const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(250);
  if(d.getElementById('tutScreen').classList.contains('on')){ click(d.getElementById('tutGo')); await step(120); }
  const E=w.__E, W=E.W, IN=E.IN; w.__freeze=true; W.auto=false;
  W.ab1={id:'storm',lv:3,st:{}}; W.p.shMax=0; W.p.sh=0;          // питание только от энергии
  W.p.energy=W.p.energyMax;
  IN.ab1=true; await step(600); IN.ab1=false;                    // полсекунды «Разряда»
  const t0=Date.now(), e0=W.p.energy, marks=[];
  for(const ms of [400,900,1300,1700,2200]){ await step(ms-(Date.now()-t0)); marks.push(`${(ms/1000).toFixed(1)} с: ${W.p.energy.toFixed(1)}`); }
  console.log('энергия после отпускания: '+e0.toFixed(1)+' → '+marks.join(' | '));
  console.log(errs.length?'ОШИБКИ: '+errs.slice(0,2).join(' | '):'ошибок нет');
  process.exit(0); })();
