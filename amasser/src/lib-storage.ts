const get: (
  keys: string | string[],
) => Promise<{ [key: string]: any }> = async keys => {
  return await chrome.storage.sync.get(keys)
}

const set: (data: StorageData, callback?: () => void) => Promise<void> = async (
  data,
  callback,
) => {
  await chrome.storage.sync.set(data, callback)
}

const getSettings: () => Promise<Settings> = async () => {
  return await chrome.storage.sync.get()
}

const setSettings: (settings: Settings) => Promise<void> = async settings => {
  return await chrome.storage.sync.set(settings)
}

export const storage = {
  get: get,
  set: set,
  settings: {
    get: getSettings,
    set: setSettings,
  },
}
