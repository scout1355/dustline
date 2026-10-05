const fs=require('fs'),{createCanvas}=require('canvas');
const h=fs.readFileSync('dustline-v17.html','utf8');
const grab=(s,e)=>{const i=h.indexOf(s);return h.slice(i,h.indexOf(e,i));};
const C=createCanvas(1000,560), ctx=C.getContext('2d'); global.ctx=ctx; const TAU=Math.PI*2;
const src=['const TAU=Math.PI*2; const W={t:1.1};',
 'function clamp(v,a,b){return v<a?a:(v>b?b:v);}',
 'function softGlow(x,y,r,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,"rgba(0,0,0,0)");ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.globalAlpha=1;}',
 grab('function shipFlame(','\nfunction drawOre'),
 'module.exports={drawShip};'].join('\n');
fs.writeFileSync('/tmp/sm3.js',src);
const M=require('/tmp/sm3.js');
ctx.fillStyle='#1b1e24'; ctx.fillRect(0,0,1000,560);
ctx.fillStyle='#dde2ea'; ctx.font='15px sans-serif';
ctx.fillText('Корабли после доработки: бортовые огни, обшивка, пламя направлено вниз',20,28);
const names=[['vector','ВЕКТОР'],['thunder','ГРОМ'],['builder','ЗОДЧИЙ'],['spore','СПОРА']];
names.forEach(([k,label],i)=>{ const cx=140+i*240, cy=280;
  ctx.fillStyle='#22262d'; ctx.fillRect(cx-115,70,230,420);
  M.drawShip(k,cx,cy,1.05,1);
  ctx.fillStyle='#dde2ea'; ctx.font='13px sans-serif'; ctx.fillText(label,cx-105,515); });
fs.writeFileSync('/home/claude/dl/ships2.png',C.toBuffer('image/png')); console.log('готово');
