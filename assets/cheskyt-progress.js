(() => {
  'use strict';

  const gameId = 'cheskyt';
  const key = 'uston.cheskyt.shop.progress.v1';
  const exposureTypes = new Set(['shopping-list', 'shelf-labels', 'basket', 'cash-register']);
  const vocabulary = new Map(window.UstonVocabularyExtra.filter(word => word.game === gameId)
    .map(word => [word.id, word]));
  const backup = window.UstonNewGames;
  backup.keys.push(key);
  const validateBackup = backup.validate;
  backup.validate = (input, output) => {
    validateBackup(input, output);
    if (!Object.hasOwn(input, key) || input[key] === null) return;
    const {version, completed, score, relaxed} = input[key] ?? {};
    if (version !== 1 || !Number.isInteger(completed) || completed < 0 || completed > 30 ||
        !Number.isInteger(score) || score < 0 || score > 3000 || typeof relaxed !== 'boolean') {
      throw Error('Повреждено сохранение «Ческыт».');
    }
    output[key] = {version, completed, score, relaxed};
  };

  function connect({frame, getActiveGame, updateDashboard}) {
    window.addEventListener('message', event => {
      const message = event.data;
      if (getActiveGame() !== gameId || event.source !== frame.contentWindow ||
          event.origin !== location.origin || message?.version !== 1 || message.gameId !== gameId) return;
      if (message.type === 'uston:cheskyt-progress') {
        updateDashboard();
        return;
      }
      if (message.type !== 'uston:cheskyt-words' || !exposureTypes.has(message.itemId) ||
          !Array.isArray(message.ids) || message.ids.length > 20) return;

      const words = [...new Set(message.ids)].map(id => vocabulary.get(gameId + ':' + id)).filter(Boolean);
      if (!words.length) return;
      window.UstonDictionary.encounter({
        gameId, itemId: message.itemId, words, eventId: gameId + ':' + message.itemId
      });
      updateDashboard();
    });
  }

  function summary(value) {
    if (!value?.completed) return 'Ческыт: можно начать.';
    return `Ческыт: ${value.completed} из 30 покупок · ${value.score} игровых баллов.`;
  }

  window.UstonCheskyt = {connect, summary, key};
})();
