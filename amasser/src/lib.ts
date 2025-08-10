import { conf } from './conf.js'
import { storage } from './lib-storage.js'

/**
 * Get decks from extension local storage
 */
export const getDecksFromStorage = async () => {
  type Decks = {
    dok: Record<string, string>
    mv: Record<string, string>
    tco: Record<string, string>
  }
  const decks: Decks = { dok: {}, tco: {}, mv: {} }
  await chrome.storage.local.get().then(data => {
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('zdok.')) {
        decks.dok[key.replace('zdok.', '')] = value
      } else if (key.startsWith('zmv.')) {
        decks.mv[key.replace('zmv.', '')] = value
      } else if (key.startsWith('ztco.')) {
        decks.tco[key.replace('ztco.', '')] = value
      }
    }
  })
  return decks
}

/**
 * Checks if timestamps are stale
 */
const isStale = async (keys: string[]): Promise<boolean> => {
  let s: Timestamps = await storage.get(keys)
  let now = Date.now()
  return Object.values(s).every(v => now - v > conf.staleSyncSeconds)
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

export const lib = {
  isStale,
  updateAlarms,
}
