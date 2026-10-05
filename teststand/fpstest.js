const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8')
  .replace('function render(){','window.__R=0;\nfunction render(){ window.__R++;')
  .replace('function spawnBoss(){','window.__F={get W(){return W},get OPT(){return OPT}};\nfunction spawnBoss(){');
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w);}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(400);
  w.__R=0; await step(2000); console.log(`главное меню: отрисовок в секунду ${(w.__R/2).toFixed(0)}`);
  click(d.querySelectorAll('#clsGrid .opt')[0]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  click(d.querySelector('#misGrid .opt:not(.locked)')); await step(50);
  click(d.getElementById('startBtn')); await step(200);
  const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(250);
  if(d.getElementById('tutScreen').classList.contains('on')){ click(d.getElementById('tutGo')); await step(120); }
  const F=w.__F, W=F.W;
  for(const fps of [60,40,30]){ F.OPT.fps=fps; await step(300);
    w.__R=0; const t0=W.t; await step(2000);
    console.log(`бой, ограничение ${fps}: отрисовок в секунду ${(w.__R/2).toFixed(0)}, игровое время за 2 с прошло ${(W.t-t0).toFixed(2)} с`); }
  F.OPT.fps=60; click(d.getElementById('pauseBtn')); await step(300);
  w.__R=0; await step(2000); console.log(`пауза: отрисовок в секунду ${(w.__R/2).toFixed(0)}`);
  process.exit(0); })();
