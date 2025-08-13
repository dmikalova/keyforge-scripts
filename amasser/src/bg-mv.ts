import { conf } from './conf.js'
import { browser } from './lib-browser.js'
import { storage } from './lib-storage.js'
import { timer } from './lib-timer.js'
/**
 * Main entry point for Master Vault synchronization
 * Fetches decks from Master Vault and stores them locally
 */
export const handleSyncMv = async () => {
  if (!(await timer.stale(['syncingMv']))) {
    return console.debug(`KFA: MV: Sync already in progress`)
  }
  await storage.set({ syncingMv: Date.now() })
  console.debug(`KFA: MV: Sync starting`)

  try {
    await getDecksMv()
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
 * Fetches new decks from Master Vault API with pagination.
 * Processes all pages of user's deck collection and stores them locally.
 * Updates popup with real-time deck count during sync.
 */
const getDecksMv = async () => {
  const { token, userId } = await getCredsMv()
  if (!token || !userId) {
    console.debug(`KFA: MV: Not logged in, skipping sync`)
    return
  }

  let { mv } = await storage.decks.get()
  await storage.set({ syncingMv: Date.now() })

  console.debug(`KFA: MV: Fetching decks`)
  const requestInit = requestInitMv(token)
  let page = 1
  let morePages = true
  while (morePages) {
    const { count, decks }: { count: number; decks: MvDeck[] } = await fetch(
      `${conf.mvBaseUrl}/api/users/v2/${userId}/decks/?page=${page}&page_size=${conf.mvPageSize}&search=&ordering=-date`,
      requestInit,
    )
      .then(r => {
        if (!r.ok) {
          throw new Error(
            `KFA: MV: Failed to fetch decks page ${page}: ${r.status}`,
          )
        }
        return r.json()
      })
      .then(r => {
        return { count: r.count, decks: r.data }
      })
      .catch(error => {
        console.error(`KFA: MV: Error fetching decks page ${page}: ${error}`)
        return { count: 0, decks: [] }
      })

    console.debug(`KFA: MV: Fetched page ${page} with ${decks.length} decks`)
    decks.forEach(async deck => {
      mv[deck.id] = true
      await storage.decks.set('mv', deck.id)
    })

    // Notify popup of new decks added
    browser.sendMessage({
      type: 'DECK_COUNT',
      decks: Object.keys(mv).length,
    })

    // Check if local deck count matches MV deck count
    if (Object.keys(mv).length >= count) {
      console.debug(
        `KFA: MV: Sync finished with ${Object.keys(mv).length}/${count} decks`,
      )
      break
    }

    morePages = decks.length === conf.mvPageSize
    page++
    console.debug(
      `KFA: MV: Next page ${page}: ${Object.keys(mv).length}/${count} decks`,
    )
  }
}

/**
 * Gets Master Vault authentication information from browser cookies.
 * Validates auth token and fetches user profile data.
 *
 * @returns Promise containing token, userId, and username, or null values if not authenticated
 */
export const getCredsMv = async (): Promise<MvCreds> => {
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
 * Creates a request configuration object for Master Vault API calls.
 * Includes authentication token and proper headers for API access.
 *
 * @param token - Authentication token for API authorization
 * @returns RequestInit object ready for use with fetch()
 */
const requestInitMv = (token: string): RequestInit => ({
  credentials: 'include',
  headers: {
    accept: 'application/json',
    authorization: `Token ${token}`,
  },
})
