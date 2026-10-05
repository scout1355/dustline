const fs=require('fs'), L=require('./sndlab.js');
const h=fs.readFileSync(process.argv[2],'utf8');
const pick=(s,e)=>{const i=h.indexOf(s);return h.slice(i,h.indexOf(e,i));};
const code=[pick('function tone(','\n/* Шум с филь'), pick('function nzs(','function squishSnd('), pick('function squishSnd(','function nz('), pick('function nz(','\nconst SFXT'),
  'const S={ mg:()=>{nz(.05,.038,2600);tone(300,.04,"square",.019,180);}, hit:()=>tone(200,.03,"triangle",.04,140),'+pick('  wet:()=>','  crunch:')+' };'].join('\n');
(async()=>{ const r=await L.analyse(L.render(code,['mg','hit','squelch','wet','burst']),'ref');
  console.log('звук      пик    громкость (RMS)');
  for(const x of r) console.log(`${x.name.padEnd(9)} ${x.peak}   ${x.rms}`);
})();
