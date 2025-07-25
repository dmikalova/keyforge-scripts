import { getLocalDecks, setLoadingState, setLocalDecks } from './lib.js'

// Master Vault configuration
const MV_BASE_URL = 'https://www.keyforgegame.com'

/**
 * Main entry point for Master Vault synchronization
 */
export const handleMvSync = async () => {
  try {
    setLoadingState(true)
    const localDecks = await getLocalDecks()
    const mvDecks = await getMvDecks(localDecks)
    // await favoriteLegacyDecks(mvDecks)
    await setLocalDecks(mvDecks)
  } catch (error) {
    console.error('Error syncing Master Vault decks:', error)
  } finally {
    setLoadingState(false)
  }
}

const getMvAuth = async () => {
  const authCookie = await getMvAuthCookie()
  if (!authCookie) {
    alert('You must login to Master Vault first')
    throw new Error(`Failed to get auth cookie: ${authCookie}`)
  }
  console.log('Master Vault auth cookie loaded...')

  const userId = await getMvUser(authCookie.value)
  console.log('Master Vault user ID:', userId)

  return { token: authCookie.value, userId: userId }
}

/**
 * Get authentication cookie from Master Vault
 */
const getMvAuthCookie = () => {
  return new Promise(resolve => {
    if (!chrome.cookies) {
      alert('ERROR: Chrome cookies API is not available.')
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
  return user.data.id
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
// TODO: options: sync dok, sync tco, sync mv, sync legacy, favorite unowned legacy
// TODO: add little i bubbles for more info on each option
// TODO: add content scripts to import decks from MV to DoK
// TODO: convert to TypeScript
// TODO: random quote
