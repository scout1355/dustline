const fs=require('fs'),{JSDOM}=require('jsdom'),{createCanvas,loadImage}=require('canvas');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function spawnBoss(){','window.__R={draw:(o,x,y)=>drawRuinAt(o,x,y),setCtx:c=>{ctx=c;},getCtx:()=>ctx,BI:()=>BIOMES};\nfunction spawnBoss(){');
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.CanvasRenderingContext2D=require('canvas').CanvasRenderingContext2D;
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w);}});
const w=dom.window; const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(500);
  const R=w.__R, C=createCanvas(1200,560), g=C.getContext('2d');
  const ground=R.BI().dust.ground; g.fillStyle=ground; g.fillRect(0,0,1200,560);
  for(let i=0;i<3000;i++){ g.fillStyle='rgba(255,255,255,'+(Math.random()*.03)+')'; g.fillRect(Math.random()*1200,Math.random()*560,1.5,1.5); }
  const saved=R.getCtx(); R.setCtx(g);
  const items=[['hull',300,170,46,.15,'корабль'],['building',720,150,58,.2,'модуль'],['tower',1000,170,22,-.5,'мачта'],
    ['wall',180,420,34,.4,'стена'],['container',460,420,30,-.3,'контейнер'],['debris',720,420,30,1,'обломки'],['container',960,420,26,.9,'контейнер']];
  for(const [k,x,y,r,a,lab] of items){ R.draw({ruin:k,r,a,ph:x*.37+y*.11},x,y);
    g.fillStyle='#dde2ea'; g.font='14px sans-serif'; g.textAlign='center'; g.fillText(lab,x,y+(k==='hull'?150:95)); }
  R.setCtx(saved);
  fs.writeFileSync('/home/claude/dl/ruins.png',C.toBuffer('image/png')); console.log('готово'); process.exit(0); })();
