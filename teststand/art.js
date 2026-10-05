const fs=require('fs'), {createCanvas}=require('canvas');
const h=fs.readFileSync('dustline-v17.html','utf8');
// достаём нужные куски игры и выполняем их с настоящим холстом
const grab=(start,end)=>{ const i=h.indexOf(start); const j=h.indexOf(end,i); return h.slice(i,j); };
const src=[
  'const TAU=Math.PI*2;',
  grab('function mulberry32','\n}')+'\n}',
  grab('const BIOMES=','\n};')+'\n};',
  grab('const MISSIONS=[','\n];')+'\n];',
  grab('function biomePreview','\n}\n/* поверх местности')+'\n}',
  grab('function artZones','\n}\n')+'\n}',
  grab('function missionArt','\n}\n')+'\n}',
  'module.exports={BIOMES,MISSIONS,biomePreview,missionArt,artZones};'
].join('\n');
fs.writeFileSync('/tmp/artmod.js',src);
const M=require('/tmp/artmod.js');
const W=232*2,H=104*2, cols=3, pad=14;
const list=M.MISSIONS.filter(m=>/^m\d$/.test(m.id));
const sheet=createCanvas(cols*(W+pad)+pad, Math.ceil(list.length/cols)*(H+40)+pad);
const sg=sheet.getContext('2d'); sg.fillStyle='#16191e'; sg.fillRect(0,0,sheet.width,sheet.height);
list.forEach((m,i)=>{ const c=createCanvas(W,H); M.biomePreview(m.biome,c,M.artZones(m)); M.missionArt(m,c);
  const x=pad+(i%cols)*(W+pad), y=pad+Math.floor(i/cols)*(H+40);
  sg.drawImage(c,x,y); sg.fillStyle='#dde2ea'; sg.font='bold 20px sans-serif';
  sg.fillText(m.name[0],x,y+H+26); });
fs.writeFileSync('/home/claude/dl/art.png',sheet.toBuffer('image/png'));
console.log('нарисовано превью:',list.length);
