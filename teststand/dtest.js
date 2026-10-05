const fs=require('fs'),{JSDOM}=require('jsdom');
let html=fs.readFileSync(process.argv[2],'utf8')
  .replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function spawnBoss(){','window.__D={get W(){return W},get S(){return S},sp:(t,x,y)=>spawnE(t,x,y)};\nfunction spawnBoss(){');
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w);}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(400);
  click(d.querySelectorAll('#clsGrid .opt')[0]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id==='m1')); await step(50);
  click(d.getElementById('startBtn')); await step(200);
  const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(250);
  if(d.getElementById('tutScreen').classList.contains('on')){ click(d.getElementById('tutGo')); await step(120); }
  const D=w.__D, W=D.W, S=D.S; W.auto=false;
  const cnt={}; for(const k of ['burst','squelch','wet','crunch']){ const f=S[k]; S[k]=(...a)=>{cnt[k]=(cnt[k]||0)+1; return f(...a);} ; }
  const types=['crawler','sprinter','stalker','hulk','spitter','bloater','armored','brood'];
  let killed=0;
  for(let g=0;g<5;g++){
    W.lull=0; W.recentKills=0;           // отключаем передышку, иначе враги не появятся
    const grp=[];
    for(let k=0;k<6;k++){ const n0=W.enemies.length; D.sp(types[(g*6+k)%types.length],W.p.x+400+k*30,W.p.y+g*40); if(W.enemies.length>n0) grp.push(W.enemies[W.enemies.length-1]); }
    await step(60);
    for(const e of grp){ e.hp=0; e.dead=true; killed++; }     // вся группа гибнет разом, как от очереди насквозь
    await step(420);
  }
  const total=Object.values(cnt).reduce((a,b)=>a+b,0);
  console.log(`${process.argv[3]}: убито ${killed}, прозвучало ${total} (${Math.round(100*total/killed)}%) — ${JSON.stringify(cnt)}`);
  process.exit(0); })();
