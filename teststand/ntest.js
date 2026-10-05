const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('n_test.html','utf8'); const errs=[];
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w);
  w.onerror=m=>errs.push('onerror: '+m); w.console.error=(...a)=>errs.push(a.map(String).join(' '));}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(400);
  click(d.querySelectorAll('#clsGrid .opt')[0]); await step(60); click(d.getElementById('toMis')); await step(150);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(40); click(ab[1]); await step(40);
  click(d.getElementById('abGo')); await step(200);
  const card=[...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id==='m1'); click(card); await step(60);
  click(d.getElementById('startBtn')); await step(250);
  const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  if(d.getElementById('tutScreen').classList.contains('on')){ click(d.getElementById('tutGo')); await step(150); }
  const N=w.__N, W=N.W;
  W.auto=false;                       // герой не стреляет: меряем только ход врагов
  /* ставим врагов по кругу в 900 единицах и смотрим, сколько дойдёт */
  for(const e of W.enemies) e.dead=true; await step(120);
  const made=[];
  for(let i=0;i<24;i++){ const a=i/24*Math.PI*2;
    N.sp('crawler', W.p.x+Math.cos(a)*900, W.p.y+Math.sin(a)*900);
    const e=W.enemies[W.enemies.length-1]; e.hp=e.hpMax=9e6; made.push(e); }
  const d0=made.map(e=>Math.hypot(e.x-W.p.x,e.y-W.p.y));
  const snap=[];
  for(let s=0;s<6;s++){ await step(2500);
    const cur=made.filter(e=>!e.dead).map(e=>Math.hypot(e.x-W.p.x,e.y-W.p.y));
    snap.push(Math.round(cur.reduce((a,b)=>a+b,0)/Math.max(1,cur.length))); }
  const stuck=made.filter(e=>!e.dead&&Math.hypot(e.x-W.p.x,e.y-W.p.y)>500).length;
  console.log('камней на карте:', W.obstacles.length);
  console.log('среднее расстояние до героя, каждые 2.5 с:', snap.join(' → '));
  console.log('из 24 врагов так и не подошли ближе 500:', stuck);
  console.log(errs.length?'ОШИБКИ: '+[...new Set(errs)].slice(0,3).join(' | '):'ошибок нет');
  process.exit(0); })();
