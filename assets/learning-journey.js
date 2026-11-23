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
  let state = {tourSeen:saved?.tourSeen === true, mode:saved?.mode === 'beginner' ? 'beginner' : '', marks:{}};
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
    save({tourSeen:true, mode:'beginner'});
    if (dialog.open) dialog.close();
    openPage('profile');
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
    link.onclick = () => save({tourSeen:true});
  });
  document.getElementById('learning-dictionary').onclick = () => {
    document.getElementById('dictionary-search').focus();
  };

  const tour = [
    ['[data-filter="learn"]','Дышетскыны · Учиться','Здесь уроки, самоучитель и тренажёры удмуртского.'],
    ['[data-filter="rest"]','Шутэтскыны · Отдыхать','Здесь можно выбрать игру и играть в своём темпе.'],
    ['.profile-button[data-page="profile"]','Профиль игрока','Здесь маршрут, входной тест и словарь. Слова из языковых заданий можно повторять.']
  ];
  const coach = dialog.querySelector('.learning-coach');
  const spotlight = dialog.querySelector('.learning-spotlight');
  const heading = document.getElementById('learning-help-title');
  const dismiss = dialog.querySelector('.learning-tour-dismiss');
  let tourIndex = 0;
  let previousFocus;
  let target;

  function positionCoach() {
    if (!dialog.open || !target) return;
    const rect = target.getBoundingClientRect();
    const left = Math.max(4,rect.left - 5);
    const top = Math.max(4,rect.top - 5);
    const right = Math.min(innerWidth - 4,rect.right + 5);
    const bottom = Math.min(innerHeight - 4,rect.bottom + 5);
    Object.assign(spotlight.style,{left:left+'px',top:top+'px',width:(right-left)+'px',height:(bottom-top)+'px'});
    const x = Math.max(12,Math.min(innerWidth - coach.offsetWidth - 12,(left+right-coach.offsetWidth)/2));
    const y = top >= coach.offsetHeight + 24 ? top - coach.offsetHeight - 12 : bottom + 12;
    coach.style.left = x+'px';
    coach.style.top = Math.max(12,Math.min(y,innerHeight-coach.offsetHeight-12))+'px';
  }

  function showTourStep() {
    const step = tour[tourIndex];
    target = step ? document.querySelector(step[0]) : null;
    dialog.classList.toggle('learning-choice',!step);
    spotlight.hidden = !step;
    document.getElementById('learning-tour-controls').hidden = !step;
    document.getElementById('learning-tour-choice').hidden = Boolean(step);
    document.getElementById('learning-tour-back').hidden = tourIndex === 0;
    document.getElementById('learning-tour-progress').textContent = step ? (tourIndex+1)+' из '+tour.length : '';
    heading.textContent = step ? step[1] : 'С чего начнём?';
    document.getElementById('learning-tour-copy').textContent = step ? step[2] : 'Если только знакомишься с удмуртским, начни с первых реплик. Если уже немного понимаешь язык, тест подскажет, с какого занятия продолжить.';
    dismiss.textContent = step ? 'Пропустить' : 'Вернуться к играм';
    if (step && tourIndex < 2) target.scrollIntoView({block:'center'});
    positionCoach();
    heading.focus({preventScroll:true});
  }

  function openTour() {
    if (dialog.open) return;
    previousFocus = document.activeElement;
    if (currentPage !== 'games' || activeGame) openPage('games');
    tourIndex = 0;
    dialog.showModal();
    showTourStep();
  }

  document.getElementById('learning-tour-next').onclick = () => { tourIndex++; showTourStep(); };
  document.getElementById('learning-tour-back').onclick = () => { tourIndex--; showTourStep(); };
  helpButton.onclick = openTour;
  document.querySelector('[data-open-learning-help]').onclick = openTour;
  window.addEventListener('resize',positionCoach);
  window.addEventListener('scroll',positionCoach,{passive:true});
  dialog.addEventListener('close', () => {
    if (!state.tourSeen) save({tourSeen:true});
    if (currentPage === 'games' && !activeGame) {
      const visible = previousFocus?.getClientRects().length > 0;
      (visible ? previousFocus : helpButton).focus({preventScroll:true});
    }
  });

  window.addEventListener('uston:welcome-entered', () => {
    if (!state.tourSeen) openTour();
  });
  render();
  if (startLearningFromLink) chooseBeginner();
  else if (!state.tourSeen && currentPage === 'games' && !activeGame && document.getElementById('portal-welcome').hidden) openTour();
})();
