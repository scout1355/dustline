const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function spawnBoss(){','window.__P={draw:(q,x,y)=>drawPoolBody(q,x,y),setCtx:c=>{ctx=c;},getCtx:()=>ctx,BI:()=>BIOMES};\nfunction spawnBoss(){');
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.CanvasRenderingContext2D=require('canvas').CanvasRenderingContext2D;
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}); require('./audio.js')(w);}});
const w=dom.window;
setTimeout(()=>{ const P=w.__P, d=w.document; const C=d.createElement('canvas'); C.width=900; C.height=260; const g=C.getContext('2d');
  g.fillStyle=P.BI().dust.ground; g.fillRect(0,0,900,260); const saved=P.getCtx(); P.setCtx(g);
  [['#9ad06a',60,'кислота'],['#c86bff',52,'споры',1],['#e0c040',46,'яд'],['#7fd0a0',58,'слизь']].forEach(([c,r,lab,air],i)=>{
    const x=120+i*220,y=120; P.draw({x:x+i*13.7,y:y+i*7.1,r,col:c,air},x,y); g.fillStyle='#dde2ea'; g.font='13px sans-serif'; g.textAlign='center'; g.fillText(lab,x,236); });
  P.setCtx(saved); fs.writeFileSync('/home/claude/dl/pools.png',Buffer.from(C.toDataURL().split(',')[1],'base64')); process.exit(0); },700);
