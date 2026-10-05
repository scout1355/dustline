const fs=require('fs'),{createCanvas}=require('canvas');
const h=fs.readFileSync('dustline-v17.html','utf8');
const grab=(start,end)=>{ const i=h.indexOf(start); return h.slice(i,h.indexOf(end,i)); };
const C=createCanvas(760,300), ctx=C.getContext('2d');
global.ctx=ctx;
const src=[
 'const TAU=Math.PI*2, QUAL=0;',
 'const W={t:1.3};',
 /* мягкое свечение — упрощённо, радиальным градиентом, как в игре выглядит glowTex */
 'function softGlow(x,y,r,col,a){ const g=ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,col); g.addColorStop(1,"rgba(0,0,0,0)"); ctx.globalAlpha=a; ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.fill(); ctx.globalAlpha=1; }',
 grab('function circle(','\n'),
 grab('function blobPath(','\nfunction shadow'),
 grab('function shadow(','\nfunction capsule'),
 grab('function drawAlien(','\nfunction drawObstacle'),
 'module.exports={drawAlien};'
].join('\n');
fs.writeFileSync('/tmp/alienmod.js',src);
const M=require('/tmp/alienmod.js');
ctx.fillStyle='#2e2a24'; ctx.fillRect(0,0,760,300);
/* зернистая земля, как в игре */
for(let i=0;i<2500;i++){ ctx.fillStyle='rgba(255,255,255,'+(Math.random()*.04)+')'; ctx.fillRect(Math.random()*760,Math.random()*300,1.5,1.5); }
/* пунктирная точка закладки и постройки вокруг, как в миссии */
const cx=380, cy=150;
ctx.strokeStyle='rgba(240,193,75,.8)'; ctx.lineWidth=2.4; ctx.setLineDash([8,6]); ctx.beginPath(); ctx.arc(cx,cy,30,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
M.drawAlien({x:cx-110,y:cy-20,r:42,alien:'hive',ph:.4});
M.drawAlien({x:cx+96,y:cy-52,r:24,alien:'spire',ph:1.2});
M.drawAlien({x:cx+84,y:cy+66,r:15,alien:'pod',ph:2});
M.drawAlien({x:cx-40,y:cy+92,r:22,alien:'spire',ph:2.6});
M.drawAlien({x:cx+150,y:cy+10,r:14,alien:'pod',ph:.9});
/* корпус героя для масштаба */
ctx.fillStyle='#ffd94a'; ctx.beginPath(); ctx.arc(cx-10,cy-120+20,16,0,Math.PI*2); ctx.fill();
ctx.fillStyle='#dde2ea'; ctx.font='13px sans-serif'; ctx.fillText('герой — для масштаба',cx+10,cy-96);
fs.writeFileSync('/home/claude/dl/alien.png',C.toBuffer('image/png')); console.log('готово');
