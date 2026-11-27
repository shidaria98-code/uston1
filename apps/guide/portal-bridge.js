/* Same-origin portal integration; standalone links use the same persistent dictionary. */
(() => {'use strict';
 const KEY='uston_game_v036',NOTES='uston_notes_v036',v=window.UstonGuideVocabulary,api=window.UstonDictionary;
 let inside=false;try{inside=parent!==window&&parent.location.origin===location.origin}catch{}
 if(parent!==window&&!inside&&location.protocol!=='file:'){document.documentElement.hidden=true;return;}
 api.register(v.entries);
 const norm=s=>String(s||'').normalize('NFC').trim().replace(/[.!?]+$/u,'').replace(/\s+/gu,' ').toLocaleLowerCase('udm'),entries=new Map(v.entries.map(e=>[e.id,e])),surfaces=new Map(v.occurrences.map(o=>[norm(o.surface),entries.get(o.entryId)])),seen=new Set;
 try{for(const e of api.events())if(e.type==='encounter'&&e.game==='guide')seen.add(e.unit)}catch{}
 function notify(){if(inside)parent.postMessage({type:'udm-reader-progress',version:1,app:'guide',data:snapshot()},location.origin)}
 let pending=false;function schedule(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;notify()})}
 window.UstonGuideSeen=text=>{const entry=surfaces.get(norm(text));if(!entry)return;const current=window.USTON_TEST?.getState();if(current?.learned&&!current.learned.some(w=>norm(w)===norm(entry.u)))current.learned.push(entry.u);if(seen.has(entry.canonicalId))return;seen.add(entry.canonicalId);api.encounter({gameId:'guide',itemId:'visible-word',words:[entry],eventId:'guide-visible:'+entry.id});if(inside)parent.dispatchEvent(new parent.Event('uston:game-vocabulary'))};
 window.UstonGuideResult=(correct,word,item)=>{if(typeof word!=='string')return;const entry=surfaces.get(norm(word));if(!entry)return;window.UstonGuideSeen(word);api.answer({unitId:entry.canonicalId,correct:!!correct,gameId:'guide',itemId:item});if(inside)parent.dispatchEvent(new parent.Event('uston:game-vocabulary'))};
 window.UstonGuideSaved=()=>{if(window.USTON_TEST)for(const u of window.USTON_TEST.getState().learned||[])window.UstonGuideSeen(u);schedule()};
 function snapshot(){const result={};for(const k of [KEY,NOTES,'udmurt_story_progress_v031','udmurt_v026_dictionary']){try{const raw=localStorage.getItem(k);if(raw!==null)result[k]=JSON.parse(raw)}catch{}}return result}
 window.udmReaderSnapshot=snapshot;
 window.addEventListener('message',event=>{if(!inside||event.source!==parent||event.origin!==location.origin||event.data?.type!=='udm-reader-hydrate'||event.data?.version!==1||event.data?.app!=='guide')return;/* Shared localStorage is authoritative: hydration must not overwrite fresh answers. */const stored=snapshot();if(stored[KEY])for(const u of stored[KEY].learned||[])window.UstonGuideSeen(u)});
 document.addEventListener('DOMContentLoaded',()=>{const nav=document.querySelector('header nav'),back=document.createElement('button');back.id='portal-return';back.type='button';back.textContent='На портал';back.onclick=returnToPortal;nav?.prepend(back);for(const link of document.querySelectorAll('.portal-link'))link.onclick=returnToPortal;try{const legacy=JSON.parse(localStorage.getItem('udmurt_v026_dictionary')||'null');for(const ref of legacy?.unlocked||[]){const e=entries.get(v.legacy[ref]);if(e)window.UstonGuideSeen(e.u)}}catch{}notify()});
 function returnToPortal(event){event?.preventDefault();if(inside){notify();parent.postMessage({type:'udm-return-to-hub',version:1,app:'guide'},location.origin)}else if(parent!==window&&location.protocol==='file:')window.open('../../index.html#games','_top');else location.href='../../index.html#games'}
 document.addEventListener('click',e=>{if(e.target.closest?.('.portal-link'))returnToPortal(e)},true);
 window.addEventListener('pagehide',notify);
})();
