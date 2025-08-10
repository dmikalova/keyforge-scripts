import { conf } from './conf.js'
import { getDecksFromStorage } from './lib.js'

/**
 * Base URL for the Master Vault API
 * @constant {string}
 */
const MV_BASE_URL = 'https://www.keyforgegame.com'

/**
 * Main entry point for Master Vault synchronization.
 * - Prevents overlapping syncs using a timestamp flag in storage
 * - Fetches MV decks and updates local storage and popup state
 * - Sends SYNC_ERROR to the popup on failure
 * @returns {Promise<void>}
 */
export const handleMvSync = async () => {
  const syncingMv = await chrome.storage.local
    .get('syncingDok')
    .then(r => r.syncingDok)
  if (syncingMv && Date.now() - syncingMv < conf.staleSyncSeconds) {
    console.debug(
      `KFA: MV: Sync already in progress: ${Date.now() - syncingMv}ms`,
    )
    return
  }
  await chrome.storage.local.set({ syncingMv: Date.now() })
  console.debug(`KFA: MV: Sync starting`)

  try {
    const { mv: decks } = await getDecksFromStorage()
    await getDecksFromMv(decks)
  } catch (error) {
    console.error(`KFA: MV: Error syncing: ${error}`)
    await chrome.storage.local.remove('syncingMv')
    chrome.runtime
      .sendMessage({
        type: 'SYNC_ERROR',
        error: error.message,
      })
      .catch(() => {})
  }

  await chrome.storage.local.remove('syncingMv')
}

/**
 * Retrieve Master Vault authentication details.
 * Reads the 'auth' cookie and fetches the current user; when not logged in,
 * returns null values for token, userId, and username.
 * @returns {Promise<MvAuth | { token: null; userId: null; username: null }>}
 */
export const getMvAuth = async (): Promise<
  MvAuth | { token: null; userId: null; username: null }
> => {
  const authCookie = await getMvAuthCookie()
  if (!authCookie) {
    console.debug(`KFA: MV: Not logged in`)
    return { token: null, userId: null, username: null }
  }

  const user = await getMvUser(authCookie.value)

  return { token: authCookie.value, userId: user.id, username: user.username }
}

/**
 * Get authentication cookie from Master Vault.
 * @returns {Promise<chrome.cookies.Cookie | null>} Resolves with the MV auth cookie or null if unavailable.
 */
const getMvAuthCookie = (): Promise<chrome.cookies.Cookie | null> => {
  return new Promise(resolve => {
    if (!chrome.cookies) {
      console.error(`KFA: MV: Cookies API is not available`)
      resolve(null)
      return
    }

    chrome.cookies.get(
      {
        url: MV_BASE_URL,
        name: 'auth',
      },
      resolve,
    )
  })
}

/**
 * Create request configuration with authentication.
 * @param {string} token - Authentication token
 * @returns {RequestInit} Fetch request configuration
 */
const createMvRequestConfig = (token: string): RequestInit => ({
  credentials: 'include' as RequestCredentials,
  headers: {
    accept: 'application/json',
    'accept-language': 'en-us',
    authorization: `Token ${token}`,
    'x-authorization': `Token ${token}`,
  },
})

/**
 * Fetch current user information from Master Vault.
 * @param {string} token - MV authentication token
 * @returns {Promise<MvUser>} Resolves with the MV user details
 * @throws {Error} If the user fetch response is not ok
 */
const getMvUser = async (token: string): Promise<MvUser> => {
  const response = await fetch(
    `${MV_BASE_URL}/api/users/self/`,
    createMvRequestConfig(token),
  )

  if (!response.ok) {
    throw new Error(`KFA: MV: Failed to fetch user: ${response.status}`)
  }

  const user = await response.json()
  return { id: user.data.id, username: user.data.username }
}

/**
 * Fetch pages of decks from Master Vault and update local storage.
 * Also notifies the popup with SYNC_STATUS updates as decks are discovered.
 * @param {Record<string, boolean>} [decks={}] - Mutable map of deck IDs already known/owned
 * @returns {Promise<void>}
 * @throws {Error} If a page fetch response is not ok
 */
const getDecksFromMv = async (decks = {}) => {
  if (typeof decks !== 'object' || decks === null) {
    decks = {}
  }

  await chrome.storage.local.set({ syncingMv: Date.now() })

  const { token, userId } = await getMvAuth()

  console.debug(`KFA: MV: Fetching decks`)
  const requestConfig = createMvRequestConfig(token)
  const pageSize = 10
  let page = 1
  let hasMorePages = true

  while (hasMorePages) {
    const url = `${MV_BASE_URL}/api/users/v2/${userId}/decks/?page=${page}&page_size=${pageSize}&search=&ordering=-date`
    const response = await fetch(url, requestConfig)

    if (!response.ok) {
      throw new Error(`Failed to fetch decks page ${page}: ${response.status}`)
    }

    const data = await response.json().then(data => {
      return { count: data.count, decks: data.data }
    })
    console.debug(
      `KFA: MV: Fetched page ${page} with ${data.decks.length} decks`,
    )
    data.decks.forEach(async deck => {
      decks[deck.id] = true
      await chrome.storage.local.set({
        [`zmv.${deck.id}`]: true,
        syncingMv: Date.now(),
      })
    })

    // Notify popup of new decks added
    chrome.runtime
      .sendMessage({
        type: 'SYNC_STATUS',
        decks: Object.keys(decks).length,
      })
      .catch(() => {})

    if (Object.keys(decks).length === data.count) {
      console.debug(
        `KFA: MV: Finished with ${Object.keys(decks).length}/${data.count} decks`,
      )
      break
    }

    hasMorePages = data.decks.length === pageSize
    page++
    console.debug(
      `KFA: MV: Next page ${page}: ${Object.keys(decks).length}/${data.count} decks`,
    )
  }
}
