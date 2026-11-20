const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const path=require('node:path');
const sourceRead=readFileSync;
const readAsset=p=>sourceRead(path.resolve(__dirname,'../..',p));
const { createGame } = require('./core');
const data = require('./data.json');
const clone = value => JSON.parse(JSON.stringify(value));

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
}

function game(source = data, disk = storage(), id = 'profile-1') {
  return createGame(source, disk, () => id, () => '2026-11-20T00:00:00Z');
}

test('реестр, источник, формы, исправления и ссылки', () => {
  const sourceIds = new Set(data.sources.map(item => item.id));
  const people = new Set(data.pronouns.map(item => item.id));
  const lexemes = new Map(data.lexemes.map(item => [item.id, item]));
  const ids = [data.finalTestId, ...people];
  assert.equal(data.verbs.length, 20);
  assert.equal(people.size, 6);
  for (const person of data.pronouns) {
    assert.equal(lexemes.get(person.occurrence.lexemeId).lemma, person.occurrence.text);
  }
  for (const verb of data.verbs) {
    const entry = lexemes.get(verb.occurrence.lexemeId);
    assert.equal(entry.lemma, verb.occurrence.text);
    assert.equal(entry.partOfSpeech, 'verb');
    assert(['approved','review'].includes(entry.status));
    assert(sourceIds.has(verb.sourceId));
    assert.equal(new Set(verb.forms.map(form => form.occurrence.text)).size, 6);
    assert.deepEqual(new Set(verb.forms.map(form => form.personId)), people);
    ids.push(verb.studyId, verb.practiceId);
    for (const form of verb.forms) {
      assert.equal(form.occurrence.lexemeId, entry.id);
      assert(form.occurrence.text);
      ids.push(form.id);
    }
  }
  assert(data.verbs.every(v=>['approved','review'].includes(v.status)));
  for (const item of data.sentences) {
    ids.push(item.id);
    assert(sourceIds.has(item.sourceId));
    assert(['approved','review'].includes(item.status));
  }
  assert.equal(new Set(ids).size, ids.length);
  for (const path of Object.values(data.media)) {
    const png = readAsset(path);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png[25], 6, 'PNG RGBA');
  }
});

test('предложение открывается только после вычитки, разметки всех слов и сверки вариантов', () => {
  assert(game().ready.every(q=>q.status==='approved'));
  const fixture = clone(data);
  const item = fixture.sentences[0];fixture.sentences=[item];
  const verb = fixture.verbs[0];verb.status='approved';const lemma=fixture.lexemes.find(x=>x.id===verb.occurrence.lexemeId);lemma.status='approved';lemma.ru||='test-only';
  // Synthetic tokens exercise coverage without introducing new Udmurt material.
  item.udm = 'A B ____.';
  item.status = 'approved';
  const occurrence = text => ({ text, lexemeId: verb.occurrence.lexemeId, unlock: 'sentence-view' });
  item.occurrences = [occurrence('A')];
  assert.equal(game(fixture).ready.length, 0);
  item.occurrences.push(occurrence('B'));
  assert.deepEqual(game(fixture).ready.map(entry => entry.id), [item.id]);
  item.optionIds[1] = item.optionIds[0];
  assert.equal(game(fixture).ready.length, 0);
});

test('прогресс сохраняется после перестановки форм и заданий', () => {
  const disk = storage();
  const fixture=clone(data);for(const l of fixture.lexemes){l.status='approved';l.ru||='test-only';}const first=game(fixture,disk);
  const verb=fixture.verbs[4];
  first.state.verbId = verb.id;
  first.state.mode = 'practice';
  first.state.rounds[verb.practiceId] = {
    inner: 'p1p', outer: 'p2s', missing: ['p1p', 'p2s'],
    optionIds: verb.forms.map(form => form.id), checked: false, answers: { p1p: verb.forms.find(form => form.personId === 'p1p').id }
  };
  assert(first.save());
  const reordered = clone(data);
  reordered.verbs.reverse().forEach(entry => entry.forms.reverse());
  reordered.pronouns.reverse();
  const roundTrip = game(reordered, disk, 'different-id');
  assert.deepEqual(roundTrip.state, first.state);
  assert.throws(() => roundTrip.restore('{"gameId":"other"}'));
  const copied = game(reordered);
  assert(copied.restore(first.exportSave()));
  assert.deepEqual(copied.state, first.state);
});

