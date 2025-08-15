import { getCredsDok } from './bg-dok.js'
import { getCredsMv } from './bg-mv.js'
import { getCredsTco } from './bg-tco.js'
import { conf } from './conf.js'
import { browser } from './lib-browser.js'
import { html } from './lib-html.js'
import { storage } from './lib-storage.js'
import { timer } from './lib-timer.js'

/**
 * Main entry point for the KeyForge Amasser extension popup
 * Initializes event listeners, loads quotes, state, and user information
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    setupListeners()
    loadQuotes()
    loadState()
  } catch (error) {
    console.error(`KFA: POP: Error initializing popup: ${error}`)
  }
})

/**
 * Sets up all event listeners for the popup interface
 * Includes message listeners, toggle controls, buttons, and mouse interactions
 */
const setupListeners = async () => {
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message: SyncMessage) => {
    handleMessages(message)
  })

  // Listen for toggle events
  html.toggleListener('link-dok-toggle', 'linkDok')
  html.toggleListener('sync-auto-toggle', 'syncAuto')
  html.toggleListener('sync-dok-toggle', 'syncDok', loadState)
  html.toggleListener('sync-tco-toggle', 'syncTco', loadState)

  // Listen for button clicks
  await html.buttonUpdate('clear-data', clearData, conf.btn.clearData, false)
  await html.buttonUpdate('sync-decks', syncDecks, conf.btn.syncDecks, false)

  // Background gradient effect
  const body = document.querySelector('body')
  const main = document.querySelector('main')
  if (body && main) {
    document.addEventListener('mousemove', (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY

      // Obfuscate angle
      const angle = Math.atan2(x + 2 * y, y - 2 * x) * (180 / Math.PI) * 4

      body.style.setProperty(
        '--gradient-angle-body',
        `${(angle * 2 + x + y) % 360}deg`,
      )
      main.style.setProperty('--gradient-angle-main', `${angle % 360}deg`)
    })
  }
}

/**
 * Loads the current state from storage and updates the UI.
 * Retrieves deck count and settings, then updates toggles and loads user information.
 */
const loadState = async () => {
  const { mv } = await storage.decks.get()
  console.debug(`KFA: POP: Deck count: ${Object.keys(mv).length}`)
  const deckCountElement = document.getElementById('deck-count')
  if (deckCountElement) {
    deckCountElement.textContent = Object.keys(mv || {}).length.toLocaleString()
  }

  const settings = await storage.settings.get()
  html.toggleState('link-dok-toggle', settings.linkDok)
  html.toggleState('sync-auto-toggle', settings.syncAuto)
  html.toggleState('sync-dok-toggle', settings.syncDok)
  html.toggleState('sync-tco-toggle', settings.syncTco)

  loadUsers(settings)
}

/**
 * Loads and displays user information for all enabled services.
 * Handles login states and updates UI accordingly.
 * Waits for all user authentication checks before enabling sync controls.
 *
 * @param settings - The current extension settings
 */
const loadUsers = async (settings: Settings) => {
  const userPromises = [
    html.userLoad(
      'mv-username',
      `${conf.mvBaseUrl}/my-decks`,
      getCredsMv,
      conf.btn.loginMv,
    ),
  ]

  if (settings.syncDok) {
    userPromises.push(
      html.userLoad(
        'dok-username',
        conf.dokBaseUrl,
        getCredsDok,
        conf.btn.loginDok,
      ),
    )
  }

  if (settings.syncTco) {
    userPromises.push(
      html.userLoad(
        'tco-username',
        conf.tcoBaseUrl,
        getCredsTco,
        conf.btn.loginTco,
      ),
    )
  }

  await Promise.allSettled(userPromises)
    .then(async (r: PromiseSettledResult<void>[]) => {
      if (
        !r.every(r => {
          return r.status === 'fulfilled'
        })
      ) {
        return console.debug(`KFA POP: Not logged in to all accounts`)
      }
      console.debug(`KFA: POP: Logged in to all accounts`)
      await syncStatus(false)
      resetButtons()
    })
    .catch((error: Error) => {
      console.warn(`KFA: POP: Error loading users: ${JSON.stringify(error)}`)
    })
}

/**
 * Handles messages from background script.
 * Processes various message types including sync events, errors, and deck count updates.
 *
 * @param message - Message object from background script
 * @param message.type - Type of message (SYNC_COMPLETE, SYNC_ERROR, DECK_COUNT, etc.)
 * @param message.error - Error message if type is SYNC_ERROR
 * @param message.decks - Deck count if type is DECK_COUNT
 */
