import { conf } from './conf.js'
import { storage } from './lib-storage.js'

/**
 * Button manager to handle abort controllers for event listeners.
 * Prevents memory leaks by properly cleaning up event listeners when buttons are updated.
 */
const buttonManager = {
  controllers: new Map<string, AbortController>(),

  /**
   * Gets an existing abort controller or creates a new one for a button.
   *
   * @param buttonId - The ID of the button element
   * @returns The abort controller for the specified button
   */
  getController(buttonId: string): AbortController {
    if (!this.controllers.has(buttonId)) {
      this.controllers.set(buttonId, new AbortController())
    }
    return this.controllers.get(buttonId)!
  },

  /**
   * Resets the abort controller for a button, aborting any existing listeners.
   * Creates a new controller to replace the old one.
   *
   * @param buttonId - The ID of the button element
   * @returns Promise resolving to the new abort controller
   */
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

/**
 * Updates a button element with new event listener, text, and disabled state.
 * Properly manages event listeners using abort controllers to prevent memory leaks.
 *
 * @param buttonId - The ID of the button element to update
 * @param callback - The click event handler function
 * @param text - Optional text content to set on the button
 * @param disabled - Optional disabled state for the button
 */
const buttonUpdate = async (
  buttonId: string,
  callback: () => void,
  text?: string,
  disabled?: boolean,
): Promise<void> => {
  const button = document.getElementById(buttonId)
  if (button && button instanceof HTMLButtonElement) {
    const controller = await buttonManager.resetController(buttonId)
    button.addEventListener('click', callback, { signal: controller.signal })
    if (text) button.textContent = text
    if (disabled !== undefined) button.disabled = disabled
  }
}

/**
 * Sets the disabled state of an input element.
 *
 * @param elementId - The ID of the input element
 * @param disabled - Whether the element should be disabled
 */
const toggleDisabled = (elementId: string, disabled: boolean): void => {
  const element = document.getElementById(elementId)
  if (element instanceof HTMLInputElement) {
    element.disabled = disabled
  }
}

/**
 * Adds a change event listener to a toggle element that updates storage settings.
 * Automatically saves the toggle state to storage when changed.
 *
 * @param elementId - The ID of the toggle input element
 * @param settingKey - The storage key to update with the toggle state
 * @param callback - Optional callback function to execute after setting is saved
 */
const toggleListener = (
  elementId: string,
  settingKey: string,
  callback?: () => void,
): void => {
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

/**
 * Sets the checked state of a toggle input element.
 *
 * @param elementId - The ID of the toggle input element
 * @param state - Whether the toggle should be checked
 */
const toggleState = (elementId: string, state: boolean): void => {
  const element = document.getElementById(elementId)
  if (element instanceof HTMLInputElement) {
    element.checked = state
  }
}

/**
 * Loads and displays user authentication status for a service.
 * Updates UI elements based on login state - shows username if logged in,
 * or updates sync button to show login action if not logged in.
 *
 * @param elementId - The ID of the element to display username in
 * @param url - The URL to open for login if user is not authenticated
 * @param authFn - Function that returns user authentication information
 * @param text - Text to display on login button if not authenticated
 * @throws Error if user is not logged in to the service
 */
const userLoad = async (
  elementId: string,
  url: string,
  authFn: () => Promise<{ username: string | null }>,
  text: string,
): Promise<void> => {
  console.debug(`KFA: POP: Getting username for ${elementId}`)
  const { username } = await authFn()
  if (username) {
    const usernameElem = document.getElementById(elementId)
    if (usernameElem) {
      usernameElem.textContent = `: ${username}`
      usernameElem.style.display = 'inline'
    }
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
