const fs=require('fs'),{JSDOM}=require('jsdom'),{createCanvas}=require('canvas');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function spawnBoss(){','window.__R={form:(o,x,y,B)=>drawFormationAt(o,x,y,B),broken:o=>drawAlienBroken(o),alien:o=>drawAlien(o),setCtx:c=>{ctx=c;},getCtx:()=>ctx,BI:()=>BIOMES,setW:v=>{W=v;}};\nfunction spawnBoss(){');
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.CanvasRenderingContext2D=require('canvas').CanvasRenderingContext2D;
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w);}});
const w=dom.window; const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(500);
  const R=w.__R, C=w.document.createElement('canvas'); C.width=1240; C.height=600; const g=C.getContext('2d'), saved=R.getCtx();
  const rows=[['dust',90],['ruins',330]];
  for(const [bid,y0] of rows){ const B=R.BI()[bid];
    g.fillStyle=B.ground; g.fillRect(0,y0-90,1240,230);
    for(let i=0;i<1500;i++){ g.fillStyle='rgba(255,255,255,'+(Math.random()*.03)+')'; g.fillRect(Math.random()*1240,y0-90+Math.random()*230,1.5,1.5); }
    R.setCtx(g);
    [['cliff',150,52],['crag',360,50],['pillar',560,42],['block',760,34]].forEach(([k,x,r],i)=>{
      R.form({kind2:k,r,a:.3+i*.4,s:1.7+i},x,y0,B);
      g.fillStyle='#dde2ea'; g.font='13px sans-serif'; g.textAlign='center';
      g.fillText({cliff:'скала',crag:'утёс',pillar:'столб',block:'бетонные блоки'}[k]+' ('+bid+')',x,y0+r+42); });
  }
  /* постройки роя: целые и после взрыва */
  const B=R.BI().dust, y=520; g.fillStyle=B.ground; g.fillRect(0,y-80,1240,160);
  R.setW({t:3}); R.setCtx(g);
  R.alien({x:960,y:200,r:40,alien:'hive',ph:.4}); R.broken({x:1120,y:200,r:40,alien:'hive',ph:.4,broken:0});
  R.alien({x:960,y:430,r:24,alien:'spire',ph:1.2}); R.broken({x:1120,y:430,r:24,alien:'spire',ph:1.2,broken:0});
  g.fillStyle='#dde2ea'; g.font='13px sans-serif'; g.textAlign='center';
  g.fillText('улей до взрыва',960,262); g.fillText('после взрыва',1120,262); g.fillText('шпиль до',960,478); g.fillText('после',1120,478);
  R.setCtx(saved); R.setW(null);
  fs.writeFileSync('/home/claude/dl/forms.png',Buffer.from(C.toDataURL().split(',')[1],'base64')); console.log('готово'); process.exit(0); })();
