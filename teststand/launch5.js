const fs=require('fs'),{createCanvas}=require('canvas');
const h=fs.readFileSync('dustline-v17.html','utf8');
const grab=(s,e)=>{const i=h.indexOf(s);return h.slice(i,h.indexOf(e,i));};
const C=createCanvas(1180,520), ctx=C.getContext('2d'); global.ctx=ctx; const TAU=Math.PI*2;
const src=['const TAU=Math.PI*2; const W={t:1.1};',
 'function clamp(v,a,b){return v<a?a:(v>b?b:v);}',
 'function softGlow(x,y,r,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,"rgba(0,0,0,0)");ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.globalAlpha=1;}',
 grab('let SHIP_AL=1;','\nfunction drawOre'),
 'module.exports={drawShip,setAl:v=>{SHIP_AL=v;}};'].join('\n');
fs.writeFileSync('/tmp/sm5.js',src);
const M=require('/tmp/sm5.js');
ctx.fillStyle='#2b2f36'; ctx.fillRect(0,0,1180,520);
for(let i=0;i<2800;i++){ ctx.fillStyle='rgba(255,255,255,'+(Math.random()*.035)+')'; ctx.fillRect(Math.random()*1180,Math.random()*520,1.5,1.5); }
ctx.fillStyle='#dde2ea'; ctx.font='14px sans-serif';
ctx.fillText('Взлёт с геометрическим разгоном: долго набирает тягу, потом срывается вверх',20,26);
const SC=0.36;
[0,.3,.55,.75,.88,.96].forEach((q,i)=>{
  const bx=110+i*196, by=430;
  const ease=(Math.exp(5*q)-1)/(Math.exp(5)-1), rise=760*ease*SC, s=(1+1.35*ease)*SC, al=q<.78?1:Math.max(0,1-(q-.78)/.22);
  if(q<.45){ const k=1-q/.45; ctx.save(); ctx.globalAlpha=k*.45; ctx.fillStyle='rgba(186,176,156,.55)';
    ctx.beginPath(); ctx.ellipse(bx,by+30*SC,150*(1.35-k)*SC,42*(1.35-k)*SC,0,0,TAU); ctx.fill(); ctx.restore(); }
  const sk=Math.max(0,1-ease*2.4);
  if(sk>.02){ ctx.save(); ctx.globalAlpha=.45*sk; ctx.fillStyle='#000';
    ctx.beginPath(); ctx.ellipse(bx,by+30*SC,92*sk*SC,28*sk*SC,0,0,TAU); ctx.fill(); ctx.restore(); }
  ctx.fillStyle='#5cc8ff'; ctx.beginPath(); ctx.arc(bx,by+20,9,0,TAU); ctx.fill();   /* герой под кораблём */
  ctx.save(); M.setAl(al); ctx.globalAlpha=al; M.drawShip('vector',bx,by-rise,s,.3+.7*q); M.setAl(1); ctx.restore(); ctx.globalAlpha=1;
  ctx.fillStyle='#8b93a1'; ctx.font='11px sans-serif'; ctx.fillText((q*1.5).toFixed(2)+' с',bx-14,by+52);
});
fs.writeFileSync('/home/claude/dl/launch5.png',C.toBuffer('image/png')); console.log('готово');
