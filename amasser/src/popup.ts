import { getCredsDok } from './bg-dok.js'
import { getCredsMv } from './bg-mv.js'
import { getCredsTco } from './bg-tco.js'
import { conf } from './conf.js'
import { browser } from './lib-browser.js'
import { storage } from './lib-storage.js'
import { lib } from './lib.js'

// Used to remove event listeners as buttons change functionality
let abortClearDataButton = new AbortController()
let abortSyncButton = new AbortController()

/**
 * Main entry point for the KeyForge Amasser extension popup
 * Initializes event listeners, loads quotes, state, and user information
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Set up event listeners
  setupEventListeners()

  // Load quotes
  loadQuotes()

  // Load state from storage
  const state = await loadState()

  // Load user information for all enabled services
  await loadUsers(state.settings)
})

/**
 * Sets up all event listeners for the popup interface
 * Includes message listeners, toggle controls, buttons, and mouse interactions
 */
const setupEventListeners = async () => {
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(message => {
    handleBackgroundMessage(message)
  })

  // Toggle event listeners
  const syncDokToggle = document.getElementById('sync-dok-toggle')
  if (syncDokToggle) {
    syncDokToggle.addEventListener('change', async () => {
      await chrome.storage.sync.set({
        syncDok:
          syncDokToggle instanceof HTMLInputElement && syncDokToggle.checked,
      })
      loadState().then(state => loadUsers(state.settings))
    })
  }
  const syncTcoToggle = document.getElementById('sync-tco-toggle')
  if (syncTcoToggle) {
    syncTcoToggle.addEventListener('change', async () => {
      await chrome.storage.sync.set({
        syncTco:
          syncTcoToggle instanceof HTMLInputElement && syncTcoToggle.checked,
      })
      loadState().then(state => loadUsers(state.settings))
    })
  }
  const syncAutoToggle = document.getElementById('sync-auto-toggle')
  if (syncAutoToggle) {
    syncAutoToggle.addEventListener('change', async () => {
      await chrome.storage.sync.set({
        syncAuto:
          syncAutoToggle instanceof HTMLInputElement && syncAutoToggle.checked,
      })
    })
  }

  // Button event listeners
  const syncDecksBtn = document.getElementById('sync-decks')
  if (syncDecksBtn) {
    syncDecksBtn.addEventListener('click', syncDecks, {
      signal: abortSyncButton.signal,
    })
  }
  const clearDataBtn = document.getElementById('clear-data')
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', clearData, {
      signal: abortClearDataButton.signal,
    })
  }

  // Background gradient effect
  const body = document.querySelector('body')
  const main = document.querySelector('main')
  if (body && main) {
    document.addEventListener('mousemove', e => {
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
 * Loads the current state from storage and updates the UI
 * @returns {Promise<{decks: object, settings: Settings}>} The loaded decks and settings
 */
const loadState = async () => {
  const settings: Settings = await chrome.storage.sync.get()

  const { mv: decks } = await storage.decks.get()

  const deckCountElem = document.getElementById('deck-count')
  if (deckCountElem) {
    deckCountElem.textContent = Object.keys(decks || {}).length.toLocaleString()
  }

  const syncDokToggle = document.getElementById(
    'sync-dok-toggle',
  ) as HTMLInputElement
  const syncTcoToggle = document.getElementById(
    'sync-tco-toggle',
  ) as HTMLInputElement
  const syncAutoToggle = document.getElementById(
    'sync-auto-toggle',
  ) as HTMLInputElement
  if (!syncDokToggle || !syncTcoToggle || !syncAutoToggle) {
    console.warn(`KFA: POP: Sync toggle elements not found`)
    return
  }
  // Set toggle states based on stored data
  if (settings.syncDok === undefined) {
    // Default to true if not set
    settings.syncDok = conf.defaults.syncDok
  }
  if (settings.syncTco === undefined) {
    // Default to true if not set
    settings.syncTco = conf.defaults.syncTco
  }
  if (settings.syncAuto === undefined) {
    // Default to true if not set
    settings.syncAuto = conf.defaults.syncAuto
  }
  // Update toggle states
  console.debug(
    `KFA: POP: Setting sync toggles: DoK: ${settings.syncDok}, TCO: ${settings.syncTco}, Auto: ${settings.syncAuto}`,
  )

  // Set toggle states
  if (syncDokToggle) {
    syncDokToggle instanceof HTMLInputElement &&
      (syncDokToggle.checked = settings.syncDok || false)
  }
  if (syncTcoToggle) {
    syncTcoToggle instanceof HTMLInputElement &&
      (syncTcoToggle.checked = settings.syncTco || false)
  }
  if (syncAutoToggle) {
    syncAutoToggle instanceof HTMLInputElement &&
      (syncAutoToggle.checked = settings.syncAuto || false)
  }

  console.debug(`KFA: POP: Deck count: ${Object.keys(decks || {}).length}`)
  return { decks, settings }
}

/**
 * Triggers a deck synchronization process
 * Updates UI state and sends sync start message to background script
 */
const syncDecks = () => {
  console.debug(`KFA: POP: Sync starting`)

  // Update button state
  handleSyncStatus(conf.syncMessages[0])
  checkSyncStatus(true)
  chrome.runtime.sendMessage({ type: 'SYNC_START' }).catch(error => {
    console.warn(`KFA: POP: Error sending sync message: ${error}`)
  })
}

/**
 * Clears all extension data from local storage
 * Updates UI to show confirmation and reloads state
 */
const clearData = () => {
  chrome.storage.local.clear(() => {
    console.debug(`KFA: POP: All data cleared`)
    loadState().then(state => loadUsers(state.settings))
  })

  const clearDataButton = document.getElementById('clear-data')
  if (clearDataButton && clearDataButton instanceof HTMLButtonElement) {
    clearDataButton.textContent = 'Data Cleared!'
    clearDataButton.disabled = true
    // TODO: use lib.sleep?
    setTimeout(() => {
      clearDataButton.textContent = 'Clear Data'
      clearDataButton.disabled = false
    }, conf.timeoutMs)
  }
}

/**
 * Handle messages from background script
 * @param {object} message - Message object from background script
 * @param {string} message.type - Type of message (SYNC_COMPLETE, SYNC_ERROR, etc.)
 * @param {string} [message.error] - Error message if type is SYNC_ERROR
 * @param {number} [message.decks] - Deck count if type is SYNC_STATUS
 */
const handleBackgroundMessage = async message => {
  switch (message.type) {
    case 'DECK_COUNT':
      if (message.decks !== undefined) {
        updateDeckCount(message.decks)
      }
      break

    case 'RELOAD_USERS':
      console.debug(`KFA: POP: Reloading users`)
      const state = await loadState()
      await loadUsers(state.settings)
      break

    case 'SYNC_COMPLETE':
      resetButtons()
      console.debug(`KFA: POP: Sync completed`)
      break

    case 'SYNC_ERROR':
      resetButtons()
      console.warn(`KFA: POP: Sync failed: ${message.error}`)
      break

    case 'SYNC_START':
      checkSyncStatus(true)
      break

    default:
      console.debug(`KFA: POP: Unknown message type: ${message.type}`)
  }
}

/**
 * Update the deck count display in the UI
 * @param {number} count - The number of decks to display
 */
const updateDeckCount = count => {
  const deckCountElement = document.getElementById('deck-count')
  if (deckCountElement) {
    deckCountElement.textContent = (count || '0').toLocaleString()
  }
}

/**
 * Cancels ongoing synchronization processes
 * Removes sync flags from storage and reloads the extension runtime
 */
const cancelSync = () => {
  console.debug(`KFA: POP: Cancelling sync`)
  chrome.storage.local
    .remove(['syncingMv', 'syncingDok', 'syncingTco'])
    .then(() => browser.extensionReload())
}

/**
 * Reset all UI elements to their default non-syncing state
 * Re-enables buttons and toggles, updates text content
 */
const resetButtons = async () => {
  console.debug(`KFA: POP: Resetting buttons`)
  const syncDokToggle = document.getElementById('sync-dok-toggle')
  if (syncDokToggle && syncDokToggle instanceof HTMLInputElement) {
    syncDokToggle.disabled = false
  }

  const syncTcoToggle = document.getElementById('sync-tco-toggle')
  if (syncTcoToggle && syncTcoToggle instanceof HTMLInputElement) {
    syncTcoToggle.disabled = false
  }

  const syncAutoToggle = document.getElementById('sync-auto-toggle')
  if (syncAutoToggle && syncAutoToggle instanceof HTMLInputElement) {
    syncAutoToggle.disabled = false
  }

  const syncButton = document.getElementById('sync-decks')
  if (syncButton && syncButton instanceof HTMLButtonElement) {
    await abortSyncButton.abort()
    abortSyncButton = new AbortController()
    syncButton.addEventListener('click', syncDecks, {
      signal: abortSyncButton.signal,
    })
    syncButton.disabled = false
    syncButton.textContent = 'Sync Decks'
  }

  const clearDataButton = document.getElementById('clear-data')
  if (clearDataButton && clearDataButton instanceof HTMLButtonElement) {
    if (clearDataButton.textContent !== 'Clear Data') {
      clearDataButton.disabled = true
      clearDataButton.textContent = 'Sync Finished'
      await abortClearDataButton.abort()
      abortClearDataButton = new AbortController()
      clearDataButton.addEventListener('click', clearData, {
        signal: abortClearDataButton.signal,
      })
      await lib.sleep(conf.clearDataButtonResetMs)
    }
    clearDataButton.textContent = 'Clear Data'
    clearDataButton.disabled = false
  }
}

/**
 * Monitors sync status and updates UI accordingly
 * Continues checking while any sync process is active
 * @param {boolean} [wait=false] - Whether to wait for sync to start
 */
const checkSyncStatus = async (wait: boolean = false) => {
  console.debug(`KFA: POP: Checking sync status`)
  let now = Date.now()
  let shift = 0
  let s = await chrome.storage.local.get([
    'syncingDok',
    'syncingMv',
    'syncingTco',
  ])
  while (
    wait ||
    (typeof s.syncingDok === 'number' &&
      now - s.syncingDok < conf.staleSyncMs) ||
    (typeof s.syncingMv === 'number' && now - s.syncingMv < conf.staleSyncMs) ||
    (typeof s.syncingTco === 'number' && now - s.syncingTco < conf.staleSyncMs)
  ) {
    handleSyncStatus(conf.syncMessages[shift])

    shift = (shift + 1) % conf.syncMessages.length
    await lib.sleep(conf.rotateAgainMs)

    s = await chrome.storage.local.get([
      'syncingDok',
      'syncingMv',
      'syncingTco',
    ])
    now = Date.now()
    if (Object.keys(s).length !== 0) {
      wait = false
    }

    // console.debug(
    //   `KFA: POP: Check sync status: Syncing timestamps: MV: ${now - s.syncingMv || 0}ms DoK: ${
    //     now - s.syncingDok || 0
    //   }ms TCO: ${now - s.syncingTco || 0}ms Wait: ${wait}`,
    // )
  }
  console.debug(`KFA: POP: Sync finished`)
}

/**
 * Updates the UI to show sync is in progress
 * Disables controls and shows animated sync text
 * @param {string} text - The sync status text to display
 */
const handleSyncStatus = async text => {
  document.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
    if (toggle instanceof HTMLInputElement) {
      toggle.disabled = true
    }
  })

  document.querySelectorAll('button').forEach(btn => {
    if (btn instanceof HTMLButtonElement) {
      btn.disabled = true
    }
  })

  const syncButton = document.getElementById('sync-decks')
  if (syncButton && syncButton instanceof HTMLButtonElement) {
    syncButton.textContent = text
    const clearDataButton = document.getElementById('clear-data')
    if (clearDataButton && clearDataButton instanceof HTMLButtonElement) {
      await abortClearDataButton.abort()
      abortClearDataButton = new AbortController()
      clearDataButton.addEventListener('click', cancelSync, {
        signal: abortClearDataButton.signal,
      })
      clearDataButton.textContent = 'Cancel Sync'
      clearDataButton.disabled = false
    }
  }

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

/**
 * Loads and displays user information for all enabled services
 * Handles login states and updates UI accordingly
 * @param {Settings} settings - The current extension settings
 */
const loadUsers = async settings => {
  const userPromises = []

  userPromises.push(
    (async () => {
      console.debug(`KFA: POP: Getting MV username`)
      const { username: userMv } = await getCredsMv()
      if (userMv) {
        // Show the MV username element
        const mvUsernameElem = document.getElementById('mv-username')
        if (mvUsernameElem) {
          mvUsernameElem.textContent = `: ${userMv}`
          mvUsernameElem.style.display = 'inline'
        }
        console.debug(`KFA: POP: MV username: ${userMv}`)
      } else {
        console.debug(`KFA: POP: Not logged in to MV`)
        // Reset the sync button to open MV login page
        const syncButton = document.getElementById('sync-decks')
        if (syncButton && syncButton instanceof HTMLButtonElement) {
          await abortSyncButton.abort()
          abortSyncButton = new AbortController()
          syncButton.addEventListener(
            'click',
            () => {
              chrome.tabs.create({ url: `${conf.mvBaseUrl}/my-decks` })
            },
            { signal: abortSyncButton.signal },
          )
          syncButton.textContent = 'Login to MV'
          syncButton.disabled = false
        }

        // Hide the MV username element
        const mvUsernameElem = document.getElementById('mv-username')
        if (mvUsernameElem) {
          mvUsernameElem.textContent = ``
          mvUsernameElem.style.display = 'inline'
        }
        throw new Error('KFA: POP: Not logged into MV')
      }
    })(),
  )

  if (settings.syncDok) {
    userPromises.push(
      (async () => {
        console.debug(`KFA: POP: Getting DoK username`)
        const { username } = await getCredsDok()

        if (username) {
          // Show the DoK username element
          const dokUsernameElem = document.getElementById('dok-username')
          if (dokUsernameElem) {
            dokUsernameElem.textContent = `: ${username}`
            dokUsernameElem.style.display = 'inline'
          }
          console.debug(`KFA: POP: DoK username: ${username}`)
        } else {
          console.debug(`KFA: POP: Not logged in to DoK`)
          // Reset the sync button to open DoK login page
          const syncButton = document.getElementById('sync-decks')
          if (
            syncButton &&
            syncButton instanceof HTMLButtonElement &&
            syncButton.textContent !== 'Login to MV'
          ) {
            await abortSyncButton.abort()
            abortSyncButton = new AbortController()
            syncButton.addEventListener(
              'click',
              () => {
                chrome.tabs.create({ url: conf.dokBaseUrl })
              },
              { signal: abortSyncButton.signal },
            )
            syncButton.textContent = 'Login to DoK'
            syncButton.disabled = false
          }

          // Hide the DoK username element
          const dokUsernameElem = document.getElementById('dok-username')
          if (dokUsernameElem) {
            dokUsernameElem.textContent = ``
            dokUsernameElem.style.display = 'inline'
          }
          throw new Error('KFA: POP: Not logged into DoK')
        }
      })(),
    )
  } else {
    const dokUsernameElem = document.getElementById('dok-username')
    if (dokUsernameElem) {
      dokUsernameElem.textContent = ``
      dokUsernameElem.style.display = 'inline'
    }
  }

  if (settings.syncTco) {
    userPromises.push(
      (async () => {
        console.debug(`KFA: POP: Getting TCO username`)
        const { username } = await getCredsTco()
        if (username) {
          // Show the TCO username element
          const tcoUsernameElem = document.getElementById('tco-username')
          if (tcoUsernameElem) {
            tcoUsernameElem.textContent = `: ${username}`
            tcoUsernameElem.style.display = 'inline'
          }
          console.debug(`KFA: POP: TCO username: ${username}`)
        } else {
          console.debug(`KFA: POP: Not logged in to TCO`)
          // Reset the sync button to open TCO login page
          const syncButton = document.getElementById('sync-decks')
          if (
            syncButton &&
            syncButton instanceof HTMLButtonElement &&
            syncButton.textContent !== 'Login to MV' &&
            syncButton.textContent !== 'Login to DoK'
          ) {
            await abortSyncButton.abort()
            abortSyncButton = new AbortController()
            await syncButton.addEventListener(
              'click',
              () => {
                chrome.tabs.create({ url: conf.tcoBaseUrl })
              },
              { signal: abortSyncButton.signal },
            )
            syncButton.textContent = 'Login to TCO'
            syncButton.disabled = false
          }

          // Hide the TCO username element
          const tcoUsernameElem = document.getElementById('tco-username')
          if (tcoUsernameElem) {
            tcoUsernameElem.textContent = ``
            tcoUsernameElem.style.display = 'inline'
          }
          throw new Error('KFA: POP: Not logged into TCO')
        }
      })(),
    )
  } else {
    const tcoUsernameElem = document.getElementById('tco-username')
    if (tcoUsernameElem) {
      tcoUsernameElem.textContent = ``
      tcoUsernameElem.style.display = 'inline'
    }
  }

  await Promise.allSettled(userPromises)
    .then(async results => {
      if (
        !results.every(r => {
          return r.status === 'fulfilled'
        })
      ) {
        return console.debug(`KFA POP: Not logged in to all accounts`)
      }
      console.debug(`KFA: POP: Logged in to all accounts`)
      await checkSyncStatus()
      resetButtons()
    })
    .catch(error => {
      console.warn(`KFA: POP: Error loading users: ${JSON.stringify(error)}`)
    })
}

/**
 * Loads and displays a random quote from the configuration
 */
const loadQuotes = () => {
  const quoteElem = document.getElementById('quote')
  if (quoteElem) {
    quoteElem.textContent =
      conf.quotes[Math.floor(Math.random() * conf.quotes.length)]
  }
}

// TODO: all the textContent to conf
