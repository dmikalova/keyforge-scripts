import { conf } from './conf.js'
import { getDecksFromStorage } from './lib.js'

/**
 * Main entry point for Decks of KeyForge synchronization
 * Imports decks from Master Vault to Decks of KeyForge
 */
export const handleSyncDok = async () => {
  const syncingDok = await chrome.storage.local
    .get('syncingDok')
    .then(r => r.syncingDok)
  if (syncingDok && Date.now() - syncingDok < conf.staleSyncSeconds) {
    console.debug(
      `KFA: DoK: Sync already in progress: ${Date.now() - syncingDok}ms`,
    )
    return
  }
  await chrome.storage.local.set({ syncingDok: Date.now() })
  await new Promise(r => setTimeout(r, conf.timeoutMs * 2))
  console.debug(`KFA: DoK: Sync starting`)
  await dokSync()
  await chrome.storage.local.remove('syncingDok')
}

/**
 * Main synchronization loop for Decks of KeyForge
 * Continuously imports decks until no new decks are available
 */
const dokSync = async () => {
  let keepSyncing = true
  while (keepSyncing) {
    try {
      const { mv, dok } = await getDecksFromStorage()
      await importDecksToDok(mv, dok)
    } catch (error) {
      console.warn(`KFA: DoK: Error syncing: ${error}`)
      await chrome.storage.local.remove('syncingDok')
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
      keepSyncing = false
    }
  }

  // If MV sync is in progress, trigger Dok sync again
  const syncingMv = await chrome.storage.local
    .get('syncingMv')
    .then(r => r.syncingMv)
  if (syncingMv && Date.now() - syncingMv < conf.staleSyncSeconds) {
    let waited = 0
    while (waited < conf.syncAgainSeconds) {
      await new Promise(resolve => setTimeout(resolve, conf.timeoutMs))
      waited += conf.timeoutMs
      const stillSyncingMv = await chrome.storage.local
        .get('syncingMv')
        .then(r => r.syncingMv)
      if (
        !stillSyncingMv ||
        Date.now() - stillSyncingMv >= conf.staleSyncSeconds
      ) {
        break
      }
    }
    await dokSync()
  }
}

/**
 * Get authentication token from Decks of KeyForge
 * @returns {Promise<string | null>} The auth token or null if not logged in
 */
export const getDokToken = async (): Promise<string | null> => {
  // Check for token in local storage
  let { authDok } = await chrome.storage.local.get('authDok')

  if (!authDok) {
    console.debug(`KFA: DoK: Not logged in`)
    return null
  }

  return authDok
}

/**
 * Get current user information from Decks of KeyForge
 * @param {string} token - Authentication token
 * @returns {Promise<string>} Username of the authenticated user
 */
export const getDokUser = async (token: string): Promise<string> => {
  const response = await fetch(
    `${conf.dokBaseUrl}/api/users/secured/your-user`,
    {
      credentials: 'include',
      headers: {
        accept: 'application/json',
        'accept-language': 'en-us',
        authorization: token,
        'x-authorization': token,
      },
    },
  )

  if (!response.ok) {
    await chrome.storage.local.remove('authDok')
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

  if (!token) {
    console.debug(`KFA: DoK: Not logged in, skipping import`)
    return
  }

  const username = await getDokUser(token)

  // Filter out decks that already have dok=true
  let decksToImport = Object.entries(mv).filter(
    ([id, deck]) => deck === true && !dok[id],
  )

  if (decksToImport.length === 0) {
    console.debug(`KFA: DoK: No new decks to import`)
    return
  }

  const { libraryDok } = await chrome.storage.local.get(['libraryDok'])
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
          pageSize: conf.dokPageSize,
          sort: 'ADDED_DATE',
          sortDirection: 'DESC',
          owner: username,
        }),
        method: 'POST',
      })
        .then(r => r.json())
        .then(r => r.decks)
        .catch(error => {
          console.warn(`KFA: DoK: Error fetching library: ${error}`)
        })

      console.debug(`KFA: DoK: Fetched ${dokLibrary.length} library decks`)
      dokLibrary.forEach(async dokDeck => {
        dok[dokDeck.keyforgeId] = true
        await chrome.storage.local.set({
          [`zdok.${dokDeck.keyforgeId}`]: true,
          syncingDok: Date.now(),
        })
      })

      if (dokLibrary.length < conf.dokPageSize) {
        nextPage = false
      }
      page++
    }

    await chrome.storage.local.set({ libraryDok: Date.now() })

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
        syncingDok: Date.now(),
      })
      console.debug(`KFA: DoK: Imported ${deck[0]}`)
    } else {
      console.warn(`KFA: DoK: Import failed ${deck[0]}: ${response.status}`)
    }
  }
}
