const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__B={get W(){return W},get IN(){return INPUT},sp:(t,x,y)=>spawnE(t,x,y,1,true)};\nfunction spawnBoss(){');
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
(async()=>{ await step(400); const K=w.__B;
  click(d.querySelectorAll('#clsGrid .opt')[2]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id==='m6')); await step(50);
  click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  const W=K.W; w.__freeze=true; K.IN.mx=0; K.IN.my=0; W.auto=false; W.enemies.length=0; W.shards.length=0; W.lull=99;
  W.helpers&&(W.helpers.length=0);
  const bt=W.baseTurrets[0]; W.p.x=bt.x+400; W.p.y=bt.y+400; await step(100);
  /* враг у турели: её убийство не должно давать опыт */
  const xp0=W.p.xp, lv0=W.p.level;
  for(let i=0;i<6;i++){ K.sp('crawler',bt.x+120+i*8,bt.y); }
  await step(2500);
  const dead=W.enemies.filter(e=>e.dead).length;
  console.log(`турель базы убила врагов: опыт героя ${xp0} → ${W.p.xp} (уровень ${lv0} → ${W.p.level})`);
  /* разрушенная турель: встаёт только после полного ремонта */
  bt.hp=0; await step(100);
  W.p.x=bt.x+bt.r+10; W.p.y=bt.y; await step(1500);
  console.log(`ремонт 1.5 с: прочность ${Math.round(bt.hp)}, ход ремонта ${Math.round(bt.rep)}/${bt.hpMax}, стреляет: ${bt.down?'нет — ещё разбита':'да'}`);
  await step(4200);
  console.log(`ремонт ещё 4.2 с: ${bt.down?'всё ещё разбита':'восстановлена, прочность '+Math.round(bt.hp)}`);
  console.log(errs.length?'ОШИБКИ: '+errs.slice(0,2).join(' | '):'ошибок нет');
  process.exit(0); })();
