import { getLocalDecks, setLocalDecks } from './lib.js'

// Master Vault API configuration
const MV_BASE_URL = 'https://www.keyforgegame.com'
const SYNC_MSGS = ['Syncing MV..', 'Syncing MV...', 'Syncing MV.']

/**
 * Main entry point for Master Vault synchronization
 */
export const handleMvSync = async () => {
  console.log('MV deck sync started')
  try {
    const localDecks = await getLocalDecks()
    const mvDecks = await getMvDecks(localDecks)
    // await favoriteLegacyDecks(mvDecks)
    await setLocalDecks(mvDecks)
  } catch (error) {
    console.error('Error syncing MV decks:', error)
    chrome.runtime
      .sendMessage({
        type: 'SYNC_ERROR',
        error: error.message,
      })
      .catch(() => {})
  }
}

export const getMvAuth = async () => {
  const authCookie = await getMvAuthCookie()
  if (!authCookie) {
    console.log('You must login to Master Vault first')
    return { token: null, userId: null, username: null }
  }
  console.log('Master Vault auth cookie loaded...')

  const user = await getMvUser(authCookie.value)
  console.log('Master Vault user ID:', user.id)

  return { token: authCookie.value, userId: user.id, username: user.username }
}

/**
 * Get authentication cookie from Master Vault
 */
const getMvAuthCookie = () => {
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
const createMvRequestConfig = token => ({
  credentials: 'include',
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
const getMvUser = async token => {
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
 * Fetch decks from Master Vault with pagination
 */
const getMvDecks = async decks => {
  if (typeof decks !== 'object' || decks === null) {
    decks = {}
    console.log('Initialized decks as an empty object')
  }

  const { token, userId } = await getMvAuth()

  console.log('Fetching Master Vault decks for user:', userId)
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
    console.log(`Fetched page ${page} with ${data.decks.length} decks`)
    data.decks.forEach(deck => {
      if (decks[deck.id]) {
        decks[deck.id].mv = true
      } else {
        decks[deck.id] = {
          id: deck.id,
          mv: true,
        }
      }
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
      console.log(
        `All ${Object.keys(decks).length}/${
          data.count
        } decks fetched, breaking loop`,
      )
      break
    }

    hasMorePages = data.decks.length === pageSize
    page++
    console.log(
      `Moving to page ${page}: ${Object.keys(decks).length}/${data.count}`,
    )
  }
  return decks
}

const favoriteLegacyDecks = async decks => {
  if (typeof decks !== 'object' || decks === null) {
    decks = {}
    console.log('Initialized decks as an empty object')
  }

  const { token, userId } = await getMvAuth()

  console.log('Fetching Master Vault legacy decks for user:', userId)
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
    console.log(`Fetched legacy page ${page} with ${data.decks.length} decks`)
    data.decks.forEach(async deck => {
      if (decks[deck.id]) {
        console.log(`Legacy deck ${deck.id} is owned`)
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
        console.log(`Adding unowned legacy deck ${deck.id} to favorites`)
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
    console.log(
      `Moving to page ${page}: ${Object.keys(decks).length}/${data.count}`,
    )
  }
}

// TODO: fail forward if TCO asks for more deck info
// TODO: add content scripts to import decks from MV to DoK on each MV load / scan
// TODO: convert to TypeScript
// TODO: random quotes
// TODO: add little i bubbles for more info on each option
