const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__T={get W(){return W},get IN(){return INPUT},nw:(c,m,s)=>newWorld(c,m,s)};\nfunction spawnBoss(){');
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const errs=[];
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub; w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w); w.console.error=(...a)=>errs.push(a.join(' '));}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(400); const T=w.__T; let bad=0;
  for(let s=1;s<=8;s++){ const W=T.nw('vector','m7',s);
    for(const tp of W.tps){
      for(const t of W.baseTurrets) if(Math.hypot(t.x-tp.x,t.y-tp.y)<t.r+tp.r) bad++;
      for(const c of W.cores){ if(Math.hypot(c.x-tp.x,c.y-tp.y)<c.r+tp.r) bad++; if(Math.hypot(c.pad.x-tp.x,c.pad.y-tp.y)<c.pad.r+tp.r) bad++; }
      for(const o of W.obstacles) if(!o.ghost&&Math.hypot(o.x-tp.x,o.y-tp.y)<o.r+tp.r) bad++; } }
  console.log('8 карт «Трёх опор»: телепортов на чём-то стоящем —', bad);
  click(d.querySelectorAll('#clsGrid .opt')[0]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id==='m7')); await step(50);
  click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  const W=T.W; w.__freeze=true; T.IN.mx=0; T.IN.my=0; W.enemies.length=0; W.lull=99; W.p.hp=W.p.hpMax=1e6;
  for(const tp of W.tps) tp.built=1;
  const c=W.size/2, name=tp=>'опора '+(W.tps.indexOf(tp)+1)+' ('+Math.round(Math.atan2(tp.y-c,tp.x-c)*180/Math.PI)+'°)';
  const near=()=>W.tps.reduce((a,b)=>Math.hypot(b.x-W.p.x,b.y-W.p.y)<Math.hypot(a.x-W.p.x,a.y-W.p.y)?b:a);
  const seq=[]; let cur=W.tps[0];
  for(let j=0;j<6;j++){ W.p.x=cur.x; W.p.y=cur.y; for(const tp of W.tps) tp.cd=0; await step(120);
    const nx=near(); seq.push(name(nx)); cur=nx; }
  console.log('прыжки подряд:', seq.join(' → '));
  console.log(errs.length?'ОШИБКИ: '+errs.slice(0,2).join(' | '):'ошибок нет');
  process.exit(0); })();
