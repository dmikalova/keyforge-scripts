import { handleSyncDok } from './bg-dok.js'
import { handleSyncMv } from './bg-mv.js'
import { handleSyncTco } from './bg-tco.js'
import { conf } from './conf.js'
import { browser } from './lib-browser.js'
import { storage } from './lib-storage.js'
import { timer } from './lib-timer.js'

/**
 * Enable debugging commands in development builds
 * Allows Ctrl+I (or Cmd+I on Mac) to reload the extension
 */
if (!('update_url' in chrome.runtime.getManifest())) {
  console.debug('KFA: BG: Enable debug commands')
  chrome.commands.onCommand.addListener(shortcut => {
    if (shortcut.includes('+I')) {
      console.debug(`KFA: BG: Reloading extension`)
      browser.reload()
    }
  })
}

/**
 * Handle messages from content scripts and popup
 * Routes different message types to appropriate handlers
 * @param {object} message - The message object from sender
 * @param {string} message.type - Type of message (AUTH, SYNC_START, etc.)
 * @param {AuthData} [message.auth] - Authentication data for AUTH messages
 * @returns {boolean} Whether the sender should expect an async response
 */
chrome.runtime.onMessage.addListener(message => {
  console.debug(`KFA: BG: Message received: ${message.type}`)

  switch (message.type) {
    case 'AUTH':
      handleAuth(message.auth)
      break

    case 'SYNC_START':
      handleSyncStart()
      break

    default:
      console.warn(`KFA: BG: Unknown message type: ${message.type}`)
      break
  }
  return false
})

/**
 * Handles alarm events for scheduled operations
 * Currently supports DAILY_SYNC for automatic daily synchronization
 * @param {chrome.alarms.Alarm} alarm - The alarm that triggered
 * @param {string} alarm.name - Name of the alarm (e.g., 'DAILY_SYNC')
 * @returns {Promise<void>}
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
 * Saves authentication data from content scripts to storage
 * Validates that auth contains either authDok or authTco properties
 * Sends RELOAD_USERS message to popup after successful save
 * @param {AuthData} auth - Authentication data object
 * @param {string} [auth.authDok] - Decks of KeyForge authentication token
 * @param {object} [auth.authTco] - The Crucible Online authentication data
 * @returns {Promise<void>}
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
 * Provides visual feedback that synchronization is in progress
 * Monitors sync status and rotates through icon frames
 * Resets to default icon when sync completes
 * @returns {Promise<void>}
 */
const handleIconRotation = async () => {
  console.debug(`KFA: BG: Handling rotating icon`)
  await timer.monitorSync(conf.iconRotations, true, browser.setIcon)
  await chrome.action.setIcon({ path: conf.iconRotations[0] })
}

/**
 * Handles deck synchronization for enabled services
 * Runs sync processes in parallel for Master Vault and enabled optional services
 * Sends SYNC_COMPLETE message to popup when finished
 * Resets extension icon to default state after completion
 * @returns {Promise<void>}
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
 * Initiates deck sync, icon rotation, and alarm updates concurrently
 * Entry point for all sync operations triggered by user or scheduled events
 * @returns {Promise<void>}
 */
const handleSyncStart = async () => {
  console.debug(`KFA: BG: Sync starting`)
  handleSyncDecks()
  handleIconRotation()
  timer.updateAlarms()
}

// TODO: clean up types
// TODO: jsdoc
