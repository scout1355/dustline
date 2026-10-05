/* сравнение: впечатанная кровь (Выгрузка) против прежней (Обкатка) после одной и той же бойни */
const fs=require('fs'),{JSDOM}=require('jsdom');
const mid=process.argv[2];
let html=fs.readFileSync('dustline-v17.html','utf8').replace('function bloodExpire(){','function bloodExpire(){ window.__BE=(window.__BE||0)+1;').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__G={get W(){return W},sp:(t,x,y)=>spawnE(t,x,y,1,true),hurt:(e,d)=>hurt(e,d),setHA:v=>{HIT_ANG=v;},get CORPSE(){return CORPSE},get DEC(){return DEC}};\nfunction spawnBoss(){')
  .replace('function blPaint(x,y,rad,fn){','function blPaint(x,y,rad,fn){ window.__BAKE=(window.__BAKE||0)+1;');
let N=0, inBake=false;
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4)}); return ()=>{N++;}; },set:()=>true});
let frames=0;
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub; w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}); require('./audio.js')(w);
  const raf=w.requestAnimationFrame.bind(w); w.requestAnimationFrame=f=>raf(t=>{frames++; f(t);});}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(400); const G=w.__G;
  click(d.querySelectorAll('#clsGrid .opt')[1]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id===mid)); await step(50);
  click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  const W=G.W; w.__freeze=true; W.auto=false; W.enemies.length=0; W.lull=99; W.intro=null; W.p.hp=W.p.hpMax=1e7; for(const g of W.goals) g.n=1e9;   // бойня не должна закончить миссию
  /* одинаковая бойня: 120 врагов вокруг героя */
  N=0; let kills=0;
  for(let wave=0;wave<8;wave++){ for(let i=0;i<15;i++){ const a=wave*1.1+i*.42, r=150+((i*37+wave*53)%260);
      G.sp('crawler',W.p.x+Math.cos(a)*r,W.p.y+Math.sin(a)*r*.7); const e=W.enemies[W.enemies.length-1];
      G.setHA(Math.atan2(e.y-W.p.y,e.x-W.p.x)); G.hurt(e,8); G.hurt(e,1e6); G.setHA(null); kills++; }
    await step(120); }
  await step(1500);
  N=0; frames=0; await step(2000);
  const perFrame=Math.round(N/frames);
  console.log(`${mid}: убито ${kills} | команд рисования за кадр после бойни: ${perFrame} | старых тел ${G.CORPSE.length}, старых следов ${G.DEC.length} | кусков земли ${Object.keys(W.blood||{}).length}`);
  if(W.bake){ /* герой уходит далеко, проходит 3 минуты — куски удаляются */
    W.p.x=W.size-200; W.p.y=W.size-200; W.t+=185;
    const tk0=w.eval('typeof TICK')!=='undefined'?0:0; await step(4000);
    const ks=Object.keys(W.blood); const c=W.blood[ks[0]];
    console.log('  уборок за всё время:', w.__BE);
    console.log('  отладка: герой', Math.round(W.p.x), Math.round(W.p.y), '| время', Math.round(W.t), '| кусок видели в', c&&Math.round(c.seen), '| до куска', c&&Math.round(Math.hypot(W.p.x-(c.cx+.5)*512,W.p.y-(c.cy+.5)*512)));
    console.log(`  через 3 минуты вдали от бойни: кусков земли ${Object.keys(W.blood||{}).length}`); }
  process.exit(0); })();
