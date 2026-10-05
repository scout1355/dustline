const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function hurt(e,d,src){ if(e.dead)return;','function hurt(e,d,src){ if(e.dead)return; if(src==="fire") window.__FIRE=(window.__FIRE||0)+1;')
  .replace('function pollInput(){','function pollInput(){ if(window.__F2)return;').replace('function spawnBoss(){','window.__G={get W(){return W},sp:(t,x,y)=>spawnE(t,x,y,1,true)};\nfunction spawnBoss(){');
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
  const G=w.__G, W=G.W; w.__F2=true;
  /* камень между героем и врагом: огонь не должен пройти */
  const rock={x:W.p.x+70,y:W.p.y,r:36,s:0,k:0}; W.obstacles.push(rock); w.eval('buildObsGrid(W)');
  G.sp('crawler',W.p.x+150,W.p.y); const behind=W.enemies[W.enemies.length-1]; behind.hp=behind.hpMax=1e7; behind.sp=0; behind.dmg=0;
  G.sp('crawler',W.p.x,W.p.y+110); const open=W.enemies[W.enemies.length-1]; open.hp=open.hpMax=1e7; open.sp=0; open.dmg=0;
  const aim=(x,y)=>{ w.eval('INPUT.ax='+x+';INPUT.ay='+y); };
  const h0=behind.hp; for(let i=0;i<20;i++){ aim(behind.x,behind.y); await step(50); }
  const h1=open.hp;   for(let i=0;i<20;i++){ aim(open.x,open.y); await step(50); }
  console.log(`огнемёт за камнем: урон ${Math.round(h0-behind.hp)} | по открытой цели: ${Math.round(h1-open.hp)}`);
  console.log(errs.length?'ОШИБКИ: '+errs.slice(0,2).join(' | '):'ошибок нет');
  process.exit(0); })();
