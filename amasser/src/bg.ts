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
    syncDaily: settings.syncDaily || false,
  })
})

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message)

  switch (message.type) {
    case 'SYNC_COMPLETE':
      console.log('Deck sync complete in bg')
      handleRotateIcon(0)
        .then(status => sendResponse({ success: true, status }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true

    case 'SYNC_ERROR':
      handleRotateIcon(180)
        .then(status => sendResponse({ success: true, status }))
        .catch(error => sendResponse({ success: false, error: error.message }))

    case 'SYNC_START':
      handleRotateIcon(15)
        .then(status => sendResponse({ success: true, status }))
        .catch(error => sendResponse({ success: false, error: error.message }))

      handleDeckSync()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true

    case 'SYNC_STATUS':
      handleRotateIcon()
        .then(status => sendResponse({ success: true, status }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true

    default:
      console.warn('Unknown message type:', message.type)
      return false
  }
})

const handleDeckSync = async () => {
  console.log('Syncing decks from bg...')
  try {
    await handleMvSync()
    if ((await chrome.storage.sync.get('syncDok')).syncDok) {
      await handleDokSync()
    }
    if ((await chrome.storage.sync.get('syncTco')).syncTco) {
      await handleTcoSync()
    }

    // Notify popup that sync is complete
    console.log('Deck sync complete in bg')
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

const ICON_ROTATIONS = [
  '../icons/amasser-128-0.png',
  '../icons/amasser-128-15.png',
  '../icons/amasser-128-30.png',
  '../icons/amasser-128-45.png',
  '../icons/amasser-128-60.png',
  '../icons/amasser-128-75.png',
  '../icons/amasser-128-90.png',
  '../icons/amasser-128-105.png',
  '../icons/amasser-128-120.png',
  '../icons/amasser-128-135.png',
  '../icons/amasser-128-150.png',
  '../icons/amasser-128-165.png',
  '../icons/amasser-128-180.png',
  '../icons/amasser-128-195.png',
  '../icons/amasser-128-210.png',
  '../icons/amasser-128-225.png',
  '../icons/amasser-128-240.png',
  '../icons/amasser-128-255.png',
  '../icons/amasser-128-270.png',
  '../icons/amasser-128-285.png',
  '../icons/amasser-128-300.png',
  '../icons/amasser-128-315.png',
  '../icons/amasser-128-330.png',
  '../icons/amasser-128-345.png',
]

const handleRotateIcon = async (angle?: number) => {
  console.log('Rotating icon to angle:', angle)

  let iconPath: string
  if (angle === undefined) {
    // Keep a counter in chrome.storage.local and increment it each time
    const { iconAngle = 0 } = await chrome.storage.local.get('iconAngle')
    angle = iconAngle + 1
    await chrome.storage.local.set({ iconAngle: angle })

    iconPath = ICON_ROTATIONS[angle % ICON_ROTATIONS.length]
  } else {
    iconPath =
      ICON_ROTATIONS.find(path => path.includes(`${angle}`)) ||
      ICON_ROTATIONS[0]
  }

  chrome.action.setIcon({
    path: iconPath,
  })
}
