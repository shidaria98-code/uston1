/* Local recordings: no network, speech synthesis or module loading required. */
(function(){
'use strict';
const clips=[{id:'1',label:'Зечбур!',re:/[ӟз]ечбур/iu},{id:'2',label:'Кызьы тынад нимыд?',re:/кызьы\s+тынад\s+нимыд/iu},{id:'3',label:'Мынам нимы…',re:/мынам\s+нимы/iu}];
let unlocked=false,enabled=true,serial=0;
const player=new Audio();player.preload='none';
const status=document.createElement('span');status.setAttribute('role','status');status.style.cssText='font:13px system-ui';
const toggle=document.createElement('button');toggle.type='button';toggle.className='btn';toggle.textContent='🔊 Звук включён';toggle.setAttribute('aria-pressed','true');
document.querySelector('.header-actions').append(toggle,status);
function stop(){serial++;player.pause();player.removeAttribute('src');player.load();}
function matches(text){return clips.filter(c=>c.re.test(text||''));}
async function play(list){stop();if(!enabled||!unlocked||!list.length)return;const token=serial;status.textContent='';
for(const c of list){if(token!==serial)return;player.src='assets/audio/'+c.id+'.mp3';
try{await player.play();}catch(e){if(token===serial)status.textContent=e.name==='NotAllowedError'?'Нажми 🔊 у фразы, чтобы прослушать.':'Не удалось воспроизвести запись. Попробуй ещё раз.';return;}
await new Promise(resolve=>{player.onended=resolve;player.onerror=()=>{if(token===serial)status.textContent='Не удалось загрузить запись.';resolve();};player.onpause=resolve;});
}}
function addButtons(parent,text){const list=matches(text);for(const c of list){const b=document.createElement('button');b.type='button';b.className='btn audio-replay';b.textContent='🔊 '+c.label;b.setAttribute('aria-label','Прослушать: '+c.label);b.onclick=()=>{unlocked=true;enabled=true;sync();play([c]);};parent.append(b);}return list;}
function sync(){toggle.textContent=enabled?'🔊 Звук включён':'🔇 Звук выключен';toggle.setAttribute('aria-pressed',String(enabled));}
document.addEventListener('click',()=>{unlocked=true;},{capture:true});
document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')unlocked=true;},{capture:true});
toggle.onclick=()=>{enabled=!enabled;sync();stop();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.GameAudio={matches,playText(text){play(matches(text));},addButtons,stop,story(text){const box=document.getElementById('storyAudio')||document.createElement('div');box.id='storyAudio';box.className='dict-controls';box.replaceChildren();document.getElementById('text').after(box);const list=addButtons(box,text);play(list);}};
})();
