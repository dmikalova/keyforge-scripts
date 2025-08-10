import { conf } from './conf.js'
import { storage } from './lib-storage.js'

/**
 * Checks if timestamps are stale
 */
const timestampsStale = async (keys: string[]): Promise<boolean> => {
  let s: Timestamps = await storage.get(keys)
  let now = Date.now()
  return Object.values(s).every(v => now - v > conf.staleSyncMs)
}

const unsyncedDecks = async (key: 'dok' | 'tco') => {
  const { mv, [key]: decks } = await storage.decks.get()
  return Object.entries(mv).filter(([id, deck]) => deck == true && !decks[id])
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
  timestampsStale,
  unsyncedDecks,
  updateAlarms,
}
