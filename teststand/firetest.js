const fs=require('fs'), {OfflineAudioContext}=require('node-web-audio-api');
const h=fs.readFileSync('dustline-v17.html','utf8');
const i=h.indexOf('let FIRE=null'), j=h.indexOf('function fireIdle(');
const code=h.slice(i,j);
(async()=>{
  const SR=44100, parts=[];
  for(const [burning,lab] of [[false,'в пустоту'],[true,'по целям']]){
    const ctx=new OfflineAudioContext(1,SR*2,SR); const MASTER=ctx.createGain(); MASTER.connect(ctx.destination);
    const performance={now:()=>0};
    const f=new Function('AC','MASTER','muted','performance', code+'\nreturn fireHum;');
    f(ctx,MASTER,false,performance)(burning);
    const r=await ctx.startRendering(), d=r.getChannelData(0);
    const s=Math.floor(SR*.5); let e=0; for(let k=s;k<d.length;k++) e+=d[k]*d[k];
    const rms=Math.sqrt(e/(d.length-s));
    console.log(`огнемёт ${lab.padEnd(10)}: громкость ${rms.toFixed(3)} (×${(rms/.020).toFixed(1)} от типичного звука игры)`);
    parts.push(Array.from(d.slice(Math.floor(SR*.1))));
  }
  /* файл послушать: сначала шипение в пустоту, потом рёв по целям */
  const all=[...parts[0],...new Array(SR*.3|0).fill(0),...parts[1]];
  let pk=0; for(const v of all){ const a=Math.abs(v); if(a>pk)pk=a; } const pcm=Int16Array.from(all.map(v=>v/pk*.85*32767));
  const hd=Buffer.alloc(44); hd.write('RIFF',0); hd.writeUInt32LE(36+pcm.length*2,4); hd.write('WAVE',8); hd.write('fmt ',12);
  hd.writeUInt32LE(16,16); hd.writeUInt16LE(1,20); hd.writeUInt16LE(1,22); hd.writeUInt32LE(SR,24); hd.writeUInt32LE(SR*2,28);
  hd.writeUInt16LE(2,32); hd.writeUInt16LE(16,34); hd.write('data',36); hd.writeUInt32LE(pcm.length*2,40);
  fs.writeFileSync('/mnt/user-data/outputs/flamer_sound.wav',Buffer.concat([hd,Buffer.from(pcm.buffer)]));
  console.log('файл записан');
})();
