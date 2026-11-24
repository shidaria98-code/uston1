(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const {lexicon, dialogue, game, numbers} = JSON.parse(byId('offline-data').textContent);
  const words = new Map(lexicon.entries.map(entry => [entry.id, entry]));
  const ingredients = lexicon.entries.filter(entry => entry.category === 'ingredient')
    .map(entry => entry.id);
  const numberWords = numbers.words;
  const prices = game.prices;
  const customers = dialogue.customers;
  const ui = dialogue.ui;
  const ordersPerLevel = 3;
  const storageKey = 'uston.cheskyt.shop.progress.v1';

  function notifyPortal(type, itemId, ids = []) {
    if (parent === window || !/^https?:$/.test(location.protocol)) return;
    parent.postMessage({type, gameId: 'cheskyt', version: 1, itemId, ids}, location.origin);
  }

  function showShelfWords() {
    if (byId('labels').checked) notifyPortal('uston:cheskyt-words', 'shelf-labels', order.shelf);
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.version === 1 && Number.isInteger(saved.completed) &&
          saved.completed >= 0 && saved.completed <= game.levels.length * ordersPerLevel &&
          Number.isInteger(saved.score) && saved.score >= 0) {
        return {...saved, relaxed: saved.relaxed === true};
      }
    } catch {
      // Local storage may be unavailable when opening a local file.
    }
    return {version: 1, completed: 0, score: 0, relaxed: false};
  }

  function saveProgress() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      // The current run remains playable without local storage.
    }
    document.dispatchEvent(new CustomEvent('cheskyt:progress', {detail: {...progress}}));
    notifyPortal('uston:cheskyt-progress');
  }

  function shuffled(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function makeOrder(level) {
    const selected = shuffled(ingredients).slice(0, level.items);
    let remaining = numberWords.length - 1 - selected.reduce((sum, id) => sum + prices[id], 0);
    const lines = selected.map(id => {
      const extra = Math.floor(Math.random() * (1 + Math.min(level.quantity - 1, Math.floor(remaining / prices[id]))));
      remaining -= extra * prices[id];
      return {id, count: 1 + extra};
    });
    const needed = new Map(lines.map(({id, count}) => [id, count]));
    const fillers = shuffled(ingredients.filter(id => !needed.has(id))).slice(0, level.shelf - needed.size);
    return {
      lines, needed, seconds: level.seconds,
      shelf: shuffled([...needed.keys(), ...fillers]),
      total: lines.reduce((sum, line) => sum + line.count, 0),
      cost: lines.reduce((sum, {id, count}) => sum + count * prices[id], 0)
    };
  }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function productButton(id) {
    const {udm, ru} = words.get(id);
    const button = element('button', '', 'product');
    button.type = 'button';
    button.dataset.id = id;
    button.setAttribute('aria-label', `${ru}, ${prices[id]} ₽`);
    const picture = element('img', '');
    picture.src = `art/${id}.jpg`;
    picture.alt = '';
    picture.setAttribute('aria-hidden', 'true');
    const badge = element('span', '', 'on-tray');
    badge.hidden = true;
    badge.setAttribute('aria-hidden', 'true');
    const name = element('b', udm, 'goods-name');
    name.lang = 'udm';
    name.hidden = !byId('labels').checked;
    button.classList.toggle('named', !name.hidden);
    button.append(picture, name, element('span', `${prices[id]} ₽`, 'tag'), badge);
    button.addEventListener('click', () => {
      if (phase !== 'playing' || !checkClock()) return;
      if (!tray.has(id)) notifyPortal('uston:cheskyt-words', 'basket', [id]);
      tray.set(id, (tray.get(id) ?? 0) + 1);
      renderTray();
      showFeedback(ui.choose);
    });
    return button;
  }

  function renderTray() {
    const basketEntries = [...tray];
    byId('tray').replaceChildren(...basketEntries.map(([id, count], position) => {
      const {udm} = words.get(id);
      const button = element('button', '');
      const picture = element('img', '');
      picture.src = `art/${id}.jpg`;
      picture.alt = '';
      button.append(picture, `×${count}`);
      button.title = udm;
      button.type = 'button';
      button.disabled = phase !== 'playing';
      button.setAttribute('aria-label', `${ui.removeOne}: ${udm} (${count})`);
      button.addEventListener('click', () => {
        if (!checkClock()) return;
        const current = tray.get(id);
        if (!current) return;
        if (current === 1) tray.delete(id);
        else tray.set(id, current - 1);
        renderTray();
        const replacement = byId('tray').children[position];
        (replacement?.matches('button') ? replacement : byId('shelf').querySelector('button')).focus({preventScroll: true});
        showFeedback(ui.choose);
      });
      return button;
    }));
    if (!tray.size) byId('tray').append(element('span', ui.empty));
    byId('shelf').querySelectorAll('.product').forEach(button => {
      const count = tray.get(button.dataset.id) ?? 0;
      const badge = button.querySelector('.on-tray');
      badge.hidden = !count;
      badge.textContent = count ? `×${count}` : '';
    });
    byId('clear').disabled = phase !== 'playing' || !tray.size;
  }

  function renderStats() {
    const level = Math.min(game.levels.length, Math.floor(progress.completed / ordersPerLevel) + 1);
    byId('level').textContent = `Уровень ${level}/${game.levels.length}`;
    byId('score').textContent = `${progress.score} очк.`;
  }

  function showFeedback(message, tone = 'info') {
    const feedback = byId('feedback');
    feedback.textContent = message;
    feedback.dataset.tone = tone;
  }

  function closeOrder(message, tone = 'info') {
    phase = 'between';
    deadline = null;
    byId('clock').textContent = '';
    byId('serve').textContent = ui.nextCustomer;
    byId('serve').hidden = false;
    byId('shelf').querySelectorAll('button').forEach(button => { button.disabled = true; });
    renderTray();
    showFeedback(message, tone);
    byId('serve').focus({preventScroll: true});
  }

  function renderFinished() {
    phase = 'finished';
    deadline = null;
    renderStats();
    setCheckout(false);
    byId('walker').hidden = true;
    walkMotion?.cancel();
    stepMotion?.cancel();
    byId('customer').textContent = '';
    byId('ticket').textContent = ui.shiftFinished;
    const summary = element('li', `Покупок оплачено: ${progress.completed}`);
    summary.lang = 'ru';
    byId('order').replaceChildren(summary);
    byId('clock').textContent = '';
    byId('shelf').replaceChildren();
    byId('serve').textContent = ui.restart;
    tray.clear();
    renderTray();
    showFeedback(ui.finished);
    byId('serve').focus({preventScroll: true});
  }

  function checkClock() {
    if (phase !== 'playing') return false;
    if (deadline === null) {
      byId('clock').textContent = ui.untimed;
      return true;
    }
    const remaining = Math.ceil((deadline - Date.now()) / 1000);
    if (remaining <= 0) {
      closeOrder(ui.expired, 'error');
      return false;
    }
    byId('clock').textContent = `${remaining} с`;
    return true;
  }

  function applyTimer() {
    deadline = order.seconds && !progress.relaxed ? Date.now() + order.seconds * 1000 : null;
    checkClock();
  }

  function animateCustomer(entering) {
    const walker = byId('walker');
    walkMotion?.cancel();
    stepMotion?.cancel();
    if (reducedMotion.matches || typeof walker.animate !== 'function') return null;

    const positions = entering ? [-74, 0] : [0, 74];
    const duration = entering ? 850 : 580;
    walkMotion = walker.animate(
      positions.map(position => ({transform: `translateX(${position}%)`})),
      {duration, easing: entering ? 'cubic-bezier(.26,.58,.53,1)' : 'ease-in', fill: entering ? 'none' : 'forwards'}
    );
    stepMotion = byId('face').animate([
      {transform: 'translateY(0) rotate(0)'},
      {transform: 'translateY(-4%) rotate(-3deg)'},
      {transform: 'translateY(0) rotate(0)'},
      {transform: 'translateY(-4%) rotate(3deg)'},
      {transform: 'translateY(0) rotate(0)'}
    ], {duration: duration / 2, iterations: 2, easing: 'ease-in-out'});
    return walkMotion;
  }

  function afterCustomerLeaves(next) {
    const motion = animateCustomer(false);
    if (!motion) {
      next();
      return;
    }

    phase = 'transition';
    byId('serve').setAttribute('aria-disabled', 'true');
    const finish = () => {
      byId('serve').removeAttribute('aria-disabled');
      next();
    };
    motion.finished.then(finish, finish);
  }

  function startOrder(focusShelf = false) {
    if (progress.completed === game.levels.length * ordersPerLevel) {
      renderFinished();
      return;
    }
    phase = 'playing';
    tray.clear();
    renderStats();
    order = makeOrder(game.levels[Math.floor(progress.completed / ordersPerLevel)]);
    const customer = customerRotation.shift();
    customerRotation.push(customer);
    byId('customer').textContent = customer.name;
    byId('walker').hidden = false;
    byId('face').src = customer.image;
    animateCustomer(true);
    setCheckout(false);
    byId('ticket').textContent = `Покупка ${progress.completed % ordersPerLevel + 1} из ${ordersPerLevel}`;
    byId('order').replaceChildren(...order.lines.map(({id, count}) => {
      const line = element('li', words.get(id).udm);
      if (count > 1) {
        line.append(element('span', ` · ${numberWords[count]}`, 'count'));
      }
      return line;
    }));
    const rows = [];
    for (let start = 0; start < order.shelf.length; start += 5) {
      const row = element('div', '', 'shelf-row');
      row.append(...order.shelf.slice(start, start + 5).map(productButton));
      rows.push(row);
    }
    byId('shelf').replaceChildren(...rows);
    const orderWords = order.lines.map(({id}) => id);
    if (order.lines.some(({count}) => count === 2)) orderWords.push('number-2');
    notifyPortal('uston:cheskyt-words', 'shopping-list', orderWords);
    showShelfWords();
    renderTray();
    byId('serve').textContent = ui.toCheckout;
    showFeedback(ui.choose);
    applyTimer();
    if (focusShelf) byId('shelf').querySelector('button')?.focus({preventScroll: true});
  }

  function serve() {
    if (phase === 'finished') {
      progress = {...progress, completed: 0, score: 0};
      saveProgress();
      startOrder(true);
      return;
    }
    if (phase === 'between') {
      afterCustomerLeaves(() => startOrder(true));
      return;
    }
    if (!checkClock()) return;
    const correct = tray.size === order.needed.size &&
      [...order.needed].every(([id, count]) => tray.get(id) === count);
    if (!correct) {
      showFeedback(ui.wrong, 'error');
      return;
    }
    startCheckout();
  }

  function setCheckout(active) {
    byId('checkout').hidden = !active;
    byId('pantry').hidden = active;
    byId('basket').hidden = active;
    byId('clear').hidden = active;
    byId('serve').hidden = active;
  }

  function startCheckout() {
    phase = 'payment';
    deadline = null;
    byId('clock').textContent = '';
    byId('order').querySelectorAll('li').forEach(line => line.classList.add('done'));
    byId('receipt').replaceChildren(...order.lines.map(({id, count}) => {
      const line = element('p', '');
      const name = element('span', words.get(id).udm);
      name.lang = 'udm';
      line.append(name, ` · ${count} × ${prices[id]} ₽`);
      return line;
    }), element('p', `${ui.total} … ₽`, 'total'));
    byId('cash-value').textContent = '—';
    cashKeys.forEach(button => {
      button.disabled = false;
      delete button.dataset.result;
    });
    setCheckout(true);
    notifyPortal('uston:cheskyt-words', 'cash-register', numberWords.slice(1).map((_, index) => `number-${index + 1}`));
    showFeedback(ui.calculate);
    cashKeys[0].focus({preventScroll: true});
  }

  function playSaleSound() {
    const Audio = window.AudioContext ?? window.webkitAudioContext;
    if (!byId('sound').checked || !Audio) return;

    try {
      audioContext ??= new Audio();
      const play = () => {
        const time = audioContext.currentTime;
        [880, 1318.51].forEach((frequency, index) => {
          const start = time + index * 0.09;
          const note = audioContext.createOscillator();
          const volume = audioContext.createGain();
          note.type = 'sine';
          note.frequency.value = frequency;
          volume.gain.setValueAtTime(0.001, start);
          volume.gain.exponentialRampToValueAtTime(0.12, start + 0.018);
          volume.gain.exponentialRampToValueAtTime(0.001, start + 0.19);
          note.connect(volume).connect(audioContext.destination);
          note.start(start);
          note.stop(start + 0.2);
        });
      };
      if (audioContext.state === 'running') play();
      else audioContext.resume().then(play).catch(() => {});
    } catch {
      // A browser may block audio. Payment still works.
    }
  }

  function pay(value, key) {
    if (phase !== 'payment') return;
    byId('cash-value').textContent = numberWords[value];
    cashKeys.forEach(button => { delete button.dataset.result; });
    if (value !== order.cost) {
      key.dataset.result = 'wrong';
      showFeedback(ui.wrongTotal, 'error');
      return;
    }
    key.dataset.result = 'correct';
    cashKeys.forEach(button => { button.disabled = true; });
    playSaleSound();
    byId('receipt').querySelector('.total').textContent = `${ui.total} ${order.cost} ₽`;
    const points = 10 * order.total;
    progress.score += points;
    progress.completed++;
    saveProgress();
    renderStats();
    if (progress.completed === game.levels.length * ordersPerLevel) {
      afterCustomerLeaves(renderFinished);
      return;
    }
    const message = progress.completed % ordersPerLevel === 0 ? ui.nextLevel : ui.correct;
    closeOrder(`${message} +${points} очк.`);
  }

  let progress = loadProgress();
  let order, phase, deadline, walkMotion, stepMotion, audioContext;
  const tray = new Map();
  const customerRotation = shuffled(customers);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion.addEventListener('change', event => {
    if (event.matches) {
      walkMotion?.cancel();
      stepMotion?.cancel();
    }
  });
  customers.forEach(customer => { new Image().src = customer.image; });

  document.title = ui.title;
  document.querySelectorAll('[data-ui]').forEach(node => { node.textContent = ui[node.dataset.ui]; });
  document.querySelectorAll('[data-ui-label]').forEach(node => { node.setAttribute('aria-label', ui[node.dataset.uiLabel]); });
  byId('draft').textContent = ui.draft;
  byId('relaxed').checked = progress.relaxed;
  byId('relaxed').addEventListener('change', event => {
    progress.relaxed = event.target.checked;
    saveProgress();
    if (phase === 'playing') applyTimer();
  });
  byId('serve').addEventListener('click', serve);
  byId('clear').addEventListener('click', () => {
    if (!checkClock()) return;
    tray.clear();
    renderTray();
    byId('shelf').querySelector('button').focus({preventScroll: true});
    showFeedback(ui.choose);
  });
  byId('labels').addEventListener('change', event => {
    byId('shelf').querySelectorAll('.product').forEach(button => {
      button.classList.toggle('named', event.target.checked);
      button.querySelector('.goods-name').hidden = !event.target.checked;
    });
    showShelfWords();
  });
  const cashKeys = numberWords.slice(1).map((word, index) => {
    const button = element('button', word, 'cash-key');
    button.type = 'button';
    button.lang = 'udm';
    button.addEventListener('click', () => pay(index + 1, button));
    return button;
  });
  byId('cash-keys').replaceChildren(...cashKeys);

  startOrder();
  setInterval(checkClock, 250);
})();
