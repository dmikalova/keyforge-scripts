import { storage } from './lib-storage.js'

const buttonListener = (
  elementId: string,
  callback: () => void,
  signal: AbortSignal,
) => {
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

const toggleListener = (
  elementId: string,
  settingKey: string,
  callback?: () => void,
) => {
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

const toggleState = (elementId: string, state: boolean) => {
  const element = document.getElementById(elementId)
  if (element instanceof HTMLInputElement) {
    element.checked = state
  }
}

export const html = {
  buttonListener,
  toggleListener,
  toggleState,
}
