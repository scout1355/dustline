const fs=require('fs'),{createCanvas}=require('canvas');
const h=fs.readFileSync('dustline-v17.html','utf8');
const C=createCanvas(1000,420), ctx=C.getContext('2d'); const TAU=Math.PI*2;
ctx.fillStyle='#2b2f36'; ctx.fillRect(0,0,1000,420);
for(let i=0;i<2000;i++){ ctx.fillStyle='rgba(255,255,255,'+(Math.random()*.035)+')'; ctx.fillRect(Math.random()*640,Math.random()*420,1.5,1.5); }
ctx.fillStyle='#dde2ea'; ctx.font='14px sans-serif';
ctx.fillText('Искры при добыче — снимок полсекунды работы',20,26);
ctx.fillText('Миникарта: залежи тусклые, враги ярче',680,26);
/* та же физика и отрисовка, что в игре: скорость, торможение, черточка, белое ядро */
const vr=(a,b)=>a+Math.random()*(b-a), P=[];
const ore={x:360,y:230,r:24,col:'#7fe07a'}, hero={x:200,y:230};
const a=Math.atan2(hero.y-ore.y,hero.x-ore.x);
for(let t=0;t<.5;t+=.055) for(let i=0;i<5;i++){ const sa=a+vr(-1.15,1.15), sp=vr(220,520);
  P.push({x:ore.x+Math.cos(a)*ore.r,y:ore.y+Math.sin(a)*ore.r,vx:Math.cos(sa)*sp,vy:Math.sin(sa)*sp,born:t,life:vr(.3,.62),r:vr(1.3,2.3),col:ore.col}); }
/* кристалл и герой для масштаба */
ctx.fillStyle='rgba(127,224,122,.25)'; ctx.beginPath(); ctx.arc(ore.x,ore.y,ore.r*2,0,TAU); ctx.fill();
ctx.fillStyle='#4f8a4c'; ctx.beginPath(); ctx.arc(ore.x,ore.y,ore.r,0,TAU); ctx.fill();
ctx.fillStyle='#5cc8ff'; ctx.beginPath(); ctx.arc(hero.x,hero.y,16,0,TAU); ctx.fill();
const now=.5;
for(const q of P){ const age=now-q.born; if(age<0||age>q.life) continue;
  let x=q.x,y=q.y,vx=q.vx,vy=q.vy; for(let s=0;s<age;s+=1/60){ x+=vx/60; y+=vy/60; const kd=Math.exp(-1.7/60); vx*=kd; vy*=kd; }
  const k=1-age/q.life, sp=Math.hypot(vx,vy), L=Math.min(16,sp*.045)+2;
  ctx.globalAlpha=k; ctx.lineCap='round'; ctx.strokeStyle=k>.55?'#fffbe8':q.col; ctx.lineWidth=q.r*(.6+k*.7);
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-vx/sp*L,y-vy/sp*L); ctx.stroke(); }
ctx.globalAlpha=1;
/* миникарта в игровых размерах, увеличенная вдвое для наглядности */
const S=132*2, x0=700, y0=70;
ctx.fillStyle='rgba(14,16,20,.9)'; ctx.beginPath(); ctx.roundRect(x0-12,y0-12,S+24,S+24,20); ctx.fill();
ctx.save(); ctx.translate(x0,y0); ctx.scale(2,2);
for(let i=0;i<60;i++){ ctx.fillStyle='rgba(224,96,94,.85)'; ctx.fillRect(Math.random()*132-1,Math.random()*132-1,2,2); }
for(const [x,y,c] of [[20,30,'#7fe07a'],[100,24,'#7fe07a'],[40,100,'#c86bff'],[110,90,'#7fe07a'],[70,60,'#c86bff'],[18,70,'#c86bff']]){
  ctx.globalAlpha=c==='#c86bff'?.6:.4; ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,1.9,0,TAU); ctx.fill(); }
ctx.globalAlpha=1; ctx.fillStyle='#ffd94a'; ctx.beginPath(); ctx.arc(66,66,2.6,0,TAU); ctx.fill();
ctx.restore();
fs.writeFileSync('/home/claude/dl/sparks.png',C.toBuffer('image/png')); console.log('готово');
