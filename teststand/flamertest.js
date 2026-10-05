const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function hurt(e,d,src){ if(e.dead)return;','function hurt(e,d,src){ if(e.dead)return; if(src==="fire") window.__FIRE=(window.__FIRE||0)+1;')
  .replace('function spawnBoss(){','window.__G={get W(){return W},sp:(t,x,y)=>spawnE(t,x,y,1,true)};\nfunction spawnBoss(){');
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const errs=[];
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  { let o=w; while(o){ if(Object.prototype.hasOwnProperty.call(o,'ontouchstart')) delete o.ontouchstart; o=Object.getPrototypeOf(o); } }
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.HTMLCanvasElement.prototype.getContext=()=>stub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  require('./audio.js')(w); w.console.error=(...a)=>errs.push(a.join(' '));}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const key=k=>{ w.dispatchEvent(new w.KeyboardEvent('keydown',{key:k,bubbles:true})); w.dispatchEvent(new w.KeyboardEvent('keyup',{key:k,bubbles:true})); };
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(400);
  click(d.querySelectorAll('#clsGrid .opt')[1]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')].filter(a=>['flamer','barrage'].includes(a.dataset.id));
  for(const a of ab){ click(a); await step(30); }
  click(d.getElementById('abGo')); await step(150);
  click(d.querySelector('#misGrid .opt:not(.locked)')); await step(50);
  click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  const G=w.__G, W=G.W;
  const ring=()=>{ for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; G.sp('crawler',W.p.x+Math.cos(a)*90,W.p.y+Math.sin(a)*90);
    const e=W.enemies[W.enemies.length-1]; e.hp=e.hpMax=1e7; e.sp=0; e.dmg=0; } };
  ring(); await step(150);
  w.__FIRE=0; await step(1000); const on1=w.__FIRE;
  key('r'); await step(100); const autoOff=!W.auto;
  await step(1900);                       // даём догореть тем, кого уже подожгли
  w.__FIRE=0; await step(1000); const off=w.__FIRE;
  key('r'); await step(100); w.__FIRE=0; await step(1000); const on2=w.__FIRE;
  console.log(`огнемёт: включён — ${on1} ударов огнём за секунду | после R (автоатака ${autoOff?'выключена':'НЕ выключилась'}) — ${off} | после повторного R — ${on2}`);
  console.log(errs.length?'ОШИБКИ: '+errs.slice(0,2).join(' | '):'ошибок нет');
  process.exit(0); })();
