const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__B={get W(){return W},get S(){return S},get IN(){return INPUT},hurtNest:(n,d)=>hurtNest(n,d),mines:()=>spawnMinePoints(),ray:(x,y,a,m,r)=>rayHit(x,y,a,m,r),cone:(...a)=>nearestCone(...a),win:()=>winRun(),menu:()=>toMenu(),get prog(){return progress},set sel(v){selCls=v},row:()=>renderRelicRow()};\nfunction spawnBoss(){');
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
const startMission=async(cls,mid)=>{ click(d.querySelectorAll('#clsGrid .opt')[cls]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id===mid)); await step(50);
  click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300); };
(async()=>{ await step(400);
  console.log('карточки героев: упоминаний ЛКМ/ПКМ —', (d.getElementById('clsGrid').textContent.match(/ЛКМ|ПКМ|LMB|RMB/g)||[]).length);
  // гнёзда: прочность и выводок
  await startMission(2,'m2'); const B=w.__B; let W=B.W;
  const n=W.nests[0]; console.log('гнездо: прочность', Math.round(n.hpMax), '(было '+Math.round(n.hpMax/3)+')');
  W.lull=5; const e0=W.enemies.length; B.hurtNest(n,1e9); await step(100);
  const brood=W.enemies.filter(e=>e.rage>0).length;
  console.log(`гнездо уничтожено во время передышки: выводка ${W.enemies.length-e0}, в ярости ${brood}`);
  // лучи: малый камень держит лазер, молния бьёт сквозь
  const small=W.obstacles.find(o=>o.r<32&&!o.ore&&!o.alien);
  if(small){ const sx=small.x-small.r-90, sy=small.y;                // встаём вплотную, на линии нет других камней
    console.log(`малый камень r${Math.round(small.r)} в ${Math.round(small.r+90)} от героя: лазер упирается на ${Math.round(B.ray(sx,sy,0,400,0))}, снаряды летят до ${Math.round(B.ray(sx,sy,0,400))}`); }
  // тиканье: закладка — да, ремонт — нет
  await (async()=>{ click(d.getElementById('pauseBtn')); await step(80); click(d.getElementById('quitBtn')||d.querySelector('#pauseScreen .ghost')); await step(200); })();
  await startMission(0,'m3'); W=B.W; w.__freeze=true; B.IN.mx=0; B.IN.my=0;
  const gc=W.goals.find(g=>g.t==='crates'); if(gc){ gc.cur=gc.n; gc.done=true; }
  if(!W.minePts.length) B.mines();
  await step(200);
  let ticks=0; const S=B.S, tk=S.tick; S.tick=(...a)=>{ ticks++; return tk(...a); };
  const m=W.minePts[0];
  if(m){ W.p.x=m.x; W.p.y=m.y; W.p.vx=0; W.p.vy=0; await step(2100);
    const armT=ticks; m.st=3; m.fix=0; ticks=0; await step(1600);
    console.log(`тиканье: за 2 с закладки — ${armT} раз, за 1.6 с ремонта — ${ticks} раз`); }
  else console.log('точек закладки нет — проверить тиканье не удалось');
  // копилка минералов и трофеи в меню
  W.goals.push({t:'ore_verd',n:200,cur:57.6,done:true}); W.relics=['adaptive']; B.win(); await step(200); B.menu(); await step(300);
  const card=d.querySelector('#clsGrid .opt[data-id="vector"]');
  console.log('карточка Вектора, строка минералов:', (card.querySelector('.pts.ore')||{}).textContent||'нет');
  B.sel='vector'; B.row(); await step(50);
  const chip=d.querySelector('#relicRow .rchip'); click(chip); await step(80);
  const pop=d.getElementById('infoPop');
  console.log('нажатие на трофей: окно', pop.hidden?'НЕ открыто':'открыто — «'+d.getElementById('infoTitle').textContent+'»');
  w.dispatchEvent(new w.Event('pointerdown',{bubbles:true})); await step(80);     // касание пальцем в любом месте
  console.log('нажатие мимо: окно', pop.hidden?'закрыто':'ОСТАЛОСЬ ОТКРЫТЫМ');
  console.log(errs.length?'ОШИБКИ: '+[...new Set(errs)].slice(0,3).join(' | '):'ошибок нет');
  process.exit(0); })();
