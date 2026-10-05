const fs=require('fs'), L=require('./sndlab.js');
const h=fs.readFileSync('dustline-v17.html','utf8');
const pick=(s,e)=>{const i=h.indexOf(s);return h.slice(i,h.indexOf(e,i));};
const i0=h.indexOf('const S={'), sc=h.indexOf('scatter:()=>',i0), end=h.indexOf('};',sc)+2;
const code=[pick('function tone(','\n/* Шум с филь'), pick('function nzs(','function squishSnd('),
  pick('function squishSnd(','function nz('), pick('function nz(','\nconst SFXT'),
  h.slice(i0,end)].join('\n');
const names=[...h.slice(i0,end).matchAll(/(?:^|[\s,{])([a-zA-Z]+):\(\)=>/g)].map(m=>m[1]);
(async()=>{
  const res=[];
  for(const n of names){
    try{ const r=await L.analyse(L.render(code,[n],1.2),'all'); res.push(r[0]); }
    catch(e){ res.push({name:n,err:String(e.message).slice(0,60)}); }
  }
  fs.writeFileSync('/home/claude/dl/sndall.json',JSON.stringify(res));
  for(const x of res) console.log(x.err?`${x.name}: ОШИБКА ${x.err}`:`${x.name.padEnd(8)} длина ${String(x.dur).padStart(4)} мс  пик ${x.peak}  громкость ${x.rms}`);
})();
