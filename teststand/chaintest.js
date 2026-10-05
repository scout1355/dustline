/* собираем звуковую цепочку так же, как игра, и меряем, что доходит до выхода */
const fs=require('fs'), {OfflineAudioContext}=require('node-web-audio-api');
const h=fs.readFileSync(process.argv[2],'utf8');
const hasNew=h.includes('const VOL_BASE=');
const SR=44100;
async function level(opts, which){
  const ctx=new OfflineAudioContext(1,SR,SR);
  let OUT,MASTER,MUSG;
  if(hasNew){
    OUT=ctx.createGain(); OUT.connect(ctx.destination); MASTER=ctx.createGain(); MASTER.connect(OUT);
    MUSG=ctx.createGain(); MUSG.connect(OUT);
    OUT.gain.value=.392*opts.volM; MASTER.gain.value=opts.volS; MUSG.gain.value=.34*opts.volMu;
  } else {
    MASTER=ctx.createGain(); MASTER.gain.value=.28; MASTER.connect(ctx.destination);
    MUSG=ctx.createGain(); MUSG.gain.value=.34; MUSG.connect(MASTER);
  }
  const o=ctx.createOscillator(); o.frequency.value=440; o.connect(which==='music'?MUSG:MASTER); o.start();
  const r=await ctx.startRendering(), d=r.getChannelData(0); let e=0; for(const v of d) e+=v*v;
  return Math.sqrt(e/d.length);
}
(async()=>{
  const base={volM:1,volS:1,volMu:1};
  const s=await level(base,'sfx'), m=await level(base,'music');
  console.log(`${process.argv[3]}: звук на выходе ${s.toFixed(4)}, музыка ${m.toFixed(4)}`);
  if(hasNew){
    console.log('  ползунок музыки 40% → звук', (await level({...base,volMu:.4},'sfx')).toFixed(4), ', музыка', (await level({...base,volMu:.4},'music')).toFixed(4));
    console.log('  ползунок звуков 50% → звук', (await level({...base,volS:.5},'sfx')).toFixed(4), ', музыка', (await level({...base,volS:.5},'music')).toFixed(4));
    console.log('  общий 0%          → звук', (await level({...base,volM:0},'sfx')).toFixed(4), ', музыка', (await level({...base,volM:0},'music')).toFixed(4));
  }
})();
