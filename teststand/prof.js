/* Профиль кадра: считаем вызовы рисования по видам в настоящем бою на 3-й минуте */
const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync(process.argv[2]||'dustline-v17.html','utf8')
  .replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function spawnBoss(){','window.__P={get W(){return W}};\nfunction spawnBoss(){');
const C={}; let frameCount=0;
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:1688,height:780};
  if(k==='createRadialGradient'||k==='createLinearGradient') return ()=>{ C['градиент']=(C['градиент']||0)+1; return {addColorStop(){}}; };
  if(k==='measureText')return()=>({width:10}); if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4)});
  return (...a)=>{ C[k]=(C[k]||0)+1; }; },set:()=>true});
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w);
  const raf=w.requestAnimationFrame.bind(w); w.requestAnimationFrame=f=>raf(t=>{ frameCount++; f(t); });}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(400);
  click(d.querySelectorAll('#clsGrid .opt')[+(process.argv[3]||1)]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id==='m3')); await step(50);
  click(d.getElementById('startBtn')); await step(200);
  const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(250);
  if(d.getElementById('tutScreen').classList.contains('on')){ click(d.getElementById('tutGo')); await step(120); }
  const W=w.__P.W; W.t=185;                    // третья минута: плотная волна
  await step(6000);                            // даём полю наполниться
  for(const k in C) delete C[k]; frameCount=0;
  await step(3000);
  const f=Math.max(1,frameCount);
  const rows=Object.entries(C).map(([k,v])=>[k,v/f]).sort((a,b)=>b[1]-a[1]).slice(0,12);
  console.log(`кадров за 3 с: ${frameCount} | врагов: ${W.enemies.length} | частиц: ${['FXP','FXB'].map(n=>n).join('')}`);
  for(const [k,v] of rows) console.log(`  ${k.padEnd(18)} ${v.toFixed(0).padStart(6)} за кадр`);
  process.exit(0); })();
