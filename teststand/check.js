const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('c_test.html','utf8'); const errs=[];
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w);
  w.onerror=m=>errs.push('onerror: '+m); w.console.error=(...a)=>errs.push(a.map(String).join(' '));}});
const w=dom.window; const step=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{
  const C=w.__C; const bad=[];
  /* 1. минералы: запас, наложения, недостижимость */
  for(const mid of ['m1','m2']) for(let s=1;s<=6;s++){
    const W=C.nw('vector',mid,s); const tot={};
    for(const o of W.ores) tot[o.kind]=(tot[o.kind]||0)+o.amount;
    for(const k in tot) if(tot[k]<200) bad.push(mid+' сид '+s+': запаса '+k+' всего '+Math.round(tot[k]));
    for(const o of W.ores) for(const ob of W.obstacles)
      if(ob.ore!==o && Math.hypot(ob.x-o.x,ob.y-o.y)<ob.r+o.r) bad.push(mid+' сид '+s+': залежь на камне');
  }
  /* 2. базы: камни внутри */
  for(const mid of ['m4','m6','m7']) for(let s=1;s<=6;s++){
    const W=C.nw('vector',mid,s);
    const pts=[]; if(W.baseC&&W.walls.length) pts.push(W.baseC);
    for(const c of W.cores) pts.push(c);
    for(const p of pts) for(const o of W.obstacles)
      if(Math.hypot(o.x-p.x,o.y-p.y)-o.r<150) bad.push(mid+' сид '+s+': камень внутри базы');
  }
  /* 3. коридоры: не запирают карту */
  for(const mid of ['m1','m3','m5']) for(let s=1;s<=4;s++){
    const W=C.nw('vector',mid,s), step=70, R=18;
    const blocked=(x,y)=>{ for(const o of W.obstacles) if(Math.hypot(o.x-x,o.y-y)<o.r+R) return true;
      return x<40||y<40||x>W.size-40||y>W.size-40; };
    const seen=new Set(), q=[[Math.round(W.p.x/step),Math.round(W.p.y/step)]];
    seen.add(q[0].join(','));
    while(q.length){ const [gx,gy]=q.shift();
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=gx+dx,ny=gy+dy,k=nx+','+ny;
        if(seen.has(k))continue; const x=nx*step,y=ny*step;
        if(x<0||y<0||x>W.size||y>W.size||blocked(x,y))continue; seen.add(k); q.push([nx,ny]); } }
    const cells=Math.pow(W.size/step,2);
    if(seen.size<cells*0.25) bad.push(mid+' сид '+s+': доступно лишь '+Math.round(seen.size/cells*100)+'% карты');
    for(const o of W.crates) if(!seen.has(Math.round(o.x/step)+','+Math.round(o.y/step))) bad.push(mid+' сид '+s+': ящик недостижим');
  }
  /* 4. сетка камней совпадает с полным перебором */
  const W2=C.nw('vector','m3',9); C.W=W2;
  let mism=0;
  for(let i=0;i<600;i++){ const x=Math.random()*W2.size,y=Math.random()*W2.size,r=90;
    const a=C.near(x,y,r).filter(o=>Math.hypot(o.x-x,o.y-y)<o.r+r).length;
    const b=W2.obstacles.filter(o=>Math.hypot(o.x-x,o.y-y)<o.r+r).length;
    if(a!==b) mism++; }
  if(mism) bad.push('сетка камней расходится с перебором в '+mism+' случаях из 600');
  console.log(bad.length?('НАЙДЕНО:\n  '+bad.slice(0,12).join('\n  ')):'проверки пройдены: минералы, базы, коридоры, сетка камней');
  console.log(errs.length?'ОШИБКИ: '+[...new Set(errs)].slice(0,3).join(' | '):'ошибок в консоли нет');
  process.exit(0);
},900);