test('события идемпотентны, хранят источник и переживают чтение и подтверждение', () => {
  const disk = storage();
  const fixture=clone(data);for(const l of fixture.lexemes){l.status='approved';l.ru||='test-only';}const first=game(fixture,disk);
  const verb=fixture.verbs[4];
  first.unlock(verb.occurrence, verb.studyId);
  first.unlock(verb.forms[0].occurrence, verb.studyId);
  first.unlock(data.verbs.at(-1).occurrence, data.verbs.at(-1).studyId);
  first.unlock(data.pronouns[0].occurrence, verb.studyId);
  first.result(verb.studyId, verb.studyId, 6, 6, [verb.sourceId], { mode: 'study' });
  first.result(verb.studyId, verb.studyId, 6, 6, [verb.sourceId], { mode: 'study' });
  const events = first.pendingEvents();
  assert.equal(events.length, 4);
  assert.equal(events[0].provenance.sourceId, verb.sourceId);
  assert.equal(events[0].provenance.trigger, 'wheel-view');
  assert.deepEqual(events.find(e=>e.type==='result.recorded').provenance.sourceIds, [verb.sourceId]);
  first.save();
  const restored = game(fixture, disk);
  assert.deepEqual(restored.pendingEvents(), events);
  assert(restored.acknowledge([events[0].id]));
  restored.unlock(verb.occurrence, verb.studyId);
  assert.deepEqual(game(fixture, disk).pendingEvents(), events.slice(1));
});

test('при ошибке локального хранилища доступен экспорт, подтверждение можно повторить', () => {
  const disk = { getItem() { throw new Error(); }, setItem() { throw new Error(); } };
  const first = game(data, disk);
  first.unlock(data.verbs[0].occurrence, data.verbs[0].studyId);
  assert.equal(first.save(), false);
  assert.equal(first.acknowledge(first.pendingEvents().map(event => event.id)), false);
  assert.equal(first.pendingEvents().length, 1);
  assert.equal(JSON.parse(first.exportSave()).gameId, data.gameId);
});

