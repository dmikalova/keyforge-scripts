import { handleDokSync } from './bg-dok.js'
import { handleMvSync } from './bg-mv.js'
import { handleTcoSync } from './bg-tco.js'
import { conf } from './conf.js'

/**
 * Enable debugging commands in development builds
 * Allows Ctrl+I to reload the extension
 */
if (!('update_url' in chrome.runtime.getManifest())) {
  console.debug('KFA: BG: Debugging commands are enabled')
  chrome.commands.onCommand.addListener(shortcut => {
    if (shortcut.includes('+I')) {
      chrome.runtime.reload()
    }
  })
}

/**
 * Initialize extension settings on installation
 * Sets default values for sync preferences
 */
chrome.runtime.onInstalled.addListener(async () => {
  const settings: Settings = await chrome.storage.sync.get()

  // Initialize default settings
  chrome.storage.sync.set({
    'sync-dok': settings['sync-dok'] || true,
    'sync-tco': settings['sync-tco'] || false,
    'sync-auto': settings['sync-auto'] || false,
  })
})

/**
 * Handle messages from content scripts and popup
 * Routes different message types to appropriate handlers
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.debug(`KFA: BG: Message received: ${message.type}`)

  switch (message.type) {
    case 'SYNC_START':
      console.debug(`KFA: BG: Sync starting`)
      handleRotateIcon()
        .then(status => sendResponse({ success: true, status }))
        .catch(error => sendResponse({ success: false, error: error.message }))

      handleDeckSync()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }))

      updateAutoSyncAlarm()
      return true

    case 'SAVE_DOK_AUTH':
      console.debug(`KFA: BG: Received DoK auth token from content script`)
      if (!message['token-dok']) {
        console.warn(`KFA: BG: SAVE_DOK_AUTH message missing token-dok token`)
        sendResponse({
          success: false,
          error: `KFA: BG: Missing token-dok: ${message['token-dok']}`,
        })
        return false
      }

      chrome.storage.local.set({ 'token-dok': message['token-dok'] }, () => {
        console.debug(
          `KFA: BG: DoK auth token saved to storage from content script`,
        )
        sendResponse({ success: true })
      })
      return true

    case 'SAVE_TCO_REFRESH_TOKEN':
      console.debug(`KFA: BG: Received TCO refresh token from content script`)
      if (!message['token-tco']) {
        console.warn(
          `KFA: BG: SAVE_TCO_REFRESH_TOKEN message missing TCO refresh token`,
        )
        sendResponse({
          success: false,
          error: `KFA: BG: Missing token-tco: ${message['token-tco']}`,
        })
        return false
      }

      chrome.storage.local.set({ 'token-tco': message['token-tco'] }, () => {
        console.debug(
          `KFA: BG: TCO refresh token saved to storage from content script`,
        )
        sendResponse({ success: true })
      })
      return true

    default:
      console.warn(`KFA: BG: Unknown message type: ${message.type}`)
      return false
  }
})

/**
 * Handles deck synchronization across all enabled services
 * Runs sync processes in parallel and notifies when complete
 */
const handleDeckSync = async () => {
  console.debug(`KFA: BG: Handling deck sync`)
  const syncPromises = [handleMvSync()]

  if ((await chrome.storage.sync.get('sync-dok'))['sync-dok']) {
    syncPromises.push(handleDokSync())
  }

  if ((await chrome.storage.sync.get('sync-tco'))['sync-tco']) {
    syncPromises.push(handleTcoSync())
  }

  try {
    const results = await Promise.allSettled(syncPromises)

    // Notify popup that sync is complete
    console.debug(`KFA: BG: Deck sync settled: ${JSON.stringify(results)}`)
    chrome.runtime.sendMessage({ type: 'SYNC_COMPLETE' }).catch(() => {})
  } catch (error) {
    console.error(`KFA: BG: Error during deck sync: ${error}`)
    throw error // Re-throw so the message handler can also handle it
  }
}

/**
 * Array of icon paths for rotation animation during sync
 */

/**
 * Rotates the extension icon during sync operations
 * Provides visual feedback that sync is in progress
 */
const handleRotateIcon = async () => {
  console.debug(`KFA: BG: Handling rotating icon`)
  let rotation = 0
  let s = await chrome.storage.local.get([
    'syncing-dok',
    'syncing-mv',
    'syncing-tco',
  ])
  let now = Date.now()
  console.debug(
    `KFA: BG: Syncing timestamps: MV: ${now - s['syncing-mv'] || 0}ms DoK: ${
      now - s['syncing-dok'] || 0
    }ms TCO: ${now - s['syncing-tco'] || 0}ms`,
  )

  if (
    (typeof s['syncing-dok'] === 'number' &&
      now - s['syncing-dok'] > conf.staleSyncSeconds) ||
    (typeof s['syncing-mv'] === 'number' &&
      now - s['syncing-mv'] > conf.staleSyncSeconds) ||
    (typeof s['syncing-tco'] === 'number' &&
      now - s['syncing-tco'] > conf.staleSyncSeconds)
  ) {
    console.debug(`KFA: BG: Syncs are stale`)
    s = {}
  }

  while (Object.keys(s).length === 0) {
    rotation = (rotation + 1) % conf.iconRotations.length
    // console.debug(`KFA: BG: Rotating icon: ${rotation}`)
    await chrome.action.setIcon({
      path: conf.iconRotations[rotation % conf.iconRotations.length],
    })

    await new Promise(resolve => setTimeout(resolve, conf.rotateAgainSeconds))
    s = await chrome.storage.local.get([
      'syncing-dok',
      'syncing-mv',
      'syncing-tco',
    ])
  }

  while (
    (typeof s['syncing-dok'] === 'number' &&
      now - s['syncing-dok'] < conf.staleSyncSeconds) ||
    (typeof s['syncing-mv'] === 'number' &&
      now - s['syncing-mv'] < conf.staleSyncSeconds) ||
    (typeof s['syncing-tco'] === 'number' &&
      now - s['syncing-tco'] < conf.staleSyncSeconds)
  ) {
    rotation = (rotation + 1) % conf.iconRotations.length
    // console.debug(`KFA: BG: Rotating icon: ${rotation}`)
    await chrome.action.setIcon({
      path: conf.iconRotations.length[rotation % conf.iconRotations.length],
    })

    // Wait for a short interval before checking again
    await new Promise(resolve => setTimeout(resolve, conf.rotateAgainSeconds))
    s = await chrome.storage.local.get([
      'syncing-dok',
      'syncing-mv',
      'syncing-tco',
    ])
    now = Date.now()
  }

  await chrome.action.setIcon({ path: conf.iconRotations.length[0] })
}

/**
 * Handles alarm events for scheduled operations
 * @param {chrome.alarms.Alarm} alarm - The alarm that triggered
 */
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

/**
 * Updates the auto-sync alarm based on user settings
 * Creates or removes daily sync alarm as needed
 */
const updateAutoSyncAlarm = async () => {
  const syncAuto = (await chrome.storage.sync.get('sync-auto'))['sync-auto']
  console.debug(`KFA: BG: Checking auto-sync: ${syncAuto}`)
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
// TODO: remove errors when not logged in
// TODO: clean up types
// TODO: convert back to syncDok etc for storage
