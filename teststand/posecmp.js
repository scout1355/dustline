const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('dustline-v17.html','utf8').replace('function spawnBoss(){','window.__E={ET:()=>ETYPES,draw:(e,T,L)=>drawEnemy(e,T,L),posed:(e,T,L)=>drawEnemyPosed(e,T,L),setCtx:c=>{ctx=c;},getCtx:()=>ctx,sc:()=>sprScale()};\nfunction spawnBoss(){');
const dom=new JSDOM(html,{url:'https://localhost/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.CanvasRenderingContext2D=require('canvas').CanvasRenderingContext2D;
  w.matchMedia=q=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}); require('./audio.js')(w);}});
const w=dom.window;
setTimeout(()=>{ const E=w.__E, ET=E.ET(), sc=E.sc(), d=w.document;
  const types=['crawler','arachnid','bloater','hulk','sprinter','brood']; const W2=180*types.length;
  const mk=()=>{ const c=d.createElement('canvas'); c.width=W2*sc; c.height=400*sc; const g=c.getContext('2d'); g.setTransform(sc,0,0,sc,0,0); g.fillStyle='#2b2f36'; g.fillRect(0,0,W2,400); return [c,g]; };
  const [A,ga]=mk(), [B,gb]=mk(); const saved=E.getCtx();
  types.forEach((t,i)=>{ const base={...ET[t],type:t,x:90+i*180,y:200,dir:.6+i*.4,face:.6+i*.4,walk:7+i,ph:1.3+i,hop:0,flash:0,hp:1,hpMax:1};
    E.setCtx(ga); E.draw({...base},2.0,false);
    E.setCtx(gb); E.posed({...base},2.0,false); });
  E.setCtx(saved);
  const da=ga.getImageData(0,0,A.width,A.height).data, db=gb.getImageData(0,0,B.width,B.height).data;
  let diff=0,big=0,max=0; for(let i=0;i<da.length;i+=4){ const m=Math.max(Math.abs(da[i]-db[i]),Math.abs(da[i+1]-db[i+1]),Math.abs(da[i+2]-db[i+2])); if(m>0)diff++; if(m>40)big++; if(m>max)max=m; }
  console.log(`масштаб экрана ${sc}: отличающихся пикселей ${(100*diff/(da.length/4)).toFixed(2)}%, заметно (>40 из 255): ${big}, наибольшая разница ${max}`);
  const o=d.createElement('canvas'); o.width=A.width; o.height=A.height*2; const go=o.getContext('2d'); go.drawImage(A,0,0); go.drawImage(B,0,A.height);
  fs.writeFileSync('/home/claude/dl/posecmp.png',Buffer.from(o.toDataURL().split(',')[1],'base64'));
  process.exit(0); },800);
