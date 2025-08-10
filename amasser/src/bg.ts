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
      chrome.storage.local
        .remove(['syncingMv', 'syncingDok', 'syncingTco'])
        .then(() => {
          console.debug(`KFA: POP: Sync cancelled and buttons reset`)
          chrome.runtime.reload()
        })
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
    syncDok: settings.syncDok || conf.defaults.syncDok,
    syncTco: settings.syncTco || conf.defaults.syncTco,
    syncAuto: settings.syncAuto || conf.defaults.syncAuto,
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
      if (!message.tokenDok) {
        console.warn(`KFA: BG: SAVE_DOK_AUTH message missing DoK token`)
        sendResponse({
          success: false,
          error: `KFA: BG: Missing DoK token: ${message.tokenDok}`,
        })
        return false
      }

      chrome.storage.local.set({ tokenDok: message.tokenDok }, () => {
        console.debug(
          `KFA: BG: DoK auth token saved to storage from content script`,
        )
        chrome.runtime.sendMessage({ type: 'RELOAD_USERS' })
        sendResponse({ success: true })
      })
      return true

    case 'SAVE_TCO_REFRESH_TOKEN':
      console.debug(`KFA: BG: Received TCO refresh token from content script`)
      if (!message.tokenTco) {
        console.warn(
          `KFA: BG: SAVE_TCO_REFRESH_TOKEN message missing TCO refresh token`,
        )
        sendResponse({
          success: false,
          error: `KFA: BG: Missing TCO refresh token: ${message.tokenTco}`,
        })
        return false
      }

      chrome.storage.local.set({ tokenTco: message.tokenTco }, () => {
        console.debug(
          `KFA: BG: TCO refresh token saved to storage from content script`,
        )
        chrome.runtime.sendMessage({ type: 'RELOAD_USERS' })
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

  if ((await chrome.storage.sync.get('syncDok')).syncDok) {
    syncPromises.push(handleDokSync())
  }

  if ((await chrome.storage.sync.get('syncTco')).syncTco) {
    syncPromises.push(handleTcoSync())
  }

  try {
    const results = await Promise.allSettled(syncPromises)

    // Notify popup that sync is complete
    console.debug(`KFA: BG: Deck sync settled: ${JSON.stringify(results)}`)
    await chrome.action.setIcon({ path: conf.iconRotations[0] })
    chrome.runtime.sendMessage({ type: 'SYNC_COMPLETE' }).catch(() => {})
  } catch (error) {
    console.debug(`KFA: BG: Error during deck sync: ${error}`)
    throw error // Re-throw so the message handler can also handle it
  }
}

/**
 * Rotates the extension icon during sync operations
 * Provides visual feedback that sync is in progress
 */
const handleRotateIcon = async () => {
  console.debug(`KFA: BG: Handling rotating icon`)
  let rotation = 0
  let s = await chrome.storage.local.get([
    'syncingDok',
    'syncingMv',
    'syncingTco',
  ])
  let now = Date.now()
  if (
    (typeof s.syncingDok === 'number' &&
      now - s.syncingDok > conf.staleSyncSeconds) ||
    (typeof s.syncingMv === 'number' &&
      now - s.syncingMv > conf.staleSyncSeconds) ||
    (typeof s.syncingTco === 'number' &&
      now - s.syncingTco > conf.staleSyncSeconds)
  ) {
    console.debug(`KFA: BG: Syncs are stale`)
    s = {}
  }

  while (Object.keys(s).length === 0) {
    rotation = (rotation + 1) % conf.iconRotations.length
    // console.debug(`KFA: BG: Rotating icon: ${rotation}`)
    await chrome.action.setIcon({
      path: conf.iconRotations[rotation],
    })

    await new Promise(resolve => setTimeout(resolve, conf.rotateAgainSeconds))
    now = Date.now()
    s = await chrome.storage.local.get([
      'syncingDok',
      'syncingMv',
      'syncingTco',
    ])
  }

  while (
    (typeof s.syncingDok === 'number' &&
      now - s.syncingDok < conf.staleSyncSeconds) ||
    (typeof s.syncingMv === 'number' &&
      now - s.syncingMv < conf.staleSyncSeconds) ||
    (typeof s.syncingTco === 'number' &&
      now - s.syncingTco < conf.staleSyncSeconds)
  ) {
    rotation = (rotation + 1) % conf.iconRotations.length
    // console.debug(`KFA: BG: Rotating icon: ${rotation}`)
    await chrome.action.setIcon({
      path: conf.iconRotations[rotation],
    })

    // Wait for a short interval before checking again
    await new Promise(resolve => setTimeout(resolve, conf.rotateAgainSeconds))
    now = Date.now()
    s = await chrome.storage.local.get([
      'syncingDok',
      'syncingMv',
      'syncingTco',
    ])
  }

  await chrome.action.setIcon({ path: conf.iconRotations[0] })
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
  const syncAuto = (await chrome.storage.sync.get('syncAuto')).syncAuto
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
// TODO: clean up types
