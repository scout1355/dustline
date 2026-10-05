/* Прежние звуки смерти — восстановлены дословно из прошлой версии, чтобы переснять их честно */
const fs=require('fs'), L=require('./sndlab.js');
const h=fs.readFileSync('dustline-v17.html','utf8');
const pick=(s,e)=>{const i=h.indexOf(s);return h.slice(i,h.indexOf(e,i));};
const base=[pick('function tone(','\n/* Шум с филь'), pick('function nzs(','function squishSnd('),
  pick('function squishSnd(','function nz('), pick('function nz(','\nconst SFXT')].join('\n');
const OLD=`const S={
  wet:()=>{ nzs(.16,.15,1500,240); tone(210,.15,'sine',.11,80); },
  squelch:()=>{ nzs(.18,.17,1800,200); tone(185,.17,'sine',.13,62); setTimeout(()=>nzs(.07,.06,900,300),60); },
  burst:()=>{ nzs(.24,.21,1300,110); tone(128,.24,'sine',.17,44); setTimeout(()=>{ nzs(.12,.09,600,150); tone(84,.2,'sine',.09,38); },70); } };`;
const i0=h.indexOf('const S={'), sc=h.indexOf('scatter:()=>',i0), end=h.indexOf('};',sc)+2;
(async()=>{
  const o=await L.analyse(L.render(base+'\n'+OLD,['squelch','wet','burst']),'old');
  const n=await L.analyse(L.render(base+'\n'+h.slice(i0,end),['squelch','wet','burst']),'new');
  fs.writeFileSync('/home/claude/dl/sndold.json',JSON.stringify({o,n}));
  console.log('звук      | было: длина, атака, низкий удар, громкость | стало');
  for(let i=0;i<3;i++){ const a=o[i],b=n[i];
    console.log(`${a.name.padEnd(9)} | ${String(a.dur).padStart(3)} мс, ${a.att.padStart(5)} мс, ${a.pop.padStart(2)}%, ${a.rms} | ${String(b.dur).padStart(3)} мс, ${b.att.padStart(5)} мс, ${b.pop.padStart(2)}%, ${b.rms}`); }
})();
