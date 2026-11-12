/* Uston culture-memory 0.2: guest progress adapter. No network requests. */
(() => {
  'use strict';
  const KEY='uston.culture-memory.v1', ID='culture-memory';
  const sizes=[5,10,20];
  const record=r=>r&&Number.isSafeInteger(r.moves)&&r.moves>=0&&r.moves<1e7&&Number.isFinite(r.elapsed)&&r.elapsed>=0&&r.elapsed<1e12;
  function clean(value) {
    const fail=()=>{throw Error('Повреждено сохранение игры «Шудон».');};
    if(!value||typeof value!=='object'||Array.isArray(value)||value.version!==1||!value.records||typeof value.records!=='object'||Array.isArray(value.records))return fail();
    const records={};
    for(const size of sizes){if(!Object.hasOwn(value.records,size))continue;const r=value.records[size];if(!record(r)||r.moves<size)return fail();records[size]={moves:r.moves,elapsed:r.elapsed};}
    let current=null;
    if(value.current!==null){const s=value.current;
      if(!s||!sizes.includes(s.size)||!Array.isArray(s.deck)||s.deck.length!==s.size*2||!Array.isArray(s.matched)||!Number.isSafeInteger(s.moves)||s.moves<0||s.moves>1e7||!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>1e12)return fail();
      const counts={};for(const id of s.deck){if(!Number.isInteger(id)||id<1||id>20)return fail();counts[id]=(counts[id]||0)+1;}
      if(Object.keys(counts).length!==s.size||Object.values(counts).some(n=>n!==2)||new Set(s.matched).size!==s.matched.length||s.matched.some(id=>!Number.isInteger(id)||!Object.hasOwn(counts,id))||s.matched.length>=s.size||s.moves<s.matched.length)return fail();
      current={size:s.size,deck:[...s.deck],matched:[...s.matched],moves:s.moves,elapsed:s.elapsed};
    }
    const seen=[...new Set((Array.isArray(value.seen)?value.seen:(current?.matched||[])).filter(id=>Number.isInteger(id)&&id>=1&&id<=20))];if(records[20])for(let id=1;id<=20;id++)if(!seen.includes(id))seen.push(id);return{version:1,records,current,seen};
  }
  function validate(data,out){if(Object.hasOwn(data,KEY)&&data[KEY]!==null)out[KEY]=clean(data[KEY]);}
  function summary(value){let v;try{v=clean(value);}catch(e){return 'Шудон: рекордов пока нет.';}const lines=[];for(const size of sizes){const r=v.records[size];if(!r)continue;const seconds=Math.floor(r.elapsed/1000);lines.push(size+' пар — '+r.moves+' ходов, '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'));}if(v.current)lines.push('сохранена партия на '+v.current.size+' пар');return 'Шудон: '+(lines.join('; ')||'рекордов пока нет')+'.';}
  function connect({frame,getActiveGame,readLocal,writeLocal,updateDashboard}){
    const origin=location.protocol==='file:'?'null':location.origin,target=origin==='null'?'*':origin;
    const listener=e=>{
      if(e.source!==frame.contentWindow||e.origin!==origin||getActiveGame()!==ID||e.data?.gameId!==ID||e.data.version!==1)return;
      if(e.data.type==='udm-culture-memory-ready'){
        const value=readLocal(KEY,null);
        if(value!==null){try{frame.contentWindow.postMessage({type:'udm-culture-memory-hydrate',version:1,gameId:ID,data:clean(value)},target);}catch(err){}}
        return;
      }
      if(e.data.type!=='udm-culture-memory-progress')return;
      try{if(JSON.stringify(e.data.data).length>8000)return;writeLocal(KEY,clean(e.data.data));updateDashboard();}catch(err){}
    };
    window.addEventListener('message',listener);
    return()=>window.removeEventListener('message',listener);
  }
  const previous=window.UstonNewGames;
  if(previous){if(!previous.keys.includes(KEY))previous.keys.push(KEY);const before=previous.validate;previous.validate=function(data,out){before(data,out);validate(data,out);};}
  window.UstonMemoryProgress={id:ID,key:KEY,clean,validate,summary,connect};
})();
