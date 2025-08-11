import { conf } from './conf.js'
import { browser } from './lib-browser.js'
import { storage } from './lib-storage.js'
import { timer } from './lib-timer.js'

/**
 * Main entry point for The Crucible Online synchronization
 * Imports decks from Master Vault to The Crucible Online
 */
export const handleSyncTco = async () => {
  if (!(await timer.stale(['syncingTco']))) {
    return console.debug(`KFA: TCO: Sync already in progress`)
  }
  await storage.set({ syncingTco: Date.now() })
  await timer.sleep(conf.timeoutMs * 2)
  console.debug(`KFA: TCO: Sync starting`)
  await syncTco()
  await storage.remove('syncingTco')
}

/**
 * Core synchronization loop for The Crucible Online.
 * Continuously imports decks until all are synchronized.
 * Waits for Master Vault sync to complete before continuing.
 */
const syncTco = async () => {
  let syncing = true
  while (syncing) {
    try {
      await importDecksTco()
    } catch (error) {
      console.warn(`KFA: TCO: Error syncing decks: ${error}`)
      storage.remove('syncingTco')
      browser.sendMessage({
        type: 'SYNC_ERROR',
        error: error.message,
      })
    }

    if ((await storage.decks.unsynced('tco')).length === 0) {
      syncing = false
    }
  }

  await timer.waitForSync('syncingMv', syncTco)
}

/**
 * Import decks from Master Vault to The Crucible Online.
 * Processes unsynced decks one by one with throttling and error handling.
 * Handles various import scenarios including existing decks and rate limits.
 */
const importDecksTco = async () => {
  await getDecksTco()
  const unsyncedDecks = await storage.decks.unsynced('tco')
  if (unsyncedDecks.length === 0) {
    console.debug(`KFA: TCO: No new decks to import`)
    return
  }

  console.debug(`KFA: TCO: Importing ${unsyncedDecks.length} decks`)
  for (const [i, deck] of unsyncedDecks.entries()) {
    const { token } = await getCredsTco()
    if (!token) {
      console.debug(`KFA: TCO: Not logged in, skipping import`)
      return
    }

    console.debug(
      `KFA: TCO: Importing deck ${i + 1}/${unsyncedDecks.length}: ${deck}`,
    )
    await fetch(
      `${conf.tcoBaseUrl}/api/decks/`,
      requestInitTco('POST', token, { uuid: deck[0] }),
    )
      .then(async r => {
        if (!r.ok) {
          throw new Error(
            `KFA: TCO: Failed to import deck ${deck[0]}: ${r.status}`,
          )
        }
        return r.json()
      })
      .then(async r => {
        switch (true) {
          case r.success:
            console.debug(`KFA: TCO: Imported deck: ${deck[0]}`)
            await storage.decks.set('tco', deck[0])
            break

          case !r.success && r.message === 'Deck already exists.':
            console.debug(`KFA: TCO: Already imported deck: ${deck[0]}`)
            await storage.decks.set('tco', deck[0])
            break

          case !r.success &&
            [
              "Cannot read properties of undefined (reading 'house')",
              'This deck is from a future expansion and not currently supported',
            ].some(msg => r.message.includes(msg)):
            console.debug(
              `KFA: TCO: Import failed with known error for deck: ${deck[0]}`,
            )
            await storage.decks.set('tco', deck[0], 'import error')
            break

          case !r.success &&
            r.message === 'Invalid response from Api. Please try again later.':
            console.debug(`KFA: TCO: Rate limit hit, pausing`)
            let waited = 0
            while (waited < conf.tcoTimeoutMs) {
              storage.set({ syncingTco: Date.now() })
              await timer.sleep(conf.timeoutMs)
              waited += conf.timeoutMs
            }
            break

          default:
            console.debug(
              `KFA: TCO: Import failed with unknown error for deck: ${deck[0]}: ${JSON.stringify(r)}`,
            )
            storage.set({ syncingTco: Date.now() })
        }
      })
      .catch(error => {
        console.warn(`KFA: TCO: Error importing deck ${deck[0]}: ${error}`)
      })

    // console.debug(`KFA: TCO: Wait before next import`)
    let waited = 0
    while (waited < conf.tcoThrottleMs) {
      storage.set({ syncingTco: Date.now() })
      await timer.sleep(conf.timeoutMs)
      waited += conf.timeoutMs
    }
  }
}

/**
 * Fetches and stores the user's deck library from The Crucible Online.
 * Only runs once per session to avoid redundant API calls.
 * Marks all existing decks as synchronized.
 */
const getDecksTco = async () => {
  const { libraryTco } = await storage.get('libraryTco')
  if (!libraryTco) {
    const { token } = await getCredsTco()
    if (!token) {
      return console.debug(`KFA: TCO: Not logged in, skipping library import`)
    }

    storage.set({ syncingTco: Date.now() + 4 * conf.staleSyncMs })
    const { decks }: { decks: TcoDeck[] } = await fetch(
      `${conf.tcoBaseUrl}/api/decks?pageSize=100000&page=1`,
      requestInitTco('GET', token),
    )
      .then(response => response.json())
      .catch(error => {
        throw new Error(`KFA: TCO: Error fetching library: ${error.message}`)
      })

    console.debug(`KFA: TCO: Fetched ${decks.length} library decks`)
    await Promise.all(
      decks.map(async deck => {
        await storage.decks.set('tco', deck.uuid)
      }),
    )
  }
}

/**
 * Get The Crucible Online refresh token from storage and validate user credentials.
 * Exchanges refresh token for access token and fetches user information.
 *
 * @returns Promise containing token, userId, and username, or null values if not authenticated
 */
export const getCredsTco = async (): Promise<TcoCreds> => {
  // Check for token in local storage
  const { authTco } = await storage.get('authTco')
  if (!authTco) {
    console.debug(`KFA: TCO: Not logged in`)
    return { token: null, userId: null, username: null }
  }

  console.debug(`KFA: TCO: Fetching user`)
  const { user, token } = await fetch(
    `${conf.tcoBaseUrl}/api/account/token`,
    requestInitTco('POST', null, { token: JSON.parse(authTco) }),
  )
    .then(async r => {
      if (!r.ok) {
        await storage.remove('authTco')
        throw new Error(`KFA: TCO: Failed to fetch user: ${r.status}`)
      }
      return r.json()
    })
    .catch(error => {
      console.warn(`KFA: TCO: Error fetching user: ${error}`)
    })

  return {
    token: token,
    userId: user.id,
    username: user.username,
  }
}

/**
 * Creates a request configuration object for The Crucible Online API calls.
 * Includes standard headers, optional authentication, and CORS settings.
 *
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param token - Optional Bearer token for authentication
 * @param body - Optional request body data that will be JSON stringified
 * @returns RequestInit object ready for use with fetch()
 */
const requestInitTco = (
  method: string,
  token?: string,
  body?: any,
): RequestInit => {
  const headers: Record<string, string> = {
    accept: 'application/json',
    'accept-language': 'en-us',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    pragma: 'no-cache',
    'x-requested-with': 'XMLHttpRequest',
  }
  if (token) {
    headers.authorization = `Bearer ${token}`
  }

  const config: RequestInit = {
    credentials: 'include',
    headers,
    referrer: `${conf.tcoBaseUrl}/decks`,
    referrerPolicy: 'no-referrer-when-downgrade',
    mode: 'cors',
    method: method,
  }
  if (body !== undefined) {
    config.body = JSON.stringify(body)
  }
  return config
}
