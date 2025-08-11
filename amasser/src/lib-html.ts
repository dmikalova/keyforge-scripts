import { storage } from './lib-storage.js'

const buttonListener = (elementId, callback, signal) => {
  document
    .getElementById(elementId)
    ?.addEventListener('click', callback, { signal: signal })
}

//   const syncDecksBtn = document.getElementById('sync-decks')
// if (syncDecksBtn) {
//   syncDecksBtn.addEventListener('click', syncDecks, {
//     signal: abortSyncButton.signal,
//   })
// }

const toggleListener = (elementId, settingKey, callback?: () => void) => {
  document
    .getElementById(elementId)
    ?.addEventListener('change', async ({ target }) => {
      storage.settings
        .set({
          [settingKey]: target instanceof HTMLInputElement && target.checked,
        })
        .then(() => {
          callback?.()
        })
    })
}

export const html = {
  buttonListener,
  toggleListener,
}
