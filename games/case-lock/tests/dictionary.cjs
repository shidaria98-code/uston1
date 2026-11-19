const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
module.exports=function run(root){
 const memory=new Map();const read=(k,d)=>memory.has(k)?JSON.parse(memory.get(k)):d,write=(k,v)=>{memory.set(k,JSON.stringify(v));return true;};
 const ctx={window:{},localStorage:{get length(){return memory.size},key:i=>[...memory.keys()][i],getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}};vm.createContext(ctx);
 for(const file of ['assets/lexicon-v18.js','assets/case-lock-dictionary.js','assets/dictionary-core.js','assets/portal-v18.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
 const api=ctx.window.UstonCaseDictionary,portal=ctx.window.UstonV18,key=api.key;
 const norm=u=>u.normalize('NFC').trim().toLowerCase();
 // Already unlocked from another game: even alternate IDs must not duplicate.
 const house=api.entries[0];write(key,{version:1,unlocked:[house.aliases.at(-1)]});api.sync({'0-0':10});assert.deepEqual(read(key).unlocked,[house.aliases.at(-1)]);
 const scores=Object.fromEntries(api.entries.flatMap(w=>[0,1,2].map(l=>[`${l}-${w.index}`,[0,5,10][l]])));
 api.sync(scores);api.sync(scores);let saved=read(key);assert.equal(saved.unlocked.length,10);
 // Existing canonical translations and records are retained; no inflected forms.
 const rows=portal.stats(read,write).dictionary;assert.equal(rows.length,10);assert.equal(new Set(rows.map(w=>norm(w.u))).size,10);assert.deepEqual(new Set(rows.map(w=>norm(w.u))),new Set(api.entries.map(w=>norm(w.u))));
 const prior=memory.get(key);api.sync({});assert.equal(memory.get(key),prior);
 assert.equal(api.idsForScores({'0-0':123,'x-1':10,'0-100':10}).length,0);
 // Portal recovers words from existing game progress even before an event arrives.
 memory.clear();write('uston.case-lock.v1',{version:1,scores});assert.equal(portal.stats(read,write).dictionary.length,10);
 const output={};portal.validate({[key]:{version:1,unlocked:api.idsForScores(scores)}},output);assert(Array.isArray(output[key].unlocked));
 // Failed writes are reported, and a later sync recovers all words.
 memory.clear();assert.equal(api.sync(scores,()=>null,()=>false),false);assert.equal(api.sync(scores),true);assert.equal(read(key).unlocked.length,10);
 // Never overwrite a malformed dictionary silently.
 memory.set(key,'{"version":1,"unlocked":"bad"}');const broken=memory.get(key);assert.equal(api.sync(scores),false);assert.equal(memory.get(key),broken);
 return 'PASS: canonical IDs, aliases, 30 answers → 10 lemmas, repeat/reset, migration, backup validation, failed writes and corrupted storage';
};
