const fs=require('fs'),{JSDOM}=require('jsdom'),{createCanvas}=require('canvas');
const html=fs.readFileSync('w_test.html','utf8');
const stub=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return{width:8,height:8};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>({addColorStop(){}});
  if(k==='measureText')return()=>({width:10}); return()=>undefined;},set:()=>true});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>stub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w);}});
const w=dom.window;
setTimeout(()=>{
  const mids=['m1','m3','m4'];
  const S=430, C=createCanvas(S*3+40, S+56), g=C.getContext('2d');
  g.fillStyle='#1b1e24'; g.fillRect(0,0,C.width,C.height);
  g.fillStyle='#dde2ea'; g.font='14px sans-serif';
  g.fillText('Карты сверху: серое — гряды коридоров, тёмное — обычные камни, жёлтое — цели',14,22);
  mids.forEach((mid,i)=>{
    const W=w.__W.nw('vector',mid,7+i), k=S/W.size, ox=10+i*(S+10), oy=36;
    g.fillStyle='#2b2f36'; g.fillRect(ox,oy,S,S);
    for(const o of W.obstacles){ g.fillStyle=o.ridge?'#6d737d':(o.alien?'#7a4a86':'#3a3f47');
      g.beginPath(); g.arc(ox+o.x*k,oy+o.y*k,Math.max(1,o.r*k),0,Math.PI*2); g.fill(); }
    for(const f of W.fences){ g.strokeStyle='#4a5560'; g.lineWidth=1.5;
      g.beginPath(); g.moveTo(ox+f.x1*k,oy+f.y1*k); g.lineTo(ox+f.x2*k,oy+f.y2*k); g.stroke(); }
    g.fillStyle='#f0c14b';
    for(const o of W.crates) { g.fillRect(ox+o.x*k-3,oy+o.y*k-3,6,6); }
    for(const o of W.cores) { g.beginPath(); g.arc(ox+o.x*k,oy+o.y*k,5,0,Math.PI*2); g.fill(); }
    if(W.beacon){ g.beginPath(); g.arc(ox+W.beacon.x*k,oy+W.beacon.y*k,6,0,Math.PI*2); g.fill(); }
    if(W.hold){ g.strokeStyle='#f0c14b'; g.lineWidth=2; g.beginPath(); g.arc(ox+W.hold.x*k,oy+W.hold.y*k,W.hold.r*k,0,Math.PI*2); g.stroke(); }
    for(const t of W.baseTurrets){ g.fillStyle='#9fd0ff'; g.fillRect(ox+t.x*k-2,oy+t.y*k-2,4,4); }
    for(const wl of W.walls){ g.strokeStyle='#8b93a1'; g.lineWidth=2;
      g.beginPath(); g.moveTo(ox+wl.x1*k,oy+wl.y1*k); g.lineTo(ox+wl.x2*k,oy+wl.y2*k); g.stroke(); }
    g.fillStyle='#5cc8ff'; g.beginPath(); g.arc(ox+W.p.x*k,oy+W.p.y*k,5,0,Math.PI*2); g.fill();
    g.fillStyle='#dde2ea'; g.font='12px sans-serif';
    g.fillText(mid+' — гряд: '+W.obstacles.filter(o=>o.ridge).length+' камней', ox, oy+S+16);
  });
  fs.writeFileSync('/home/claude/dl/maps.png',C.toBuffer('image/png'));
  console.log('готово'); process.exit(0);
},900);
