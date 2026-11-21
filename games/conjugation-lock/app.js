(async () => {
  'use strict';
  const data = JSON.parse(document.querySelector('#data').textContent);
  const initialSnapshot=window.ConjugationPortal?.embedded?await window.ConjugationPortal.loadSnapshot():null;
  const { copy, pronouns, verbs, sentences } = data;
  // Reuse the portal's bundled font, including Udmurt characters; no network font.
  try {
    const source=window.parent?.UDM_SHARED?.[1];
    if(source&&window.FontFace&&document.fonts){const font=new FontFace('Conjugation Nunito','url('+source+')',{weight:'200 1000'});document.fonts.add(font);font.load().catch(()=>{});}
    document.body.classList.toggle('embedded',window.parent!==window);
  } catch {}
  const get = id => document.getElementById(id);
  const format = (key, values = {}) => copy[key].replace(/\{(\w+)\}/g, (_, name) => values[name]);
  const makeId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte =>
    byte.toString(16).padStart(2, '0')).join('');
  const game = (window.UstonConjugationCore?.createGame || createGame)(data, {
    getItem: key => initialSnapshot?JSON.stringify(initialSnapshot):localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value)
  }, makeId);
  const state = () => game.state;
  const verb = () => game.verbById.get(state().verbId);
  const people = pronouns.map(person => person.id);
  const mod = value => ((value % people.length) + people.length) % people.length;
  const currentTask = () => state().mode === 'practice' ? verb().practiceId : verb().studyId;
  const round = () => state().rounds[currentTask()];
  const tiles = { inner: [], outer: [] };
  let spins = { inner: 0, outer: 0 };

  function element(tag, value = '') {
    const node = document.createElement(tag);
    node.textContent = value;
    return node;
  }

  function shuffle(values) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function setArt(node, name) {
    node.dataset.art = name;
    node.src = art[name];
  }

  function persist() {
    get('save-status').textContent = game.save() ? '' : copy.storageError;
    window.ConjugationPortal?.notify();
  }

  document.title = copy.title;
  document.querySelectorAll('[data-copy]').forEach(node => {
    node.textContent = copy[node.dataset.copy];
  });
  document.querySelectorAll('[data-label]').forEach(node => {
    node.setAttribute('aria-label', copy[node.dataset.label]);
  });
  document.querySelectorAll('img[data-art]').forEach(img => setArt(img, img.dataset.art));

  const picker = get('verb-picker');
  const verbButtons = new Map();
  for (const entry of verbs) {
    const lexeme = game.lexemeById.get(entry.occurrence.lexemeId);
    const button = element('button');
    const lemma = element('strong', entry.occurrence.text);
    lemma.lang = 'udm';
    button.append(lemma, element('span', lexeme.ru ?? copy.review));
    button.addEventListener('click', () => {
      state().verbId = entry.id;
      picker.open = false;
      picker.firstElementChild.focus();
      render();
    });
    button.dataset.lexemeId=entry.occurrence.lexemeId;
    verbButtons.set(entry.id, button);
    get('verb-list').append(button);
  }
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape' && picker.open) {
      picker.open = false;
      picker.firstElementChild.focus();
    }
  });

  function resetRound() {
    const inner = Math.floor(Math.random() * people.length);
    const outer = mod(inner + 1 + Math.floor(Math.random() * (people.length - 1)));
    state().rounds[currentTask()] = {
      inner: people[inner], outer: people[outer],
      missing: state().mode === 'practice' ? shuffle(people).slice(0, 2) : [],
      optionIds: state().mode === 'practice' ? shuffle(verb().forms.map(form => form.id)) : [],
      answers: {}, checked: false
    };
  }

  function rotate(ring, step) {
    spins[ring] += step;
    round()[ring] = people[mod(-spins[ring])];
    showWheel();
    persist();
  }

  for (const ring of ['inner', 'outer']) {
    pronouns.forEach((_, index) => {
      const slot = element('div');
      slot.className = 'slot';
      slot.style.setProperty('--angle', `${60 * index}deg`);
      const tile = element('button');
      tile.lang = 'udm';
      tile.className = 'tile';
      tile.append(element('span'));
      tile.addEventListener('click', () => rotate(ring, mod(-index - spins[ring] + 3) - 3));
      slot.append(tile);
      get(ring).append(slot);
      tiles[ring].push(tile);
    });
  }

  function wheelForms() {
    const forms = new Map(verb().forms.map(form => [form.personId, form]));
    return people.map(id => forms.get(id));
  }

  function showWheel() {
    const active = round();
    const forms = wheelForms();
    const practice = state().mode === 'practice';
    const aligned = active.inner === active.outer;
    const solved = active.checked && active.missing.every(id =>
      active.answers[id] === forms[people.indexOf(id)].id);
    const approved = verb().status === 'approved';
    for (const ring of ['inner', 'outer']) {
      get(ring).style.setProperty('--spin', `${60 * spins[ring]}deg`);
      tiles[ring].forEach((tile, index) => {
        const current = people[index] === active[ring];
        const blank = ring === 'outer' && active.missing.includes(people[index]) && !solved;
        const occurrence = ring === 'inner' ? pronouns[index].occurrence : forms[index].occurrence;
        tile.setAttribute('aria-current', String(current));
        tile.firstChild.textContent = blank ? '' : occurrence.text;
        tile.setAttribute('aria-label', blank ? copy.hiddenForm : occurrence.text);
        if (ring === 'outer') {
          tile.style.backgroundImage = `url("${art[blank ? 'sector_question' : 'sector_blank']}")`;
        }
      });
    }
    const unlocked = approved && aligned && (!practice || solved);
    get('wheel').classList.toggle('aligned', unlocked);
    setArt(get('lock'), unlocked ? 'lock_open' : 'lock_closed');
    if (unlocked) {
      if (!practice) forms.forEach(form => game.unlock(form.occurrence, currentTask()));
      game.result(currentTask(), currentTask(), practice ? active.missing.length : people.length,
        practice ? active.missing.length : people.length, [verb().sourceId], { mode: state().mode, verbId: verb().id });
    }
    if (!approved) {
      get('wheel-status').textContent = practice ? copy.practicePending : copy.review;
    } else if (!practice) {
      const pair = `${pronouns[people.indexOf(active.inner)].occurrence.text} · ${forms[people.indexOf(active.outer)].occurrence.text}`;
      get('wheel-status').textContent = format(aligned ? 'aligned' : 'pointer', { pair });
    } else if (solved) {
      get('wheel-status').textContent = copy[aligned ? 'practiceAligned' : 'practiceSolved'];
    } else if (active.checked) {
      const correct = active.missing.filter(id => active.answers[id] === forms[people.indexOf(id)].id).length;
      get('wheel-status').textContent = format('wrongGaps', { correct, total: active.missing.length });
    } else {
      get('wheel-status').textContent = '';
    }
    return solved;
  }

  function renderWheel() {
    if (!round()) resetRound();
    const active = round();
    const entry = verb();
    const practice = state().mode === 'practice';
    const canPractice = practice && entry.status === 'approved';
    const forms = wheelForms();
    spins = { inner: -people.indexOf(active.inner), outer: -people.indexOf(active.outer) };
    get('current-verb').textContent = entry.occurrence.text;
    get('meaning').textContent = game.lexemeById.get(entry.occurrence.lexemeId).ru ?? copy.review;
    for (const [id, button] of verbButtons) button.setAttribute('aria-pressed', String(id === entry.id));
    get('instructions').textContent = practice ? (canPractice ? copy.practiceInstruction : '') : copy.studyInstruction;
    get('practice-actions').hidden = !canPractice;
    const gaps = get('gaps');
    gaps.replaceChildren();
    game.unlock(entry.occurrence, currentTask());
    pronouns.forEach(person => game.unlock(person.occurrence, currentTask()));
    const solved = showWheel();
    get('check-gaps').disabled = solved || active.missing.some(id => !active.answers[id]);
    if (!canPractice) return;
    for (const id of active.missing) {
      const index = people.indexOf(id);
      const row = element('div');
      row.className = 'gap';
      const label = element('label', pronouns[index].occurrence.text);
      label.lang = 'udm';
      const select = element('select');
      select.id = label.htmlFor = 'gap-' + id;
      select.append(new Option(copy.choose, ''), ...active.optionIds.map(formId =>
        new Option(game.formById.get(formId).occurrence.text, formId)));
      select.value = active.answers[id] ?? '';
      select.disabled = solved;
      if (active.checked) select.dataset.result = select.value === forms[index].id ? 'right' : 'wrong';
      select.addEventListener('change', () => {
        if (select.value) active.answers[id] = select.value;
        else delete active.answers[id];
        active.checked = false;
        gaps.querySelectorAll('select').forEach(field => delete field.dataset.result);
        get('check-gaps').disabled = active.missing.some(personId => !active.answers[personId]);
        showWheel();
        persist();
      });
      row.append(label, select);
      gaps.append(row);
    }
  }

  function beginTest() {
    const items = shuffle(game.ready).slice(0, data.testLimit);
    state().test = {
      id: makeId(), cursor: 0, ids: items.map(item => item.id), answers: {},
      options: Object.fromEntries(items.map(item => [item.id, shuffle(item.optionIds)]))
    };
  }

  const verbByQuestion=item=>game.verbById.get(item.verbId);
  function renderTest(focus) {
    const body = get('test-body');
    body.replaceChildren();
    if (!game.ready.length) {
      body.append(element('p', copy.testPending), element('p', format('draftCount', {
        total: sentences.length - game.ready.length
      })));
      return;
    }
    if (!state().test) beginTest();
    const test = state().test;
    const total = test.ids.length;
    if (test.cursor === total) {
      const items = test.ids.map(id => game.questionById.get(id));
      const correct = items.filter(item => test.answers[item.id] === item.answerId).length;
      game.result(data.finalTestId, test.id, correct, total, [...new Set(items.map(item => item.sourceId))],
        { mode: 'test', answers: { ...test.answers } });
      const result = element('p', format('result', { correct, total }));
      result.className = 'feedback';
      result.setAttribute('role', 'status');
      const restart = element('button', copy.restart);
      restart.addEventListener('click', () => {
        beginTest();
        render(true);
      });
      body.append(result, restart);
      if (focus) restart.focus();
      return;
    }
    const item = game.questionById.get(test.ids[test.cursor]);
    item.occurrences.forEach(occurrence => game.unlock(occurrence, item.id));
    const prompt = element('p', item.udm);
    prompt.className = 'prompt';
    prompt.lang = 'udm';
    prompt.tabIndex = -1;
    const choices = element('div');
    choices.className = 'answers';
    const answer = test.answers[item.id];
    const result = element('p');
    result.setAttribute('role', 'status');
    result.className = 'feedback';
    if (answer) {
      result.textContent = (answer === item.answerId
        ? copy.correct : format('wrong', { answer: game.formById.get(item.answerId).occurrence.text })) +
        (item.explanation ? ' ' + item.explanation : '');
    }
    const next = element('button', copy[test.cursor + 1 === total ? 'showResult' : 'next']);
    next.className = 'primary';
    next.hidden = !answer;
    next.addEventListener('click', () => {
      test.cursor++;
      render(true);
    });
    for (const id of test.options[item.id]) {
      const form = game.formById.get(id);
      game.unlock({ ...form.occurrence, unlock: 'sentence-options' }, item.id);
      const button = element('button', form.occurrence.text);
      button.lang = 'udm';
      button.disabled = Boolean(answer);
      if (answer && id === item.answerId) button.className = 'primary';
      button.addEventListener('click', () => {
        if(test.answers[item.id]!==undefined)return;
        game.answer(verbByQuestion(item).occurrence.lexemeId,id===item.answerId,item.id,'test');
        test.answers[item.id] = id;
        render();
        get('test-body').querySelector('.primary:not(:disabled)').focus();
      });
      choices.append(button);
    }
    body.append(element('p', format('progress', { current: test.cursor + 1, total })), prompt, choices, result, next);
    if (focus) prompt.focus();
  }

  function render(focus = false) {
    const mode = state().mode;
    document.querySelectorAll('[data-mode]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
    });
    get('wheel-view').hidden = mode === 'test';
    get('test-view').hidden = mode !== 'test';
    if (mode === 'test') renderTest(focus);
    else renderWheel();
    persist();
  }

  document.querySelectorAll('[data-ring]').forEach(button => {
    const { ring, step } = button.dataset;
    button.setAttribute('aria-label', copy[ring === 'inner' ? 'pronouns' : 'forms'] + ' · ' +
      copy[Number(step) < 0 ? 'counterclockwise' : 'clockwise']);
    button.addEventListener('click', () => rotate(ring, Number(step)));
  });
  document.querySelectorAll('[data-mode]').forEach(button => {
    button.addEventListener('click', () => {
      state().mode = button.dataset.mode;
      render();
    });
  });
  get('new-gaps').addEventListener('click', () => {
    resetRound();
    render();
  });
  get('next-verb').addEventListener('click', () => {
    const index=verbs.findIndex(entry=>entry.id===state().verbId);
    state().verbId=verbs[(index+1)%verbs.length].id;
    picker.open=false;
    render();
    get('next-verb').focus();
  });
  get('check-gaps').addEventListener('click', () => {
    if(!round().checked)game.answer(verb().occurrence.lexemeId,round().missing.every(id=>round().answers[id]===verb().forms.find(f=>f.personId===id).id),currentTask(),'practice');
    round().checked = true;
    render();
    (get('check-gaps').disabled ? get('next-verb') : get('check-gaps')).focus();
  });
  window.conjugationLock = Object.freeze({
    observeLexeme(id){const entry=game.lexemeById.get(id);if(entry){game.unlock({text:entry.lemma,lexemeId:id,unlock:'wheel-view'},'picker:'+id);persist();}},
    pendingEvents: game.pendingEvents,
    acknowledge: game.acknowledge,
    exportSave: game.exportSave,
    restoreSave(raw) {
      game.restore(raw);
      render();
      return !get('save-status').textContent;
    }
  });
  window.ConjugationPortal?.attachPicker();
  render();
})();
