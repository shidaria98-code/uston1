/* Validation and profile summaries for the three November prototypes. */
(() => {
  'use strict';
  const familyRounds = new Set(["close","generations","maternal","branches","cousins","inlaws","nephews","three","oldest","brothers","aunt","fatherSon","mothers","maternalSon","teenagers","inlawMarina","inlawAndrey","greatLine","baby","nephewPavel"]);
  const keys = ['uston.family-tree.v1','uston.das-vityashki.v1',
    'uston.beny-bony.options.v1','uston.beny-bony.blitz.best.v1'];
  const mods = ["blitz","layouts","roles","snow","ice","wind","clock","smart","trials","cup"];
  const number = n => Number.isFinite(n) && n >= 0 && n <= 1e10;
  const board = a => Array.isArray(a) && a.length === 16 && new Set(a).size === 16 && a.every(n => Number.isInteger(n) && n >= 0 && n < 16);
  function validate(data, out) {
    for (const key of keys) {
      if (!Object.hasOwn(data,key)) continue;
      const v=data[key];
      if(v===null) continue;
      if(key==='uston.family-tree.v1') {
        if(v.version!==1||!v.completed||typeof v.completed!=='object')throw Error('Повреждено сохранение игры «Семья».');
        const completed={};
        for(const [id,r]of Object.entries(v.completed))if(familyRounds.has(id)&&r&&typeof r.solo==='boolean')completed[id]={solo:r.solo};
        out[key]={version:1,completed};
      } else if(key==='uston.beny-bony.options.v1') {
        if(typeof v!=='object'||Array.isArray(v))throw Error('Повреждены настройки «Бены и Боны».');
        out[key]=Object.fromEntries(mods.map(id=>[id,v[id]===true]));
      } else if(key==='uston.beny-bony.blitz.best.v1') {
        if(!number(v))throw Error('Повреждён рекорд «Бены и Боны».');
        out[key]=v;
      } else {
        if(v.version!==1)throw Error('Неверная версия сохранения пятнашек.');
        const records={};
        for(const level of ['easy','normal']){const r=v.records?.[level];if(r&&number(r.time)&&Number.isInteger(r.moves)&&r.moves>=0&&r.moves<=100000)records[level]={time:r.time,moves:r.moves};}
        let session=null;
        if(v.session){const s=v.session;
          if(!board(s.board)||!['easy','normal'].includes(s.level)||!number(s.elapsed)||!Number.isInteger(s.moves)||s.moves<0||s.moves>100000||typeof s.started!=='boolean')throw Error('Повреждена партия пятнашек.');
          const history=Array.isArray(s.history)?s.history:[];
          if(history.length>500||history.length>s.moves||!history.every(board))throw Error('Повреждена история ходов пятнашек.');
          session={board:s.board.slice(),level:s.level,elapsed:s.elapsed,moves:s.moves,history:history.map(a=>a.slice()),started:s.started,won:s.won===true,ended:s.ended===true,startKey:typeof s.startKey==='string'&&/^[0-9a-f]{16}$/.test(s.startKey)?s.startKey:null};
        }
        out[key]={version:1,session,records,showWords:v.showWords!==false,usedStarts:[...new Set(Array.isArray(v.usedStarts)?v.usedStarts.filter(s=>typeof s==='string'&&/^[0-9a-f]{16}$/.test(s)&&board([...s].map(c=>parseInt(c,16)))):[])]};
      }
    }
  }
  window.UstonNewGames={keys,validate,familyRoundCount:familyRounds.size};
})();
