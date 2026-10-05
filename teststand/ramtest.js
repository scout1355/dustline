const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__K={get W(){return W},get IN(){return INPUT},get AB(){return ABILITIES},sp:(t,x,y)=>spawnE(t,x,y,1,true)};\nfunction spawnBoss(){');
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
(async()=>{ await step(400); const K=w.__K;
  click(d.querySelectorAll('#clsGrid .opt')[1]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')].filter(a=>['ram','barrage'].includes(a.dataset.id)); for(const a of ab){ click(a); await step(30); }
  click(d.getElementById('abGo')); await step(150);
  click(d.querySelector('#misGrid .opt:not(.locked)')); await step(50);
  click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  const W=K.W; w.__freeze=true; W.auto=false; for(const e of W.enemies) e.dead=true; W.lull=99; await step(80);
  /* таран вправо: оставляет горизонтальную стену огня */
  K.IN.mx=1; K.IN.my=0; W.p.ang=0; K.AB.ram.use(3); await step(700); K.IN.mx=0;
  const trail=W.pools.filter(q=>q.wall);
  const xs=trail.map(q=>q.x), y0=trail.length?trail[0].y:W.p.y, cx=(Math.min(...xs)+Math.max(...xs))/2;
  console.log(`след: звеньев ${trail.length}, длина ${Math.round(Math.max(...xs)-Math.min(...xs))}, живёт ${trail.length?trail[0].max:0} с`);
  /* враг снизу идёт вверх, к герою за стеной */
  W.p.x=cx; W.p.y=y0-260;
  K.sp('stalker',cx,y0+70); const e=W.enemies[W.enemies.length-1]; e.hp=e.hpMax=1e6;
  let minY=e.y; for(let i=0;i<60;i++){ await step(50); minY=Math.min(minY,e.y); }
  console.log(`враг шёл к герою через след: ближе всего подошёл к линии на ${Math.round(minY-y0)} (отрицательно — значит прошёл) | обожжён: ${Math.round(1e6-e.hp)} урона`);
  await step(1500); console.log(`через ~5 с: звеньев следа осталось ${W.pools.filter(q=>q.wall).length}`);
  console.log(errs.length?'ОШИБКИ: '+errs.slice(0,2).join(' | '):'ошибок нет');
  process.exit(0); })();
