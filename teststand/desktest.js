/* отдельный чистый запуск: сразу в первую миссию на «телефоне», собираем подсказки обучения */
const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function spawnBoss(){','window.__T={get W(){return W},get toast(){return toastMsg},get TOUCH(){return TOUCH}};\nfunction spawnBoss(){');
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const errs=[];
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  
  { let o=w; while(o){ if(Object.prototype.hasOwnProperty.call(o,"ontouchstart")) delete o.ontouchstart; o=Object.getPrototypeOf(o); } }
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.HTMLCanvasElement.prototype.getContext=()=>stub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  require('./audio.js')(w); w.console.error=(...a)=>errs.push(a.join(' '));}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
const bad=s=>(s.match(/ЛКМ|ПКМ|LMB|RMB|WASD|ПРОБЕЛ/g)||[]);
(async()=>{ await step(400);
  click(d.querySelectorAll('#clsGrid .opt')[0]); await step(50); click(d.getElementById('toMis')); await step(150);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  const m1=[...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id==='m1'); click(m1); await step(50);
  click(d.getElementById('startBtn')); await step(250); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(350);
  const W=w.__T.W; if(!W){ console.log('бой не начался — экран:', (d.querySelector('.screen.on')||{}).id); process.exit(0); }
  console.log('режим телефона:', w.__T.TOUCH);
  const seen=[];
  for(const t of [1.6,9.1,19.1,30.1,44.1]){ W.t=t; await step(90); const tm=w.__T.toast; if(tm&&tm.tut&&seen.indexOf(tm.txt)<0) seen.push(tm.txt); }
  for(const s of seen) console.log('  подсказка:', s, bad(s).length?'  ← ЛИШНЕЕ':'');
  console.log('подписей клавиш на кнопках скрыто правилом:', /body\.touch \.ab \.k, body\.touch #hint\{display:none\}/.test(html));
  console.log(errs.length?'ОШИБКИ: '+errs.slice(0,2).join(' | '):'ошибок нет');
  process.exit(0); })();
