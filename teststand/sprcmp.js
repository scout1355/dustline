const fs=require('fs'),{createCanvas}=require('canvas');
const h=fs.readFileSync('dustline-v17.html','utf8');
const pick=(a,b)=>{const i=h.indexOf(a);return h.slice(i,h.indexOf(b,i));};
const SC=1.4;  /* масштаб экрана: плотность 2 × приближение 0.7 */
const src=['const TAU=Math.PI*2; let QUAL=0; const DPR=2, ZOOM=0.7;',
 'const document={createElement:()=>require("/home/claude/dl/node_modules/canvas").createCanvas(1,1)};',
 'let ctx=null; function setCtx(c){ctx=c;}',
 'function glowTex(){ const c=require("/home/claude/dl/node_modules/canvas").createCanvas(64,64); return c; }',
 pick('function softGlow(','function circle(')+pick('function circle(','\n/* лужа')+'\n',
 pick('function blobPath(','\nfunction shadow')+'\n', pick('function shadow(','\nfunction capsule')+'\n',
 pick('function sprScale(','/* далёкие картинки'), pick('function drawRockAt(','function drawObstacle('),
 pick('function drawPropOne(','function drawProps('),
 'module.exports={setCtx,drawRockAt,drawPropOne,makeSprite,drawSprite};'].join('\n');
fs.writeFileSync('/tmp/spr.js',src); const M=require('/tmp/spr.js');
const BIOMES=new Function(h.slice(h.indexOf('const BIOMES='),h.indexOf('\n};',h.indexOf('const BIOMES='))+3)+'\nreturn BIOMES;')();
const B=BIOMES.dust;
function scene(useSpr){ const c=createCanvas(900,300), g=c.getContext('2d'); M.setCtx(g);
  g.fillStyle=B.ground; g.fillRect(0,0,900,300); g.setTransform(SC,0,0,SC,0,0);
  const items=[{t:'rock',o:{x:90,y:110,r:52,s:1.1,k:0}},{t:'rock',o:{x:230,y:110,r:38,s:2.3,k:1}},
    {t:'prop',q:{k:'slab',x:360,y:110,r:28,a:.4,s:1,c:.3}},{t:'prop',q:{k:'dune',x:500,y:110,r:24,a:1.2,s:1,c:.5}},
    {t:'prop',q:{k:'rubble',x:600,y:110,r:30,a:2,s:1,c:.2}}];
  for(const it of items){
    if(it.t==='rock'){ const o=it.o; if(useSpr){ const s=M.makeSprite(o.r*1.6+8,hf=>M.drawRockAt(o,hf,hf,B)); M.setCtx(g); M.drawSprite(s,o.x,o.y);} else M.drawRockAt(o,o.x,o.y,B); }
    else { const q=it.q; if(useSpr){ const s=M.makeSprite(q.r*2.8+10,hf=>M.drawPropOne(q,hf,hf,q.r,B,0)); M.setCtx(g); M.drawSprite(s,q.x,q.y);} else M.drawPropOne(q,q.x,q.y,q.r,B,0); } }
  return c; }
const a=scene(false), b=scene(true);
const da=a.getContext('2d').getImageData(0,0,900,300).data, db=b.getContext('2d').getImageData(0,0,900,300).data;
let diff=0,big=0,maxd=0; for(let i=0;i<da.length;i+=4){ const d=Math.max(Math.abs(da[i]-db[i]),Math.abs(da[i+1]-db[i+1]),Math.abs(da[i+2]-db[i+2]));
  if(d>0)diff++; if(d>24)big++; maxd=Math.max(maxd,d); }
console.log(`отличающихся пикселей: ${diff} из ${900*300} (${(100*diff/270000).toFixed(2)}%), заметно (>24 из 255): ${big}, наибольшая разница ${maxd}`);
const out=createCanvas(900,620), o2=out.getContext('2d'); o2.drawImage(a,0,0); o2.drawImage(b,0,320);
o2.fillStyle='#dde2ea'; o2.font='14px sans-serif'; o2.fillText('прямое рисование',10,20); o2.fillText('из кэша',10,340);
fs.writeFileSync('/home/claude/dl/sprcmp.png',out.toBuffer('image/png'));
