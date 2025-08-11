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

const userLoad = async (
  elementId: string,
  url: string,
  authFn: () => Promise<{ username: string | null }>,
) => {
  console.debug(`KFA: POP: Getting MV username`)
  const { username } = await authFn()
  if (username) {
    const mvUsernameElem = document.getElementById(elementId)
    if (mvUsernameElem) {
      mvUsernameElem.textContent = `: ${username}`
      mvUsernameElem.style.display = 'inline'
    }
    console.debug(`KFA: POP: MV username: ${username}`)
  } else {
    console.debug(`KFA: POP: Not logged in for ${elementId}`)
    const syncButton = document.getElementById('sync-decks')
    if (syncButton && syncButton instanceof HTMLButtonElement) {
      await abortSync.abort()
      abortSync = new AbortController()
      syncButton.addEventListener(
        'click',
        () => {
          chrome.tabs.create({ url: url })
        },
        { signal: abortSync.signal },
      )
      syncButton.textContent = 'Login to MV'
      syncButton.disabled = false
    }

    const mvUsernameElem = document.getElementById(elementId)
    if (mvUsernameElem) {
      mvUsernameElem.textContent = ``
      mvUsernameElem.style.display = 'inline'
    }
    throw new Error(`KFA: POP: Not logged into ${elementId}`)
  }
}

export const html = {
  buttonListener,
  toggleListener,
  toggleState,
  userLoad,
}
