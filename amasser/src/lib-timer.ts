import { conf } from './conf.js'
import { storage } from './lib-storage.js'

const sleep = async (ms: number): Promise<void> => {
  return new Promise(r => setTimeout(r, ms))
}

/**
 * Checks if timestamps are stale
 */
const stale = async (keys: string | string[]): Promise<boolean> => {
  let s: Timestamps = await storage.get(keys)
  let now = Date.now()
  return Object.values(s).every(v => now - v > conf.staleSyncMs)
}

/**
 * Updates the auto-sync alarm based on settings
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
  sleep,
  stale,
  updateAlarms,
  waitForSync,
}
