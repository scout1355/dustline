const fs=require('fs'),{JSDOM}=require('jsdom'),{createCanvas,loadImage}=require('canvas');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function spawnBoss(){','window.__S={get W(){return W},get cam(){return cam},render:()=>render(),set paused(v){paused=v}};\nfunction spawnBoss(){');
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.CanvasRenderingContext2D=require('canvas').CanvasRenderingContext2D;
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w);
  Object.defineProperty(w,'innerWidth',{value:1280,writable:true}); Object.defineProperty(w,'innerHeight',{value:640,writable:true});
  Object.defineProperty(w.HTMLCanvasElement.prototype,'clientWidth',{get(){return 1280;}});
  Object.defineProperty(w.HTMLCanvasElement.prototype,'clientHeight',{get(){return 640;}});}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(500);
  click(d.querySelectorAll('#clsGrid .opt')[1]); await step(60); click(d.getElementById('toMis')); await step(150);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(200);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id===process.argv[2])); await step(60);
  click(d.getElementById('startBtn')); await step(250); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(400);
  const S=w.__S, W=S.W;
  for(const e of W.enemies) e.dead=true;
  W.intro=null;
  const core=(W.cores&&W.cores[0])||W.baseC; const s={x:core.x,y:core.y};
  for(const tp of (W.tps||[])) tp.built=1;
  W.p.x=s.x+90; W.p.y=s.y+110;
  S.paused=true; S.cam.x=s.x; S.cam.y=s.y; await step(300);
  for(let i=0;i<4;i++){ S.render(); await step(30); }
  const img=await loadImage(d.getElementById('cv').toDataURL());
  const out=createCanvas(img.width,img.height); out.getContext('2d').drawImage(img,0,0);
  fs.writeFileSync('/home/claude/dl/base_'+process.argv[2]+'.png',out.toBuffer('image/png')); console.log('кадр снят', img.width+'×'+img.height); process.exit(0); })();
