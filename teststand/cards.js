/* игра целиком с настоящим холстом: снимаем превью с карточек миссий */
const fs=require('fs'),{JSDOM}=require('jsdom'),{createCanvas,loadImage}=require('canvas');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;');
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.CanvasRenderingContext2D=require('canvas').CanvasRenderingContext2D;
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w);}});
const w=dom.window,d=w.document,click=n=>n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ await step(600);
  click(d.querySelectorAll('#clsGrid .opt')[0]); await step(60); click(d.getElementById('toMis')); await step(150);
  const ab=[...d.querySelectorAll('#abGrid .abcard')]; click(ab[0]); await step(30); click(ab[1]); await step(30);
  click(d.getElementById('abGo')); await step(300);
  const cards=[...d.querySelectorAll('#misGrid .opt')].slice(0,6);
  const W=464,H=208, sheet=createCanvas(3*(W+16)+16,2*(H+44)+40), g=sheet.getContext('2d');
  g.fillStyle='#1b1e24'; g.fillRect(0,0,sheet.width,sheet.height);
  for(let i=0;i<cards.length;i++){ const cv=cards[i].querySelector('canvas'); const img=await loadImage(cv.toDataURL());
    const x=16+(i%3)*(W+16), y=30+Math.floor(i/3)*(H+44);
    g.drawImage(img,x,y,W,H); g.fillStyle='#dde2ea'; g.font='bold 18px sans-serif';
    g.fillText('№'+(i+1)+' '+cards[i].querySelector('h3').textContent,x,y+H+26); }
  fs.writeFileSync('/home/claude/dl/cards.png',sheet.toBuffer('image/png'));
  /* заодно — список целей на карточке «Обкатки» */
  const all=[...d.querySelectorAll('#misGrid .opt')]; const m1=all.find(c=>c.dataset.id==='m1'), m2=all.find(c=>c.dataset.id==='m2');
  for(const c of [m1,m2]) console.log('цели «'+c.querySelector('h3').textContent+'» на карточке:', [...c.querySelectorAll('.mgoals li')].map(l=>l.textContent).join(' | '));
  console.log('готово'); process.exit(0); })();
