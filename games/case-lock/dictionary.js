/* Canonical portal dictionary IDs, shared by the game and the portal. */
(() => {
 'use strict';
 const KEY='uston-hub-dictionary-v1';
 const entries=[{"index":0,"id":"guide:korka","u":"корка","ru":"дом","aliases":["guide:korka","seem:home:0"]},{"index":1,"id":"guide:gurt","u":"гурт","ru":"деревня","aliases":["guide:gurt","seem:world:3"]},{"index":2,"id":"case-lock:kar","u":"кар","ru":"город","aliases":["case-lock:kar","seem:world:2"]},{"index":3,"id":"case-lock:lavka","u":"лавка","ru":"магазин","aliases":["case-lock:lavka"]},{"index":4,"id":"guide:shur","u":"шур","ru":"река","aliases":["guide:shur","seem:nature:4"]},{"index":5,"id":"guide:syures","u":"сюрес","ru":"дорога","aliases":["guide:syures","seem:world:8"]},{"index":6,"id":"case-lock:inty","u":"инты","ru":"место","aliases":["case-lock:inty"]},{"index":7,"id":"case-lock:kuala","u":"куала","ru":"святилище","aliases":["case-lock:kuala"]},{"index":8,"id":"case-lock:gur","u":"гур","ru":"печка","aliases":["case-lock:gur"]},{"index":9,"id":"pattern:6","u":"пужым","ru":"сосна","aliases":["pattern:6"]}];
 function idsForScores(scores){
  if(!scores||typeof scores!=='object'||Array.isArray(scores))return [];
  return entries.filter(w=>[0,1,2].some(level=>Object.hasOwn(scores,`${level}-${w.index}`)&&[0,5,10].includes(scores[`${level}-${w.index}`]))).map(w=>w.id);
 }
 function sync(scores,read,write){
  const ids=idsForScores(scores);if(!ids.length)return true;
  try{
   const old=read?read(KEY,null):JSON.parse(localStorage.getItem(KEY)||'null');
   if(old!==null&&(!old||old.version!==1||!Array.isArray(old.unlocked)||!old.unlocked.every(x=>typeof x==='string')))return false;
   const prior=old?.unlocked||[],found=new Set(prior);
   for(const id of ids){const entry=entries.find(w=>w.id===id);if(!entry.aliases.some(alias=>found.has(alias)))found.add(id);}
   const unlocked=[...found];
   if(JSON.stringify(prior)===JSON.stringify(unlocked))return true;
   const next={...(old||{}),version:1,unlocked};
   if(write)return write(KEY,next)!==false;
   localStorage.setItem(KEY,JSON.stringify(next));return true;
  }catch{return false;}
 }
 window.UstonCaseDictionary={key:KEY,entries,idsForScores,sync};
})();
