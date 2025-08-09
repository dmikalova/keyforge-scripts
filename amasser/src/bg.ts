// Background service worker for the KeyForge Amasser extension
console.debug(`KFA: BG: script loaded`)

import { handleDokSync } from './bg-dok.js'
import { handleMvSync } from './bg-mv.js'
import { handleTcoSync } from './bg-tco.js'
import { rotateAgainSeconds, staleSyncSeconds } from './lib.js'

chrome.commands.onCommand.addListener(shortcut => {
  console.debug(`lets reload`)
  console.debug(shortcut)
  if (shortcut.includes('+I')) {
    chrome.runtime.reload()
  }
})

// Extension installation/startup
chrome.runtime.onInstalled.addListener(async details => {
  console.debug(`KFA: BG: Extension installed: ${details}`)

  const settings: Settings = await chrome.storage.sync.get()

  // Initialize default settings
  chrome.storage.sync.set({
    'sync-dok': settings['sync-dok'] || true,
    'sync-tco': settings['sync-tco'] || false,
    'sync-auto': settings['sync-auto'] || false,
  })
})

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.debug(`Background received message of type: ${message.type}`)

  switch (message.type) {
    case 'SYNC_START':
      handleRotateIcon()
        .then(status => sendResponse({ success: true, status }))
        .catch(error => sendResponse({ success: false, error: error.message }))

      handleDeckSync()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }))

      updateAutoSyncAlarm()
      return true

    case 'SAVE_DOK_AUTH':
      console.debug(`Received DoK auth token from content script`)
      if (message['token-dok']) {
        chrome.storage.local.set({ 'token-dok': message['token-dok'] }, () => {
          console.debug(`DoK auth token saved to storage from content script`)
          sendResponse({ success: true })
        })
      } else {
        console.warn(`SAVE_DOK_AUTH message missing token-dok token`)
        sendResponse({ success: false, error: 'Missing token-dok token' })
      }
      return true

    case 'SAVE_TCO_REFRESH_TOKEN':
      console.debug(`Received TCO refresh token from content script`)
      if (message['token-tco']) {
        chrome.storage.local.set({ 'token-tco': message['token-tco'] }, () => {
          console.debug(
            `TCO refresh token saved to storage from content script`,
          )
          sendResponse({ success: true })
        })
      } else {
        console.warn(`SAVE_TCO_REFRESH_TOKEN message missing TCO refresh token`)
        sendResponse({ success: false, error: 'Missing TCO refresh token' })
      }
      return true

    default:
      console.warn(`Unknown message type: ${message.type}`)
      return false
  }
})

const handleDeckSync = async () => {
  console.debug(`Syncing decks from bg...`)
  const syncPromises = []

  syncPromises.push(handleMvSync())

  if ((await chrome.storage.sync.get('sync-dok'))['sync-dok']) {
    syncPromises.push(handleDokSync())
  }

  if ((await chrome.storage.sync.get('sync-tco'))['sync-tco']) {
    syncPromises.push(handleTcoSync())
  }

  try {
    const results = await Promise.allSettled(syncPromises)

    // Notify popup that sync is complete
    console.debug(`Deck sync promises complete in bg: ${results}`)
    chrome.runtime.sendMessage({ type: 'SYNC_COMPLETE' }).catch(() => {})
  } catch (error) {
    console.error(`Error during deck sync: ${error}`)
    throw error // Re-throw so the message handler can also handle it
  }
}

const ICON_ROTATIONS = [
  '../icons/amasser-128-0.png',
  '../icons/amasser-128-30.png',
  '../icons/amasser-128-60.png',
  '../icons/amasser-128-90.png',
  '../icons/amasser-128-120.png',
  '../icons/amasser-128-150.png',
  '../icons/amasser-128-180.png',
  '../icons/amasser-128-210.png',
  '../icons/amasser-128-240.png',
  '../icons/amasser-128-270.png',
  '../icons/amasser-128-300.png',
  '../icons/amasser-128-330.png',
]

