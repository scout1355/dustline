const fs=require('fs'),{JSDOM}=require('jsdom');
const src=process.argv[2];
let html=fs.readFileSync(src,'utf8')
  .replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function spawnBoss(){','window.__N={get W(){return W},set W(v){W=v},nw:(c,m,s)=>newWorld(c,m,s),sp:(t,x,y)=>spawnE(t,x,y)};\nfunction spawnBoss(){');
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
  const N=w.__N, res=[];
  for(const seed of [11,22,33,44,55]){
    const W=N.nw('vector','m1',seed); N.W=W; W.auto=false; await step(120);
    const made=[];
    for(let i=0;i<24;i++){ const a=i/24*Math.PI*2;
      N.sp('crawler', W.p.x+Math.cos(a)*900, W.p.y+Math.sin(a)*900);
      const e=W.enemies[W.enemies.length-1]; e.hp=e.hpMax=9e6; made.push(e); }
    await step(12000);
    const cur=made.filter(e=>!e.dead).map(e=>Math.hypot(e.x-W.p.x,e.y-W.p.y));
    res.push(Math.round(cur.reduce((a,b)=>a+b,0)/Math.max(1,cur.length)));
  }
  const avg=Math.round(res.reduce((a,b)=>a+b,0)/res.length);
  console.log(src.split('/').pop()+': по картам '+res.join(', ')+' | среднее '+avg);
  process.exit(0); })();
