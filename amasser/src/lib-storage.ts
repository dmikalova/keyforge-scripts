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

const getSettings: () => Promise<Settings> = async () => {
  return await chrome.storage.sync.get()
}

const setSettings: (settings: Settings) => Promise<void> = async settings => {
  return await chrome.storage.sync.set(settings)
}

export const storage = {
  get: get,
  remove: remove,
  set: set,
  settings: {
    get: getSettings,
    set: setSettings,
  },
}
