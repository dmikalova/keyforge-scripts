import { conf } from './conf.js'
import { browser } from './lib-browser.js'
import { storage } from './lib-storage.js'
import { getDecksFromStorage, lib } from './lib.js'
/**
 * Main entry point for Master Vault synchronization
 * Fetches decks from Master Vault and stores them locally
 */
export const handleSyncMv = async () => {
  if (!lib.isStale(['syncingMv'])) {
    return console.debug(`KFA: MV: Sync already in progress`)
  }
  await storage.set({ syncingMv: Date.now() })
  console.debug(`KFA: MV: Sync starting`)

  try {
    await getDecksFromMv()
  } catch (error) {
    console.warn(`KFA: MV: Error syncing: ${error}`)
    await storage.remove('syncingMv')
    browser.sendMessage({
      type: 'SYNC_ERROR',
      error: error.message,
    })
  }

  await storage.remove('syncingMv')
}

/**
 * Gets Master Vault authentication information
 * @returns {Promise<MvAuth | {token: null, userId: null, username: null}>} Auth data or null values if not logged in
 */
export const getCredsMv = async (): Promise<credsMv> => {
  if (!chrome.cookies) {
    throw new Error(`KFA: MV: Cookies API is not available`)
  }
  const { value: token } = await chrome.cookies.get({
    url: conf.mvBaseUrl,
    name: 'auth',
  })
  if (!token) {
    console.debug(`KFA: MV: Not logged in`)
    return { token: null, userId: null, username: null }
  }

  const { userId, username } = await fetch(
    `${conf.mvBaseUrl}/api/users/self/`,
    requestInitMv(token),
  )
    .then(r => {
      if (!r.ok) {
        throw new Error(`KFA: MV: Failed to fetch user: ${r.status}`)
      }
      return r.json()
    })
    .then(r => {
      return { userId: r.data.id, username: r.data.username }
    })


  return { token: token, userId: userId, username: username }
}

/**
 * Create request configuration with authentication
 * @param {string} token - Authentication token
 * @returns {RequestInit} Fetch request configuration
 */
const requestInitMv = (token: string): RequestInit => ({
  credentials: 'include',
  headers: {
    accept: 'application/json',
    authorization: `Token ${token}`,
  },
})

/**
 * Fetch new decks from Master Vault API
 * @param {object} [decks={}] - Existing deck collection to update
 */
const getDecksFromMv = async () => {
  const { token, userId } = await getCredsMv()
  if (!token || !userId) {
    console.debug(`KFA: MV: Not logged in, skipping sync`)
    return
  }

  let { mv } = await getDecksFromStorage()
  await storage.set({ syncingMv: Date.now() })

  console.debug(`KFA: MV: Fetching decks`)
  const requestInit = requestInitMv(token)
  let page = 1
  let morePages = true
  while (morePages) {
    const response = await fetch(
      `${conf.mvBaseUrl}/api/users/v2/${userId}/decks/?page=${page}&page_size=${conf.mvPageSize}&search=&ordering=-date`,
      requestInit,
    )
      .then(r => {
        if (!r.ok) {
          throw new Error(`Failed to fetch decks page ${page}: ${r.status}`)
        }
        return r.json()
      })
      .then(r => {
        return { count: r.count, decks: r.data }
      })

    console.debug(
      `KFA: MV: Fetched page ${page} with ${response.decks.length} decks`,
    )
    response.decks.forEach(async deck => {
      mv[deck.id] = true
      await storage.set({
        [`zmv.${deck.id}`]: true,
        syncingMv: Date.now(),
      })
    })

    // Notify popup of new decks added
    browser.sendMessage({
      type: 'DECK_COUNT',
      decks: Object.keys(mv).length,
    })

    // Check if local deck count matches MV deck count
    if (Object.keys(mv).length === response.count) {
      console.debug(
        `KFA: MV: Sync finished with ${Object.keys(mv).length}/${response.count} decks`,
      )
      break
    }

    // Next page
    morePages = response.decks.length === conf.mvPageSize
    page++
    console.debug(
      `KFA: MV: Next page ${page}: ${Object.keys(mv).length}/${response.count} decks`,
    )
  }
}
