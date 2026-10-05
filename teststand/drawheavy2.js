/* какие части картинки тратят больше всего команд рисования */
const fs=require('fs'),{JSDOM}=require('jsdom');
let html=fs.readFileSync('dp_heavy.html','utf8');
const parts=[];
for(const p of parts) html=html.replace(`function ${p}(`,`function ${p}(...__a){ const __s=DP.cur; DP.cur='${p}'; try{ return ${p}_(...__a); } finally{ DP.cur=__s; } }\nfunction ${p}_(`);
html=html.replace('<script>','<script>\nconst DP={cur:"прочее"}; window.DP=DP;');
const C={}; let frames=0;
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
    if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
    if(k==='measureText')return()=>({width:10});
    return ()=>{ const c=w.DP?w.DP.cur:'?'; C[c]=(C[c]||0)+1; }; },set:()=>true});
  w.HTMLCanvasElement.prototype.getContext=()=>stub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w); const raf=w.requestAnimationFrame.bind(w); w.requestAnimationFrame=f=>raf(t=>{frames++; f(t);});}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(400);
  click(d.querySelectorAll('#clsGrid .opt')[+(process.argv[2]||1)]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')].filter(a=>['flamer','barrage'].includes(a.dataset.id)); for(const a of ab){ click(a); await step(30); }
  click(d.getElementById('abGo')); await step(150);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id==='m3')); await step(50);
  click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  const FW=w.__FW, W=FW.W; W.weapons.rockets={lv:5,cd:0}; W.lull=0; FW.OPT.efps=+(process.argv[3]||15);
  /* тяжёлый бой: толпа постоянно подходит, гибнет — ракеты, дым, взрывы, ошмётки, лужи */
  const feed=setInterval(()=>{ for(let i=0;i<6;i++){ const a=Math.random()*6.28, r=160+Math.random()*120;
      FW.sp(['crawler','bloater','spitter'][i%3],W.p.x+Math.cos(a)*r,W.p.y+Math.sin(a)*r); } },400);
  await step(5000);
  for(const k in C) delete C[k]; frames=0; await step(3000);
  const tot=Object.values(C).reduce((a,b)=>a+b,0);
  console.log('частиц в кадре:', JSON.stringify(w.__FW.FX), '| луж:', w.__FW.W.pools.length, '| снарядов:', w.__FW.W.bullets.length, '| врагов:', w.__FW.W.enemies.length);
  console.log(`команд рисования за кадр: ${(tot/frames).toFixed(0)}`);
  for(const [k,v] of Object.entries(C).sort((a,b)=>b[1]-a[1])) console.log(`  ${k.padEnd(14)} ${(v/frames).toFixed(0).padStart(5)}  (${(100*v/tot).toFixed(0)}%)`);
  process.exit(0); })();
