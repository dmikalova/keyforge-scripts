// Background service worker for the KeyForge Amasser extension
console.log('KeyForge Amasser background script loaded');

// Extension installation/startup
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details);

  // Initialize default settings
  chrome.storage.sync.set({
    syncDok: true,
    syncTco: false,
    autoSync: false
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.type) {
    case 'COLLECT_DECK_DATA':
      handleDeckSync(message.data, sender.tab);
      break;
    case 'GET_SETTINGS':
      getSettings().then(sendResponse);
      return true; // Will respond asynchronously
    default:
      console.warn('Unknown message type:', message.type);
  }
});

// Handle deck data collection
async function handleDeckSync(deckData, tab) {
  try {
    // Check if MV logged in
    // Check if DoK logged in
    // Get MV decks
    // When new deck matches latest deck, stop
    // Save deck data
    // Go to DoK
    // Sync decks
    // Mark decks as synced
    // Retry on failures


    // Store deck data
    const key = `deck_${deckData.id || Date.now()}`;
    await chrome.storage.local.set({
      [key]: {
        ...deckData,
        timestamp: Date.now(),
        source: tab.url
      }
    });

    console.log('Deck data saved:', key);
  } catch (error) {
    console.error('Error saving deck data:', error);
  }
}

// Get extension settings
async function getSettings() {
  try {
    const settings = await chrome.storage.sync.get([
      'enabled',
      'autoCollect',
      'collectDecks',
      'collectGames'
    ]);
    return settings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return {};
  }
}

// TODO: run daily https://stackoverflow.com/questions/36241436/chrome-extension-use-javascript-to-run-periodically-and-log-data-permanently
