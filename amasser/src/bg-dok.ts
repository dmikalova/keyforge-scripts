import { conf } from './conf.js'
import { getDecksFromStorage } from './lib.js'

/**
 * Main entry point for Decks of KeyForge synchronization
 * Imports decks from Master Vault to Decks of KeyForge
 */
export const handleDokSync = async () => {
  const syncingDok = await chrome.storage.local
    .get(['syncing-dok'])
    .then(r => r['syncing-dok'])
  if (syncingDok && Date.now() - syncingDok < conf.staleSyncSeconds) {
    console.debug(
      `KFA: DoK: Sync already in progress: ${Date.now() - syncingDok}ms`,
    )
    return
  }
  await chrome.storage.local.set({ 'syncing-dok': Date.now() })
  console.debug(`KFA: DoK: Sync starting`)

  let keepSyncing = true
  while (keepSyncing) {
    try {
      const { mv, dok } = await getDecksFromStorage()
      await importDecksToDok(mv, dok)
    } catch (error) {
      console.error(`KFA: DoK: Error syncing: ${error}`)
      await chrome.storage.local.remove(['syncing-dok'])
      chrome.runtime
        .sendMessage({
          type: 'SYNC_ERROR',
          error: error.message,
        })
        .catch(() => {})
    }

    // Filter out decks that already have dok=true
    const { mv, dok }: { mv: Decks; dok: Decks } = await getDecksFromStorage()
    let decksToImport = Object.entries(mv).filter(
      ([id, deck]) => deck == true && !dok[id],
    )
    if (decksToImport.length === 0) {
      console.debug(`KFA: DoK: No new decks to import`)
      keepSyncing = false
    }
  }

  // If MV sync is in progress, trigger Dok sync again
  const syncingMv = await chrome.storage.local
    .get(['syncing-mv'])
    .then(r => r['syncing-mv'])
  if (syncingMv && Date.now() - syncingMv < conf.staleSyncSeconds) {
    let waited = 0
    while (waited < conf.syncAgainSeconds) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      waited += 1000
      const stillSyncingMv = await chrome.storage.local
        .get(['syncing-mv'])
        .then(r => r['syncing-mv'])
      if (
        !stillSyncingMv ||
        Date.now() - stillSyncingMv >= conf.staleSyncSeconds
      ) {
        break
      }
    }
    await chrome.storage.local.remove(['syncing-dok'])
    await handleDokSync()
  }
  await chrome.storage.local.remove(['syncing-dok'])
}

/**
 * Get authentication token from Decks of KeyForge
 * @returns {Promise<string | null>} The auth token or null if not logged in
 */
export const getDokToken = async (): Promise<string | null> => {
  // Check for token in local storage
  let { 'token-dok': token } = await chrome.storage.local.get(['token-dok'])

  if (!token) {
    console.debug(`KFA: DoK: Not logged in`)
    return null
  }

  return token
}

/**
 * Get current user information from Decks of KeyForge
 * @param {string} token - Authentication token
 * @returns {Promise<string>} Username of the authenticated user
 */
export const getDokUser = async (token: string): Promise<string> => {
  const response = await fetch(`${conf.dokBaseUrl}/api/users/secured/your-user`, {
    credentials: 'include',
    headers: {
      accept: 'application/json',
      'accept-language': 'en-us',
      authorization: token,
      'x-authorization': token,
    },
  })

  if (!response.ok) {
    await chrome.storage.local.remove(['token-dok'])
    throw new Error(`KFA: DoK: Failed to fetch user: ${response.status}`)
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

/**
 * Import decks from Master Vault to Decks of KeyForge
 * @param {Decks} mv - Master Vault deck collection
 * @param {Decks} dok - Decks of KeyForge deck collection
 */
const importDecksToDok = async (mv: Decks, dok: Decks) => {
  console.debug(`KFA: DoK: Importing decks`)
  const token = await getDokToken()
  const username = await getDokUser(token)

  // Filter out decks that already have dok=true
  let decksToImport = Object.entries(mv).filter(
    ([id, deck]) => deck === true && !dok[id],
  )

  if (decksToImport.length === 0) {
    console.debug(`KFA: DoK: No new decks to import`)
    return
  }

  const { 'library-dok': libraryDok } = await chrome.storage.local.get([
    'library-dok',
  ])
  if (!libraryDok) {
    let nextPage = true
    let page = 0
    while (nextPage) {
      console.debug(`KFA: DoK: Fetching library page ${page}`)
      const dokLibrary = await fetch(`${conf.dokBaseUrl}/api/decks/filter`, {
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
          page: page,
          pageSize: 1000,
          sort: 'ADDED_DATE',
          sortDirection: 'DESC',
          owner: username,
        }),
        method: 'POST',
      })
        .then(r => r.json())
        .then(r => r.decks)
        .catch(error => {
          console.error(`KFA: DoK: Error fetching library: ${error}`)
        })

      console.debug(`KFA: DoK: Fetched ${dokLibrary.length} library decks`)
      dokLibrary.forEach(async dokDeck => {
        dok[dokDeck.keyforgeId] = true
        await chrome.storage.local.set({
          [`zdok.${dokDeck.keyforgeId}`]: true,
          'syncing-dok': Date.now(),
        })
      })

      if (dokLibrary.length < 1000) {
        nextPage = false
      }
      page++
    }

    await chrome.storage.local.set({ 'library-dok': Date.now() })

    decksToImport = Object.entries(mv).filter(
      ([id, deck]) => deck === true && !dok[id],
    )

    if (decksToImport.length === 0) {
      console.debug(`KFA: DoK: No new decks to import`)
      return
    }
  }

  console.debug(`KFA: DoK: Importing ${decksToImport.length} decks`)

  for (const [i, deck] of decksToImport.entries()) {
    console.debug(
      `KFA: DoK: Importing deck ${i + 1}/${decksToImport.length}: ${deck}`,
    )
    const response = await fetch(
      `${conf.dokBaseUrl}/api/decks/${deck[0]}/import-and-add`,
      createDokRequestConfig(token),
    )

    if (response.ok) {
      dok[deck[0]] = true
      await chrome.storage.local.set({
        [`zdok.${deck[0]}`]: true,
        'syncing-dok': Date.now(),
      })
      console.debug(`KFA: DoK: Imported ${deck[0]}`)
    } else {
      console.debug(`KFA: DoK: Import failed ${deck[0]}: ${response.status}`)
    }
  }
}
