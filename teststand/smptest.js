const fs=require('fs'), {OfflineAudioContext}=require('node-web-audio-api');
const h=fs.readFileSync('dustline-v17.html','utf8');
const i=h.indexOf('const SMP_SRC={'), j=h.indexOf('};',i)+2;
const SRC=new Function(h.slice(i,j)+'\nreturn SMP_SRC;')();
const gi=h.indexOf('const SMP_GAIN='), GAIN=new Function(h.slice(gi,h.indexOf(';',gi)+1)+'\nreturn SMP_GAIN;')();
(async()=>{
  const SR=44100, out={};
  for(const k of Object.keys(SRC)){
    const bin=Buffer.from(SRC[k],'base64');
    const ctx=new OfflineAudioContext(1,SR*2,SR);
    let buf=null;
    try{ buf=await ctx.decodeAudioData(bin.buffer.slice(bin.byteOffset,bin.byteOffset+bin.length)); }catch(e){ console.log(k,'НЕ РАЗБИРАЕТСЯ:',e.message); continue; }
    out[k]=buf;
    console.log(`${k}: разобран, ${(buf.duration*1000|0)} мс, ${buf.sampleRate} Гц, ${buf.numberOfChannels} канал`);
  }
  /* громкость так, как её сыграет игра: с тем же множителем, что в коде */
  const plays=[['мелкие','splat',.85,1.14],['мелкие','goop',.85,1.14],['средние','goop',1,1],['средние','splat',1,1],['крупные','goop',1.15,.8],['постройки','hive',1.1,1]];
  console.log('\nкак прозвучит в игре (типичный звук игры = 0.020):');
  for(const [lab,k,vol,rate] of plays){
    const ctx=new OfflineAudioContext(1,SR*2,SR), s=ctx.createBufferSource(), g=ctx.createGain(), m=ctx.createGain();
    s.buffer=out[k]; s.playbackRate.value=rate; g.gain.value=vol*GAIN[k]; m.gain.value=1;
    s.connect(g); g.connect(m); m.connect(ctx.destination); s.start(0);
    const r=await ctx.startRendering(), d=r.getChannelData(0);
    let pk=0; for(const v of d) pk=Math.max(pk,Math.abs(v));
    let e=0,c=0; for(const v of d) if(Math.abs(v)>pk*.05){ e+=v*v; c++; }
    const rms=Math.sqrt(e/Math.max(1,c));
    console.log(`  ${lab.padEnd(10)} ${k.padEnd(6)} громкость ${rms.toFixed(3)}  (×${(rms/.020).toFixed(1)} от типичного)`);
  }
})();
