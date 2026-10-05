/* настоящий кадр: «Выгрузка» после бойни — кровь и тела впечатаны в землю */
const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;')
  .replace('function pollInput(){','function pollInput(){ if(window.__freeze)return;')
  .replace('function spawnBoss(){','window.__G={get W(){return W},get cam(){return cam},render:()=>render(),set paused(v){paused=v},sp:(t,x,y)=>spawnE(t,x,y,1,true),hurt:(e,d)=>hurt(e,d),setHA:v=>{HIT_ANG=v;}};\nfunction spawnBoss(){');
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.CanvasRenderingContext2D=require('canvas').CanvasRenderingContext2D;
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}); require('./audio.js')(w);
  Object.defineProperty(w.HTMLCanvasElement.prototype,'clientWidth',{get(){return 1280;}});
  Object.defineProperty(w.HTMLCanvasElement.prototype,'clientHeight',{get(){return 640;}});}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(500); const G=w.__G;
  const mid=process.argv[2]||'i1', ci=+(process.argv[3]||1);
  click(d.querySelectorAll('#clsGrid .opt')[ci]); await step(60); click(d.getElementById('toMis')); await step(150);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(200);
  click([...d.querySelectorAll('#misGrid .opt')].find(n=>n.dataset.id===mid)); await step(60);
  click(d.getElementById('startBtn')); await step(250); const bg=d.getElementById('briefGo'); if(bg) click(bg); await step(400);
  const W=G.W; w.__freeze=true; W.auto=false; W.enemies.length=0; W.lull=99; W.intro=null; W.p.hp=W.p.hpMax=1e7;
  const types=(process.argv[4]||'crawler').split(',');
  /* бойня: враги гибнут волнами с разных сторон, по каждому несколько попаданий */
  for(let wave=0;wave<6;wave++){
    for(let i=0;i<14;i++){ const a=wave*1.1+i*.45, r=150+((i*37+wave*53)%260);
      G.sp(types[(i+wave)%types.length],W.p.x+Math.cos(a)*r,W.p.y+Math.sin(a)*r*.7); const e=W.enemies[W.enemies.length-1];
      const ha=Math.atan2(e.y-W.p.y,e.x-W.p.x)+(Math.random()-.5)*.6; G.setHA(ha);
      G.hurt(e,8); G.hurt(e,12); G.hurt(e,1e6); G.setHA(null); }
    await step(500); }
  await step(1200);
  console.log('кусков земли с кровью:', Object.keys(W.blood||{}).length, '| старых тел:', w.eval ? 'n/a':'' );
  G.paused=true; G.cam.x=W.p.x; G.cam.y=W.p.y; await step(200);
  for(let i=0;i<3;i++){ G.render(); await step(30); }
  fs.writeFileSync('/home/claude/dl/gore_'+mid+'.png',Buffer.from(d.getElementById('cv').toDataURL().split(',')[1],'base64'));
  console.log('кадр снят'); process.exit(0); })();
