const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('c_test.html','utf8');
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub; w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}); require('./audio.js')(w);}});
const w=dom.window;
setTimeout(()=>{ const C=w.__C; const bad=[]; let OV=0; let kinds={}, ridges=0, maps=0;
  for(const mid of ['m1','m3','m4','m5','m6','i3']) for(let s=1;s<=4;s++){ const W=C.nw('vector',mid,s); maps++;
    for(const o of W.obstacles) if(o.ridge){ ridges++; kinds[o.kind2||'rock']=(kinds[o.kind2||'rock']||0)+1; }
    const R=W.obstacles.filter(o=>o.ridge);
    /* налезание гряд на важное */
    for(const o of R){
      if(W.baseC&&W.walls.length&&Math.hypot(o.x-W.baseC.x,o.y-W.baseC.y)<(W.baseR||220)+o.r) bad.push(mid+': гряда на базе');
      for(const s2 of W.sites||[]) if(Math.hypot(o.x-s2.x,o.y-s2.y)<s2.r+o.r) bad.push(mid+': гряда на месте исследования');
      for(const q of W.ores) if(Math.hypot(o.x-q.x,o.y-q.y)<q.r+o.r) bad.push(mid+': гряда на залежи');
      for(const c of W.crates) if(Math.hypot(o.x-c.x,o.y-c.y)<c.r+o.r) bad.push(mid+': гряда на ящике');
      for(const o2 of W.obstacles) if(o2!==o&&!o2.ghost&&!o.ghost&&!o2.hard&&Math.hypot(o.x-o2.x,o.y-o2.y)<C.vr(o)+C.vr(o2)-6) { bad.push(mid+': картинки налезают ('+(o.kind2||'камень')+' и '+(o2.kind2||o2.ruin||'камень')+')'); OV++; break; } }
    /* проходимость */
    const st=60,Rr=18, blocked=(x,y)=>{ for(const o of C.near.call?W.obstacles:[]) if(Math.hypot(o.x-x,o.y-y)<o.r+Rr) return true; return x<40||y<40||x>W.size-40||y>W.size-40; };
    const seen=new Set(), q=[[Math.round(W.p.x/st),Math.round(W.p.y/st)]]; seen.add(q[0].join(','));
    while(q.length){ const [gx,gy]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=gx+dx,ny=gy+dy,k=nx+','+ny;
      if(seen.has(k))continue; if(blocked(nx*st,ny*st))continue; seen.add(k); q.push([nx,ny]); } }
    const share=seen.size/Math.pow(W.size/st,2);
    if(share<.5) bad.push(mid+' сид '+s+': доступно лишь '+Math.round(share*100)+'%');
    for(const qq of W.ores) if(!seen.has(Math.round(qq.x/st)+','+Math.round(qq.y/st))) { let ok=false;
      for(let a=0;a<6.3&&!ok;a+=.4) if(seen.has(Math.round((qq.x+Math.cos(a)*(qq.r+40))/st)+','+Math.round((qq.y+Math.sin(a)*(qq.r+40))/st))) ok=true;
      if(!ok) bad.push(mid+': залежь недоступна'); } }
  console.log(`карт ${maps}, камней в грядах в среднем ${Math.round(ridges/maps)}; виды: ${JSON.stringify(kinds)}`);
  console.log('наложений картинок всего:', OV);
  const uniq=[...new Set(bad)]; console.log(uniq.length?'НАЙДЕНО: '+uniq.slice(0,8).join(' | '):'наложений нет, всё достижимо');
  process.exit(0); },900);
