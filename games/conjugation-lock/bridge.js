/* Explicit handshake also supports file previews with separate storage scopes. */
(() => {
 'use strict';
 const embedded=window.parent!==window,target=location.protocol==='file:'?'*':location.origin,origin=location.protocol==='file:'?'null':location.origin;
 let last='',timer,resolveHydration=null,hydration=null,hydrationTimer=null;
 function notify(){if(!embedded)return;const api=window.conjugationLock;if(!api)return;const raw=api.exportSave();if(raw===last&&api.pendingEvents().length===0)return;last=raw;parent.postMessage({type:'uston:conjugation-progress',version:1,gameId:'conjugation-lock',snapshot:JSON.parse(raw)},target);}
 function prepare(remote){if(!remote)return null;try{const data=JSON.parse(document.getElementById('data').textContent),raw=localStorage.getItem(data.gameId+'.save.v1');if(!raw)return remote;const local=JSON.parse(raw);const comparable=value=>{const copy=JSON.parse(JSON.stringify(value));delete copy.recoveredStandalone;for(const r of Object.values(copy.events||{}))delete r.acked;return JSON.stringify(copy);};if(comparable(local)!==comparable(remote))remote.recoveredStandalone=raw;}catch{}return remote;}
 function loadSnapshot(){if(!embedded)return null;if(!hydration){hydration=new Promise(resolve=>{resolveHydration=resolve;hydrationTimer=setTimeout(()=>{resolveHydration=null;resolve(null);},2000);});parent.postMessage({type:'uston:conjugation-ready',version:1,gameId:'conjugation-lock'},target);}return hydration;}
 function attachPicker(){if(!window.IntersectionObserver)return;const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting&&entry.intersectionRatio>=.5){const id=entry.target.dataset.lexemeId;if(id)window.conjugationLock.observeLexeme(id);}},{threshold:.5});document.querySelectorAll('#verb-list button').forEach(button=>observer.observe(button));}
 window.ConjugationPortal={embedded,notify,loadSnapshot,attachPicker};
 if(!embedded)return;
 window.addEventListener('message',event=>{if(event.source!==parent||event.origin!==origin||event.data?.version!==1)return;const message=event.data;if(message.type==='uston:conjugation-hydrate'&&message.gameId==='conjugation-lock'&&resolveHydration){clearTimeout(hydrationTimer);const resolve=resolveHydration;resolveHydration=null;resolve(prepare(message.snapshot));return;}if(message.type==='uston:conjugation-ack'&&Array.isArray(message.ids)&&message.ids.every(id=>typeof id==='string'))window.conjugationLock?.acknowledge(message.ids);});

 timer=setInterval(notify,1000);window.addEventListener('pagehide',()=>{notify();clearInterval(timer);});
})();
