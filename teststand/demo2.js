const fs=require('fs'), {OfflineAudioContext}=require('node-web-audio-api');
const h=fs.readFileSync('dustline-v17.html','utf8');
const pick=(a,b)=>{const i=h.indexOf(a);return h.slice(i,h.indexOf(b,i));};
const SRC=new Function(pick('const SMP_SRC={','\nconst SMP={}')+'\nreturn SMP_SRC;')();
const G=new Function(pick('const SMP_GAIN=','\nfunction')+'\nreturn SMP_GAIN;')();
const SR=44100, TOTAL=11.5;
(async()=>{
  const ctx=new OfflineAudioContext(1,Math.floor(SR*TOTAL),SR), out=ctx.createGain(); out.gain.value=2.4; out.connect(ctx.destination);
  const dec=async k=>{ const b=Buffer.from(SRC[k],'base64'); return ctx.decodeAudioData(b.buffer.slice(b.byteOffset,b.byteOffset+b.length)); };
  const makeLoop=new Function('AC',pick('function makeLoop(','/* Одна копия')+'\nreturn makeLoop;')(ctx);
  const one=(buf,t,g)=>{ const s=ctx.createBufferSource(), n=ctx.createGain(); s.buffer=buf; n.gain.value=g; s.connect(n); n.connect(out); s.start(t); };
  const loop=(buf,t0,t1,g,pulses)=>{ const s=ctx.createBufferSource(), n=ctx.createGain(); s.buffer=makeLoop(buf,.03,.06); s.loop=true;
    n.gain.value=0; s.connect(n); n.connect(out); s.start(t0);
    const ramp=(v,t,d)=>{ n.gain.linearRampToValueAtTime(v,t+d); };
    n.gain.setValueAtTime(0,t0);
    if(pulses){ for(let t=t0;t<t1;t+=pulses){ n.gain.setValueAtTime(0,t); ramp(g,t,.03); n.gain.setValueAtTime(g,t+.16); ramp(0,t+.16,.18); } }
    else { ramp(g,t0,.1); n.gain.setValueAtTime(g,t1); ramp(0,t1,.18); } s.stop(t1+.6); };
  const W=await dec('whoosh'), W1=await dec('weld1'), W2=await dec('weld2'), Z=await dec('zap');
  one(W,.2,G.whoosh); one(W,.9,G.whoosh);          // два прыжка
  loop(W1,1.8,4.3,G.weld1);                         // добыча 2.5 с
  loop(W2,5.0,7.5,G.weld2);                         // луч по врагу 2.5 с
  loop(Z,8.2,9.6,G.zap,.26);                        // тесла: разряды импульсами
  loop(Z,9.9,11.2,G.zap);                           // «Разряд» Вектора: непрерывно
  const r=await ctx.startRendering(), d=r.getChannelData(0);
  let pk=0; for(const v of d) pk=Math.max(pk,Math.abs(v)); const k=pk>0.95?.95/pk:1;
  const pcm=Int16Array.from(d,v=>Math.max(-1,Math.min(1,v*k))*32767);
  const hd=Buffer.alloc(44); hd.write('RIFF',0); hd.writeUInt32LE(36+pcm.length*2,4); hd.write('WAVE',8); hd.write('fmt ',12);
  hd.writeUInt32LE(16,16); hd.writeUInt16LE(1,20); hd.writeUInt16LE(1,22); hd.writeUInt32LE(SR,24); hd.writeUInt32LE(SR*2,28);
  hd.writeUInt16LE(2,32); hd.writeUInt16LE(16,34); hd.write('data',36); hd.writeUInt32LE(pcm.length*2,40);
  fs.writeFileSync('/mnt/user-data/outputs/new_sounds_ingame.wav',Buffer.concat([hd,Buffer.from(pcm.buffer)]));
  console.log('файл записан, пик до выравнивания '+pk.toFixed(2));
})();
