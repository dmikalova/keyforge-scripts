import { handleDokSync } from './bg-dok.js'
import { handleMvSync } from './bg-mv.js'
import { handleTcoSync } from './bg-tco.js'
import { conf } from './conf.js'
import { browser } from './lib-browser.js'
import { storage } from './lib-storage.js'

/**
 * Enable debugging commands in development builds
 * Allows Ctrl+I to reload the extension
 */
if (!('update_url' in chrome.runtime.getManifest())) {
  console.debug('KFA: BG: Enable debug commands')
  chrome.commands.onCommand.addListener(shortcut => {
    if (shortcut.includes('+I')) {
      browser.extensionReload()
    }
  })
}

/**
 * Initialize extension settings on installation
 * Sets default values for sync preferences
 */
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await storage.settings.get()

  // Initialize default settings
  storage.settings.set({
    syncAuto: settings.syncAuto || conf.defaults.syncAuto,
    syncDok: settings.syncDok || conf.defaults.syncDok,
    syncTco: settings.syncTco || conf.defaults.syncTco,
  })
})

/**
 * Handle messages from content scripts and popup
 * Routes different message types to appropriate handlers
 */
chrome.runtime.onMessage.addListener(message => {
  console.debug(`KFA: BG: Message received: ${message.type}`)

  switch (message.type) {
    case 'AUTH':
      handleAuth(message.auth)
      return false

    case 'SYNC_START':
      handleSyncStart()
      return false

    default:
      console.warn(`KFA: BG: Unknown message type: ${message.type}`)
      return false
  }
})

const handleAuth = async (auth: AuthData) => {
  if (
    !auth ||
    (!auth.hasOwnProperty('authDok') && !auth.hasOwnProperty('authTco'))
  ) {
    console.warn(`KFA: BG: AUTH message is missing authDok or authTco token`)
    return
  }

  storage.set(auth, () => {
    console.debug(
      `KFA: BG: Auth token ${Object.keys(auth)} saved to storage from content script`,
    )
    browser.sendMessage({ type: 'RELOAD_USERS' })
  })
}

const handleSyncStart = async () => {
  console.debug(`KFA: BG: Sync starting`)
  handleRotateIcon()
  handleDeckSync()
  updateAlarms()
}

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
    await Promise.allSettled(syncPromises)
    console.debug(`KFA: BG: Deck sync settled`)
    await chrome.action.setIcon({ path: conf.iconRotations[0] })
    browser.sendMessage({ type: 'SYNC_COMPLETE' })
  } catch (error) {
    console.warn(`KFA: BG: Error during deck sync: ${error}`)
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
const handleAlarms = async alarm => {
  switch (alarm.name) {
    case 'DAILY_SYNC':
      console.debug(`KFA: BG: Daily sync triggered`)
      handleSyncStart()
      browser.sendMessage({ type: 'SYNC_START' })
      return

    default:
      console.warn(`KFA: BG: Unknown alarm: ${alarm.name}`)
      return
  }
}
chrome.alarms.onAlarm.addListener(handleAlarms)

/**
 * Updates the auto-sync alarm based on user settings
 * Creates or removes daily sync alarm as needed
 */
const updateAlarms = async () => {
  const syncAuto = (await storage.settings.get()).syncAuto
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
