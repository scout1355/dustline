const fs=require('fs'),{createCanvas}=require('canvas');
const h=fs.readFileSync('dustline-v17.html','utf8');
const pick=(a,b)=>{const i=h.indexOf(a);return h.slice(i,h.indexOf(b,i));};
const C=createCanvas(900,300), ctx=C.getContext('2d'); global.ctx=ctx;
const src=['const TAU=Math.PI*2;','function clamp(v,a,b){return v<a?a:(v>b?b:v);}',
 'const fx={spark(){}};',
 'function softGlow(x,y,r,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,"rgba(0,0,0,0)");ctx.globalAlpha*=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.globalAlpha=1;}',
 pick('function drawDetonator(','function drawOre('),'module.exports={drawDetonator};'].join('\n');
fs.writeFileSync('/tmp/det.js',src); const M=require('/tmp/det.js');
ctx.fillStyle='#2b2f36'; ctx.fillRect(0,0,900,300);
ctx.fillStyle='#dde2ea'; ctx.font='14px sans-serif'; ctx.fillText('Заряд на точке закладки (увеличено вдвое)',20,26);
const stages=[['закладка 40%',{st:0,arm:2},.4],['заложен, идёт отсчёт',{st:2,t:80},1],['сбой — нужен ремонт',{st:3,t:50},1],['10 секунд до взрыва',{st:2,t:6},1]];
stages.forEach(([lab,m,al],i)=>{ const x=120+i*210, y=160;
  ctx.save(); ctx.translate(x,y); ctx.scale(2,2);
  const col=m.st===3?'#e0605e':(m.st===2?'#ffb03a':'#f0c14b');
  ctx.globalAlpha=.16; ctx.fillStyle=col; ctx.beginPath(); ctx.arc(0,0,30,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=.55; ctx.strokeStyle=col; ctx.lineWidth=1; ctx.setLineDash([3,3.5]); ctx.beginPath(); ctx.arc(0,0,30,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
  ctx.globalAlpha=1; M.drawDetonator(0,0,m,al,0.1); ctx.restore();
  ctx.fillStyle='#8b93a1'; ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.fillText(lab,x,y+92); ctx.textAlign='left'; });
fs.writeFileSync('/home/claude/dl/detonator.png',C.toBuffer('image/png')); console.log('готово');
