/* Reusable dictionary module. New chapters only need entries in WORDS and dialogue text. */
(function(){
'use strict';
const WORDS=[
{"id":"mon","u":"мон","ru":"я","parts":["мон"],"cat":"Местоимения"},{"id":"ton","u":"тон","ru":"ты","parts":["тон"],"cat":"Местоимения"},{"id":"so","u":"со","ru":"он / она","parts":["со"],"cat":"Местоимения"},{"id":"mi","u":"ми","ru":"мы","parts":["ми"],"cat":"Местоимения"},{"id":"ti","u":"тӥ","ru":"вы","parts":["тӥ"],"cat":"Местоимения"},{"id":"soos","u":"соос","ru":"они","parts":["соос"],"cat":"Местоимения"},
{id:'kytyn',u:'кытын',ru:'где?',parts:['кы','тын'],cat:'Общение'},
{id:'kytynkorkaed',u:'кытын коркаед',ru:'где твой дом?',parts:['кытын','коркаед'],cat:'Общение'},
{id:'kinta',u:'кин та',ru:'кто это?',parts:['кин','та'],cat:'Общение'},
{id:'shedty',u:'шедьты',ru:'найди',parts:['шедь','ты'],cat:'Общение'},
{id:'shedtykorka',u:'шедьты коркаез',ru:'найди дом!',parts:['шедьты','коркаез'],cat:'Общение'},
{id:'shedtyanay',u:'шедьты анаез',ru:'найди маму!',parts:['шедьты','анаез'],cat:'Общение'},
{id:'shedtyapay',u:'шедьты апаез',ru:'найди старшую сестру!',parts:['шедьты','апаез'],cat:'Общение'},
{id:'atay',u:'атай',ru:'папа',parts:['а','тай'],cat:'Семья'},
{id:'apay',u:'апай',ru:'старшая сестра',parts:['а','пай'],cat:'Семья'},
{id:'agay',u:'агай',ru:'старший брат',parts:['а','гай'],cat:'Семья'},
{id:'myanay',u:'мынам анае',ru:'моя мама',parts:['мынам','анае'],cat:'Грамматика'},
{id:'youranay',u:'тынад анаед',ru:'твоя мама',parts:['тынад','анаед'],cat:'Грамматика'},
{id:'myapay',u:'мынам апае',ru:'моя старшая сестра',parts:['мынам','апае'],cat:'Грамматика'},
{id:'mynam',u:'мынам',ru:'мой / моя / моё',parts:['мы','нам'],cat:'Грамматика'},
{id:'tynad',u:'тынад',ru:'твой / твоя / твоё',parts:['ты','над'],cat:'Грамматика'},
{id:'myhouse',u:'мынам коркае',ru:'мой дом',parts:['мынам','коркае'],cat:'Грамматика'},
{id:'yourhouse',u:'тынад коркаед',ru:'твой дом',parts:['тынад','коркаед'],cat:'Грамматика'},
{id:'myvillage',u:'мынам гуртэ',ru:'моя деревня',parts:['мынам','гуртэ'],cat:'Грамматика'},
{id:'yourvillage',u:'тынад гуртэд',ru:'твоя деревня',parts:['тынад','гуртэд'],cat:'Грамматика'},
{id:'marta',u:'мар та',ru:'что это?',parts:['мар','та'],cat:'Общение'},
{id:'tapispu',u:'та писпу',ru:'это дерево',parts:['та','писпу'],cat:'Общение'},
{id:'shur',u:'шур',ru:'река',parts:['шур'],cat:'Природа'},
{id:'syures',u:'сюрес',ru:'дорога',parts:['сю','рес'],cat:'Природа'},
{id:'gurt',u:'гурт',ru:'деревня',img:'card_village.jpg',parts:['гу','рт'],cat:'Дом и деревня'},
{id:'korka',u:'корка',ru:'дом',img:'card_house.jpg',parts:['кор','ка'],cat:'Дом и деревня'},
{id:'pispu',u:'писпу',ru:'дерево (растение)',img:'card_tree.jpg',parts:['пис','пу'],cat:'Природа'},
{id:'pu',u:'пу',ru:'древесина',parts:['пу'],cat:'Природа'},
{id:'pesyanay',u:'песянай',ru:'бабушка',img:'card_grandma.jpg',parts:['пе','ся','най'],cat:'Семья'},
{id:'pesyatay',u:'песятай',ru:'дедушка',img:'card_grandpa.jpg',parts:['пе','ся','тай'],cat:'Семья'},
{id:'anay',u:'анай',ru:'мама',parts:['а','най'],cat:'Семья'},
{id:'zhechbur',u:'Ӟечбур',ru:'здравствуй / здравствуйте',parts:['Ӟеч','бур'],cat:'Общение'},
{id:'myname',u:'Мынам нимы',ru:'меня зовут…',parts:['Мынам','нимы'],cat:'Общение'},
{id:'whatname',u:'Кызьы тынад нимыд',ru:'как тебя зовут?',parts:['Кызьы','тынад','нимыд'],cat:'Общение'},
{id:'chukna',u:'ӵукна',ru:'утро',parts:['ӵук','на'],cat:'Время'},
{id:'goodmorning',u:'Бур ӵукнаен',ru:'доброе утро',parts:['Бур','ӵукнаен'],cat:'Общение'},
{id:'zhyt',u:'ӝыт',ru:'вечер',parts:['ӝыт'],cat:'Время'},
{id:'nyan',u:'нянь',ru:'хлеб',img:'card_bread.jpg',parts:['нянь'],cat:'Еда'},
{id:'puny',u:'пуньы',ru:'ложка',img:'card_spoon.jpg',parts:['пу','ньы'],cat:'Дом и деревня'},
{id:'zhok',u:'ӝӧк',ru:'стол',img:'card_table.jpg',parts:['ӝӧк'],cat:'Дом и деревня'},
{id:'syaska',u:'сяська',ru:'цветок',img:'card_flower.jpg',parts:['сясь','ка'],cat:'Природа'},
{id:'shundy',u:'шунды',ru:'солнце',img:'card_sun.jpg',parts:['шун','ды'],cat:'Природа'},
{id:'leyka',u:'лейка',ru:'лейка',img:'card_wateringcan.jpg',parts:['лей','ка'],cat:'Дом и деревня'},
{id:'shykys',u:'шыкыс',ru:'сундук',parts:['шы','кыс'],cat:'Одежда и традиции'},
{id:'derem',u:'дэрем',ru:'платье / рубашка',img:'object_derem.jpg',parts:['дэ','рем'],cat:'Одежда и традиции'},
{id:'yyrkyshet',u:'йыркышет',ru:'головной платок',img:'object_scarf.jpg',parts:['йыр','кы','шет'],cat:'Одежда и традиции'},
{id:'kuskertton',u:'кускерттон',ru:'пояс',img:'object_belt.jpg',parts:['кус','керт','тон'],cat:'Одежда и традиции'},
{id:'chyrtyves',u:'чыртывесь',ru:'монисто',img:'object_monisto.jpg',parts:['чыр','ты','весь'],cat:'Одежда и традиции'}
];
const byId=Object.fromEntries(WORDS.map(w=>[w.id,w]));
const $=id=>document.getElementById(id);
const key='udmurt_v026_dictionary';
let saved={unlocked:[],scores:{}};
try{const raw=JSON.parse(localStorage.getItem(key)||'null');if(raw&&Array.isArray(raw.unlocked))saved={unlocked:raw.unlocked.filter(x=>byId[x]),scores:raw.scores||{}}}catch(e){}
let screen='list',game=null,scope=null,returnToChapter=false,chapterNext=null;
function persist(){try{localStorage.setItem(key,JSON.stringify(saved))}catch(e){}}
function updateCount(){$('wordCount').textContent=saved.unlocked.length}
function encounter(l){if(!l||!l.text)return;const text=l.text.toLocaleLowerCase('ru');let changed=false;
 for(const w of WORDS){const needle=w.u.toLocaleLowerCase('ru');const escaped=needle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const regex=new RegExp('(^|[^\\p{L}])'+escaped+'(?=$|[^\\p{L}])','iu');if(regex.test(text)&&!saved.unlocked.includes(w.id)){saved.unlocked.push(w.id);changed=true}}
 if(changed){persist();updateCount()}
}
function newRun(){/* Keep vocabulary and training progress across restarts. */updateCount()}
function unlocked(){return saved.unlocked.map(id=>byId[id]).filter(Boolean)}
function pool(){return unlocked().filter(w=>!scope||chapterWords(scope).some(x=>x.id===w.id))}
const chapterWordsMap={1:['mon','ton','gurt','korka','pispu','pu','pesyanay','pesyatay','anay','zhechbur','myname','whatname'],2:['derem','yyrkyshet','kuskertton','chyrtyves','chukna','goodmorning','zhyt','nyan','puny','zhok','syaska','shundy','leyka'],3:['so','mi','ti','soos','anay','atay','shykys','derem','yyrkyshet','kuskertton','chyrtyves'],5:['mynam','tynad','myanay','youranay'],4:['mynam','tynad','myhouse','yourhouse','myvillage','yourvillage','marta','tapispu','shur','syures']};
function chapterWords(ch){return (chapterWordsMap[ch]||[]).map(id=>byId[id]).filter(Boolean)}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function button(label,fn,cls='btn'){const b=el('button',cls,label);b.type='button';b.addEventListener('click',fn);return b}
function show(){ GameAudio.stop(); $('dictionaryOverlay').classList.remove('hide');render()}
function hide(){ GameAudio.stop(); $('dictionaryOverlay').classList.add('hide');scope=null;if(returnToChapter){returnToChapter=false;$('chapterOverlay').classList.remove('hide')}}
function render(){updateCount();$('dictListTab').classList.toggle('primary',screen==='list');$('dictTrainTab').classList.toggle('primary',screen!=='list');$('dictSummary').textContent=`Открыто слов: ${saved.unlocked.length} из ${WORDS.length}. Доступны только слова, которые встретились в истории.`;const body=$('dictBody');body.replaceChildren();
 if(screen==='list'){const controls=el('div','dict-controls');controls.append(button('Все встреченные',()=>{scope=null;render()}));for(let ch=1;ch<=4;ch++)controls.append(button('Глава '+ch,()=>{scope=ch;render()}));body.append(controls);const grid=el('div','dict-words');for(const w of pool()){const card=el('div','dict-word');card.append(el('b','',w.u),el('span','',w.ru),el('small','',w.cat));GameAudio.addButtons(card,w.u);const sc=saved.scores[w.id]||{};if(sc.pair||sc.build)card.append(el('small','',`Успехи: пары ${sc.pair||0}, слово ${sc.build||0}`));grid.append(card)}if(!grid.children.length)body.append(el('p','dict-muted','Пока здесь нет слов. Продолжай историю — новые слова появятся автоматически.'));body.append(grid);return}
 if(screen==='train'){const opts=el('div','dict-controls');opts.append(button('🔗 Найди пару',()=>startPairs(), 'btn primary'),button('🔤 Собери слово',()=>startBuild(),'btn primary'));body.append(el('p','dict-muted',scope?`Повторяем слова главы ${scope}.`:'Повторяем все встреченные слова.'),opts);body.append(el('p','dict-muted','«Найди пару» — удмуртское слово и картинка или русский перевод. «Собери слово» — выбери части в правильном порядке.'));return}
 if(screen==='pairs')drawPairs(body);
 if(screen==='build')drawBuild(body);
}
function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function score(w,type){saved.scores[w.id]??={};saved.scores[w.id][type]=(saved.scores[w.id][type]||0)+1;persist()}
function startPairs(){
 const available=shuffle(pool());
 if(available.length<2){screen='train';render();$('dictBody').prepend(el('p','dict-feedback','Для игры «Найди пару» нужно встретить хотя бы два слова.'));return}
 // Three compact rounds. With fewer than nine unlocked words, reuse the pool in later rounds.
 const rounds=[];let cursor=0;
 for(let r=0;r<3;r++){
  const count=Math.min(3,available.length),selection=[];
  for(let j=0;j<count;j++)selection.push(available[(cursor+j)%available.length]);
  cursor=(cursor+count)%available.length;
  rounds.push(shuffle(selection));
 }
 game={rounds,round:0,matched:new Set(),left:null,right:null,errors:0,needsRetry:false,complete:false};
 screen='pairs';render();
}
function drawPairs(body){
 const g=game,words=g.rounds[g.round];
 body.append(el('h3','',`Найди пару · раунд ${g.round+1} из 3`));
 body.append(el('p','dict-muted',`Сопоставь ${words.length} слова с картинками или переводами. Для перехода дальше нужно пройти раунд без ошибок.`));
 if(g.complete){
  body.append(el('p','dict-feedback','Супер! Все три раунда пройдены без ошибок.'));
  body.append(button('↻ Новая тренировка',startPairs,'btn primary'),button('← К тренировкам',()=>{screen='train';render()}));return;
 }
 if(g.matched.size===words.length){
  if(g.needsRetry){
   body.append(el('p','dict-feedback','Все пары найдены, но были ошибки. Повторим эти три слова ещё раз, в другом порядке.'));
   body.append(button('↻ Повторить раунд',()=>{g.matched=new Set();g.left=null;g.right=null;g.errors=0;g.needsRetry=false;render()},'btn primary'));
  }else{
   words.forEach(w=>score(w,'pair'));
   body.append(el('p','dict-feedback',`Отлично! Раунд ${g.round+1} пройден без ошибок.`));
   body.append(button(g.round===2?'Завершить тренировку':'Следующий раунд →',()=>{
    if(g.round===2){g.complete=true}else{g.round++;g.matched=new Set();g.left=null;g.right=null;g.errors=0;g.needsRetry=false}
    render();
   },'btn primary'));
  }
  body.append(button('← К тренировкам',()=>{screen='train';render()}));return;
 }
 const grid=el('div','pair-grid');const left=el('div','pair-col'),right=el('div','pair-col');
 const feedback=el('p','dict-feedback','Выбери слово слева, затем соответствующую картинку или перевод справа.');feedback.setAttribute('aria-live','polite');
 const select=(side,w,b)=>{
  if(g.matched.has(w.id))return;
  const previous=g[side];if(previous&&previous.b)previous.b.classList.remove('active');
  g[side]={w,b};b.classList.add('active');
  if(!g.left||!g.right)return;
  if(g.left.w.id===g.right.w.id){
   g.matched.add(w.id);g.left=null;g.right=null;
   render();
  }else{
   g.errors++;g.needsRetry=true;
   feedback.textContent='Пока не совпало. Попробуй другую пару! После раунда мы повторим эти слова.';
   g.left.b.classList.remove('active');g.right.b.classList.remove('active');g.left=null;g.right=null;
  }
 };
 for(const w of shuffle(words)){
  const b=button(w.u,()=>{GameAudio.playText(w.u);select('left',w,b)},'pair-card');if(g.matched.has(w.id)){b.classList.add('matched');b.disabled=true}left.append(b)
 }
 for(const w of shuffle(words)){
  const b=button('',()=>select('right',w,b),'pair-card');
  if(w.img){const im=el('img');im.src='assets/'+w.img;im.alt='';im.onerror=()=>{im.remove();b.textContent=w.ru};b.append(im)}else b.textContent=w.ru;
  if(g.matched.has(w.id)){b.classList.add('matched');b.disabled=true}right.append(b)
 }
 grid.append(left,right);body.append(grid,feedback,button('← К тренировкам',()=>{screen='train';render()}));
}
function startBuild(){const words=shuffle(pool().filter(w=>w.parts.length>=2));if(!words.length){screen='train';render();$('dictBody').prepend(el('p','dict-feedback','Для составления слова пока нет подходящих слов. Продолжай историю.'));return}game={words,index:0,chosen:[],mistakes:0};screen='build';render()}
function drawBuild(body){const g=game,w=g.words[g.index];body.append(el('h3','',`Собери слово · ${g.index+1} из ${g.words.length}`),el('p','',w.ru));if(w.img){const img=el('img');img.src='assets/'+w.img;img.alt=w.ru;img.style.cssText='height:105px;max-width:190px;object-fit:contain;margin:auto';body.append(img)}const answer=el('div','answerline',g.chosen.map(x=>x.part).join(' · ')||'Выбирай части слова по порядку');body.append(answer);const chunks=el('div','syllables');const feedback=el('p','dict-feedback','');feedback.setAttribute('aria-live','polite');let shuffled=shuffle(w.parts.map((part,index)=>({part,index})));for(const item of shuffled){const b=button(item.part,()=>{if(g.chosen.some(x=>x.index===item.index))return;g.chosen.push(item);b.disabled=true;answer.textContent=g.chosen.map(x=>x.part).join(' · ');if(g.chosen.length===w.parts.length){const result=g.chosen.map(x=>x.part).join('').toLocaleLowerCase('ru');if(result===w.u.replaceAll(' ','').toLocaleLowerCase('ru')){score(w,'build');GameAudio.playText(w.u);GameAudio.addButtons(body,w.u);feedback.textContent='Верно! '+w.u+' — '+w.ru+'.';chunks.querySelectorAll('button').forEach(x=>x.disabled=true);body.append(button(g.index===g.words.length-1?'Завершить тренировку':'Следующее слово →',()=>{if(g.index===g.words.length-1){screen='train';render();$('dictBody').prepend(el('p','dict-feedback','Тренировка завершена!'))}else{g.index++;g.chosen=[];render()}},'btn primary'))}else{g.mistakes++;feedback.textContent='Порядок пока неверный. Попробуй ещё раз!';body.append(button('↻ Попробовать снова',()=>{g.chosen=[];render()}))}}},'btn');chunks.append(b)}body.append(chunks,feedback,button('← Выбрать другую тренировку',()=>{screen='train';render()}));}
function chapterEnd(ch,next){chapterNext=next;scope=ch;$('chapterTitle').textContent=`Глава ${ch} завершена!`;$('chapterWords').textContent=`В этой главе ты встретил(а) ${chapterWords(ch).filter(w=>saved.unlocked.includes(w.id)).length} слов и выражений.`;$('chapterOverlay').classList.remove('hide');}
$('openDictionary').addEventListener('click',()=>{scope=null;screen='list';show()});$('dictClose').addEventListener('click',hide);$('dictListTab').addEventListener('click',()=>{screen='list';render()});$('dictTrainTab').addEventListener('click',()=>{screen='train';render()});
$('endTrain').addEventListener('click',()=>{$('chapterOverlay').classList.add('hide');returnToChapter=true;screen='train';show()});$('endDictionary').addEventListener('click',()=>{$('chapterOverlay').classList.add('hide');returnToChapter=true;screen='list';show()});$('endContinue').addEventListener('click',()=>{$('chapterOverlay').classList.add('hide');returnToChapter=false;scope=null;const fn=chapterNext;chapterNext=null;if(fn)fn()});
updateCount();window.GameDictionary={encounter,newRun,chapterEnd};
})();
