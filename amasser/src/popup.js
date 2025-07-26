// Popup script for KeyForge Amasser extension
document.addEventListener('DOMContentLoaded', async () => {
  // Set up event listeners
  setupEventListeners()

  // Load initial data
  await loadState()

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(message => {
    handleBackgroundMessage(message)
  })
})

// TODO: stop all clicks while running
// TODO: don't allow clicks while bg syncing
// TODO: check if logged in first
// TODO: show MV/DoK/TCO username

function setupEventListeners() {
  // Toggle event listners
  const syncDokToggle = document.getElementById('sync-dok-toggle')
  if (syncDokToggle) {
    syncDokToggle.addEventListener('change', async () => {
      await chrome.storage.local.set({
        syncDok:
          syncDokToggle instanceof HTMLInputElement && syncDokToggle.checked,
      })
    })
  }
  const syncTcoToggle = document.getElementById('sync-tco-toggle')
  if (syncTcoToggle) {
    syncTcoToggle.addEventListener('change', async () => {
      await chrome.storage.local.set({
        syncTco:
          syncTcoToggle instanceof HTMLInputElement && syncTcoToggle.checked,
      })
    })
  }
  const syncDailyToggle = document.getElementById('sync-daily-toggle')
  if (syncDailyToggle) {
    syncDailyToggle.addEventListener('change', async () => {
      await chrome.storage.local.set({
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

async function getStorage() {
  return new Promise(resolve => {
    chrome.storage.local.get(null, result => {
      resolve(result)
    })
  })
}

async function loadState() {
  const data = await getStorage()

  const deckCountElem = document.getElementById('deck-count')
  if (deckCountElem) {
    deckCountElem.textContent = Object.keys(data.decks || {}).length.toString()
  }

  const syncDokToggle = document.getElementById('sync-dok-toggle')
  const syncTcoToggle = document.getElementById('sync-tco-toggle')
  const syncDailyToggle = document.getElementById('sync-daily-toggle')
  if (!syncDokToggle || !syncTcoToggle || !syncDailyToggle) {
    console.error('Sync toggles not found in popup')
    return
  }
  // Set toggle states based on stored data
  if (data.syncDok === undefined) {
    // Default to true if not set
    data.syncDok = true
  }
  if (data.syncTco === undefined) {
    // Default to true if not set
    data.syncTco = false
  }
  if (data.syncDaily === undefined) {
    // Default to true if not set
    data.syncDaily = false
  }
  // Update toggle states
  console.log('Setting sync toggles:', {
    syncDok: data.syncDok,
    syncTco: data.syncTco,
    syncDaily: data.syncDaily,
  })

  // Set toggle states
  if (syncDokToggle) {
    syncDokToggle instanceof HTMLInputElement &&
      (syncDokToggle.checked = data.syncDok || false)
  }
  if (syncTcoToggle) {
    syncTcoToggle instanceof HTMLInputElement &&
      (syncTcoToggle.checked = data.syncTco || false)
  }
  if (syncDailyToggle) {
    syncDailyToggle instanceof HTMLInputElement &&
      (syncDailyToggle.checked = data.syncDaily || false)
  }

  console.log('Current value: ', Object.keys(data.decks || {}).length)
}

// Trigger a deck sync
function syncDecks() {
  console.log('Syncing decks from popup..')

  // Update button state
  handleSyncStatus('Syncing...')

  chrome.runtime.sendMessage({ type: 'DECK_SYNC' })
}

// Clear all data from local storage
async function clearData() {
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
function handleBackgroundMessage(message) {
  switch (message.type) {
    case 'SYNC_COMPLETE':
      updateDeckCount(message.totalDecks)
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
function updateDeckCount(count) {
  const deckCountElement = document.getElementById('deck-count')
  if (deckCountElement) {
    deckCountElement.textContent = count || '0'
  }
}

/**
 * Reset sync button to default state
 */
function resetButtons() {
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
function handleSyncStatus(message) {
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
          .replace('deg', '')
      ) || 0
    const newCount = currentCount + Math.floor(Math.random() * 240) + 60
    body.style.setProperty('--count', `${newCount % 360}deg`)
  }
}
