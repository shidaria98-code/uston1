// Works with HTTP and local file frames. Only known progress keys are shared.
(()=>{'use strict';const allowed=window.PORTAL_PROGRESS_KEYS||[],embedded=parent!==window;let ready=!embedded,applying=false,pending=0;
function snapshot(){const data={};for(const k of allowed){try{const s=localStorage.getItem(k);data[k]=s===null?null:JSON.parse(s);}catch(e){}}return data;}
function publish(){if(embedded&&ready&&!applying)parent.postMessage({type:'udm-reader-progress',app:window.PORTAL_APP_ID,data:snapshot()},'*');}
const nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem;
Storage.prototype.setItem=function(k,v){nativeSet.call(this,k,v);if(allowed.includes(k)&&!applying&&ready){clearTimeout(pending);pending=setTimeout(publish,50);}};
Storage.prototype.removeItem=function(k){nativeRemove.call(this,k);if(allowed.includes(k)&&!applying&&ready){clearTimeout(pending);pending=setTimeout(publish,50);}};
window.addEventListener('message',e=>{if(!embedded||e.source!==parent||e.data?.type!=='udm-reader-hydrate'||!e.data.data||typeof e.data.data!=='object')return;let changed=false;applying=true;for(const k of allowed){if(!Object.hasOwn(e.data.data,k))continue;const value=e.data.data[k],v=value===null?null:JSON.stringify(value);if(v!==null&&v.length>150000)continue;try{if(localStorage.getItem(k)!==v){if(v===null)nativeRemove.call(localStorage,k);else nativeSet.call(localStorage,k,v);changed=true;}}catch(err){}}
applying=false;if(changed){location.reload();return;}ready=true;publish();});
window.udmReaderSnapshot=snapshot;
window.udmCloseGame=()=>{try{if(typeof saveStory==='function'&&document.getElementById('intro')?.classList.contains('hide'))saveStory();}catch(e){}if(window.GameAudio)window.GameAudio.stop();document.querySelectorAll('audio,video').forEach(m=>m.pause());clearTimeout(pending);publish();};
window.addEventListener('pagehide',publish);
window.addEventListener('DOMContentLoaded',()=>{const a=document.getElementById('portal-return');if(a)a.onclick=e=>{if(embedded){e.preventDefault();window.udmCloseGame();parent.postMessage({type:'udm-return-to-hub'},'*');}};});
})();
