import { getDecksFromStorage } from './lib.js'

// Decks of KeyForge configuration
const DOK_BASE_URL = 'https://decksofkeyforge.com'
const SYNC_MSGS = ['Syncing DoK.', 'Syncing DoK..', 'Syncing DoK...']

export const handleDokSync = async () => {
  console.debug('DoK deck sync started')
  try {
    const { mv, dok } = await getDecksFromStorage()
    await importDecksToDok(mv, dok)
  } catch (error) {
    console.error('Error syncing DoK decks:', error)
    chrome.runtime
      .sendMessage({
        type: 'SYNC_ERROR',
        error: error.message,
      })
      .catch(() => {})
  }

  chrome.storage.local.remove(['syncing-dok'])
}

/**
 * Get authentication cookie from Decks of KeyForge
 */
export const getDokToken = async (): Promise<string | null> => {
  // Check for token in local storage
  let { 'token-dok': token } = await chrome.storage.local.get(['token-dok'])

  if (!token) {
    console.debug('You must login to Decks of KeyForge first')
    return null
  }

  return token
}

export const getDokUser = async (token: string): Promise<string> => {
  const response = await fetch(`${DOK_BASE_URL}/api/users/secured/your-user`, {
    credentials: 'include',
    headers: {
      accept: 'application/json',
      'accept-language': 'en-us',
      authorization: token,
      'x-authorization': token,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`)
  }

  const user = await response.json()
  return user.username
}

/**
 * Create request configuration with authentication
 * @param {string} token - Authentication token
 * @returns {RequestInit} Fetch request configuration
 */
const createDokRequestConfig = (token: string): RequestInit => ({
  credentials: 'include' as RequestCredentials,
  headers: {
    accept: 'application/json',
    'accept-language': 'en-US',
    authorization: token,
    'x-authorization': token,
  },
  method: 'POST',
})

const importDecksToDok = async (mv: Decks, dok: Decks) => {
  const token = await getDokToken()
  const username = await getDokUser(token)

  // Filter out decks that already have dok=true
  let decksToImport = Object.entries(mv).filter(
    ([id, deck]) => deck === true && !dok[id],
  )

  if (decksToImport.length === 0) {
    console.debug('KFA: DoK: No new decks to import')
    return
  }

  console.debug(
    `KFA: DoK: Importing ${decksToImport.length} decks...`,
    decksToImport[0],
  )

  let dokLibraryPage = 0
  let dokNextPage = true
  let dokLibrary = []

  await fetch(`${DOK_BASE_URL}/api/decks/filter`, {
    credentials: 'include',
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9,da;q=0.8',
      authorization: token,
      'cache-control': 'no-cache',
      'content-type': 'application/json;charset=UTF-8',
      pragma: 'no-cache',
      timezone: '-240',
    },
    body: JSON.stringify({
      houses: [],
      page: dokLibraryPage,
      constraints: [],
      expansions: [],
      pageSize: 1000,
      title: '',
      sort: 'ADDED_DATE',
      forSale: false,
      notForSale: false,
      forTrade: false,
      forAuction: false,
      withOwners: false,
      completedAuctions: false,
      includeUnregistered: true,
      myFavorites: false,
      cards: [],
      sortDirection: 'DESC',
      owner: username,
    }),
    method: 'POST',
  })
    .then(response => response.json())
    .then(response => {
      if (response.decks.length === 0) {
        dokNextPage = false
        return
      }
      console.debug(
        `Fetched ${response.decks.length} decks from DoK library on page ${
          dokLibraryPage + 1
        }`,
      )
      dokLibrary = dokLibrary.concat(response.decks)
    })
    .catch(error => {
      console.error('Error fetching DoK library:', error)
      dokNextPage = false
    })
  console.debug(`Fetched ${dokLibrary.length} decks from DoK library`)

  for (const deck of dokLibrary) {
    // console.debug(`KFA: DoK: Found deck in library: ${deck.keyforgeId}`)
    dok[deck.keyforgeId] = true
    chrome.storage.local.set({ [`zdok.${deck.keyforgeId}`]: true })
  }

  decksToImport = Object.entries(mv).filter(
    ([id, deck]) => deck === true && !dok[id],
  )

  if (decksToImport.length === 0) {
    console.debug('KFA: DoK: No new deckz to import')
    return
  }

  for (const [i, deck] of decksToImport.entries()) {
    console.debug(
      `Importing deck ${i + 1}/${decksToImport.length}: ${JSON.stringify(
        deck,
      )} to DoK...`,
    )
    const response = await fetch(
      `${DOK_BASE_URL}/api/decks/${deck[0]}/import-and-add`,
      createDokRequestConfig(token),
    )

    if (response.ok) {
      console.debug(`Imported ${deck[0]}`)
      dok[deck[0]] = true
      chrome.storage.local.set({ [`zdok.${deck[0]}`]: true })
    } else {
      console.error(`Failed to import ${deck[0]}: ${response.status}`)
    }

    chrome.runtime
      .sendMessage({
        type: 'SYNC_STATUS',
        button: SYNC_MSGS[i % SYNC_MSGS.length],
      })
      .catch(() => {})
  }
}
