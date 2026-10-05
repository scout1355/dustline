const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('c_test.html','utf8');
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub; w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}); require('./audio.js')(w);}});
const w=dom.window;
setTimeout(()=>{ const C=w.__C; let gaps=[], overl=[], ghosts=0, cross=0, unreach=0, maps=0;
  for(const mid of ['m1','m3','m4','m5','m6','i3']) for(let s=1;s<=4;s++){ const W=C.nw('vector',mid,s); maps++;
    ghosts+=W.obstacles.filter(o=>o.ghost&&o.ridge).length;
    const byR={}; for(const o of W.obstacles) if(o.ridge&&!o.ghost)(byR[o.ridge]=byR[o.ridge]||[]).push(o);
    for(const k in byR){ const L=byR[k]; for(let i=1;i<L.length;i++){ const a=L[i-1],b=L[i], d=Math.hypot(a.x-b.x,a.y-b.y);
      const vis=d-C.vr(a)-C.vr(b);                                   /* просвет, который видно */
      if(vis>80) continue;                                           /* это проём, не соседи */
      /* можно ли пройти: ищем на отрезке между ними точку, где герою (r 16) хватает места */
      let pass=false;
      for(let t=.2;t<=.8&&!pass;t+=.05){ const px=a.x+(b.x-a.x)*t, py=a.y+(b.y-a.y)*t;
        if(W.obstacles.every(o=>Math.hypot(o.x-px,o.y-py)>=o.r+16)) pass=true; }
      if(vis>=32&&!pass) gaps.push('видно просвет '+Math.round(vis)+', а не пройти ('+(a.kind2||'камень')+')');
      if(vis<8&&pass) overl.push('выглядит сплошным, а проходится ('+(a.kind2||'камень')+')'); } }
    for(const o of W.obstacles) if(o.ridge&&!o.ghost) for(const o2 of W.obstacles)
      if(o2!==o&&!o2.ghost&&o2.ridge!==o.ridge&&!o2.hard&&Math.hypot(o.x-o2.x,o.y-o2.y)<C.vr(o)+C.vr(o2)-6){ cross++; break; }
    const st=60,R=17, blocked=(x,y)=>{ for(const o of W.obstacles) if(Math.hypot(o.x-x,o.y-y)<o.r+R) return true; return x<40||y<40||x>W.size-40||y>W.size-40; };
    const seen=new Set(), q=[[Math.round(W.p.x/st),Math.round(W.p.y/st)]]; seen.add(q[0].join(','));
    while(q.length){ const [gx,gy]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=gx+dx,ny=gy+dy,k=nx+','+ny;
      if(seen.has(k))continue; if(blocked(nx*st,ny*st))continue; seen.add(k); q.push([nx,ny]); } }
    if(seen.size/Math.pow(W.size/st,2)<.5) unreach++; }
  console.log(`карт ${maps}: «видно просвет шире героя, а не пройти» — ${gaps.length}; «выглядит сплошным, а проходится» — ${overl.length}`);
  const cnt=a=>{ const m={}; for(const x of a){ const k=x.replace(/\d+/,'N'); m[k]=(m[k]||0)+1; } return JSON.stringify(m); };
  if(gaps.length) console.log('  ', cnt(gaps)); if(overl.length) console.log('  ', cnt(overl));
  console.log(`наложений на чужие объекты: ${cross} | карт с запертыми участками: ${unreach}`);
  process.exit(0); },900);
