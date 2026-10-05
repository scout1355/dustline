const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__M={get W(){return W},get IN(){return INPUT}};\nfunction spawnBoss(){');
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
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id==='m2')); await step(50);
  click(d.getElementById('startBtn')); await step(200);
  const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  const M=w.__M, W=M.W, IN=M.IN; w.__freeze=true; IN.mx=0; IN.my=0;
  const bars=d.getElementById('oreBars');
  console.log('полос добычи:', bars.querySelectorAll('.orebar').length, '| видны до добычи:', bars.classList.contains('on'));
  const ore=W.ores[0]; W.p.x=ore.x+ore.r+W.p.r+6; W.p.y=ore.y; W.p.vx=0; W.p.vy=0;
  const g=W.goals.find(x=>x.t==='ore_'+ore.kind); const c0=g.cur;
  let beams=0; const b0=W.beams.length;
  await step(2000);
  const shotsWhileMining=W.beams.filter(b=>b.kind==='ray').length;
  console.log(`стоя 2 с: добыто ${(g.cur-c0).toFixed(1)} (около 14 при 7 в секунду) | полосы видны: ${bars.classList.contains('on')} | лучей автоатаки: ${shotsWhileMining} | подпись «${d.getElementById('ot_'+g.t).textContent}»`);
  IN.mx=1; const c1=g.cur;                                   // пошёл
  for(let i=0;i<20;i++){ W.p.x=ore.x+ore.r+W.p.r+6; W.p.y=ore.y; await step(50); }   // держим у кристалла, но «идём»
  console.log(`на ходу 1 с у кристалла: добыто ${(g.cur-c1).toFixed(1)} (должно быть 0) | полосы: ${bars.classList.contains('on')?'видны':'гаснут'}`);
  console.log(errs.length?'ОШИБКИ: '+errs.slice(0,2).join(' | '):'ошибок нет');
  process.exit(0); })();
