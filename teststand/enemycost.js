/* сколько команд рисования уходит на одного врага каждого вида и на одну лужу */
const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function spawnBoss(){','window.__E={ET:()=>ETYPES,draw:(e,T,L)=>drawEnemy(e,T,L),setW:v=>{W=v;}};\nfunction spawnBoss(){');
let N=0;
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>{N++;return{addColorStop(){}};};
  if(k==='measureText')return()=>({width:10}); return ()=>{N++;}; },set:()=>true});
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub; w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}); require('./audio.js')(w);}});
const w=dom.window;
setTimeout(()=>{ const E=w.__E, ET=E.ET(); const rows=[];
  for(const t in ET){ const d=ET[t]; let sum=0;
    for(let k=0;k<20;k++){ const e={...d,type:t,x:500,y:500,dir:k*.3,face:k*.3,walk:k*3,ph:k*.7,hop:0,flash:0,hp:1,hpMax:1};
      N=0; E.draw(e,k*.11,false); sum+=N; }
    rows.push([t,Math.round(sum/20),d.r]); }
  rows.sort((a,b)=>b[1]-a[1]);
  for(const [t,n,r] of rows) console.log(`${t.padEnd(11)} ${String(n).padStart(4)} команд за один рисунок (радиус ${r})`);
  process.exit(0); },700);
