const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__K={get W(){return W},get IN(){return INPUT},get AB(){return ABILITIES},get WP(){return WEAPONS},sp:(t,x,y)=>spawnE(t,x,y,1,true),grid:()=>buildObsGrid(W),get prog(){return progress},elite:t=>spawnElite(t),get CL(){return CLASSES}};\nfunction spawnBoss(){');
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
const start=async(ci,ids,mid)=>{ click(d.querySelectorAll('#clsGrid .opt')[ci]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; const pk=ids?ab.filter(a=>ids.includes(a.dataset.id)):ab.slice(0,2);
  for(const a of pk.slice(0,2)) if(!a.classList.contains('sel')){ click(a); await step(30); }
  click(d.getElementById('abGo')); await step(150);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id===mid)); await step(50);
  click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300); };
const quit=async()=>{ w.eval; const K=w.__K; K.W.over=true; await step(50); click(d.getElementById('pauseBtn')); await step(60);
  const q=d.getElementById('quitBtn'); if(q) click(q); await step(150); };
const aim=(K,x,y)=>{ K.IN.ax=x; K.IN.ay=y; };
(async()=>{ await step(400); const K=w.__K;
  console.log('Гром: здоровье', K.CL.thunder.hp, '| скорость', K.CL.thunder.speed, '(было 132 и 190)');
  /* огнемёт и клинок по гнезду */
  await start(1,['flamer','blade'],'m2'); let W=K.W; w.__freeze=true; K.IN.mx=0; K.IN.my=0; W.auto=true;
  const n=W.nests[0]; W.p.x=n.x-90; W.p.y=n.y; for(const e of W.enemies) e.dead=true;
  const h0=n.hp; for(let i=0;i<20;i++){ aim(K,n.x,n.y); await step(50); }
  console.log(`огнемёт по гнезду за секунду: ${Math.round(h0-n.hp)}`);
  const slot=W.ab1.id==='blade'?'ab1':'ab2'; const h1=n.hp; W.p[slot+'Cd']=0; aim(K,n.x,n.y); K.IN[slot]=true; await step(120); K.IN[slot]=false; await step(400);
  console.log(`клинок по гнезду, один взмах: ${Math.round(h1-n.hp)} (с огнём за то же время)`);
  /* удержание точки и минералы */
  await quit(); await start(2,null,'m4'); W=K.W;
  const hg=W.goals.find(g=>g.t==='hold'); W.p.x=W.hold.x; W.p.y=W.hold.y; await step(800);
  console.log(`«Точка опоры»: целей с минералами ${W.goals.filter(g=>g.t.indexOf('ore_')===0).length}, стоим на точке 0.8 с при недобытых — удержание ${hg.cur.toFixed(1)} (должно быть 0)`);
  for(const g of W.goals) if(g.t.indexOf('ore_')===0){ g.cur=g.n; g.done=true; }
  await step(800); console.log(`после добычи всех минералов — удержание ${hg.cur.toFixed(1)}`);
  /* трофей не выпадает повторно */
  await quit(); await start(0,null,'m2'); W=K.W;
  K.prog.relicBy=K.prog.relicBy||{}; (K.prog.relicBy.vector=K.prog.relicBy.vector||{}).m2='adaptive';
  W.eliteLeft=1; W.eliteT=0; W.trophySpawned=false; await step(300);
  const el=W.enemies.filter(e=>e.elite&&!e.boss);
  console.log(`повторный забег героя с трофеем: элита появилась ${el.length?'да':'нет'}, носитель трофея: ${el.some(e=>e.trophy)?'ДА — плохо':'нет'}`);
  /* луч: враг за камнем; автоподача */
  W.auto=true; for(const e of W.enemies) e.dead=true; await step(80);
  const rock={x:W.p.x+120,y:W.p.y,r:30,s:0,k:0}; W.obstacles.push(rock); K.grid();
  K.sp('crawler',W.p.x+240,W.p.y); const behind=W.enemies[W.enemies.length-1]; behind.hp=behind.hpMax=1e7; behind.sp=0; behind.dmg=0;
  const hb=behind.hp; for(let i=0;i<20;i++){ aim(K,behind.x,behind.y); await step(50); }
  console.log(`луч по врагу за камнем: урон ${Math.round(hb-behind.hp)} (должно быть 0)`);
  W.obstacles.splice(W.obstacles.indexOf(rock),1); K.grid();
  const dps=async()=>{ const x=behind.hp; for(let i=0;i<20;i++){ aim(K,behind.x,behind.y); await step(50); } return x-behind.hp; };
  W.weapons.beam.hot=1.7; W.pas.rate=0; const a0=await dps(); W.pas.rate=5; const a5=await dps();
  console.log(`луч без автоподачи ${Math.round(a0)}, с автоподачей 5 — ${Math.round(a5)} (×${(a5/a0).toFixed(2)})`);
  console.log(errs.length?'ОШИБКИ: '+[...new Set(errs)].slice(0,3).join(' | '):'ошибок нет');
  process.exit(0); })();
