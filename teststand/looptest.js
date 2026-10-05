const fs=require('fs'), {OfflineAudioContext}=require('node-web-audio-api');
const h=fs.readFileSync('dustline-v17.html','utf8');
const i=h.indexOf('const SMP_SRC={'), j=h.indexOf('};',i)+2;
const SRC=new Function(h.slice(i,j)+'\nreturn SMP_SRC;')();
const mi=h.indexOf('function makeLoop('), mj=h.indexOf('/* Одна копия на петлю');
(async()=>{
  const SR=44100, res={};
  for(const k of ['whoosh','weld1','weld2','zap']){
    const ctx=new OfflineAudioContext(1,SR*4,SR);
    const bin=Buffer.from(SRC[k],'base64');
    const buf=await ctx.decodeAudioData(bin.buffer.slice(bin.byteOffset,bin.byteOffset+bin.length));
    if(k==='whoosh'){
      const s=ctx.createBufferSource(); s.buffer=buf; s.connect(ctx.destination); s.start(0);
      const r=await ctx.startRendering(), d=r.getChannelData(0);
      let pk=0; for(const v of d) pk=Math.max(pk,Math.abs(v)); let e=0,c=0; for(const v of d) if(Math.abs(v)>pk*.05){e+=v*v;c++;}
      res[k]={rms:Math.sqrt(e/c)}; console.log(`whoosh: разобран, ${(buf.duration*1000)|0} мс, громкость ${res[k].rms.toFixed(3)}`); continue; }
    const makeLoop=new Function('AC', h.slice(mi,mj)+'\nreturn makeLoop;')(ctx);
    const lp=makeLoop(buf,.03,.06); const L=lp.length;
    const s=ctx.createBufferSource(); s.buffer=lp; s.loop=true; s.connect(ctx.destination); s.start(0);
    const r=await ctx.startRendering(), d=r.getChannelData(0);
    /* скачок на стыке против обычных соседних отсчётов */
    const jumps=[]; for(let q=1;q<d.length;q++) jumps.push(Math.abs(d[q]-d[q-1]));
    const typ=jumps.slice().sort((a,b)=>a-b)[Math.floor(jumps.length*.99)];
    let worst=0; for(let c=1;c<4;c++){ const q=c*L; if(q<d.length) worst=Math.max(worst,Math.abs(d[q]-d[q-1])); }
    /* провал громкости на стыке: 10-мс окна вокруг стыка против средней */
    const win=Math.floor(SR*.01), rmsAt=q=>{ let e=0; for(let t=q-win;t<q+win;t++) e+=d[t]*d[t]; return Math.sqrt(e/(2*win)); };
    let tot=0; for(const v of d) tot+=v*v; const avg=Math.sqrt(tot/d.length);
    let dip=1; for(let c=1;c<4;c++){ const q=c*L; if(q+win<d.length) dip=Math.min(dip,rmsAt(q)/avg); }
    res[k]={rms:avg};
    console.log(`${k.padEnd(6)}: петля ${(L/SR*1000)|0} мс | скачок на стыке ${worst.toFixed(3)} при обычном ${typ.toFixed(3)} | громкость на стыке ${(dip*100)|0}% от средней | громкость ${avg.toFixed(3)}`);
  }
  fs.writeFileSync('/home/claude/dl/looprms.json',JSON.stringify(res));
})();
