const get: (keys: string | string[]) => Promise<StorageData> = async keys => {
  return await chrome.storage.local.get(keys)
}

const set: (data: StorageData, callback?: () => void) => Promise<void> = async (
  data,
  callback,
) => {
  return await chrome.storage.local.set(data, callback)
}

const remove: (keys: string | string[]) => Promise<void> = async keys => {
  return await chrome.storage.local.remove(keys)
}

/**
 * Get decks from extension local storage
 */
const decksGet: () => Promise<Decks> = async () => {
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

const settingsGet: () => Promise<Settings> = async () => {
  return await chrome.storage.sync.get()
}

const settingsSet: (settings: Settings) => Promise<void> = async settings => {
  return await chrome.storage.sync.set(settings)
}

export const storage = {
  get: get,
  remove: remove,
  set: set,
  decks: {
    get: decksGet,
  },
  settings: {
    get: settingsGet,
    set: settingsSet,
  },
}
