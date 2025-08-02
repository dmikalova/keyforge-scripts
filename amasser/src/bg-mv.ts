import { getDecksFromStorage } from './lib.js'

// Master Vault API configuration
const MV_BASE_URL = 'https://www.keyforgegame.com'
const SYNC_MSGS = ['Syncing MV.', 'Syncing MV..', 'Syncing MV...']

/**
 * Main entry point for Master Vault synchronization
 */
export const handleMvSync = async () => {
  if (
    await chrome.storage.local.get(['syncing-mv']).then(r => r['syncing-mv'])
  ) {
    console.debug(`KFA: MV: sync already in progress`)
    return
  }
  chrome.storage.local.set({ 'syncing-mv': Date.now() })
  console.debug('KFA: MV: deck sync started')

  try {
    const { mv: decks } = await getDecksFromStorage()
    await getDecksFromMv(decks)
  } catch (error) {
    console.error('KFA: MV: Error syncing decks:', error)
    chrome.runtime
      .sendMessage({
        type: 'SYNC_ERROR',
        error: error.message,
      })
      .catch(() => {})
  }

  chrome.storage.local.remove(['syncing-mv'])
}

export const getMvAuth = async (): Promise<
  MvAuth | { token: null; userId: null; username: null }
> => {
  const authCookie = await getMvAuthCookie()
  if (!authCookie) {
    console.debug('You must login to Master Vault first')
    return { token: null, userId: null, username: null }
  }
  console.debug('Master Vault auth cookie loaded...')

  const user = await getMvUser(authCookie.value)
  console.debug('Master Vault user ID:', user.id)

  return { token: authCookie.value, userId: user.id, username: user.username }
}

/**
 * Get authentication cookie from Master Vault
 */
const getMvAuthCookie = (): Promise<chrome.cookies.Cookie | null> => {
  return new Promise(resolve => {
    if (!chrome.cookies) {
      console.error('ERROR: Chrome cookies API is not available.')
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
 * Create request configuration with authentication
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
 * Fetch current user information from Master Vault
 */
const getMvUser = async (token: string): Promise<MvUser> => {
  const response = await fetch(
    `${MV_BASE_URL}/api/users/self/`,
    createMvRequestConfig(token),
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`)
  }

  const user = await response.json()
  return { id: user.data.id, username: user.data.username }
}

/**
 * Fetch new decks from Master Vault
 */
const getDecksFromMv = async (decks = {}) => {
  if (typeof decks !== 'object' || decks === null) {
    decks = {}
  }

  chrome.storage.local.set({ 'syncing-mv': Date.now() })

  const { token, userId } = await getMvAuth()

  console.debug('Fetching Master Vault decks for user:', userId)
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
    data.decks.forEach(deck => {
      decks[deck.id] = true
      chrome.storage.local.set({ [`zmv.${deck.id}`]: true })
    })

    // Notify popup of new decks added
    chrome.runtime
      .sendMessage({
        type: 'SYNC_STATUS',
        decks: Object.keys(decks).length,
        button: SYNC_MSGS[Object.keys(decks).length % SYNC_MSGS.length],
      })
      .catch(() => {})

    if (Object.keys(decks).length === data.count) {
      console.debug(
        `All ${Object.keys(decks).length}/${
          data.count
        } decks fetched, breaking loop`,
      )
      break
    }

    hasMorePages = data.decks.length === pageSize
    page++
    console.debug(
      `Moving to page ${page}: ${Object.keys(decks).length}/${data.count}`,
    )
  }
}

const favoriteLegacyDecks = async decks => {
  if (typeof decks !== 'object' || decks === null) {
    decks = {}
    console.debug('Initialized decks as an empty object')
  }

  const { token, userId } = await getMvAuth()

  console.debug('Fetching Master Vault legacy decks for user:', userId)
  const requestConfig = createMvRequestConfig(token)
  const pageSize = 10
  let page = 1
  let hasMorePages = true

  while (hasMorePages) {
    const url = `${MV_BASE_URL}/api/users/${userId}/decks/?page=${page}&page_size=${pageSize}&search=&ordering=-date`
    const response = await fetch(url, requestConfig)

    if (!response.ok) {
      throw new Error(`Failed to fetch decks page ${page}: ${response.status}`)
    }

    const data = await response.json().then(data => {
      return { count: data.count, decks: data.data }
    })
    console.debug(`Fetched legacy page ${page} with ${data.decks.length} decks`)
    data.decks.forEach(async deck => {
      if (decks[deck.id]) {
        console.debug(`Legacy deck ${deck.id} is owned`)
        await fetch(`${MV_BASE_URL}/api/users/${userId}/decks/favorites/`, {
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'accept-language': 'en-us',
            authorization: `Token ${token}`,
            'x-authorization': `Token ${token}`,
            'content-type': 'application/json',
          },
          method: 'DELETE',
          body: JSON.stringify({ deck_id: deck.id }),
        })
      } else {
        console.debug(`Adding unowned legacy deck ${deck.id} to favorites`)
        await fetch(`${MV_BASE_URL}/api/users/${userId}/decks/favorites/`, {
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'accept-language': 'en-us',
            authorization: `Token ${token}`,
            'x-authorization': `Token ${token}`,
            'content-type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ deck_id: deck.id }),
        })
      }
    })

    hasMorePages = data.decks.length === pageSize
    page++
    console.debug(
      `Moving to page ${page}: ${Object.keys(decks).length}/${data.count}`,
    )
  }
}

// TODO: stop all clicks while running
// TODO: don't allow clicks while bg syncing//
// TODO: while syncing change clear data to stop sync - probably by restarting the extension?
// TODO: run daily https://stackoverflow.com/questions/36241436/chrome-extension-use-javascript-to-run-periodically-and-log-data-permanently
// TODO: clearing data should restart the extension as well
