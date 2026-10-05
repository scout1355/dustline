const fs=require('fs'), {JSDOM}=require('jsdom');
const html=fs.readFileSync(process.argv[2],'utf8');
const errs=[];
const ctxStub=new Proxy({},{get:(t,k)=>{
  if(k==='canvas')return {width:800,height:600};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return ()=>({addColorStop(){}});
  if(k==='measureText')return ()=>({width:10});
  if(k==='getImageData')return ()=>({data:new Uint8ClampedArray(4)});
  return ()=>undefined;
},set:()=>true});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>ctxStub;
  w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
  w.matchMedia=q=>({matches:/coarse/.test(q),addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  require('./audio.js')(w);
  w.onerror=m=>errs.push('onerror: '+m);
  w.console.error=(...a)=>errs.push('console.error: '+a.map(String).join(' '));
}});
setTimeout(()=>{ console.log(errs.length?'ОШИБКИ: '+[...new Set(errs)].slice(0,4).join(' | '):'загрузка без ошибок'); process.exit(0); },1200);
