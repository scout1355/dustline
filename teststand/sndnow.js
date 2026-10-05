const fs=require('fs'), L=require('./sndlab.js');
const h=fs.readFileSync(process.argv[2],'utf8');
const pick=(s,e)=>{const i=h.indexOf(s);return h.slice(i,h.indexOf(e,i));};
const code=[pick('function tone(','\n/* Шум с филь'), pick('function nzs(','function squishSnd('), pick('function squishSnd(','function nz('), pick('function nz(','\nconst SFXT'),
  'const S={'+pick('  wet:()=>','  crunch:')+' crunch:'+pick('  crunch:','\n  /*').replace('  crunch:','')+' };'].join('\n');
(async()=>{ const r=await L.analyse(L.render(code,['squelch','wet','burst']),process.argv[3]);
  console.log('звук      атака, мс   длина, мс   пик    громкость   доля низкого удара');
  for(const x of r) console.log(`${x.name.padEnd(9)} ${x.att.padStart(7)}   ${String(x.dur).padStart(8)}   ${x.peak}   ${x.rms}       ${x.pop}%`);
})();
