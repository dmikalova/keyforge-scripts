import { conf } from './conf.js'
import { storage } from './lib-storage.js'

/**
 * Monitor sync status and execute callback with rotation
 * @param list - List of items to rotate through (e.g., icon paths)
 * @param wait - Whether to wait for sync to start
 * @param callback - Function to call with each rotation item
 * @returns Promise that resolves when monitoring is complete
 */
const monitorSync = async (
  list: string[],
  wait: boolean,
  callback: (message: string) => void,
) => {
  let i = 0
  // Wait for sync to start
  while (
    wait ||
    !(await timer.stale(['syncingDok', 'syncingMv', 'syncingTco']))
  ) {
    await callback(list[i])
    // console.debug(`KFA: Monitor sync stale: ${list[i]}`)
    i = (i + 1) % list.length
    await timer.sleep(conf.rotateMs)

    if (
      Object.keys(await storage.get(['syncingDok', 'syncingMv', 'syncingTco']))
        .length !== 0
    ) {
      wait = false
    }
  }
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = async (ms: number) => {
  return new Promise(r => setTimeout(r, ms))
}

/**
 * Checks if timestamps are stale (older than staleSyncMs)
 * @param keys - Storage keys to check
 * @returns Promise resolving to true if all timestamps are stale
 */
const stale = async (keys: string | string[]): Promise<boolean> => {
  let s: Timestamps = await storage.get(keys)
  let now = Date.now()
  return Object.values(s).every(v => now - v > conf.staleSyncMs)
}

/**
 * Updates the auto-sync alarm based on user settings
 * Creates or removes daily sync alarm as needed
 * @returns Promise that resolves when alarm update is complete
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

/**
 * Wait for sync to complete, then execute callback
 * @param timestamps - Timestamp keys to monitor
 * @param callback - Function to execute after sync completes
 * @returns Promise that resolves when wait and callback execution are complete
 */
const waitForSync = async (
  timestamps: string | string[],
  callback: () => void,
) => {
  if (!(await stale(timestamps))) {
    let waited = 0
    while (waited < conf.syncAgainMs) {
      await storage.set({ syncingDok: Date.now() })
      await sleep(conf.timeoutMs)
      waited += conf.timeoutMs
      if (await stale(timestamps)) {
        break
      }
    }
    return await callback()
  }
}

export const timer = {
  monitorSync,
  sleep,
  stale,
  updateAlarms,
  waitForSync,
}
