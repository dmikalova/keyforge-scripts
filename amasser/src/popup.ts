import { getDokToken, getDokUser } from './bg-dok.js'
import { getMvAuth } from './bg-mv.js'
import { getTcoRefreshToken, getTcoUser } from './bg-tco.js'
import { getDecksFromStorage } from './lib.js'
import { quotes } from './quotes.js'

// Popup script for KeyForge Amasser extension
document.addEventListener('DOMContentLoaded', async () => {
  // Load quotes
  loadQuotes()

  // Load state from storage
  const state = await loadState()

  // Set up event listeners
  setupEventListeners()

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(message => {
    handleBackgroundMessage(message)
  })

  await loadUsers(state.settings)
})

const setupEventListeners = async () => {
  // Toggle event listeners
  const syncDokToggle = document.getElementById('sync-dok-toggle')
  if (syncDokToggle) {
    syncDokToggle.addEventListener('change', async () => {
      await chrome.storage.sync.set({
        'sync-dok':
          syncDokToggle instanceof HTMLInputElement && syncDokToggle.checked,
      })
      loadState().then(state => loadUsers(state.settings))
    })
  }
  const syncTcoToggle = document.getElementById('sync-tco-toggle')
  if (syncTcoToggle) {
    syncTcoToggle.addEventListener('change', async () => {
      await chrome.storage.sync.set({
        'sync-tco':
          syncTcoToggle instanceof HTMLInputElement && syncTcoToggle.checked,
      })
      loadState().then(state => loadUsers(state.settings))
    })
  }
  const syncAutoToggle = document.getElementById('sync-auto-toggle')
  if (syncAutoToggle) {
    syncAutoToggle.addEventListener('change', async () => {
      await chrome.storage.sync.set({
        'sync-auto':
          syncAutoToggle instanceof HTMLInputElement && syncAutoToggle.checked,
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

const loadState = async () => {
  const settings: Settings = await chrome.storage.sync.get()

  const { mv: decks } = await getDecksFromStorage()

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
    console.error('Sync toggles not found in popup')
    return
  }
  // Set toggle states based on stored data
  if (settings['sync-dok'] === undefined) {
    // Default to true if not set
    settings['sync-dok'] = true
  }
  if (settings['sync-tco'] === undefined) {
    // Default to true if not set
    settings['sync-tco'] = false
  }
  if (settings['sync-auto'] === undefined) {
    // Default to true if not set
    settings['sync-auto'] = false
  }
  // Update toggle states
  console.debug('Setting sync toggles:', {
    'sync-dok': settings['sync-dok'],
    'sync-tco': settings['sync-tco'],
    'sync-auto': settings['sync-auto'],
  })

  // Set toggle states
  if (syncDokToggle) {
    syncDokToggle instanceof HTMLInputElement &&
      (syncDokToggle.checked = settings['sync-dok'] || false)
  }
  if (syncTcoToggle) {
    syncTcoToggle instanceof HTMLInputElement &&
      (syncTcoToggle.checked = settings['sync-tco'] || false)
  }
  if (syncAutoToggle) {
    syncAutoToggle instanceof HTMLInputElement &&
      (syncAutoToggle.checked = settings['sync-auto'] || false)
  }

  console.debug('Current value: ', Object.keys(decks || {}).length)

  return { decks, settings }
}

// Trigger a deck sync
const syncDecks = () => {
  console.debug('Syncing decks from popup..')

  // Update button state
  handleSyncStatus('Syncing...')

  chrome.runtime.sendMessage({ type: 'SYNC_START' })
}

// Clear all data from local storage
const clearData = () => {
  chrome.storage.local.clear(() => {
    console.debug('All data cleared')
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
      console.debug('Deck sync complete in popup')
      resetButtons()
      console.debug('Sync completed successfully!')
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
      console.debug('Unknown message type:', message.type)
  }
}

/**
 * Update the deck count display
 */
const updateDeckCount = count => {
  const deckCountElement = document.getElementById('deck-count')
  if (deckCountElement) {
    deckCountElement.textContent = (count || '0').toLocaleString()
  }
}

/**
 * Reset sync button to default state
 */
const resetButtons = () => {
  console.debug('Resetting buttons to default state')
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
        console.debug('Master Vault user found:', userMv)
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

  if (settings['sync-dok']) {
    userPromises.push(
      (async () => {
        console.debug('Getting DoK username')
        const token = await getDokToken()
        if (token) {
          const user = await getDokUser(token)
          const dokUsernameElem = document.getElementById('dok-username')
          if (dokUsernameElem) {
            dokUsernameElem.textContent = `: ${user}`
            dokUsernameElem.style.display = 'inline'
          }
        } else {
          const syncButton = document.getElementById('sync-decks')
          console.debug('Sync button found?')
          if (syncButton && syncButton instanceof HTMLButtonElement) {
            console.debug('Sync button found, replacing it')
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
          throw new Error('No DoK user found')
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

  if (settings['sync-tco']) {
    userPromises.push(
      (async () => {
        console.debug('Getting TCO username')
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
          throw new Error('No TCO user found')
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

  await Promise.all(userPromises)
    .then(() => {
      console.debug('Logged in!')
      resetButtons()
    })
    .catch(error => {
      console.error('Error loading users:', error)
    })
}

const loadQuotes = () => {
  const quoteElem = document.getElementById('quote')
  if (quoteElem) {
    quoteElem.textContent = quotes[Math.floor(Math.random() * quotes.length)]
  }
}
