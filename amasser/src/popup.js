import { getDokToken, getDokUser } from './bg-dok.js'
import { getMvAuth } from './bg-mv.js'
import { getTcoRefreshToken, getTcoUser } from './bg-tco.js'
import { getLocalDecks } from './lib.js'

// Popup script for KeyForge Amasser extension
document.addEventListener('DOMContentLoaded', async () => {
  // Set up event listeners
  setupEventListeners()

  // Load initial data
  const state = await loadState()

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(message => {
    handleBackgroundMessage(message)
  })

  await loadUsers(state.settings)
})

const setupEventListeners = async () => {
  // Toggle event listners
  const syncDokToggle = document.getElementById('sync-dok-toggle')
  if (syncDokToggle) {
    syncDokToggle.addEventListener('change', async () => {
      await chrome.storage.sync.set({
        syncDok:
          syncDokToggle instanceof HTMLInputElement && syncDokToggle.checked,
      })
    })
  }
  const syncTcoToggle = document.getElementById('sync-tco-toggle')
  if (syncTcoToggle) {
    syncTcoToggle.addEventListener('change', async () => {
      await chrome.storage.sync.set({
        syncTco:
          syncTcoToggle instanceof HTMLInputElement && syncTcoToggle.checked,
      })
    })
  }
  const syncDailyToggle = document.getElementById('sync-daily-toggle')
  if (syncDailyToggle) {
    syncDailyToggle.addEventListener('change', async () => {
      await chrome.storage.sync.set({
        syncDaily:
          syncDailyToggle instanceof HTMLInputElement &&
          syncDailyToggle.checked,
      })
    })
  }

  // Button event listeners
  const syncDecksBtn = document.getElementById('sync-decks')
  if (syncDecksBtn) {
    syncDecksBtn.addEventListener('click', syncDecks)
  }
  const clearDataBtn = document.getElementById('clear-data')
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', clearData)
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

const getSettings = async () => {
  return new Promise(resolve => {
    chrome.storage.sync.get(null, result => {
      resolve(result)
    })
  })
}

const loadState = async () => {
  const settings = await getSettings()
  console.log('loaded settings:', settings)

  const decks = await getLocalDecks()
  console.log('loaded decks:', decks)

  const deckCountElem = document.getElementById('deck-count')
  if (deckCountElem) {
    deckCountElem.textContent = Object.keys(decks || {}).length.toString()
  }

  const syncDokToggle = document.getElementById('sync-dok-toggle')
  const syncTcoToggle = document.getElementById('sync-tco-toggle')
  const syncDailyToggle = document.getElementById('sync-daily-toggle')
  if (!syncDokToggle || !syncTcoToggle || !syncDailyToggle) {
    console.error('Sync toggles not found in popup')
    return
  }
  // Set toggle states based on stored data
  if (settings.syncDok === undefined) {
    // Default to true if not set
    settings.syncDok = true
  }
  if (settings.syncTco === undefined) {
    // Default to true if not set
    settings.syncTco = false
  }
  if (settings.syncDaily === undefined) {
    // Default to true if not set
    settings.syncDaily = false
  }
  // Update toggle states
  console.log('Setting sync toggles:', {
    syncDok: settings.syncDok,
    syncTco: settings.syncTco,
    syncDaily: settings.syncDaily,
  })

  // Set toggle states
  if (syncDokToggle) {
    syncDokToggle instanceof HTMLInputElement &&
      (syncDokToggle.checked = settings.syncDok || false)
  }
  if (syncTcoToggle) {
    syncTcoToggle instanceof HTMLInputElement &&
      (syncTcoToggle.checked = settings.syncTco || false)
  }
  if (syncDailyToggle) {
    syncDailyToggle instanceof HTMLInputElement &&
      (syncDailyToggle.checked = settings.syncDaily || false)
  }

  console.log('Current value: ', Object.keys(decks || {}).length)

  return { decks, settings }
}

// Trigger a deck sync
const syncDecks = () => {
  console.log('Syncing decks from popup..')

  // Update button state
  handleSyncStatus('Syncing...')

  chrome.runtime.sendMessage({ type: 'DECK_SYNC' })
}

// Clear all data from local storage
const clearData = () => {
  chrome.storage.local.clear(() => {
    console.log('All data cleared')
    loadState()
  })
  const clearDataButton = document.getElementById('clear-data')
  if (clearDataButton && clearDataButton instanceof HTMLButtonElement) {
    clearDataButton.textContent = 'Data Cleared!'
    clearDataButton.disabled = true
    setTimeout(() => {
      clearDataButton.textContent = 'Clear Data'
      clearDataButton.disabled = false
    }, 1000)
  }
}

/**
 * Handle messages from background script
 */
const handleBackgroundMessage = message => {
  switch (message.type) {
    case 'SYNC_COMPLETE':
      console.log('Deck sync complete in popup')
      resetButtons()
      console.log('Sync completed successfully!')
      break

    case 'SYNC_ERROR':
      resetButtons()
      console.error(`Sync failed: ${message.error}`)
      break

    case 'SYNC_STATUS':
      handleSyncStatus(message.button)
      if (message.decks !== undefined) {
        updateDeckCount(message.decks)
      }
      break

    default:
      console.log('Unknown message type:', message.type)
  }
}

/**
 * Update the deck count display
 */
const updateDeckCount = count => {
  const deckCountElement = document.getElementById('deck-count')
  if (deckCountElement) {
    deckCountElement.textContent = count || '0'
  }
}

/**
 * Reset sync button to default state
 */
const resetButtons = () => {
  const syncDokToggle = document.getElementById('sync-dok-toggle')
  if (syncDokToggle && syncDokToggle instanceof HTMLInputElement) {
    syncDokToggle.disabled = false
  }

  const syncTcoToggle = document.getElementById('sync-tco-toggle')
  if (syncTcoToggle && syncTcoToggle instanceof HTMLInputElement) {
    syncTcoToggle.disabled = false
  }

  const syncDailyToggle = document.getElementById('sync-daily-toggle')
  if (syncDailyToggle && syncDailyToggle instanceof HTMLInputElement) {
    syncDailyToggle.disabled = false
  }

  const syncButton = document.getElementById('sync-decks')
  if (syncButton && syncButton instanceof HTMLButtonElement) {
    syncButton.disabled = false
    syncButton.textContent = 'Sync Decks'
  }

  const clearDataButton = document.getElementById('clear-data')
  if (clearDataButton && clearDataButton instanceof HTMLButtonElement) {
    clearDataButton.disabled = false
  }
}

/**
 * Reset sync button to default state
 */
const handleSyncStatus = message => {
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
    syncButton.textContent = message
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
    body.style.setProperty('--count', `${newCount % 360}deg`)
  }
}

