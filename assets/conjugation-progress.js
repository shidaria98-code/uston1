/* Conjugation adapter: isolated game save, existing dictionary, no change to portal XP. */
(() => {
 'use strict';
 let volatileSnapshot=null;
 const KEY='uston.conjugation-lock.save.v1',GAME='conjugation-lock',data=window.UstonConjugationData;
 const lex=new Map(data.lexemes.map(word=>[word.id,word]));
 const taskIds=new Set(data.verbs.flatMap(v=>[v.studyId,v.practiceId]).concat(data.sentences.map(q=>q.id),data.lexemes.map(w=>'picker:'+w.id),[data.finalTestId]));
 function validate(value){
  if(!value||JSON.stringify(value).length>2000000||typeof value.profileId!=='string'||value.profileId.length>200||!value.events||typeof value.events!=='object'||Array.isArray(value.events)||Object.keys(value.events).length>10000)throw Error('Повреждено сохранение «Замка спряжения».');
  const clone=JSON.parse(JSON.stringify(value));
  for(const record of Object.values(clone.events)){const e=record?.event;if(!e||typeof e.id!=='string'||e.id.length>2000||typeof e.type!=='string'||!Number.isFinite(Date.parse(e.at))||!e.payload||typeof e.payload!=='object'||!e.provenance||typeof e.provenance!=='object')throw Error('Повреждена история «Замка спряжения».');}
  const api=window.UstonConjugationCore.createGame(data,{getItem:()=>null,setItem(){}},()=> 'validation-only');api.restore(JSON.stringify(clone));return JSON.parse(api.exportSave());
 }
 const api=window.UstonNewGames;if(api){api.keys.push(KEY);const previous=api.validate;api.validate=(input,out)=>{previous(input,out);if(input[KEY]!==undefined&&input[KEY]!==null)out[KEY]=validate(input[KEY]);};}
 function summary(value){value=volatileSnapshot||value;if(!value)return 'Замок спряжения: можно начать.';let safe;try{safe=validate(value);}catch{return 'Замок спряжения: сохранение требует проверки.';}let score=0,max=0,study=0,practice=0;for(const v of data.verbs)if(v.status==='approved'){max+=8;for(const [task,points,kind]of [[v.studyId,6,'study'],[v.practiceId,2,'practice']]){const records=Object.values(safe.events).map(r=>r.event).filter(e=>e.type==='result.recorded'&&e.payload.taskId===task&&e.payload.score===points&&e.payload.total===points);if(records.length){score+=points;if(kind==='study')study++;else practice++;}}}const finals=Object.values(safe.events).map(r=>r.event).filter(e=>e.type==='result.recorded'&&e.payload.taskId===data.finalTestId&&Number.isInteger(e.payload.score)&&Number.isInteger(e.payload.total)&&e.payload.total>0&&e.payload.score>=0&&e.payload.score<=e.payload.total).sort((a,b)=>b.payload.score/b.payload.total-a.payload.score/a.payload.total);const final=finals[0]?.payload;return `Замок спряжения: ${score} из ${max} игровых баллов · изучено глаголов: ${study} · тренировка: ${practice}. Последний ключ: ${final?final.score+' из '+final.total:'ещё не пройден'}.`;}
 function consume(snapshot,writeLocal){
  const accepted=[],delivered=new Set(window.UstonDictionary.events().map(e=>e.id));
   for(const record of Object.values(snapshot.events)){
    const e=record.event;if(!taskIds.has(e.provenance.taskId))continue;
    if(e.type==='result.recorded'){if(!record.acked)accepted.push(e.id);continue;}
    const word=lex.get(e.payload.lexemeId);if(!word||word.status!=='approved'||!word.ru)continue;
    if(word.dictionary===false){accepted.push(e.id);continue;}
    const sourceId=GAME+':'+word.id;
    const entry=(window.UstonVocabularyExtra||[]).find(w=>w.id===sourceId&&w.game===GAME);if(!entry)continue;
    const unitId=window.UstonDictionary.resolve(sourceId);const already=e.type==='lexeme.unlocked'?delivered.has(e.id+':'+unitId):e.type==='lexeme.answered'&&delivered.has(e.id)&&delivered.has(e.id+':seen:'+unitId);if(already&&!window.UstonDictionary.unsaved){if(!record.acked)accepted.push(e.id);continue;}
    if(e.type==='lexeme.unlocked'){
     window.UstonDictionary.encounter({gameId:GAME,itemId:e.provenance.taskId,words:[entry],eventId:e.id});
    }else if(e.type==='lexeme.answered'&&typeof e.payload.correct==='boolean'){
     window.UstonDictionary.encounter({gameId:GAME,itemId:e.provenance.taskId,words:[entry],eventId:e.id+':seen'});
     window.UstonDictionary.answer({unitId:window.UstonDictionary.resolve(sourceId),correct:e.payload.correct,gameId:GAME,itemId:e.provenance.taskId,eventId:e.id,at:Date.parse(e.at)});
    }else continue;
    if(!window.UstonDictionary.unsaved)accepted.push(e.id);
   }
  if(accepted.length){for(const id of accepted)snapshot.events[id].acked=true;writeLocal(KEY,snapshot);}return accepted;
 }
 function reconcile(readLocal,writeLocal){const value=volatileSnapshot||readLocal(KEY,null);if(!value)return;try{const safe=validate(value);if(volatileSnapshot&&writeLocal(KEY,safe))volatileSnapshot=null;consume(safe,writeLocal);}catch{}}
 function connect({frame,getActiveGame,readLocal,writeLocal,updateDashboard}){
  window.addEventListener('message',event=>{
   const message=event.data,origin=location.protocol==='file:'?'null':location.origin;
   if(getActiveGame()!==GAME||event.source!==frame.contentWindow||event.origin!==origin||message?.version!==1||message.gameId!==GAME)return;
   if(message.type==='uston:conjugation-ready'){let value=volatileSnapshot||readLocal(KEY,null);try{if(value)value=validate(value);}catch{value=null;}frame.contentWindow.postMessage({type:'uston:conjugation-hydrate',version:1,gameId:GAME,snapshot:value},location.protocol==='file:'?'*':location.origin);return;}
   if(message.type!=='uston:conjugation-progress')return;
   let snapshot;try{snapshot=validate(message.snapshot);}catch{return;}
   // Never acknowledge an event unless its local game snapshot and shared vocabulary persisted.
   const stored=writeLocal(KEY,snapshot);volatileSnapshot=stored?null:snapshot;
   const accepted=consume(snapshot,writeLocal);
   if(stored&&accepted.length)frame.contentWindow.postMessage({type:'uston:conjugation-ack',version:1,ids:accepted},location.protocol==='file:'?'*':location.origin);
   updateDashboard();
  });
 }
 window.UstonConjugationProgress={key:KEY,validate,summary,connect,reconcile};
 (window.UstonVocabularyProviders||=[]).push({reconcile});
 (window.UstonSaveProviders||=[]).push({key:KEY,snapshot:read=>volatileSnapshot||read(KEY,null),onImport:()=>{volatileSnapshot=null;}});
})();
