const fs=require('fs'), {OfflineAudioContext}=require('node-web-audio-api');
const h=fs.readFileSync('dustline-v17.html','utf8');
const pick=(a,b)=>{const i=h.indexOf(a);return h.slice(i,h.indexOf(b,i));};
const SRC=new Function(pick('const SMP_SRC={','\nconst SMP={}')+'\nreturn SMP_SRC;')();
const SR=44100;
async function test(label, build){
  const ctx=new OfflineAudioContext(1,SR*3,SR);
  const dec=async k=>{ const b=Buffer.from(SRC[k],'base64'); return ctx.decodeAudioData(b.buffer.slice(b.byteOffset,b.byteOffset+b.length)); };
  const makeLoop=new Function('AC',pick('function makeLoop(','/* Одна копия')+'\nreturn makeLoop;')(ctx);
  await build(ctx,dec,makeLoop);
  const d=(await ctx.startRendering()).getChannelData(0); let pk=0, bad=0;
  for(const v of d){ if(!isFinite(v)) bad++; else pk=Math.max(pk,Math.abs(v)); }
  console.log(`${label.padEnd(44)} пик ${pk.toExponential(2)}  нечисел ${bad}`);
}
(async()=>{
  await test('одиночный звук прыжка', async(c,dec)=>{ const s=c.createBufferSource(); s.buffer=await dec('whoosh'); s.connect(c.destination); s.start(.1); });
  await test('петля добычи, громкость сразу', async(c,dec,mk)=>{ const s=c.createBufferSource(); s.buffer=mk(await dec('weld1'),.03,.06); s.loop=true; s.connect(c.destination); s.start(0); });
  await test('петля с setValueAtTime(0,0) и нарастанием', async(c,dec,mk)=>{ const s=c.createBufferSource(),g=c.createGain(); s.buffer=mk(await dec('weld1'),.03,.06); s.loop=true;
     g.gain.setValueAtTime(0,0); g.gain.setTargetAtTime(.5,.2,.04); g.gain.setTargetAtTime(0,1.5,.07); s.connect(g); g.connect(c.destination); s.start(.2); });
  await test('петля как в игре: gain.value=0 и нарастание', async(c,dec,mk)=>{ const s=c.createBufferSource(),g=c.createGain(); s.buffer=mk(await dec('weld1'),.03,.06); s.loop=true;
     g.gain.value=0; g.gain.setTargetAtTime(.5,0,.04); s.connect(g); g.connect(c.destination); s.start(0); });
  await test('петля со stop()', async(c,dec,mk)=>{ const s=c.createBufferSource(),g=c.createGain(); s.buffer=mk(await dec('weld1'),.03,.06); s.loop=true;
     g.gain.value=.5; s.connect(g); g.connect(c.destination); s.start(.2); s.stop(1.2); });
  await test('импульсы молнии (много setTargetAtTime)', async(c,dec,mk)=>{ const s=c.createBufferSource(),g=c.createGain(); s.buffer=mk(await dec('zap'),.03,.06); s.loop=true;
     g.gain.setValueAtTime(0,0); for(let t=.1;t<2.5;t+=.26){ g.gain.setTargetAtTime(.2,t,.012); g.gain.setTargetAtTime(0,t+.16,.07); } s.connect(g); g.connect(c.destination); s.start(.1); });
})();
(async()=>{ await new Promise(r=>setTimeout(r,2500));
  await test('ИГРОВОЙ порядок: импульсы молнии', async(c,dec,mk)=>{ const s=c.createBufferSource(),g=c.createGain(); s.buffer=mk(await dec('zap'),.03,.06); s.loop=true;
     g.gain.value=0; s.connect(g); g.connect(c.destination); s.start();
     for(let t=.1;t<2.5;t+=.26){ g.gain.setTargetAtTime(.2,t,.012); g.gain.setTargetAtTime(0,t+.16,.07); } });
  await test('ИГРОВОЙ порядок: частые подталкивания', async(c,dec,mk)=>{ const s=c.createBufferSource(),g=c.createGain(); s.buffer=mk(await dec('zap'),.03,.06); s.loop=true;
     g.gain.value=0; s.connect(g); g.connect(c.destination); s.start();
     for(let t=0;t<2.5;t+=1/60) g.gain.setTargetAtTime(.2,t,.012); });
})();
