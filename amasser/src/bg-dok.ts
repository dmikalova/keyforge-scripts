import { getDecksFromStorage } from './lib.js'

// Decks of KeyForge configuration
const DOK_BASE_URL = 'https://decksofkeyforge.com'
const SYNC_MSGS = ['Syncing DoK.', 'Syncing DoK..', 'Syncing DoK...']

export const handleDokSync = async () => {
  const syncingDok = await chrome.storage.local
    .get(['syncing-dok'])
    .then(r => r['syncing-dok'])
  if (syncingDok && Date.now() - syncingDok < 60 * 1000) {
    console.debug(`KFA: DoK: sync already in progress`)
    return
  }
  chrome.storage.local.set({ 'syncing-dok': Date.now() })
  console.debug('KFA: DoK: deck sync started')

  try {
    const { mv, dok } = await getDecksFromStorage()
    await importDecksToDok(mv, dok)
  } catch (error) {
    console.error('Error syncing DoK decks:', error)
    chrome.storage.local.remove(['syncing-dok'])
    chrome.runtime
      .sendMessage({
        type: 'SYNC_ERROR',
        error: error.message,
      })
      .catch(() => {})
  }

  chrome.storage.local.remove(['syncing-dok'])

  // If MV sync is in progress, trigger Dok sync again
  if (
    await chrome.storage.local.get(['syncing-mv']).then(r => r['syncing-mv'])
  ) {
    handleDokSync()
  }
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
    chrome.storage.local.remove(['token-dok'])
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

  const dokLibrary = await fetch(`${DOK_BASE_URL}/api/decks/filter`, {
    credentials: 'include',
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US',
      authorization: token,
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      timezone: '0',
    },
    body: JSON.stringify({
      page: 0,
      pageSize: 1000,
      sort: 'ADDED_DATE',
      sortDirection: 'DESC',
      owner: username,
    }),
    method: 'POST',
  })
    .then(response => response.json())
    .then(response => {
      console.debug(`Fetched ${response.decks.length} decks from DoK library`)
      return response.decks
    })
    .catch(error => {
      console.error('Error fetching DoK library:', error)
    })
  console.debug(`KFA: DoK: Fetched ${dokLibrary.length} decks from DoK library`)

  for (const deck of dokLibrary) {
    dok[deck.keyforgeId] = true
    chrome.storage.local.set({ [`zdok.${deck.keyforgeId}`]: true })
    chrome.storage.local.set({ 'syncing-dok': Date.now() })
  }

  decksToImport = Object.entries(mv).filter(
    ([id, deck]) => deck === true && !dok[id],
  )

  if (decksToImport.length === 0) {
    console.debug('KFA: DoK: No new decks to import')
    return
  }

  for (const [i, deck] of decksToImport.entries()) {
    console.debug(
      `Importing deck ${i + 1}/${decksToImport.length}: ${deck} to DoK...`,
    )
    const response = await fetch(
      `${DOK_BASE_URL}/api/decks/${deck[0]}/import-and-add`,
      createDokRequestConfig(token),
    )

    if (response.ok) {
      console.debug(`Imported ${deck[0]}`)
      dok[deck[0]] = true
      chrome.storage.local.set({ [`zdok.${deck[0]}`]: true })
      chrome.storage.local.set({ 'syncing-dok': Date.now() })
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