test('сборка встраивает данные, код, стили и шесть PNG', () => {
  const html = readFileSync('index.html', 'utf8');
  const json = html.match(/<script type="application\/json" id="data">([^]*?)<\/script>/)[1];
  assert.deepEqual(JSON.parse(json), data);
  assert.equal(html.match(/data:image\/png;base64,/g).length, 6);
  assert(!/\/\* (STYLES|CORE|APP|ART|DATA) \*\//.test(html));
  assert(!/<(?:script|link)[^>]*\b(?:src|href)=/.test(html));
  assert.match(html, /width=device-width/);
  assert.match(html, /@media\(max-width:760px\).*grid-template-columns:minmax\(0,1fr\)/);
  for (const match of html.matchAll(/data-(?:copy|label)="(\w+)"/g)) assert(data.copy[match[1]]);
});

test('интерфейс восстанавливает колесо, пропуски и итоговую попытку', () => {
  // Minimal DOM contract for testing the real click handlers without a browser dependency.
  const { runInNewContext } = require('node:vm');
  class Node {
    children = [];
    dataset = {};
    listeners = {};
    attributes = {};
    style = { setProperty() {} };
    classList = { toggle() {} };
    constructor(tag = '') { this.tag = tag; }
    get firstChild() { return this.children[0]; }
    get firstElementChild() { return this.firstChild; }
    append(...children) { this.children.push(...children); }
    replaceChildren() { this.children = []; }
    setAttribute(key, value) { this.attributes[key] = value; }
    addEventListener(type, handler) { this.listeners[type] = handler; }
    click() { if (!this.disabled) this.listeners.click?.(); }
    focus() {}
    querySelectorAll(tag) { return this.children.flatMap(child => [
      ...(child.tag === tag ? [child] : []), ...child.querySelectorAll(tag)
    ]); }
    querySelector() { return this.children.find(child => child.className === 'primary' && !child.disabled); }
  }

  const fixture = clone(data);
  const item = fixture.sentences[0];fixture.sentences=[item];
  const verb = fixture.verbs[0];verb.status='approved';const lemma=fixture.lexemes.find(x=>x.id===verb.occurrence.lexemeId);lemma.status='approved';lemma.ru||='test-only';
  Object.assign(item, { status: 'approved', udm: 'A ____.',
    occurrences: [{ lexemeId: verb.id, text: 'A', unlock: 'sentence-view' }] });
  const disk = storage();
  function load() {
    const ids = new Map();
    const get = id => {
      if (!ids.has(id)) ids.set(id, new Node());
      return ids.get(id);
    };
    get('data').textContent = JSON.stringify(fixture);
    get('verb-picker').append(new Node());
    const modes = Object.fromEntries(['study', 'practice', 'test'].map(mode => {
      const button = new Node();
      button.dataset.mode = mode;
      return [mode, button];
    }));
    const buttons = ['inner', 'outer'].map(ring => {
      const button = new Node();
      Object.assign(button.dataset, { ring, step: '1' });
      return button;
    });
    const controls = { '[data-mode]': Object.values(modes), '[data-ring]': buttons };
    const window = {};
    runInNewContext(readFileSync('app.js', 'utf8'), {
      createGame, window, localStorage: disk, art: {},
      crypto: require('node:crypto').webcrypto,
      Option: class extends Node {},
      document: { createElement: tag => new Node(tag), getElementById: get,
        querySelector: () => get('data'), querySelectorAll: selector => controls[selector] ?? [] }
    });
    return { get, modes, buttons, api: window.conjugationLock };
  }

  let ui = load();
  const snapshot = () => JSON.parse(ui.api.exportSave());
  const study = () => snapshot().rounds[verb.studyId];
  const original = study();
  ui.buttons[0].click();
  assert.notEqual(study().inner, original.inner);
  assert.equal(study().outer, original.outer);
  while (study().inner !== study().outer) ui.buttons[0].click();
  assert.equal(ui.get('lock').dataset.art, 'lock_open');

  ui.modes.practice.click();
  function chooseAnswers(wrong = false) {
    ui.get('gaps').querySelectorAll('select').forEach(select => {
      const personId = select.id.slice(4);
      const form = verb.forms.find(entry => wrong ? entry.personId !== personId : entry.personId === personId);
      select.value = form.id;
      select.listeners.change();
    });
  }
  chooseAnswers(true);
  ui.get('check-gaps').click();
  assert.match(ui.get('wheel-status').textContent, /0 из 2/);
  chooseAnswers();
  ui = load();
  assert.equal(ui.get('gaps').querySelectorAll('select').length, 2);
  ui.get('check-gaps').click();
  const practice = () => snapshot().rounds[verb.practiceId];
  while (practice().inner !== practice().outer) ui.buttons[1].click();
  assert.equal(ui.get('lock').dataset.art, 'lock_open');

  ui.modes.test.click();
  const answerIndex = snapshot().test.options[item.id].indexOf(item.answerId);
  ui.get('test-body').children[2].children[answerIndex].click();
  ui = load();
  assert.equal(snapshot().test.answers[item.id], item.answerId);
  ui.get('test-body').children.at(-1).click();
  assert.match(ui.get('test-body').firstChild.textContent, /1 из 1/);
  const result = ui.api.pendingEvents().filter(event => event.type === 'result.recorded');
  assert.equal(result.length, 3);
  assert.deepEqual(result.at(-1).payload.answers, { [item.id]: item.answerId });
  ui = load();
  assert.equal(ui.api.pendingEvents().filter(event => event.type === 'result.recorded').length, 3);
});

 test('нечитаемый старый снимок сохраняется в экспортируемом архиве',()=>{
 const raw='{broken';const values=new Map([[data.gameId+'.save.v1',raw]]);const api=createGame(data,{getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)},()=> 'recovery-profile');assert.equal(api.state.recovery,raw);assert(api.save());assert.equal(JSON.parse(api.exportSave()).recovery,raw);
});
