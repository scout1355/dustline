const fs=require('fs'), {JSDOM}=require('jsdom');
let html=fs.readFileSync(process.argv[2],'utf8');
/* для теста открываем все задания: иначе поздние миссии недоступны в свежем профиле */
if(process.argv[5]) html=html.replace('function unlocked(i){ if(i===0)return true;','function unlocked(i){ return true;');
const SEC=parseInt(process.argv[3]||'60',10), CI=parseInt(process.argv[4]||'0',10);
const errs=[];
const ctxStub=new Proxy({},{get:(t,k)=>{
  if(k==='canvas')return {width:800,height:600};
  if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return ()=>({addColorStop(){}});
  if(k==='measureText')return ()=>({width:10});
  if(k==='getImageData')return ()=>({data:new Uint8ClampedArray(4)});
  return ()=>undefined;
},set:()=>true});
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(w){
    /* открываем все задания, иначе поздние миссии в тесте недоступны */
    try{ w.localStorage.setItem('dustline3', JSON.stringify({best:{},ach:{},achst:{},
      progress:{done:{i1:1,i2:1,i3:1,m1:1,m2:1,m3:1,m4:1,m5:1,m6:1,m7:1},pts:{}}})); }catch(e){}
    w.HTMLCanvasElement.prototype.getContext=()=>ctxStub;
    w.CanvasRenderingContext2D=function(){}; w.CanvasRenderingContext2D.prototype={};
    w.matchMedia=q=>({matches:/coarse/.test(q),addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
    require('./audio.js')(w);
    Object.defineProperty(w.navigator,'maxTouchPoints',{value:5,configurable:true});
    w.onerror=m=>errs.push('onerror: '+m);
    w.console.error=(...a)=>errs.push('console.error: '+a.map(String).join(' '));
  }});
const w=dom.window,d=w.document;
const click=n=>{ if(n) n.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); };
const key=(k,t)=>w.dispatchEvent(new w.KeyboardEvent(t,{key:k,bubbles:true}));
const step=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  await step(400);
  for(let i=0;i<8;i++){
    const s=d.querySelector('.screen.on'); if(!s) break;
    const cands=[...s.querySelectorAll('.opt,.card,.rcard,.abcard')].filter(n=>!n.classList.contains('locked'));
    if(s.id==='clsScreen'){ click(cands[Math.min(CI,cands.length-1)]); await step(40); }
    else if(s.id==='misScreen'&&process.argv[5]){
      const want=process.argv[5];
      const card=[...s.querySelectorAll('.opt')].find(n=>n.dataset.id===want&&!n.classList.contains('locked'));
      if(card){ click(card); await step(40); }
      else console.log('миссия '+want+' закрыта — беру доступную'); }
    else for(const c of cands.slice(0,2)){ click(c); await step(35); }
    let b=[...s.querySelectorAll('.go button')].filter(x=>!x.disabled);
    if(!b.length) b=[...s.querySelectorAll('button')].filter(x=>!x.disabled);
    if(b.length) click(b[b.length-1]);
    await step(110);
    if(!d.getElementById('hud').hidden) break;
  }
  if(d.getElementById('tutScreen')&&d.getElementById('tutScreen').classList.contains('on')){
    click(d.getElementById('tutGo')); await step(250); }
  let lvls=0;
  for(let s2=0;s2<SEC;s2++){
    key(['w','a','s','d'][s2%4],'keydown');
    if(s2%3===0) key('q','keydown'); if(s2%5===0) key('e','keydown'); if(s2%7===0) key(' ','keydown');
    await step(120);
    key(['w','a','s','d'][s2%4],'keyup'); key('q','keyup'); key('e','keyup'); key(' ','keyup');
    const lb=d.getElementById('lvlBtn');
    if(lb&&!lb.hidden){ click(lb); lvls++; await step(150);
      for(let k2=0;k2<6;k2++){ const c=d.querySelector('#lvlScreen.on .card'); if(!c)break; click(c); await step(140); } }
    const rc=d.querySelector('#relicScreen.on .rcard'); if(rc){ click(rc); await step(200); }
    await step(70);
  }
  const txt=id=>{const n=d.getElementById(id);return n?n.textContent.trim():'—';};
  console.log('миссия: '+((d.getElementById('mName')||{}).textContent||'?')+' | класс: '+txt('clsPill')+' | часы '+txt('clock')+' | уровней '+lvls+' | hp '+txt('hpTxt'));
  const sf=d.getElementById('shFill');
  console.log('полоска щита: '+(sf? (sf.hidden?'скрыта':'видна ('+sf.style.transform+')') : 'нет элемента'));
  const box=d.getElementById('errBox');
  console.log('плашка ошибки: '+(box&&!box.hidden?box.textContent.slice(0,140):'нет'));
  console.log(errs.length?'ОШИБКИ:\n  '+[...new Set(errs)].slice(0,6).join('\n  '):'ошибок нет');
  process.exit(0);
})();