const loadUsers = async settings => {
  const userPromises = []

  // MV user
  userPromises.push(
    (async () => {
      const { username: userMv } = await getMvAuth()
      if (userMv) {
        console.log('Master Vault user found:', userMv)
        const mvUsernameElem = document.getElementById('mv-username')
        if (mvUsernameElem) {
          mvUsernameElem.textContent = `: ${userMv}`
          mvUsernameElem.style.display = 'inline'
        }
      } else {
        console.error('No MV user found')
        const syncButton = document.getElementById('sync-decks')
        if (syncButton && syncButton instanceof HTMLButtonElement) {
          syncButton.replaceWith(syncButton.cloneNode(true))
          const newSyncButton = document.getElementById('sync-decks')
          newSyncButton.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://www.keyforgegame.com/my-decks' })
          })
          newSyncButton.textContent = 'Login to MV'
          if (newSyncButton instanceof HTMLButtonElement) {
            newSyncButton.disabled = false
          }
        }
      }
    })(),
  )

  if (settings.syncDok) {
    userPromises.push(
      (async () => {
        console.log('Getting DoK username')
        const token = await getDokToken()
        if (token) {
          const user = await getDokUser(token)
          const dokUsernameElem = document.getElementById('dok-username')
          if (dokUsernameElem) {
            dokUsernameElem.textContent = `: ${user}`
            dokUsernameElem.style.display = 'inline'
          }
        } else {
          console.error('No DoK user found')
          const syncButton = document.getElementById('sync-decks')
          if (syncButton && syncButton instanceof HTMLButtonElement) {
            syncButton.replaceWith(syncButton.cloneNode(true))
            const newSyncButton = document.getElementById('sync-decks')
            newSyncButton.addEventListener('click', () => {
              chrome.tabs.create({ url: 'https://decksofkeyforge.com/' })
            })
            newSyncButton.textContent = 'Login to DoK'
            if (newSyncButton instanceof HTMLButtonElement) {
              newSyncButton.disabled = false
            }
          }
        }
      })(),
    )
  }

  if (settings.syncTco) {
    userPromises.push(
      (async () => {
        console.log('Getting TCO username')
        const token = await getTcoRefreshToken()
        if (token) {
          const { username } = await getTcoUser(token)
          const tcoUsernameElem = document.getElementById('tco-username')
          if (tcoUsernameElem) {
            tcoUsernameElem.textContent = `: ${username}`
            tcoUsernameElem.style.display = 'inline'
          }
        } else {
          console.error('No TCO user found')
          const syncButton = document.getElementById('sync-decks')
          if (syncButton && syncButton instanceof HTMLButtonElement) {
            syncButton.replaceWith(syncButton.cloneNode(true))
            const newSyncButton = document.getElementById('sync-decks')
            newSyncButton.addEventListener('click', () => {
              chrome.tabs.create({ url: 'https://thecrucible.online/' })
            })
            newSyncButton.textContent = 'Login to TCO'
            if (newSyncButton instanceof HTMLButtonElement) {
              newSyncButton.disabled = false
            }
          }
        }
      })(),
    )
  }

  await Promise.all(userPromises)
  console.log('Logged in!')
  resetButtons()
}
