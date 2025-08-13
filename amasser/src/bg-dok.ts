import { conf } from './conf.js'
import { browser } from './lib-browser.js'
import { storage } from './lib-storage.js'
import { timer } from './lib-timer.js'

/**
 * Main entry point for Decks of KeyForge synchronization
 * Imports decks from Master Vault to Decks of KeyForge
 */
export const handleSyncDok = async () => {
  if (!(await timer.stale(['syncingDok']))) {
    return console.debug(`KFA: DoK: Sync already in progress`)
  }
  await storage.set({ syncingDok: Date.now() })
  await timer.sleep(conf.timeoutMs * 2)
  console.debug(`KFA: DoK: Sync starting`)
  await syncDok()
  await storage.remove('syncingDok')
}

/**
 * Main synchronization loop for Decks of KeyForge
 * Continuously imports decks until no new decks are available
 */
const syncDok = async () => {
  let syncing = true
  let failures = 0
  while (syncing && failures < conf.maxSyncFailures) {
    try {
      await importDecksDok()
    } catch (error: unknown) {
      failures++
      console.warn(`KFA: DoK: Error syncing: ${error}`)
      await storage.remove('syncingDok')
      browser.sendMessage({
        type: 'SYNC_ERROR',
        error: error instanceof Error ? error.message : String(error),
      })
    }

    if ((await storage.decks.unsynced('dok')).length === 0) {
      syncing = false
    }
  }

  await timer.waitForSync('syncingMv', syncDok)
}

/**
 * Imports decks from Master Vault to Decks of KeyForge.
 * First fetches the user's existing library to avoid duplicates,
 * then processes all unsynced decks one by one with error handling.
 * Logs progress and handles API failures gracefully.
 */
const importDecksDok = async () => {
  const { token, username } = await getCredsDok()
  if (!token || !username) {
    console.debug(`KFA: DoK: Not logged in, skipping import`)
    return
  }

  await getDecksDok(token, username)
  const unsyncedDecks = await storage.decks.unsynced('dok')
  if (unsyncedDecks.length === 0) {
    console.debug(`KFA: DoK: No new decks to import`)
    return
  }

  console.debug(`KFA: DoK: Importing ${unsyncedDecks.length} decks`)
  for (const [i, deck] of unsyncedDecks.entries()) {
    console.debug(
      `KFA: DoK: Importing deck ${i + 1}/${unsyncedDecks.length}: ${deck}`,
    )
    await fetch(
      `${conf.dokBaseUrl}/api/decks/${deck[0]}/import-and-add`,
      requestInitDok(token, 'POST'),
    )
      .then(async r => {
        if (!r.ok) {
          const j = await r.json()
          console.log('teesttt:', r.status, JSON.stringify(j))
          switch (true) {
            case r.status === 417 &&
              j.message ===
                `No deck found with Master Vault Deck Id: ${deck[0]}`:
              await storage.decks.set('dok', deck[0], 'import error')
              console.debug(
                `KFA: DoK: Import failed with known error for deck: ${deck[0]}`,
              )
              break

            case r.status === 417 &&
              j.message ===
                'DoK limits requests to Master Vault. Please be patient and try again.':
              console.debug('KFA: DoK: Rate limit hit')
              await timer.sleep(conf.timeoutMs)
              break

            case r.status === 500 && j.error === 'Internal Server Error':
              await storage.decks.set('dok', deck[0], 'internal server error')
              console.debug(
                `KFA: DoK: Import failed with known error for deck: ${deck[0]}`,
              )
              break

            default:
              throw new Error(
                `KFA: DoK: Failed to import deck ${deck[0]}: ${r.status}`,
              )
          }
          return
        }

        await storage.decks.set('dok', deck[0])
        console.debug(`KFA: DoK: Imported ${deck[0]}`)
      })
      .catch(error => {
        console.warn(`KFA: DoK: Error importing deck ${deck[0]}: ${error}`)
        throw new Error(`KFA: DoK: Failed to import deck ${deck[0]}: ${error}`)
      })
  }
}

/**
 * Fetches and stores the user's deck library from Decks of KeyForge.
 * Only runs once per session to avoid redundant API calls.
 * Paginates through all user decks and marks them as synchronized.
 *
 * @param token - The authentication token for API access
 * @param username - The username to fetch decks for
 */
const getDecksDok = async (token: string, username: string) => {
  const { libraryDok } = await storage.get('libraryDok')
  if (!libraryDok) {
    let page = 0
    let morePages = true
    while (morePages) {
      console.debug(`KFA: DoK: Fetching library page ${page}`)
      const { decks }: { decks: DokDeck[] } = await fetch(
        `${conf.dokBaseUrl}/api/decks/filter`,
        requestInitDok(token, 'POST', {
          page: page,
          pageSize: conf.dokPageSize,
          sort: 'ADDED_DATE',
          sortDirection: 'DESC',
          owner: username,
        }),
      )
        .then(r => {
          if (!r.ok) {
            throw new Error(`KFA: DoK: Failed to fetch library: ${r.status}`)
          }
          return r.json()
        })
        .catch(error => {
          console.warn(`KFA: DoK: Error fetching library: ${error}`)
        })

      console.debug(`KFA: DoK: Fetched ${decks.length} library decks`)
      await Promise.all(
        decks.map(async deck => {
          await storage.decks.set('dok', deck.keyforgeId)
        }),
      )

      if (decks.length < conf.dokPageSize) {
        morePages = false
      }
      page++
    }
    await storage.set({ libraryDok: Date.now() })
  }
}

/**
 * Get authentication token from Decks of KeyForge
 * @returns {Promise<string | null>} The auth token or null if not logged in
 */
export const getCredsDok = async (): Promise<DokCreds> => {
  let { authDok } = await storage.get('authDok')
  if (!authDok) {
    console.debug(`KFA: DoK: Not logged in`)
    return { token: null, username: null }
  }

  const { username } = await fetch(
    `${conf.dokBaseUrl}/api/users/secured/your-user`,
    requestInitDok(authDok, 'GET'),
  )
    .then(async r => {
      if (!r.ok) {
        await storage.remove('authDok')
        throw new Error(`KFA: DoK: Failed to fetch user: ${r.status}`)
      }
      return r.json()
    })
    .catch(error => {
      console.warn(`KFA: DoK: Error fetching user: ${error}`)
      storage.remove('authDok')
      return { username: null }
    })

  return { token: authDok, username: username }
}

/**
 * Creates a request configuration object for DoK API calls.
 * Includes standard headers, authentication, and optional body serialization.
 *
 * @param token - The authorization token for API authentication
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param body - Optional request body data that will be JSON stringified
 * @returns RequestInit object ready for use with fetch()
 */
const requestInitDok = (
  token: string,
  method: string,
  body?: any,
): RequestInit => {
  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'accept-language': 'en-US',
      accept: 'application/json',
      authorization: token,
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      timezone: '0',
    },
    method: method,
  }
  if (body !== undefined) {
    config.body = JSON.stringify(body)
  }
  return config
}
