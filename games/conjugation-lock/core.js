(() => {
function createGame(data, storage, makeId, now = () => new Date().toISOString()) {
  const { gameId, schemaVersion, contentVersion, verbs, lexemes, pronouns, sentences } = data;
  const key = gameId + '.save.v1';
  const byId = entries => new Map(entries.map(entry => [entry.id, entry]));
  const verbById = byId(verbs);
  const lexemeById = byId(lexemes);
  const formById = byId(verbs.flatMap(verb => verb.forms));
  const approvedOccurrence = occurrence => {
    const lexeme = lexemeById.get(occurrence.lexemeId);
    return Boolean(occurrence.text && lexeme?.status === 'approved' && lexeme.ru);
  };
  const tokens = text => text.toLowerCase().normalize('NFC').match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
  function coversSentence(item) {
    const words = tokens(item.udm);
    const covered = new Set();
    for (const occurrence of item.occurrences) {
      const phrase = tokens(occurrence.text);
      if (!phrase.length || occurrence.unlock !== 'sentence-view' || !approvedOccurrence(occurrence)) return false;
      let matched = false;
      for (let start = 0; start <= words.length - phrase.length; start++) {
        if (phrase.every((word, index) => word === words[start + index])) {
          phrase.forEach((_, index) => covered.add(start + index));
          matched = true;
        }
      }
      if (!matched) return false;
    }
    return words.length > 0 && covered.size === words.length;
  }
  const ready = sentences.filter(item => {
    const verb = verbById.get(item.verbId);
    const ids = new Set(verb?.forms.map(form => form.id));
    return item.status === 'approved' && verb?.status === 'approved' &&
      item.udm.split('____').length === 2 && !item.udm.replace('____', '').includes('_') &&
      item.optionIds.length === 4 && new Set(item.optionIds).size === 4 &&
      item.optionIds.includes(item.answerId) && item.optionIds.every(id => ids.has(id)) &&
      coversSentence(item) && new Set(item.optionIds.map(id => formById.get(id).occurrence.text)).size === 4;
  });
  const questionById = byId(ready);
  const taskIds = new Set(verbs.flatMap(verb => [verb.studyId, verb.practiceId]));

  function fresh() {
    return { gameId, schemaVersion, profileId: makeId(), mode: 'study', verbId: verbs[0].id,
      rounds: {}, test: null, events: {} };
  }

  const record = value => value && typeof value === "object" && !Array.isArray(value);

  function decode(raw) {
    const state = JSON.parse(raw);
    if (state?.gameId !== gameId || state.schemaVersion !== schemaVersion ||
        typeof state.profileId !== 'string' || !state.profileId || !['study','practice','test'].includes(state.mode) ||
        !record(state.rounds) || !record(state.events)) throw new Error('Invalid save');
    if (!verbById.has(state.verbId)) state.verbId = verbs[0].id;
    for (const [taskId, round] of Object.entries(state.rounds)) {
      const verb = verbs.find(entry => [entry.studyId, entry.practiceId].includes(taskId));
      const people = new Set(pronouns.map(person => person.id));
      const forms = new Set(verb?.forms.map(form => form.id));
      const expectedGaps = verb?.practiceId === taskId ? 2 : 0;
      const expectedOptions = expectedGaps ? forms.size : 0;
      if (!taskIds.has(taskId) || !people.has(round?.inner) || !people.has(round?.outer) ||
          !Array.isArray(round.missing) || new Set(round.missing).size !== expectedGaps ||
          round.missing.length !== expectedGaps || !round.missing.every(id => people.has(id)) ||
          !Array.isArray(round.optionIds) || round.optionIds.length !== expectedOptions ||
          new Set(round.optionIds).size !== expectedOptions || !round.optionIds.every(id => forms.has(id)) ||
          typeof round.checked !== 'boolean' || !record(round.answers) || Object.entries(round.answers).some(([id, answer]) =>
            !round.missing.includes(id) || !forms.has(answer))) {
        if(!record(state.recoveredRounds))state.recoveredRounds={};state.recoveredRounds[taskId]=round;delete state.rounds[taskId];
      }
    }
    const test = state.test;
    if (test && (!Array.isArray(test.ids) || !test.ids.length || new Set(test.ids).size !== test.ids.length ||
        typeof test.id !== 'string' || !record(test.answers) || !record(test.options) ||
        !Number.isInteger(test.cursor) || test.cursor < 0 || test.cursor > test.ids.length ||
        !test.ids.every((id, index) => {
          const item = questionById.get(id);
          const options = test.options[id];
          const answer = test.answers[id];
          return item && Array.isArray(options) && new Set(options).size === item.optionIds.length &&
            options.length === item.optionIds.length && options.every(option => item.optionIds.includes(option)) &&
            (answer === undefined ? index >= test.cursor : index <= test.cursor && options.includes(answer));
        }))) {state.recoveredTest=state.test;state.test=null;}
    for (const [id, record] of Object.entries(state.events)) {
      if (record?.event?.id !== id || record.event.gameId !== gameId ||
          record.event.profileId !== state.profileId || typeof record.acked !== 'boolean') {
        throw new Error('Invalid event');
      }
    }
    return state;
  }

  let state = fresh(), recoveryRaw=null;
  try {
    const raw = storage.getItem(key);recoveryRaw=raw;
    if (raw) state = decode(raw);
  } catch {
    // Preserve unreadable old data inside the export instead of silently discarding it.
    if(typeof recoveryRaw==='string')state.recovery=recoveryRaw;
  }

  function save() {
    try {
      storage.setItem(key, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  function emit(kind, subjectId, payload, provenance) {
    const id = [state.profileId, gameId, kind, subjectId].join('/');
    if (Object.hasOwn(state.events, id)) return;
    state.events[id] = { acked: false, event: {
      id, type: kind, profileId: state.profileId, gameId, schemaVersion, contentVersion, at: now(),
      provenance, payload
    } };
  }

  function unlock(occurrence, taskId) {
    if (!approvedOccurrence(occurrence)) return;
    if (lexemeById.get(occurrence.lexemeId).dictionary === false) return;
    const lexeme = lexemeById.get(occurrence.lexemeId);
    emit('lexeme.unlocked', lexeme.id, { lexemeId: lexeme.id, lemma: lexeme.lemma, ru: lexeme.ru,
      partOfSpeech: lexeme.partOfSpeech, text: occurrence.text },
    { taskId, trigger: occurrence.unlock, sourceId: lexeme.sourceId });
  }

  function result(taskId, subjectId, score, total, sourceIds, details) {
    emit('result.recorded', subjectId, { taskId, score, total, ...details }, { taskId, sourceIds });
  }

  return {
    answer(lexemeId, correct, taskId, mode) { const entry=lexemeById.get(lexemeId);if(entry?.status==='approved'&&entry.ru&&entry.dictionary!==false)emit('lexeme.answered',makeId(),{lexemeId,correct:!!correct},{taskId,mode,sourceId:entry.sourceId}); },
    get state() { return state; },
    ready, questionById, verbById, lexemeById, formById, save, unlock, result, makeId,
    exportSave: () => JSON.stringify(state),
    restore(raw) { state = decode(raw); return save(); },
    pendingEvents() {
      return JSON.parse(JSON.stringify(Object.values(state.events).filter(record => !record.acked).map(record => record.event)));
    },
    acknowledge(ids) {
      const changed = ids.filter(id => Object.hasOwn(state.events, id) && !state.events[id].acked);
      for (const id of changed) state.events[id].acked = true;
      if (save()) return true;
      for (const id of changed) state.events[id].acked = false;
      return false;
    }
  };
}

if(typeof window!=='undefined')window.UstonConjugationCore={createGame};
if (typeof module !== 'undefined') module.exports = { createGame };

})();
