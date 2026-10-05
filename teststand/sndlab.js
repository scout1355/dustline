/* Лаборатория звука: запускает звуки игры в настоящем звуковом движке без браузера,
   пишет их в wav и меряет характер: атаку, пик, долю низкого «удара». */
const fs=require('fs'), {OfflineAudioContext}=require('node-web-audio-api');
const SR=44100;
function render(code, names, dur=0.6){
  return names.map(name=>{
    const ctx=new OfflineAudioContext(1,Math.floor(SR*dur),SR);
    let OFF=0;
    /* часы, которые можно сдвинуть: так отложенные слои звука встают на своё место */
    /* источник, запущенный без времени, в игре стартует «сейчас» — здесь «сейчас» это OFF.
       Без этой поправки отложенные слои звучали с нулевой секунды на полной громкости. */
    const wrapSrc=node=>{ const s0=node.start.bind(node), p0=node.stop.bind(node);
      node.start=(t,...r)=>s0(t===undefined?OFF:t,...r);
      node.stop=(t)=>p0(t===undefined?OFF:t); return node; };
    const AC=new Proxy(ctx,{get(t,k){ if(k==='currentTime') return OFF;
      if(k==='createOscillator') return ()=>wrapSrc(t.createOscillator());
      if(k==='createBufferSource') return ()=>wrapSrc(t.createBufferSource());
      const v=t[k]; return typeof v==='function'?v.bind(t):v; }});
    const MASTER=ctx.createGain(); MASTER.gain.value=1; MASTER.connect(ctx.destination);
    const timers=[];
    const setTimeout=(fn,ms)=>timers.push([ms/1000,fn]);
    const env={AC,MASTER,muted:false,Math,setTimeout};
    const fn=new Function(...Object.keys(env), code+'\nreturn S;');
    const S=fn(...Object.values(env));
    OFF=0; S[name]();
    timers.sort((a,b)=>a[0]-b[0]);
    for(let i=0;i<timers.length;i++){ OFF=timers[i][0]; timers[i][1](); }
    return {name, ctx};
  });
}
async function analyse(list, tag){
  const out=[];
  for(const {name,ctx} of list){
    const buf=await ctx.startRendering(); const d=buf.getChannelData(0);
    let peak=0,pi=0; for(let i=0;i<d.length;i++){ const a=Math.abs(d[i]); if(a>peak){peak=a;pi=i;} }
    /* атака: за сколько мс громкость дорастает до 70% пика */
    let att=0; for(let i=0;i<d.length;i++){ if(Math.abs(d[i])>=peak*.7){ att=i/SR*1000; break; } }
    /* длина: пока громкость выше 5% пика */
    let last=0; for(let i=0;i<d.length;i++) if(Math.abs(d[i])>peak*.05) last=i;
    /* доля низкого удара: энергия ниже 160 Гц в первые 40 мс */
    const n=Math.floor(SR*.04); let lo=0,all=0,prev=0;
    const a=Math.exp(-2*Math.PI*160/SR);
    for(let i=0;i<n;i++){ const y=(1-a)*d[i]+a*prev; prev=y; lo+=y*y; all+=d[i]*d[i]; }
    /* громкость по RMS */
    let rms=0; for(let i=0;i<=last;i++) rms+=d[i]*d[i]; rms=Math.sqrt(rms/Math.max(1,last));
    out.push({name,att:att.toFixed(1),dur:(last/SR*1000|0),peak:peak.toFixed(2),rms:rms.toFixed(3),pop:(100*lo/Math.max(1e-9,all)).toFixed(0)});
    /* wav, чтобы можно было послушать */
    const pcm=new Int16Array(d.length); const g=.9/Math.max(peak,1e-6);
    for(let i=0;i<d.length;i++) pcm[i]=Math.max(-1,Math.min(1,d[i]*g))*32767;
    const hdr=Buffer.alloc(44); hdr.write('RIFF',0); hdr.writeUInt32LE(36+pcm.length*2,4); hdr.write('WAVE',8);
    hdr.write('fmt ',12); hdr.writeUInt32LE(16,16); hdr.writeUInt16LE(1,20); hdr.writeUInt16LE(1,22);
    hdr.writeUInt32LE(SR,24); hdr.writeUInt32LE(SR*2,28); hdr.writeUInt16LE(2,32); hdr.writeUInt16LE(16,34);
    hdr.write('data',36); hdr.writeUInt32LE(pcm.length*2,40);
    fs.writeFileSync(`/home/claude/dl/snd_${tag}_${name}.wav`,Buffer.concat([hdr,Buffer.from(pcm.buffer)]));
  }
  return out;
}
module.exports={render,analyse};
