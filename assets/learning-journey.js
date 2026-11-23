(() => {
  const key = 'uston-learning-journey-v1';
  const panel = document.getElementById('learning-journey');
  const dialog = document.getElementById('learning-help');
  const helpButton = document.getElementById('learning-help-open');
  const steps = [
    {id:'guide', title:'Первые реплики', module:'Лето в удмуртской деревне', instruction:'Начни первую главу. Послушай приветствие и попробуй повторить его вслух.'},
    {id:'my-seem', title:'Знакомые предметы', module:'Мы сеем', instruction:'Выбери поле про дом. Попробуй узнать и собрать по буквам несколько слов.'},
    {id:'kin-ta', title:'Понимание на слух', module:'Кин та?', instruction:'Прослушай описание и попробуй найти персонажа. Можно прослушать реплику ещё раз.'},
    {id:'case-lock', title:'Где? Куда? Откуда?', module:'Кытын? Кытчы? Кытысь?', instruction:'Начни с вопроса «где?». Затем попробуй различить место, направление и исходную точку.'},
    {id:'conjugation-lock', title:'Кто что делает?', module:'Замок спряжения', instruction:'Открой режим изучения. Возьми один глагол и сравни формы с разными местоимениями.'}
  ];
  const allowedMarks = new Set(['done', 'practice']);
  const saved = readLocal(key, null);
  let state = {seen:saved?.seen === true, mode:saved?.mode === 'beginner' ? 'beginner' : '', marks:{}};
  for (const {id} of steps) {
    if (allowedMarks.has(saved?.marks?.[id])) state.marks[id] = saved.marks[id];
  }

  function save(changes) {
    state = {...state, ...changes};
    writeLocal(key, state);
    render();
  }

  function render() {
    const next = steps.find(step => state.marks[step.id] !== 'done');
    const route = document.getElementById('learning-route');
    route.hidden = state.mode !== 'beginner';
    document.getElementById('learning-main-start').hidden = !route.hidden;
    document.getElementById('learning-next').textContent = next
      ? 'Следующий шаг по порядку · ' + next.title
      : 'Все шаги отмечены. Можно повторить слова или вернуться к выбранному занятию.';
    document.querySelectorAll('[data-route-step]').forEach(row => {
      const id = row.dataset.routeStep;
      const mark = state.marks[id];
      row.classList.toggle('learning-current', id === next?.id);
      const select = row.querySelector('select');
      select.value = mark || '';
      if (id === next?.id) row.setAttribute('aria-current', 'step');
      else row.removeAttribute('aria-current');
    });
  }

  function chooseBeginner() {
    save({seen:true, mode:'beginner'});
    if (dialog.open) dialog.close();
    if (currentPage !== 'games' || activeGame) openPage('games');
    panel.querySelector('h2').focus();
    panel.scrollIntoView({block:'nearest'});
  }

  const list = document.getElementById('learning-steps');
  for (const {id, title, module, instruction} of steps) {
    const row = document.createElement('li');
    row.dataset.routeStep = id;
    const heading = document.createElement('h3');
    heading.textContent = title;
    const detail = document.createElement('p');
    detail.textContent = instruction;
    const actions = document.createElement('div');
    actions.className = 'learning-actions';
    const launch = document.createElement('button');
    launch.type = 'button';
    launch.textContent = module;
    launch.onclick = () => openGame(id);
    const mark = document.createElement('select');
    mark.setAttribute('aria-label', 'Моя отметка · ' + title);
    for (const [value, label] of [['','Моя отметка'],['done','Получилось'],['practice','Хочу потренироваться']]) {
      mark.add(new Option(label, value));
    }
    mark.onchange = () => {
      const marks = {...state.marks};
      if (allowedMarks.has(mark.value)) marks[id] = mark.value;
      else delete marks[id];
      save({marks});
    };
    actions.append(launch, mark);
    row.append(heading, detail, actions);
    list.append(row);
  }

  document.querySelectorAll('[data-learning-start]').forEach(button => button.onclick = chooseBeginner);
  document.querySelectorAll('[data-learning-diagnostic]').forEach(link => {
    link.onclick = () => save({seen:true});
  });
  document.getElementById('learning-catalog').onclick = () => {
    save({seen:true});
    dialog.close();
    if (currentPage !== 'games' || activeGame) openPage('games');
    const catalog = document.querySelector('[data-filter="all"]');
    catalog.click();
    catalog.focus();
  };
  document.getElementById('learning-dictionary').onclick = () => {
    if (dialog.open) dialog.close();
    openPage('profile');
    const dictionary = document.getElementById('dictionary-search');
    dictionary.focus();
  };

  helpButton.onclick = () => dialog.showModal();
  document.querySelector('[data-open-learning-help]').onclick = () => dialog.showModal();
  dialog.addEventListener('close', () => {
    if (!state.seen) save({seen:true});
  });

  render();
  if (startLearningFromLink) chooseBeginner();
  if (!state.seen && currentPage === 'games' && !activeGame && document.getElementById('portal-welcome').hidden) {
    dialog.showModal();
  }
})();
