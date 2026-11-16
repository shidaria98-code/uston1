(() => {
'use strict';
const groups=window.CASE_GROUPS,KEY='uston.case-lock.v1', questions=['Кытын?','Кытчы?','Кытысь?'],meanings=['Где?','Куда?','Откуда?'], directions=['where','to','from'];
function escCopy(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
const $=id=>document.getElementById(id),shuffle=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const fresh=()=>({version:1,runId:globalThis.crypto?.randomUUID?.()||String(Date.now()),level:0,queue:shuffle(groups.map((_,i)=>i)),position:0,retries:[],attempts:0,selected:[],resolved:false,feedback:'',scores:{},completed:[],history:[],reviewIndex:null});
let s=fresh(),storageOK=true;
function valid(v){return v?.version===1&&typeof v.runId==='string'&&Number.isInteger(v.level)&&v.level>=0&&v.level<=3&&Array.isArray(v.queue)&&v.queue.length<=20&&v.queue.every(i=>Number.isInteger(i)&&i>=0&&i<10)&&Number.isInteger(v.position)&&v.position>=0&&v.position<=v.queue.length&&Array.isArray(v.retries)&&v.retries.length<=10&&v.retries.every(i=>Number.isInteger(i)&&i>=0&&i<10)&&[0,1,2].includes(v.attempts)&&Array.isArray(v.selected)&&v.selected.length<=2&&v.selected.every(x=>typeof x==='string'&&x.length<40)&&typeof v.resolved==='boolean'&&typeof v.feedback==='string'&&v.scores&&Object.entries(v.scores).every(([k,n])=>/^[0-2]-[0-9]$/.test(k)&&[0,5,10].includes(n))&&Array.isArray(v.completed)&&v.completed.every(n=>[0,1,2].includes(n));}
try{const raw=localStorage.getItem(KEY);if(raw){const v=JSON.parse(raw);if(valid(v))s=v;else storageOK=false;}}catch{storageOK=false;}
// Older saves have no history. Recover the available order from the current queue;
// previous castles retain their completed words, whose original shuffled order was not stored.
function restoreHistory(){
 const recordOK=r=>r&&Number.isInteger(r.level)&&r.level>=0&&r.level<3&&Number.isInteger(r.group)&&r.group>=0&&r.group<10&&Number.isInteger(r.position)&&r.position>=0&&r.position<20&&Array.isArray(r.selected)&&r.selected.length<=2&&r.selected.every(x=>typeof x==='string'&&x.length<40)&&[0,1,2].includes(r.attempts)&&typeof r.feedback==='string'&&r.feedback.length<1000;
 if(!Array.isArray(s.history)||s.history.length>60||!s.history.every(recordOK)){
  s.history=[];
  for(let level=0;level<Math.min(s.level,3);level++)groups.forEach((g,i)=>{if(Object.hasOwn(s.scores,`${level}-${i}`))s.history.push({level,group:i,position:i,selected:[],attempts:0,feedback:'Ранее выполненное задание. Первоначальный порядок этого замка в старом сохранении недоступен.'});});
  if(s.level<3)s.queue.slice(0,s.position).forEach((group,position)=>{if(Object.hasOwn(s.scores,`${s.level}-${group}`))s.history.push({level:s.level,group,position,selected:[],attempts:0,feedback:'Ранее выполненное задание.'});});
 }
 if(!Number.isInteger(s.reviewIndex)||s.reviewIndex<0||s.reviewIndex>=s.history.length)s.reviewIndex=null;
}
restoreHistory();
const total=()=>Object.values(s.scores).reduce((a,b)=>a+b,0);
function report(type){const detail={schemaVersion:1,gameId:'case-lock',runId:s.runId,eventId:`${s.runId}:${s.level}:${s.position}:${type}`,type,score:total(),maxScore:300,completedLevels:s.completed.slice(),words:groups.filter((g,i)=>[0,1,2].some(l=>Object.hasOwn(s.scores,`${l}-${i}`))).map(g=>({udm:g.word,ru:g.meaning})),finished:s.level===3};window.dispatchEvent(new CustomEvent('uston:case-lock',{detail}));if(window.parent!==window&&location.origin!=='null')window.parent.postMessage({type:'uston:game-progress',payload:detail},location.origin);}
function save(){const dictOK=window.UstonCaseDictionary?.sync(s.scores);if($('dictionary-status'))$('dictionary-status').textContent=dictOK===false?'Не удалось обновить словарь. Попробуем снова при следующем ходе.':'Слова из выполненных заданий автоматически попадают в словарь портала в начальной форме.';try{localStorage.setItem(KEY,JSON.stringify(s));storageOK=true;}catch{storageOK=false;}$('storage').textContent=storageOK?'Прогресс сохраняется в этом браузере.':'Не удалось прочитать или сохранить прогресс. Игра доступна; сохранение может быть недоступно.';}
function group(){return groups[s.queue[s.position]];}
function parts(g,level=s.level){if(['syures','puzhym'].includes(g.id))return [g.word,g.forms[level].split(' ')[1]];return [g.word,g.forms[level].slice(g.word.length)];}
function compose(a,g){return a.join(['syures','puzhym'].includes(g.id)?' ':'');}
function explanation(g,level=s.level){if(g.explanations?.[level])return g.explanations[level];return ['syures','puzhym'].includes(g.id)?`${questions[level]} — ${meanings[level]} Основа «${g.word}» остаётся неизменной. Выбираем отдельный послелог «${parts(g,level)[1]}»: выл обозначает верх, поверхность.`:`${questions[level]} — ${meanings[level]} К основе «${g.word}» присоединяем «${parts(g,level)[1]}»: ${g.forms[level]}.`;}
function button(text,fn,cls=''){const b=document.createElement('button');b.textContent=text;b.className=cls;b.onclick=fn;return b;}
function openReview(index){s.reviewIndex=index;save();render();$('game').scrollIntoView({block:'nearest'});}
function backButton(){const b=button('← Назад',()=>openReview(s.history.length-1));b.disabled=s.history.length===0;return b;}
function rememberCurrent(){s.history.push({level:s.level,group:s.queue[s.position],position:s.position,selected:s.selected.slice(),attempts:s.attempts,feedback:s.feedback});s.reviewIndex=null;}
function renderReview(root){
 const r=s.history[s.reviewIndex],g=groups[r.group];
 $('status').textContent=`Просмотр · Замок ${r.level+1} · ${r.position>=10?'Повторение':`Задание ${r.position+1}`} · ${s.reviewIndex+1} из ${s.history.length} пройденных шагов`;
 const board=document.createElement('div');board.className='board';
 const scene=document.createElement('div');scene.className='scene';const img=new Image();img.alt=g.ru[r.level];img.src=window.CASE_IMAGES?.[`${g.id}-${directions[r.level]}`]||`images/case_${g.id}_${directions[r.level]}.webp`;scene.append(img);
 const play=document.createElement('div');play.className='play';
 const label=document.createElement('div');label.className='eyebrow';label.textContent=`${questions[r.level]} · Просмотр выполненного задания`;
 const heading=document.createElement('h2');heading.textContent=g.ru[r.level];
 const sentence=document.createElement('p');sentence.className='sentence';sentence.lang='udm';sentence.textContent=g.udm[r.level];
 const form=document.createElement('p');form.textContent=`Правильная форма: ${g.forms[r.level]}`;
 const exp=document.createElement('p');exp.textContent=explanation(g,r.level);
 const note=document.createElement('p');note.className='muted';note.textContent='Просмотр не меняет баллы и попытки. Вперёд можно идти только по уже пройденным заданиям, до текущего.';
 play.append(label,heading,sentence,form,exp);
 if(r.selected.length){const answer=document.createElement('p');answer.textContent='Твой ответ: '+compose(r.selected,g);play.append(answer);}
 if(r.feedback){const feedback=document.createElement('p');feedback.textContent=r.feedback;play.append(feedback);}
 play.append(note);board.append(scene,play);root.append(board);
 const nav=document.createElement('div');nav.className='review-navigation';nav.setAttribute('aria-label','Просмотр пройденных заданий');
 const back=button('← Назад',()=>openReview(s.reviewIndex-1));back.disabled=s.reviewIndex===0;
 nav.append(back,button(s.reviewIndex===s.history.length-1?'К текущему шагу →':'Вперёд →',()=>openReview(s.reviewIndex+1<s.history.length?s.reviewIndex+1:null),'primary'));
 if(s.reviewIndex<s.history.length-1)nav.append(button('К текущему шагу',()=>openReview(null)));
 root.append(nav);save();
}
function render(){
$('score').textContent=total();$('bar').style.width=`${Object.keys(s.scores).length/30*100}%`;
$('levels').replaceChildren(...questions.map((q,i)=>{const b=button('',()=>{});b.innerHTML=`<b>${s.completed.includes(i)?'✓ ':i>s.level?'⌑ ':''}${q}</b><small>${meanings[i]} · ${s.completed.includes(i)?'Открыт':i===s.level?'Текущий замок':'Закрыт'}</small>`;b.disabled=true;b.style.opacity='1';b.setAttribute('aria-current',String(i===s.level));return b;}));
const root=$('game');root.replaceChildren();
if(s.reviewIndex!==null){renderReview(root);return;}
const historyNav=document.createElement('div');historyNav.className='review-navigation';historyNav.append(backButton());root.append(historyNav);
if(s.level===3){$('status').textContent='Все три замка открыты';root.innerHTML=`<div class="finish"><div class="eyebrow">ПУТЕШЕСТВИЕ ЗАВЕРШЕНО</div><h2>Все ключи найдены!</h2><p>Ты разобрался с 30 предложениями и тремя пространственными вопросами.</p><p class="translation">${total()} из 300 баллов</p><p>Загляни в справку, чтобы повторить формы.</p></div>`;root.append(historyNav);save();return;}
if(s.position>=s.queue.length){$('status').textContent=`Замок ${s.level+1} из 3`;root.innerHTML=`<div class="finish"><div class="eyebrow">ЗАМОК ОТКРЫТ</div><h2>${questions[s.level]} ${meanings[s.level]}</h2><p>Все десять слов пройдены, ошибки повторены.</p></div>`;root.append(historyNav);root.firstChild.append(button(s.level===2?'Завершить игру':'Открыть следующий замок',()=>{s.completed.push(s.level);s.level++;s.queue=s.level<3?shuffle(groups.map((_,i)=>i)):[];s.position=0;s.retries=[];s.selected=[];s.attempts=0;s.resolved=false;s.feedback='';save();report('level-complete');render();},'primary'));save();return;}
const g=group(),repeat=s.position>=10;
$('status').textContent=`Замок ${s.level+1} из 3 · ${repeat?'Повторение ошибок':`Задание ${s.position+1} из 10`} · ${Object.keys(s.scores).length} / 30 пройдено`;
const board=document.createElement('div');board.className='board';board.innerHTML='<div class="scene"></div><div class="play"></div>';root.append(board);
const scene=board.firstChild,img=new Image();img.alt=g.ru[s.level];img.onload=()=>scene.replaceChildren(img);img.onerror=()=>{scene.innerHTML='<div class="symbol" aria-hidden="true">◇</div><p>Утверждённая иллюстрация ожидает подключения исходного файла</p>';};img.src=window.CASE_IMAGES?.[`${g.id}-${directions[s.level]}`]||`images/case_${g.id}_${directions[s.level]}.webp`;
const play=board.lastChild;play.innerHTML=`<div class="eyebrow">${questions[s.level]} · ${meanings[s.level]}</div><h2>${escCopy(g.ru[s.level])}</h2><div class="label">Собери форму: ${escCopy(g.word)} — ${escCopy(g.meaning)}</div><div class="answer" aria-label="Собранный ответ"></div><div class="label">Основа и ${['syures','puzhym'].includes(g.id)?'послелог':'окончание'}</div><div class="chips"></div><div class="actions"></div>`;
const sentence=document.createElement('p');sentence.className='sentence';sentence.lang='udm';sentence.setAttribute('aria-label','Удмуртское предложение с пропуском');
const target=g.forms[s.level],offset=g.udm[s.level].indexOf(target);
const gap=document.createElement('span');gap.className='sentence-gap';gap.textContent=s.resolved?target:(s.selected.length?compose(s.selected,g):'_____');gap.setAttribute('aria-label',s.selected.length||s.resolved?'Собранная форма':'Пропуск для формы');
sentence.append(document.createTextNode(g.udm[s.level].slice(0,offset)),gap,document.createTextNode(g.udm[s.level].slice(offset+target.length)));
play.querySelector('h2').after(sentence);
const answer=play.querySelector('.answer');if(!s.selected.length)answer.innerHTML='<span>Выбирай элементы по порядку</span>';else s.selected.forEach((x,i)=>{const b=button(x,()=>{s.selected.splice(i,1);save();render();});b.disabled=s.resolved;answer.append(b);});
const options=[g.word,...g.forms.map(f=>['syures','puzhym'].includes(g.id)?f.split(' ')[1]:f.slice(g.word.length))];
// Deterministic arrangement preserves focus and choice positions after each click.
const order=[options[2],options[0],options[3],options[1]];
order.forEach(x=>{const b=button(x,()=>{s.selected.push(x);save();render();});b.disabled=s.resolved||s.selected.length>=2;play.querySelector('.chips').append(b);});
const actions=play.querySelector('.actions');
if(s.resolved){actions.append(button('Дальше →',()=>{rememberCurrent();s.position++;s.selected=[];s.attempts=0;s.resolved=false;s.feedback='';save();render();$('game').scrollIntoView({block:'nearest'});},'primary'));}
else{const check=button('Проверить ключ',checkAnswer,'primary');check.disabled=s.selected.length!==2;actions.append(check,button('Очистить',()=>{s.selected=[];save();render();}));}
if(s.feedback){const feedback=document.createElement('div');feedback.className='feedback'+(!s.resolved?' bad':'');feedback.setAttribute('role','status');const message=document.createElement('p');message.textContent=s.feedback;feedback.append(message);if(s.resolved){const translation=document.createElement('p');translation.className='translation';translation.lang='udm';translation.textContent=g.udm[s.level];const exp=document.createElement('p');exp.textContent=explanation(g);feedback.append(translation,exp);}root.append(feedback);}save();
}
function checkAnswer(){if(s.resolved||s.selected.length!==2)return;const g=group(),id=`${s.level}-${s.queue[s.position]}`,correct=compose(s.selected,g)===g.forms[s.level],repeat=s.position>=10;
if(correct){s.resolved=true;if(!Object.hasOwn(s.scores,id))s.scores[id]=s.attempts===0?10:5;s.feedback=repeat?'Верно! Форма закреплена.':`Ключ подошёл! +${s.attempts===0?10:5} баллов.`;}
else{s.attempts++;if(s.attempts>=2){s.resolved=true;if(!Object.hasOwn(s.scores,id))s.scores[id]=0;s.feedback=`Правильная форма: ${g.forms[s.level]}. ${repeat?'Вспомни её по объяснению.':'Повторим это слово в конце замка.'}`;}else{s.selected=[];s.feedback='Пока не подошло. Проверь вопрос и порядок элементов. Осталась одна попытка.';}
if(!repeat&&!s.retries.includes(s.queue[s.position])){s.retries.push(s.queue[s.position]);s.queue.push(s.queue[s.position]);}}
save();report('answer');render();}
$('help').onclick=()=>$('guide').showModal();$('forms').innerHTML=groups.map(g=>`<tr><th lang="udm">${escCopy(g.word)}<small>${escCopy(g.meaning)}</small></th>${g.forms.map(f=>`<td lang="udm">${escCopy(f)}</td>`).join('')}</tr>`).join('');
$('reset').onclick=()=>{if(confirm('Сбросить прогресс и баллы «Кытын? Кытчы? Кытысь?»?')){s=fresh();save();report('reset');render();}};
window.UstonCaseLock={version:1,getProgress:()=>JSON.parse(JSON.stringify({score:total(),maxScore:300,completed:s.completed,finished:s.level===3,runId:s.runId})),storageKey:KEY};render();
})();
