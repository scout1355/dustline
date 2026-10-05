const fs=require('fs'), {OfflineAudioContext}=require('node-web-audio-api');
const h=fs.readFileSync('dustline-v17.html','utf8');
const pick=(a,b)=>{const i=h.indexOf(a);return h.slice(i,h.indexOf(b,i));};
const SRC=new Function(pick('const SMP_SRC={','\nconst SMP={}')+'\nreturn SMP_SRC;')();
const GAIN=new Function(pick('const SMP_GAIN=','\nfunction')+'\nreturn SMP_GAIN;')();
const loopCode=pick('function makeLoop(','function smp(');
async function run(hits,label){
  const SR=44100, ctx=new OfflineAudioContext(1,SR*1,SR), MASTER=ctx.createGain(); MASTER.connect(ctx.destination);
  const bin=Buffer.from(SRC.zap,'base64'); const SMP={zap:await ctx.decodeAudioData(bin.buffer.slice(bin.byteOffset,bin.byteOffset+bin.length))};
  let sources=0; const AC=new Proxy(ctx,{get(t,k){ if(k==='createBufferSource') return ()=>{ sources++; return t.createBufferSource(); };
    const v=t[k]; return typeof v==='function'?v.bind(t):v; }});
  const env={AC,MASTER,muted:false,SMP,SMP_GAIN:GAIN,performance:{now:()=>0}};
  const api=new Function(...Object.keys(env), loopCode+'\nreturn {loopPoke};')(...Object.values(env));
  for(let i=0;i<hits;i++) api.loopPoke('zap',1,.16,.012);      // столько целей задел разряд в одном кадре
  const r=await ctx.startRendering(), d=r.getChannelData(0);
  let e=0; for(let i=Math.floor(SR*.2);i<SR*.8;i++) e+=d[i]*d[i];
  const rms=Math.sqrt(e/(SR*.6));
  console.log(`${label}: создано звуков ${sources}, громкость ${rms.toFixed(4)}`);
  return rms;
}
(async()=>{ const a=await run(1,'разряд по 1 цели '); const b=await run(5,'разряд по 5 целям'); const c=await run(20,'20 молний разом   ');
  console.log(`громкость при 5 целях = ${(b/a*100).toFixed(0)}% от одной цели, при 20 = ${(c/a*100).toFixed(0)}%`); })();
