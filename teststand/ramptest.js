/* та же проверка импульсов, но через настоящий игровой код loopPoke/loopsIdle с часами */
const fs=require('fs'), {OfflineAudioContext}=require('node-web-audio-api');
const h=fs.readFileSync('dustline-v17.html','utf8');
const pick=(a,b)=>{const i=h.indexOf(a);return h.slice(i,h.indexOf(b,i));};
const SRC=new Function(pick('const SMP_SRC={','\nconst SMP={}')+'\nreturn SMP_SRC;')();
const G=new Function(pick('const SMP_GAIN=','\nfunction')+'\nreturn SMP_GAIN;')();
const code=pick('function makeLoop(','function smp(');
(async()=>{
  const SR=44100, DUR=3, ctx=new OfflineAudioContext(1,SR*DUR,SR), M=ctx.createGain(); M.connect(ctx.destination);
  const b=Buffer.from(SRC.zap,'base64'); const SMP={zap:await ctx.decodeAudioData(b.buffer.slice(b.byteOffset,b.byteOffset+b.length))};
  let NOW=0; const AC=new Proxy(ctx,{get(t,k){ if(k==='currentTime') return NOW/1000; const v=t[k]; return typeof v==='function'?v.bind(t):v; }});
  /* начальное значение параметра для p.value в офлайне берём из последней цели */
  const api=new Function('AC','MASTER','muted','SMP','SMP_GAIN','performance',code+'\nreturn {loopPoke,loopsIdle};')(AC,M,false,SMP,G,{now:()=>NOW});
  /* кадры по 1/60 с: разряд каждые 0.26 с, 1-я секунда — пять целей за кадр */
  let ev=0;
  for(let f=0;f<DUR*60;f++){ NOW=f*1000/60;
    if(Math.abs((NOW/1000)%.26)<1/60){ for(let q=0;q<(NOW<1000?5:1);q++) api.loopPoke('zap',1,.16,.012); }
    api.loopsIdle(); }
  const d=(await ctx.startRendering()).getChannelData(0); let pk=0; for(const v of d) pk=Math.max(pk,Math.abs(v));
  console.log(`импульсы молнии через игровой код: пик ${pk.toFixed(3)} (норма — не выше ${(0.9*G.zap).toFixed(3)})`);
})();
