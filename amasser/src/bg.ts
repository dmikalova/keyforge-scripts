import { handleSyncDok } from './bg-dok.js'
import { handleSyncMv } from './bg-mv.js'
import { handleSyncTco } from './bg-tco.js'
import { conf } from './conf.js'
import { browser } from './lib-browser.js'
import { storage } from './lib-storage.js'
import { lib } from './lib.js'

/**
 * Enable debugging commands in development builds
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
 */
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await storage.settings.get()
  storage.settings.set({
    syncAuto: settings.syncAuto || conf.defaults.syncAuto,
    syncDok: settings.syncDok || conf.defaults.syncDok,
    syncTco: settings.syncTco || conf.defaults.syncTco,
  })
})

/**
 * Handle messages from content scripts and popup
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
 * Saves auth from content scripts to storage
 */
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

/**
 * Rotates the extension icon during sync operations
 */
const handleIconRotation = async () => {
  console.debug(`KFA: BG: Handling rotating icon`)
  let rotation = 0
  // Wait for sync to start
  while (await lib.isStale(['syncingDok', 'syncingMv', 'syncingTco'])) {
    rotation = (rotation + 1) % conf.iconRotations.length
    // console.debug(`KFA: BG: Rotating icon (stale): ${rotation} `)
    await chrome.action.setIcon({ path: conf.iconRotations[rotation] })
    await new Promise(resolve => setTimeout(resolve, conf.rotateAgainSeconds))
  }

  // Wait for sync to finish
  while (!(await lib.isStale(['syncingDok', 'syncingMv', 'syncingTco']))) {
    rotation = (rotation + 1) % conf.iconRotations.length
    // console.debug(`KFA: BG: Rotating icon: ${rotation}`)
    await chrome.action.setIcon({ path: conf.iconRotations[rotation] })
    await new Promise(resolve => setTimeout(resolve, conf.rotateAgainSeconds))
  }

  await chrome.action.setIcon({ path: conf.iconRotations[0] })
}

/**
 * Handles deck synchronization for enabled services
 */
const handleSyncDecks = async () => {
  console.debug(`KFA: BG: Handling deck sync`)
  const settings = await storage.settings.get()
  const syncPromises = [handleSyncMv()]

  if (settings.syncDok) {
    syncPromises.push(handleSyncDok())
  }

  if (settings.syncTco) {
    syncPromises.push(handleSyncTco())
  }

  try {
    await Promise.allSettled(syncPromises)
    console.debug(`KFA: BG: Deck sync settled`)
    browser.sendMessage({ type: 'SYNC_COMPLETE' })
    await chrome.action.setIcon({ path: conf.iconRotations[0] })
  } catch (error) {
    console.warn(`KFA: BG: Error during deck sync: ${error}`)
  }
}

/**
 * Starts the synchronization process
 */
const handleSyncStart = async () => {
  console.debug(`KFA: BG: Sync starting`)
  handleSyncDecks()
  handleIconRotation()
  lib.updateAlarms()
}

// TODO: code consistency
// TODO: break out fns
// TODO: clean up types