const handleMessages = async (message: SyncMessage): Promise<boolean> => {
  switch (message.type) {
    case 'DECK_COUNT':
      deckCount(message.decks)
      break

    case 'RELOAD_USERS':
      console.debug(`KFA: POP: Reloading users`)
      loadState()
      break

    case 'SYNC_COMPLETE':
      console.debug(`KFA: POP: Sync completed`)
      resetButtons()
      break

    case 'SYNC_ERROR':
      console.warn(`KFA: POP: Sync failed: ${message.error}`)
      resetButtons()
      break

    case 'SYNC_START':
      syncStatus(true)
      break

    default:
      console.debug(`KFA: POP: Unknown message type: ${message.type}`)
  }
  return false
}

/**
 * Cancels ongoing synchronization processes.
 * Removes sync flags from storage and reloads the extension runtime.
 */
const cancelSync = (): void => {
  console.debug(`KFA: POP: Reloading extension`)
  browser.reload()
}

/**
 * Updates the deck count display in the UI.
 *
 * @param count - The number of decks to display
 */
const deckCount = (count: number): void => {
  const deckCountElement = document.getElementById('deck-count')
  if (deckCountElement) {
    deckCountElement.textContent = (count || '0').toLocaleString()
  }
}

/**
 * Clears all extension data from local storage.
 * Updates UI to show confirmation and reloads state.
 */
const clearData = (): void => {
  chrome.storage.local.clear(() => {
    console.debug(`KFA: POP: All data cleared`)
    loadState()
  })

  const clearDataElement = document.getElementById('clear-data')
  if (clearDataElement && clearDataElement instanceof HTMLButtonElement) {
    clearDataElement.textContent = 'Data Cleared!'
    clearDataElement.disabled = true
    setTimeout(() => {
      clearDataElement.textContent = conf.btn.clearData
      clearDataElement.disabled = false
    }, conf.timeoutMs)
  }
}

/**
 * Loads and displays a random quote from the configuration.
 */
const loadQuotes = (): void => {
  const quoteElement = document.getElementById('quote')
  if (quoteElement) {
    quoteElement.textContent =
      conf.quotes[Math.floor(Math.random() * conf.quotes.length)]
  }
}

/**
 * Resets all UI elements to their default non-syncing state.
 * Re-enables buttons and toggles, updates text content.
 */
const resetButtons = async () => {
  console.debug(`KFA: POP: Resetting buttons`)
  html.toggleDisabled('link-dok-toggle', false)
  html.toggleDisabled('sync-auto-toggle', false)
  html.toggleDisabled('sync-dok-toggle', false)
  html.toggleDisabled('sync-tco-toggle', false)
  html.buttonUpdate('sync-decks', syncDecks, conf.btn.syncDecks, false)

  const clearDataElement = document.getElementById('clear-data')
  if (clearDataElement && clearDataElement instanceof HTMLButtonElement) {
    if (clearDataElement.textContent !== conf.btn.clearData) {
      html.buttonUpdate('clear-data', clearData, conf.btn.syncFinished, true)
      await timer.sleep(conf.btn.resetMs)
    }
    clearDataElement.textContent = conf.btn.clearData
    clearDataElement.disabled = false
  }
}

/**
 * Triggers a deck synchronization process.
 * Updates UI state and sends sync start message to background script.
 */
const syncDecks = (): void => {
  console.debug(`KFA: POP: Sync starting`)
  syncStatus(true)
  browser.sendMessage({ type: 'SYNC_START' })
}

/**
 * Monitors sync status and updates UI accordingly.
 * Continues checking while any sync process is active.
 *
 * @param wait - Whether to wait for sync to start
 */
const syncStatus = async (wait: boolean) => {
  console.debug(`KFA: POP: Checking sync status`)
  await timer.monitorSync(conf.syncMessages, wait, syncStatusUpdate)
  console.debug(`KFA: POP: Sync finished`)
}

/**
 * Updates the UI to show sync is in progress.
 * Disables controls and shows animated sync text.
 *
 * @param text - The sync status text to display
 */
const syncStatusUpdate = async (text: string) => {
  document.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
    if (toggle instanceof HTMLInputElement) {
      toggle.disabled = true
    }
  })

  await html.buttonUpdate('sync-decks', syncDecks, text, true)
  await html.buttonUpdate('clear-data', cancelSync, conf.btn.cancelSync, false)

  // Randomly rotate the background gradients
  const body = document.querySelector('body')
  if (body) {
    const currentCount =
      parseFloat(
        getComputedStyle(body)
          .getPropertyValue('--count')
          .trim()
          .replace('deg', ''),
      ) || 0
    const newCount = currentCount + Math.floor(Math.random() * 240) + 60
    // console.debug(`KFA: POP: Rotating background gradient`)
    body.style.setProperty('--count', `${newCount % 360}deg`)
  }
}
