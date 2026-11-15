const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
module.exports=function(root){
 const source=fs.readFileSync(path.join(root,'game.js'),'utf8');const from=source.indexOf('function restoreHistory(){'),to=source.indexOf('const total=()=>',from);assert.ok(from>0&&to>from);
 function migrate(s){const groups=Array.from({length:10},(_,i)=>({id:String(i)}));vm.runInNewContext(source.slice(from,to),{s,groups});return JSON.parse(JSON.stringify(s));}
 const scores={};for(let l=0;l<2;l++)for(let i=0;i<10;i++)scores[`${l}-${i}`]=10;
 const queue=[9,4,2,7,0,1,3,5,6,8];for(const i of queue.slice(0,4))scores[`2-${i}`]=5;
 const old={level:2,position:4,queue,scores,attempts:1,selected:['корка'],resolved:false,retries:[0]};const migrated=migrate(structuredClone(old));assert.equal(migrated.history.length,24);assert.deepEqual(migrated.history.slice(20).map(r=>r.group),queue.slice(0,4));assert.equal(migrated.reviewIndex,null);for(const key of Object.keys(old))assert.deepEqual(migrated[key],old[key]);
 const saved={...old,history:[{level:0,group:8,position:0,selected:['гур','ын'],attempts:0,feedback:'Верно'}],reviewIndex:0};const retained=migrate(structuredClone(saved));assert.deepEqual(retained,saved);
 const invalid=migrate({...old,history:[{level:99}],reviewIndex:99});assert.equal(invalid.history.length,24);assert.equal(invalid.reviewIndex,null);
 const fresh=migrate({level:0,position:0,queue,scores:{},history:[],reviewIndex:0});assert.equal(fresh.history.length,0);assert.equal(fresh.reviewIndex,null);
 return 'PASS: old-save migration, exact current queue order, retained review and answer snapshots, malformed history recovery, preserved current attempts/selection/retries';
};
