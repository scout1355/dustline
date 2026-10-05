const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__S={get W(){return W},sp:(t,x,y)=>spawnE(t,x,y,1,true),hurt:(e,d)=>hurt(e,d),get FXB(){return FXB},proj:o=>proj(o),get IN(){return INPUT}};\nfunction spawnBoss(){');
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const errs=[];
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub; w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}); require('./audio.js')(w); w.console.error=(...a)=>errs.push(a.join(' '));}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
const share=(arr,ang)=>{ let ok=0; for(const q of arr){ let da=Math.atan2(q.vy,q.vx)-ang; while(da>Math.PI)da-=2*Math.PI; while(da<-Math.PI)da+=2*Math.PI; if(Math.abs(da)<1.05) ok++; } return arr.length?Math.round(100*ok/arr.length):0; };
(async()=>{ await step(400); const S=w.__S;
  click(d.querySelectorAll('#clsGrid .opt')[1]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  click(d.querySelector('#misGrid .opt:not(.locked)')); await step(50);
  click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  const W=S.W; w.__freeze=true; W.auto=false; W.enemies.length=0; W.lull=99; S.IN.mx=0; S.IN.my=0;
  /* враг справа от героя: удар без своего направления — брызги должны лететь вправо, за спину врага */
  S.sp('crawler',W.p.x+200,W.p.y); const e=W.enemies[W.enemies.length-1]; e.hp=e.hpMax=1e6; e.sp=0;
  let n0=S.FXB.length; S.hurt(e,20); const hitP=S.FXB.slice(n0);
  console.log(`ранение: брызг ${hitP.length}, летят от героя (за спину врага): ${share(hitP,0)}%`);
  /* гибель от удара сверху: ошмётки — вниз */
  S.sp('crawler',W.p.x,W.p.y-200); const e2=W.enemies[W.enemies.length-1]; e2.sp=0;
  n0=S.FXB.length; S.hurt(e2,1e6); await step(60); const deathP=S.FXB.slice(n0);
  console.log(`гибель: брызг и ошмётков ${deathP.length}, летят по направлению удара (вверх, от героя): ${share(deathP,-Math.PI/2)}%`);
  console.log(errs.length?'ОШИБКИ: '+errs.slice(0,2).join(' | '):'ошибок нет');
  process.exit(0); })();
