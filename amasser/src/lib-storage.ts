import { conf } from './conf.js'

/**
 * Get data from Chrome local storage
 * @param {string | string[]} keys - Storage keys to retrieve
 * @returns {Promise<StorageData>} Storage data object
 */
const get = async (keys: string | string[]): Promise<StorageData> => {
  return await chrome.storage.local.get(keys)
}

/**
 * Set data in Chrome local storage
 * @param {StorageData} data - Data to store
 * @param {() => void} [callback] - Optional callback after storage
 * @returns {Promise<void>}
 */
const set = async (data: StorageData, callback?: () => void) => {
  return await chrome.storage.local.set(data, callback)
}

/**
 * Remove data from Chrome local storage
 * @param {string | string[]} keys - Storage keys to remove
 * @returns {Promise<void>}
 */
const remove = async (keys: string | string[]) => {
  return await chrome.storage.local.remove(keys)
}

/**
 * Get decks from extension local storage
 * Parses deck data from storage keys prefixed with 'zdok.', 'zmv.', 'ztco.'
 * @returns {Promise<Decks>} Object containing decks organized by service
 */
const decksGet = async (): Promise<Decks> => {
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
 * Set deck data in storage with sync timestamp
 * @param {'dok' | 'mv' | 'tco'} site - Service identifier
 * @param {string} deckId - Unique deck identifier
 * @param {boolean | string} [value=true] - Deck status or metadata
 * @returns {Promise<void>}
 */
const decksSet = async (
  site: 'dok' | 'mv' | 'tco',
  deckId: string,
  value: boolean | string = true,
) => {
  const sites = {
    dok: 'syncingDok',
    mv: 'syncingMv',
    tco: 'syncingTco',
  }
  await storage.set({
    [`z${site}.${deckId}`]: value,
    [sites[site]]: Date.now(),
  })
}

/**
 * Get unsynced decks for a specific service
 * Returns decks that exist in Master Vault but not in the specified service
 * @param {'dok' | 'tco'} key - Service to check for unsynced decks
 * @returns {Promise<[string, Deck][]>} Array of [deckId, deckData] tuples
 */
const decksUnsynced = async (key: 'dok' | 'tco'): Promise<[string, Deck][]> => {
  const { mv, [key]: decks } = await storage.decks.get()
  return Object.entries(mv).filter(([id, deck]) => deck == true && !decks[id])
}

/**
 * Get extension settings from sync storage with defaults
 * @returns {Promise<Settings>} Settings object with all properties defined
 */
const settingsGet = async () => {
  const settings = await chrome.storage.sync.get()
  return {
    syncAuto:
      settings.syncAuto !== undefined
        ? settings.syncAuto
        : conf.defaults.syncAuto,
    syncDok:
      settings.syncDok !== undefined ? settings.syncDok : conf.defaults.syncDok,
    syncTco:
      settings.syncTco !== undefined ? settings.syncTco : conf.defaults.syncTco,
  }
}

/**
 * Save extension settings to sync storage
 * @param {Settings} settings - Settings object to save
 * @returns {Promise<void>}
 */
const settingsSet = async (settings: Settings) => {
  return await chrome.storage.sync.set(settings)
}

export const storage = {
  get: get,
  remove: remove,
  set: set,
  decks: {
    get: decksGet,
    set: decksSet,
    unsynced: decksUnsynced,
  },
  settings: {
    get: settingsGet,
    set: settingsSet,
  },
}
