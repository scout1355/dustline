const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__S={get W(){return W},set W(v){W=v},nw:(c,m,s)=>newWorld(c,m,s),get IN(){return INPUT}};\nfunction spawnBoss(){');
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
  const S=w.__S; let bad=0, minSites=99;
  for(let seed=1;seed<=8;seed++){ const W=S.nw('vector','i3',seed);
    minSites=Math.min(minSites,W.sites.length);
    /* проходимость: от старта до центра каждого места, обходя камни и руины */
    const st=60,R=18, blocked=(x,y)=>{ for(const o of W.obstacles) if(Math.hypot(o.x-x,o.y-y)<o.r+R) return true; return x<40||y<40||x>W.size-40||y>W.size-40; };
    const seen=new Set(), q=[[Math.round(W.p.x/st),Math.round(W.p.y/st)]]; seen.add(q[0].join(','));
    while(q.length){ const [gx,gy]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=gx+dx,ny=gy+dy,k=nx+','+ny;
      if(seen.has(k))continue; if(blocked(nx*st,ny*st))continue; seen.add(k); q.push([nx,ny]); } }
    for(const s of W.sites){ let ok=false; for(let r=0;r<s.r&&!ok;r+=st) for(let a=0;a<6.28&&!ok;a+=.5)
        if(seen.has(Math.round((s.x+Math.cos(a)*r)/st)+','+Math.round((s.y+Math.sin(a)*r)/st))) ok=true;
      if(!ok) bad++; } }
  console.log(`8 карт: мест на карте не меньше ${minSites}, недостижимых мест: ${bad}`);
  /* бой: стоим в месте 15 с — изучено */
  click(d.querySelectorAll('#clsGrid .opt')[0]); await step(50); click(d.getElementById('toMis')); await step(120);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(150);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id==='i3')); await step(50);
  click(d.getElementById('startBtn')); await step(200); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(300);
  const W=S.W; w.__freeze=true; S.IN.mx=0; S.IN.my=0;
  const s=W.sites[0]; const g=W.goals.find(x=>x.t==='explore');
  W.p.x=s.x+s.r*.5; W.p.y=s.y; W.p.hp=1e6; W.p.hpMax=1e6; s.prog=13.5; await step(2000);
  console.log(`место: прогресс ${s.prog.toFixed(1)} → ${s.done?'изучено':'не изучено'} | цель «${g.t}» ${g.cur}/${g.n}`);
  /* натиск после первой минуты */
  const n0=W.enemies.length; W.t=60.5; W.pushT=0; await step(300);
  console.log(`«Глубокий рейд» после минуты: врагов было ${n0}, стало ${W.enemies.length}`);
  console.log(errs.length?'ОШИБКИ: '+[...new Set(errs)].slice(0,3).join(' | '):'ошибок нет');
  process.exit(0); })();
