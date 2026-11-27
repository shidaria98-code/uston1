const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');const root=path.resolve(process.env.USTON_GUIDE_ROOT||'apps/guide');
function environment(storage={}){const ids={};class E{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={};this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.classList={toggle:()=>{},add:()=>{},remove:()=>{}}}set id(v){this._id=v;ids[v]=this}get id(){return this._id}append(...x){this.children.push(...x)}prepend(...x){this.children.unshift(...x)}replaceChildren(...x){this.children=x}setAttribute(k,v){this[k]=v}showModal(){this.open=true}close(){this.open=false}addEventListener(){}click(){if(!this.disabled)this.onclick?.()}removeAttribute(k){delete this[k]}}
const ctx={window:{scrollTo(){}},document:{body:{dataset:{}},getElementById:id=>ids[id]??=(new E('div')),createElement:t=>new E(t)},Audio:class{pause(){}play(){storage.lastPlayedAudio=this.src;return Promise.resolve()}},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v,get length(){return Object.keys(storage).length},key:i=>Object.keys(storage)[i]},structuredClone,Blob,URL,setTimeout:()=>0,clearTimeout(){},console};vm.createContext(ctx);for(const file of ['course.js','audio-manifest.js','house-data.js','game.js','v040.js','v041.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);return {ctx,ids,storage,T:ctx.window.USTON_TEST}}
function descendants(e){return [e,...(e.children||[]).flatMap(descendants)]}
function click(e,text){const b=descendants(e).find(x=>x.tagName==='BUTTON'&&!x.disabled&&x.textContent===text);assert(b,`button ${text} absent. Visible: `+descendants(e).filter(x=>x.tagName==='BUTTON').map(x=>x.textContent));b.click()}
function list(e,tag){return descendants(e).filter(x=>x.tagName===tag)}

const env=environment(),{T,ids}=env,S=env.ctx.window.COURSE.scenes;
assert.equal(S.length,68);assert.equal(S.reduce((n,s)=>n+s.tasks.length,0),95);
function reset(i,extra={}){T.setState({...structuredClone(T.DEFAULT),started:true,helpSeen:true,name:'Аня',scene:i,phase:'practice',ex:{task:0,part:0,round:0},...extra})}
function buttonWhere(root,fn){const b=list(root,'BUTTON').find(x=>!x.disabled&&fn(x));assert(b,'button missing');b.click()}
function solve(){const t=T.part(),st=T.getState(),p=ids.panel,r=st.ex.round;for(const im of list(p,'IMG'))if(im.src&&!im.src.startsWith('data:'))assert(fs.existsSync(path.join(root,im.src)),'missing asset '+im.src);const text=x=>String(x).replaceAll('{name}',st.name).replaceAll('{went}',st.gender==='girl'?'ходила':'ходил').replaceAll('{helped}',st.gender==='girl'?'помогла':'помог').replaceAll('{played}',st.gender==='girl'?'играла':'играл').replaceAll('{familyNames}',/Анай/.test(st.artifacts.family?.value?.photo||'')?'Анай но атай':'Песянай но песятай');
switch(t.type){
case'match':{const pair=t.pairs[r];click(p,text(t.direction==='ru'?pair[0]:pair[1]));break}
case'quiz':click(p,text(t.rounds[r].answer));break;
case'select':for(const x of t.correct||t.options.slice(0,t.count))click(p,text(x));click(p,'Проверить выбор');break;
case'tokens':{const src=descendants(p).find(e=>e.className==='row token-source');for(const w of text(t.pairs[r][0]).split(/\s+/))click(src,w);click(p,'Проверить фразу');break}
case'dialogueOrder':case'finalDialogueOrder':{const items=t.items||T.finalDialogue40();const src=descendants(p).find(e=>e.className==='dialogue-source');for(let i=0;i<items.length;i++)buttonWhere(src,b=>b.dataset.dialogueIndex===i);click(p,'Проверить диалог');break}
case'wordBuilder':click(p,t.rows[r][1]);break;
case'pairMatch':for(let i=0;i<t.pairs.length;i++){buttonWhere(p,b=>b.dataset.pairSide==='left'&&b.dataset.pairIndex===i);buttonWhere(p,b=>b.dataset.pairSide==='right'&&b.dataset.pairIndex===i)}break;
case'order':for(let i=0;i<t.items.length;i++)buttonWhere(p,b=>b.dataset.orderIndex===i);click(p,'Проверить порядок');break;
case'plan':click(p,'Сначала кухня');break;
case'pronouns':click(p,['мон','со','со','ми','тӥ','соос'][r]);break;
case'bouquet':{const zone=descendants(p).find(e=>e.className==='bouquet-zone');for(const b of list(p,'BUTTON').filter(e=>e.className==='draggable-flower')){b.click();zone.onclick()}click(p,'Вручить букет бабушке');break}
case'dress':click(p,st.gender==='boy'?'Дэрем · рубаха':'Дэрем · платье');click(p,st.gender==='boy'?'Штани':'Йыркышет · платок');for(const kind of ['dress','scarf'])buttonWhere(p,b=>b.dataset.partKind===kind&&b.dataset.color==='Горд · красный');click(p,'Сохранить наряд');break;
case'postcard':click(p,'Перевернуть открытку');click(p,'Кыӵе тынад ужъёсыд?');break;
case'suffix':click(p,'лэн');break;
case'houses':buttonWhere(p,b=>b.dataset.houseKey===env.ctx.window.HOUSE_ROUNDS[r].correct);break;
case'family':click(p,'Сохранить страницу');break;
case'verbTrainer':{const verb=t.pairs[r][0].split(' ').slice(1).join(' '),forms=t.pairs.slice(Math.floor(r/6)*6,Math.floor(r/6)*6+6).map(x=>x[0].split(' ').slice(1).join(' '));let stem=forms[0];for(const v of forms)while(stem&&!v.startsWith(stem))stem=stem.slice(0,-1);click(p,verb.slice(stem.length));assert(descendants(p).some(x=>x.className==='inserted-suffix'));break}
case'introduction':if(r===0){list(p,'INPUT')[0].value='8';click(p,'Готово')}else click(p,'Мон гуртын улӥсько.');break;
case'workshop':if(r===0)click(p,'Корка');else if(r===1){list(p,'INPUT')[0].value='Аня';click(p,'Дась!')}else click(p,'Сохранить рисунок');break;
case'ballGame':click(p,r%3===0?'Лэзьыны':r%3===1?'Кутыны':['одӥг','кык','куинь','ньыль','вить'][Math.floor(r/3)]);break;
case'patternBuilder':click(p,'Лыз');click(p,'Кизили');click(p,'Толэзь');click(p,'Проверить узор');break;
case'patternSave':click(p,'Сохранить узор в рюкзак');break;
case'routineBoard':{const words=['Султыны','Мисьтӥськыны','Дӥсяськыны','Ӵукназэ сиськыны','Дышетскыны','Шудыны','Шутэтскыны','Лыдӟыны','Выдыны','Изьыны'];for(let i=0;i<words.length;i++){click(p,words[i]);const time=i<4?'Ӵукна':i<7?'Нунал':i<9?'Ӝыт':'Уй';const col=descendants(p).find(x=>x.className==='routine-column'&&list(x,'H3')[0]?.textContent===time);assert(col);click(col,words.some((w,j)=>j<i&& (j<4?'Ӵукна':j<7?'Нунал':j<9?'Ӝыт':'Уй')===time)?'Добавить сюда':'Татчы')}click(p,'Сохранить мой день');break}
case'frequency':click(p,r<5?T.expectedAnswer():['ӵем','котьку','ноку'][r-5]);break;
case'habitSentences':{const adv=st.habitAnswers[r];const bases=['Мон ӵукна султӥсько.','Мон азбарын шудӥсько.','Мон ӝыт выдӥсько.'];const sentence=adv==='ноку'?'Мон ноку но та ужез уг лэсьтӥськы.':bases[r].replace('Мон ','Мон '+adv+' ');const src=descendants(p).find(x=>x.className==='row token-source');for(const w of sentence.split(/\s+/))click(src,w);click(p,'Проверить фразу');break}
case'chooseArtifacts':for(const label of ['Карта прогулки','Фотолист природы','Семейная страница'])buttonWhere(p,b=>b.dataset.value===label);click(p,'Выбрать три вещи');break;
case'storyOrder':for(const label of st.artifacts.selected.value)click(p,label);click(p,'Проверить порядок');break;
case'firstArtifact':click(p,st.artifacts.selected.value[0]);click(p,'Проверить выбор');break;
case'dialogueFill':{const prompt=descendants(p).filter(x=>x.className==='chat-question').at(-1).textContent;const answers={'Кытын вал тон туэ гужем?':'Мон шур дуре ветлӥ.','Кинлы тон юрттӥд?':'Мон песянаелы юрттӥ.','Кинэ тон вераны быгатӥськод?':'Песянай но песятай.','Мар татын возьматэмын?':'Куар, турын, узы, губи.','Мар та?':'Та дэрем.'};click(p,answers[prompt]);break}
case'finalText':list(p,'TEXTAREA')[0].value='Мон шур дуре ветлӥ. Мон песянаелы юрттӥ.';click(p,'Сохранить рассказ');break;
default:throw Error('No solver '+t.type)
}
assert(ids.exerciseFeedback.className.includes('good'),'wrong '+T.scene().ID+' '+t.type+' '+r);T.finishFeedback40()}
for(const gender of ['girl','boy']){reset(0,{phase:'dialogue',gender});let n=0;while(T.getState().phase!=='finished'){if(T.getState().phase==='practice')solve();else ids.nextBtn.click();assert(++n<2500,'route loop '+T.scene().ID)}assert.equal(T.getState().completed.length,68);assert.equal(Object.keys(T.getState().done).length,95);assert(T.getState().artifacts.oralStory.value.text.includes('Мон'));assert.equal(T.getState().artifacts.nature.value.length,4);assert.equal(T.getState().artifacts.pattern.value.color,'Лыз');assert.equal(T.getState().artifacts.habitSentences.value.length,3);console.log('PASS route',gender,n,'UI steps: 68 scenes / 95 tasks, native dialogue, artifacts and saved final text.');}
// Two wrong answers reveal no answer; only the third wrong response reveals it.
reset(0);for(let n=1;n<=3;n++){click(ids.panel,'Тау!');const text=descendants(ids.exerciseFeedback).map(x=>x.textContent).join(' ');assert.equal(text.includes('Правильный ответ:'),n===3)}
assert.equal(T.getState().answerLog['MG-C01-S01-1:0:0'].length,3);click(ids.panel,'Ӟечбур!');T.finishFeedback40();ids.backBtn.click();assert(T.reviewing());assert(descendants(ids.panel).some(x=>x.className==='past-answer'));const snapshot=JSON.stringify(T.getState().done);ids.homeBtn.click();ids.resumeBtn.click();assert.equal(JSON.stringify(T.getState().done),snapshot);
// Counts and author descriptions are wholly Udmurt; no visual sample gives the answer away.
reset(S.findIndex(s=>s.ID==='C04-S05'),{ex:{task:0,part:1,round:0}});assert(!descendants(ids.panel).some(x=>x.className==='house-sample'));assert(descendants(ids.panel).some(x=>x.textContent==='Бадӟым, горд, ӝужыт липетэн корка.'));
reset(S.findIndex(s=>s.ID==='P06-S01'),{ex:{task:0,part:0,round:2}});assert.equal(list(ids.panel,'IMG').filter(x=>x.className==='question-image').length,1);assert(descendants(ids.panel).some(x=>x.textContent==='Кӧня укноосыз?'));
console.log('PASS three-attempt rule, visible answer history, Back/Home preserve progress; native house description and one-house window count.');
for(const [word,id]of [['ӝ','author_b2_035'],['ӟ','author_b2_037'],['ӵ','author_b2_038'],['ӥ','author_b2_039'],['ӧ','author_b2_036'],['Мынам гуртэ','author_b2_057']])assert.equal(T.audioMatches(word)[0]?.id,id);
assert.equal(T.audioMatches('Сётэ, вал.').some(x=>x.text==='вал'),false);
assert.equal(T.audioMatches('Кытын вал тон туэ гужем?').some(x=>x.text==='вал'),false);
assert.equal(T.audioMatches('Коӵыш')[0]?.id,'author_b3_131');
assert.equal(T.audioMatches('Коркаысь')[0]?.id,'author_b2_121');
assert.equal(T.audioMatches('Бызьылыны')[0]?.id,'author_b2_115');
assert(T.audioMatches('Мар та?').some(x=>x.id==='author_b2_047'));
assert(!S.find(x=>x.ID==='C01-S05').bridge.includes('познаком'));
assert(!S.find(x=>x.ID==='C01-S06').lines.some(x=>/как тебя зовут/i.test(x.text)));
console.log('PASS known relatives greet by name; new affricates and exact word recordings, punctuation matching and homonym isolation.');
assert.equal(S.flatMap(s=>s.tasks).filter(t=>t.chapterReview).length,19);
reset(S.findIndex(s=>s.ID==='C01-S03'));const ordered=T.part().pairs.map(p=>p[0]);assert.notDeepEqual(ordered,Array.from(S.find(s=>s.ID==='C01-S03').tasks[0].steps[0].pairs,p=>p[0]));T.render();assert.deepEqual(T.part().pairs.map(p=>p[0]),ordered);
reset(S.findIndex(s=>s.ID==='C01-S06'),{phase:'dialogue',gender:'girl'});assert(T.fill40('ты приехал! Я так соскучился!').includes('ты приехала! Я так соскучилась!'));
for(const id of ['P08-S01','P08-S03'])assert.equal(S.find(s=>s.ID===id).tasks[0].steps[0].type,'wordBuilder');
assert(S.find(s=>s.ID==='C05-S02').tasks[0].rows.some(r=>r[2]==='туспуктэмез'));
assert(S.find(s=>s.ID==='P15-S02').tasks[0].steps[0].items.every(x=>!x.startsWith('Тау.')));
assert.equal(S.find(s=>s.ID==='C04-S01').tasks[0].steps[0].type,'pairMatch');
reset(S.findIndex(s=>s.ID==='P12-S01'),{ex:{task:0,part:0,round:4}});const court=descendants(ids.panel).find(x=>x.className==='ball-court live-ball');assert.equal(court.dataset.direction,'left');assert.equal(court.children[0].textContent,'Саша');assert.equal(court.children[2].textContent,'Аня');
reset(S.findIndex(s=>s.ID==='P16-S02'),{artifacts:{drawing:{value:{image:'data:image/png;base64,test',name:'Аня'}},nature:{value:['Куар','Турын','Узы','Губи']},map:{value:[]},postcard:{value:{greeting:'Ӟечбур!'}},pattern:{value:{color:'Лыз',motifs:['Кизили','Толэзь','Кизили','Толэзь']}}}});click(ids.panel,'Сохранить страницу');T.finishFeedback40();assert.equal(T.getState().artifacts.family.value.items.length,5);assert.equal(T.getState().artifacts.family.value.pattern.color,'Лыз');
console.log('PASS 19 chapter reviews, persistent shuffled vocabulary, author direction builders, photograph possession, guest dialogue, gender wording, alternating ball direction and five-item memory page snapshots.');
// Completed grammatical words themselves replay the exact full-word recording.
reset(S.findIndex(s=>s.ID==='C05-S02'),{ex:{task:0,part:0,round:0}});click(ids.panel,'лэн');let built=descendants(ids.panel).find(x=>x.className==='built-word');assert.equal(built.role,'button');built.onclick();assert(env.storage.lastPlayedAudio.endsWith('author_b2_073.mp3'));
reset(S.findIndex(s=>s.ID==='P07-S02'),{ex:{task:0,part:0,round:0}});click(ids.panel,'исько');built=descendants(ids.panel).find(x=>x.className==='built-word');built.onclick();assert(env.storage.lastPlayedAudio.endsWith('author_b2_106.mp3'));
for(const gender of ['girl','boy']){reset(0,{gender});for(const word of ['ыж','кеч','лудкеч','улмо','штани','люктаны','басьтыны','уксё тырыны','вайыны','поныны','ӝӧк вылэ сиён-юон пуктыны','пумитаны','ӧтьыны','султыны','мисьтӥськыны','ехать']){const im=T.objectImage(word);assert(im&&fs.existsSync(path.join(root,im.src)),gender+' missing illustration '+word)}}
reset(0,{learned:['ыж','Штани']});T.showWords();const dictionary=descendants(ids.modalBody).map(x=>x.textContent).join(' ');assert(dictionary.includes('овца')&&dictionary.includes('брюки'));
console.log('PASS complete-word playback after suffix insertion, both-hero updated art lookups, new dictionary entries and Штани.');
