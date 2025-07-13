// Popup script for KeyForge Amasser extension
document.addEventListener('DOMContentLoaded', async () => {
  // Set up event listeners
  setupEventListeners();

  // Load initial data
  await refreshStats();
  await loadRecentData();
});

function setupEventListeners() {
  // Button event listeners
  const syncDecksBtn = document.getElementById('sync-decks');
  if (syncDecksBtn) {
    syncDecksBtn.addEventListener('click', syncDecks);
  }
  const clearDataBtn = document.getElementById('clear-data');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', clearData);
  }
}

async function getStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (result) => {
      resolve(result);
    });
  });
}

async function refreshStats() {
  const data = await getStorage();
  const entries = Object.entries(data);

  const deckCount = entries.filter(([key]) => key.startsWith('deck_')).length;

  const deckCountElem = document.getElementById('deck-count');
  if (deckCountElem) {
    deckCountElem.textContent = deckCount.toString();
  }
}

async function loadRecentData() {
   const data = await getStorage();
  const entries = Object.entries(data)
    .filter(([key]) => key.startsWith('deck_'))
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 1);

  const recentList = document.getElementById('recent-list');

  if (entries.length === 0) {
    if (recentList) {
      recentList.innerHTML = '<div class="empty-state">No amassed decks</div>';
    }
    return;
  }

  if (recentList) {
    recentList.innerHTML = entries.map(item => {
      const type = item.key.startsWith('deck_') ? 'Deck' : 'Game';
      const name = item.name || item.id || 'Unknown';
      const time = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown time';

      return `
        <div class="recent-item">
          <div class="recent-item-type">${type}</div>
          <div class="recent-item-name">${name}</div>
          <div class="recent-item-time">${time}</div>
        </div>
      `;
    }).join('');
  }
}

async function clearData() {
  if (confirm('Are you sure you want to clear all collected data? This action cannot be undone.')) {
    chrome.storage.local.clear(() => {
      console.log('All data cleared');
      refreshStats();
      loadRecentData();

      // Reset badge
      chrome.action.setBadgeText({ text: '' });
    });
  }
}

// Add the missing syncDecks function
function syncDecks() {
  // TODO: Implement deck syncing logic here
  alert('Sync decks functionality not yet implemented.');
}
