import { conf } from './conf.js'
import { storage } from './lib-storage.js'

// Button manager to handle abort controllers
const buttonManager = {
  controllers: new Map<string, AbortController>(),

  getController(buttonId: string): AbortController {
    if (!this.controllers.has(buttonId)) {
      this.controllers.set(buttonId, new AbortController())
    }
    return this.controllers.get(buttonId)!
  },

  async resetController(buttonId: string): Promise<AbortController> {
    const existing = this.controllers.get(buttonId)
    if (existing) {
      await existing.abort()
    }
    const newController = new AbortController()
    this.controllers.set(buttonId, newController)
    return newController
  },
}

const buttonUpdate = async (
  buttonId: string,
  callback: () => void,
  text?: string,
  disabled?: boolean,
) => {
  const button = document.getElementById(buttonId)
  if (button && button instanceof HTMLButtonElement) {
    const controller = await buttonManager.resetController(buttonId)
    button.addEventListener('click', callback, { signal: controller.signal })
    if (text) button.textContent = text
    if (disabled !== undefined) button.disabled = disabled
  }
}

const toggleDisabled = (elementId: string, disabled: boolean) => {
  const element = document.getElementById(elementId)
  if (element instanceof HTMLInputElement) {
    element.disabled = disabled
  }
}

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
  text: string,
) => {
  console.debug(`KFA: POP: Getting username for ${elementId}`)
  const { username } = await authFn()
  if (username) {
    const usernameElem = document.getElementById(elementId)
    if (usernameElem) {
      usernameElem.textContent = `: ${username}`
      usernameElem.style.display = 'inline'
    }
    console.debug(`KFA: POP: Username for ${elementId}: ${username}`)
  } else {
    console.debug(`KFA: POP: Not logged in for ${elementId}`)

    // Set the sync button to login action
    const syncBtn = document.getElementById('sync-decks')
    const shouldUpdate =
      elementId === 'mv-username' ||
      (elementId === 'dok-username' &&
        syncBtn?.textContent !== conf.btn.loginMv) ||
      (elementId === 'tco-username' &&
        ![conf.btn.loginMv, conf.btn.loginDok].includes(
          syncBtn?.textContent ?? '',
        ))
    if (shouldUpdate) {
      await buttonUpdate(
        'sync-decks',
        () => chrome.tabs.create({ url }),
        text,
        false,
      )
    }

    // Hide the username element
    const usernameElem = document.getElementById(elementId)
    if (usernameElem) {
      usernameElem.textContent = ``
      usernameElem.style.display = 'inline'
    }
    throw new Error(`KFA: POP: Not logged into ${elementId}`)
  }
}

export const html = {
  buttonUpdate,
  toggleDisabled,
  toggleListener,
  toggleState,
  userLoad,
}
