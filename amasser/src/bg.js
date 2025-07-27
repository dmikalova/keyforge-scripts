// Background service worker for the KeyForge Amasser extension
console.log('KeyForge Amasser background script loaded')

import { handleDokSync } from './bg-dok.js'
import { handleMvSync } from './bg-mv.js'
import { handleTcoSync } from './bg-tco.js'

chrome.commands.onCommand.addListener(shortcut => {
  console.log('lets reload')
  console.log(shortcut)
  if (shortcut.includes('+I')) {
    chrome.runtime.reload()
  }
})

// Extension installation/startup
chrome.runtime.onInstalled.addListener(async details => {
  console.log('Extension installed:', details)

  const settings = await chrome.storage.sync.get()

  // Initialize default settings
  chrome.storage.sync.set({
    syncDok: settings.syncDok || true,
    syncTco: settings.syncTco || false,
    autoSync: settings.autoSync || false,
  })
})

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message)

  switch (message.type) {
    case 'DECK_SYNC':
      handleDeckSync()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true
    case 'GET_SETTINGS':
      getSettings().then(sendResponse)
      return true
    default:
      console.warn('Unknown message type:', message.type)
      return false
  }
})

// Get extension settings
const getSettings = async () => {
  try {
    const settings = await chrome.storage.sync.get([
      'enabled',
      'autoCollect',
      'collectDecks',
      'collectGames',
    ])
    return settings
  } catch (error) {
    console.error('Error getting settings:', error)
    return {}
  }
}

// TODO: run daily https://stackoverflow.com/questions/36241436/chrome-extension-use-javascript-to-run-periodically-and-log-data-permanently

// Add the missing syncDecks function
const handleDeckSync = async () => {
  console.log('Syncing decks from bg...')
  try {
    // TODO: Add toggles for each of these based on settings
    await handleMvSync()
    if ((await chrome.storage.sync.get('syncDok')).syncDok) {
      await handleDokSync()
    }
    if ((await chrome.storage.sync.get('syncTco')).syncTco) {
      await handleTcoSync()
    }

    // Notify popup that sync is complete
    chrome.runtime.sendMessage({ type: 'SYNC_COMPLETE' }).catch(() => {})
  } catch (error) {
    console.error('Error during deck sync:', error)
    // Notify popup that sync failed
    chrome.runtime
      .sendMessage({
        type: 'SYNC_ERROR',
        error: error.message,
      })
      .catch(() => {})
    throw error // Re-throw so the message handler can also handle it
  }
}