const handleRotateIcon = async () => {
  console.debug(`KFA: BG: Rotating icon during sync...`)
  let rotation = 0
  let s = await chrome.storage.local.get([
    'syncing-dok',
    'syncing-mv',
    'syncing-tco',
  ])
  let now = Date.now()
  console.debug(
    `KFA: BG: syncing times: MV: ${now - s['syncing-mv']}ms DoK: ${
      now - s['syncing-dok']
    }ms TCO: ${now - s['syncing-tco']}ms`,
  )

  if (
    (typeof s['syncing-dok'] === 'number' &&
      now - s['syncing-dok'] > staleSyncSeconds) ||
    (typeof s['syncing-mv'] === 'number' &&
      now - s['syncing-mv'] > staleSyncSeconds) ||
    (typeof s['syncing-tco'] === 'number' &&
      now - s['syncing-tco'] > staleSyncSeconds)
  ) {
    console.debug(`KFA: BG: Stale syncs...`)
    s = {}
  }

  while (Object.keys(s).length === 0) {
    rotation = (rotation + 1) % ICON_ROTATIONS.length
    console.debug(`KFA: BG: Rotating icon to angle: ${rotation}`)
    await chrome.action.setIcon({
      path: ICON_ROTATIONS[rotation % ICON_ROTATIONS.length],
    })

    await new Promise(resolve => setTimeout(resolve, rotateAgainSeconds))
    s = await chrome.storage.local.get([
      'syncing-dok',
      'syncing-mv',
      'syncing-tco',
    ])
  }

  while (
    (typeof s['syncing-dok'] === 'number' &&
      now - s['syncing-dok'] < staleSyncSeconds) ||
    (typeof s['syncing-mv'] === 'number' &&
      now - s['syncing-mv'] < staleSyncSeconds) ||
    (typeof s['syncing-tco'] === 'number' &&
      now - s['syncing-tco'] < staleSyncSeconds)
  ) {
    rotation = (rotation + 1) % ICON_ROTATIONS.length
    console.debug(`KFA: BG: Rotating icon to angle: ${rotation}`)
    await chrome.action.setIcon({
      path: ICON_ROTATIONS[rotation % ICON_ROTATIONS.length],
    })

    // Wait for a short interval before checking again
    await new Promise(resolve => setTimeout(resolve, rotateAgainSeconds))
    s = await chrome.storage.local.get([
      'syncing-dok',
      'syncing-mv',
      'syncing-tco',
    ])
    now = Date.now()
  }

  await chrome.action.setIcon({ path: ICON_ROTATIONS[0] })
}

const onAlarm = async alarm => {
  switch (alarm.name) {
    case 'DAILY_SYNC':
      console.debug(`KFA: BG: Daily sync triggered`)
      handleRotateIcon()
      handleDeckSync()
      chrome.runtime.sendMessage({ type: 'SYNC_START' })
      break

    default:
      break
  }
}
chrome.alarms.onAlarm.addListener(onAlarm)

const updateAutoSyncAlarm = async () => {
  const syncAuto = (await chrome.storage.sync.get('sync-auto'))['sync-auto']
  console.debug(`KFA: BG: Checking auto-sync alarm... ${syncAuto}`)
  if (syncAuto) {
    console.debug(`KFA: BG: Scheduling daily sync alarm`)
    chrome.alarms.create('DAILY_SYNC', {
      periodInMinutes: 24 * 60, // every 24 hours
    })
  } else {
    chrome.alarms.clear('DAILY_SYNC')
  }
}

// TODO: code consistency
// TODO: break out fns
// TODO: test on FF
// TODO: compile for chrome
// TODO: compile for firefox
// TODO: consistent debug messaging
// TODO: turn off excessive debug messaging
// TODO: remove errors when not logged in
