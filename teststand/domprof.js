const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;');
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
let frames=0;
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w); const raf=w.requestAnimationFrame.bind(w); w.requestAnimationFrame=f=>raf(t=>{frames++; f(t);});}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(400);
  click(d.querySelectorAll('#clsGrid .opt')[0]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  click(d.querySelector('#misGrid .opt:not(.locked)')); await step(50);
  click(d.getElementById('startBtn')); await step(200);
  const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(250);
  if(d.getElementById('tutScreen').classList.contains('on')){ click(d.getElementById('tutGo')); await step(120); }
  await step(1500);
  let muts=0, kinds={}; const ob=new w.MutationObserver(list=>{ for(const m of list){ muts++; const t=(m.target.id||m.target.parentNode&&m.target.parentNode.id||m.target.nodeName); kinds[t]=(kinds[t]||0)+1; } });
  ob.observe(d.body,{subtree:true,childList:true,attributes:true,characterData:true});
  frames=0; await step(2000);
  console.log(`изменений страницы за кадр: ${(muts/frames).toFixed(1)} (кадров ${frames})`);
  console.log('  где чаще всего: '+Object.entries(kinds).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>`${k} ${(v/frames).toFixed(1)}`).join(', '));
  process.exit(0); })();
