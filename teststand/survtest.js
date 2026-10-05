const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__S={get W(){return W},get IN(){return INPUT},boss:()=>spawnBoss(),hurt:(e,d)=>hurt(e,d),mdmg:()=>mDmg(),get prog(){return progress},menu:()=>toMenu(),over:()=>gameOver()};\nfunction spawnBoss(){');
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
(async()=>{ await step(400); const S=w.__S;
  click(d.querySelectorAll('#clsGrid .opt')[0]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  const card=[...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id==='endless');
  console.log('карточка режима:', card.querySelector('h3').textContent);
  click(card); await step(50); click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  const W=S.W; w.__freeze=true; S.IN.mx=0; S.IN.my=0; W.p.hp=W.p.hpMax=1e7; W.auto=false;
  /* четыре босса погибают — четвёртый роняет ящик урона */
  const d0=S.mdmg();
  for(let k=0;k<4;k++){ S.boss(); const b=W.enemies[W.enemies.length-1]; b.x=W.p.x+60; b.y=W.p.y; b.hp=0; b.dead=true; await step(80); }
  console.log(`убито боссов ${W.bossKills}, ящиков урона выпало ${(W.dmgCrates||[]).length}`);
  await step(1200);
  console.log(`подобран: множитель урона ${d0.toFixed(3)} → ${S.mdmg().toFixed(3)} (+${((S.mdmg()/d0-1)*100).toFixed(1)}%), ящиков осталось ${(W.dmgCrates||[]).length}`);
  /* частота боссов по минутам */
  const iv=[]; for(const m of [3,7,12,16]){ W.t=m*60; W.bossT=0; await step(60); iv.push(`${m} мин — следующий через ${Math.round(W.bossT)} с`); }
  console.log('боссы:', iv.join(' | '));
  /* щит после 18-й минуты */
  W.t=22*60; let sh=0; for(let k=0;k<20;k++){ S.boss(); const b=W.enemies[W.enemies.length-1]; if(b.armSh>0) sh++; b.dead=true; b.hp=0; }
  await step(80);
  console.log(`на 22-й минуте из 20 боссов со щитом: ${sh}`);
  S.boss(); const bb=W.enemies[W.enemies.length-1]; bb.armShMax=1000; bb.armSh=1000; const hp0=bb.hp; S.hurt(bb,600); const s1=bb.armSh, h1=bb.hp; S.hurt(bb,600);
  console.log(`щит принимает урон первым: 600 урона — щит ${1000}→${s1}, здоровье не тронуто (${h1===hp0}); ещё 600 — щит ${bb.armSh}, здоровье −${Math.round(hp0-bb.hp)}`);
  /* рекорд выживания */
  W.score=4321; S.over(); await step(1000);
  console.log(`рекорд Вектора в выживании: ${S.prog.surv&&S.prog.surv.vector} | основные очки не тронуты: ${(S.prog.pts||{}).vector||0}`);
  S.menu(); await step(300);
  const vc=d.querySelector('#clsGrid .opt[data-id="vector"] .pts');
  console.log('карточка героя:', vc&&vc.textContent.replace(/\s+/g,' ').trim());
  console.log(errs.length?'ОШИБКИ: '+[...new Set(errs)].slice(0,3).join(' | '):'ошибок нет');
  process.exit(0); })();
