// Popup script for KeyForge Amasser extension
document.addEventListener('DOMContentLoaded', async () => {
  // Set up event listeners
  setupEventListeners()

  // Load initial data
  await loadState()
})

// TODO: stop all clicks while running
// TODO: don't allow clicks while bg syncing
// TODO: check if logged in first
// TODO: show MV/DoK/TCO username

function setupEventListeners() {
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

      // Calculate angle in degrees
      const angle = Math.atan2(x + 2 * y, y - 2 * x) * (180 / Math.PI) * 4

      body.style.setProperty(
        '--gradient-angle-body',
        `${(angle * 2 + x + y) % 360}deg`,
      )
      main.style.setProperty('--gradient-angle-main', `${angle}deg`)
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

  console.log('Current value: ', Object.keys(data.decks).length)
}

// async function refreshStats() {
//   const data = await getStorage()
//   const entries = Object.entries(data)

//   const deckCount = entries.filter(([key]) => key.startsWith('deck_')).length

//   const deckCountElem = document.getElementById('deck-count')
//   if (deckCountElem) {
//     deckCountElem.textContent = deckCount.toString()
//   }
// }

// async function loadRecentData() {
//   const data = await getStorage()
//   const entries = Object.entries(data)
//     .filter(([key]) => key.startsWith('deck_'))
//     .map(([key, value]) => ({ key, ...value }))
//     .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
//     .slice(0, 1)

//   const recentList = document.getElementById('recent-list')

//   if (entries.length === 0) {
//     if (recentList) {
//       recentList.innerHTML = '<div class="empty-state">No amassed decks</div>'
//     }
//     return
//   }

//   if (recentList) {
//     recentList.innerHTML = entries
//       .map(item => {
//         const type = item.key.startsWith('deck_') ? 'Deck' : 'Game'
//         const name = item.name || item.id || 'Unknown'
//         const time = item.timestamp
//           ? new Date(item.timestamp).toLocaleString()
//           : 'Unknown time'

//         return `
//         <div class="recent-item">
//           <div class="recent-item-type">${type}</div>
//           <div class="recent-item-name">${name}</div>
//           <div class="recent-item-time">${time}</div>
//         </div>
//       `
//       })
//       .join('')
//   }
// }

// Trigger a deck sync
function syncDecks() {
  console.log('Syncing decks from popup..')
  chrome.runtime.sendMessage({ type: 'DECK_SYNC' })
}

// Clear all data from local storage
async function clearData() {
  chrome.storage.local.clear(() => {
    console.log('All data cleared')
    loadState()
  })
}
