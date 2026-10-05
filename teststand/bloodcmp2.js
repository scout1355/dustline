const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function spawnBoss(){','window.__B={corpse:(c,x,y)=>drawCorpseAt(c,x,y),splat:(x,y,r,s,q)=>splatPath(x,y,r,s,q),setCtx:c=>{ctx=c;},getCtx:()=>ctx,ET:()=>ETYPES,BI:()=>BIOMES};\nfunction spawnBoss(){');
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.CanvasRenderingContext2D=require('canvas').CanvasRenderingContext2D;
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}); require('./audio.js')(w);}});
const w=dom.window;
setTimeout(()=>{ const B=w.__B, d=w.document, ET=B.ET(), ground=B.BI().dust.ground;
  const C=d.createElement('canvas'); C.width=900; C.height=420; const g=C.getContext('2d');
  g.fillStyle=ground; g.fillRect(0,0,900,420); g.setTransform(2,0,0,2,0,0);
  const saved=B.getCtx(); B.setCtx(g);
  const types=['crawler','sprinter','spitter','stalker'];
  /* СЕЙЧАС: тело с двумя пятнами + отдельный след крови рядом */
  types.forEach((t,i)=>{ const e=ET[t], x=60+i*100, y=55;
    B.corpse({x,y,r:e.r,col:e.col,blood:e.blood||'#b03030',ph:i*1.7,dir:i*.9,t:0,life:9,big:e.r>20},x,y); });
  g.fillStyle='#dde2ea'; g.font='9px sans-serif'; g.fillText('теперь: одно пятно, без светлого кольца и без следа под телом',12,104);
  B.setCtx(saved);
  fs.writeFileSync('/home/claude/dl/blood_after.png',Buffer.from(C.toDataURL().split(',')[1],'base64'));
  process.exit(0); },700);
