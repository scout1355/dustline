const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function spawnBoss(){','window.__P={get W(){return W},pick:id=>applyPick?applyPick(id):null};\nfunction spawnBoss(){');
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
(async()=>{ await step(400);
  for(const ci of [0,2]){
    click(d.querySelectorAll('#clsGrid .opt')[ci]); await step(50); click(d.getElementById('toMis')); await step(120);
    const ab=[...d.querySelectorAll('#abGrid .abcard')]; for(const a of ab.slice(0,2)) if(!a.classList.contains('sel')){ click(a); await step(30); }
    click(d.getElementById('abGo')); await step(150);
    click(d.querySelector('#misGrid .opt:not(.locked)')); await step(50);
    click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
    const W=w.__P.W; W.ab1.lv=3; W.picks.push(W.ab1.id); W.picks.push(W.ab1.id);    /* как будто дважды улучшили первую */
    click(d.getElementById('pauseBtn')); await step(200);
    const chips=[...d.querySelectorAll('#pauseLoad .chip')].map(c=>({t:c.textContent.trim(),own:c.classList.contains('own')}));
    const names=chips.map(c=>c.t);
    const dup=names.filter((n,i)=>names.findIndex(m=>m.replace(/\d+$/,'')===n.replace(/\d+$/,''))!==i);
    console.log(`${ci?'Зодчий':'Вектор'}: строк ${chips.length}, повторов ${dup.length}, обведены: ${chips.filter(c=>c.own).map(c=>c.t).join(', ')}`);
    click(d.getElementById('pauseBtn')); await step(80); W.over=true; await step(60);
    const q=d.getElementById('quitBtn'); click(q||d.querySelector('#pauseScreen .ghost')); await step(200);
    click(d.getElementById('pauseBtn')); await step(60); const q2=d.getElementById('quitBtn'); if(q2) click(q2); await step(300);
  }
  console.log(errs.length?'ОШИБКИ: '+errs.slice(0,2).join(' | '):'ошибок нет');
  process.exit(0); })();
