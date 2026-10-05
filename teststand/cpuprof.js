/* профиль расчёта: сколько времени и вызовов уходит на каждую часть за секунду боя */
const fs=require('fs'),{JSDOM}=require('jsdom');
let html=fs.readFileSync(process.argv[2]||'dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;');
/* обёртки для замера — только в тестовой копии */
html=html.replace('function hurt(e,d,src){ if(e.dead)return;','function hurt(e,d,src){ if(e.dead)return; PROF.hurt=(PROF.hurt||0)+1; if(src===undefined) PROF.dot=(PROF.dot||0)+1;')
         .replace('function gridNear(','function gridNear_(').replace('function spawnBoss(){',
`window.__P={sp:(t,x,y)=>spawnE(t,x,y,1,true),get IN(){return INPUT},get W(){return W},get WEAPONS(){return WEAPONS},get ABILITIES(){return ABILITIES}};
function gridNear(...a){ PROF.grid=(PROF.grid||0)+1; return gridNear_(...a); }
function spawnBoss(){`);
html=html.replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;').replace('<script>','<script>\nconst PROF={}; window.PROF=PROF;');
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
  const ci=+(process.argv[3]||0);
  click(d.querySelectorAll('#clsGrid .opt')[ci]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')];
  const want=(process.argv[4]||'').split(',').filter(Boolean);
  const pick=want.length?ab.filter(a=>want.includes(a.dataset.id)):ab.slice(0,2);
  for(const a of pick.slice(0,2)){ click(a); await step(30); }
  click(d.getElementById('abGo')); await step(150);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id==='m3')); await step(50);
  click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  const P=w.__P, W=P.W; W.t=200;
  /* плотная толпа вокруг героя: 40 живучих врагов в 120–320 единицах, стоят на месте */
  for(const e of W.enemies) e.dead=true; await step(100);
  for(let i=0;i<40;i++){ const a=i/40*Math.PI*2*3.1, r=120+(i%5)*50;
    P.sp('crawler',W.p.x+Math.cos(a)*r,W.p.y+Math.sin(a)*r);
    const e=W.enemies[W.enemies.length-1]; e.hp=e.hpMax=1e7; e.sp=0; e.dmg=0; }
  w.__freeze=true; P.IN.mx=0; P.IN.my=0; P.IN.ax=W.p.x+200; P.IN.ay=W.p.y; W.lull=999;
  if((process.argv[4]||'').includes('storm')) P.IN.ab1=true;
  /* время по частям: оборачиваем тики оружия и способностей */
  const T={}; const now=()=>w.performance.now();
  for(const [tab,label] of [[P.WEAPONS,'оружие'],[P.ABILITIES,'способн.']]) for(const id in tab){ const o=tab[id];
    for(const fn of ['tick','use']) if(typeof o[fn]==='function'){ const f=o[fn];
      o[fn]=function(...a){ const t0=now(); try{ return f.apply(this,a); } finally{ const k=label+' '+id; T[k]=(T[k]||0)+now()-t0; } }; } }
  await step(5000);
  for(const k of ['hurt','grid','dot']) w.PROF[k]=0; for(const k in T) T[k]=0;
  const t0=W.t; await step(4000); const sec=W.t-t0;
  console.log(`за ${sec.toFixed(1)} с боя, врагов ${W.enemies.length}, горящих/отравленных ${W.enemies.filter(e=>e.pois).length}:`);
  console.log(`  вызовов урона в секунду: ${(w.PROF.hurt/sec).toFixed(0)} (из них без источника, т.е. яд/горение: ${(w.PROF.dot/sec).toFixed(0)}) | поисков соседей: ${(w.PROF.grid/sec).toFixed(0)}`);
  for(const [k,v] of Object.entries(T).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,6)) console.log(`  ${k.padEnd(22)} ${(v/sec).toFixed(1)} мс на секунду боя`);
  process.exit(0); })();
