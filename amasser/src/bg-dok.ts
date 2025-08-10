import { conf } from './conf.js'
import { browser } from './lib-browser.js'
import { storage } from './lib-storage.js'
import { lib } from './lib.js'

/**
 * Main entry point for Decks of KeyForge synchronization
 * Imports decks from Master Vault to Decks of KeyForge
 */
export const handleSyncDok = async () => {
  if (!(await lib.timestampsStale(['syncingDok']))) {
    return console.debug(`KFA: DoK: Sync already in progress`)
  }
  await storage.set({ syncingDok: Date.now() })
  await new Promise(r => setTimeout(r, conf.timeoutMs * 2))
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
  while (syncing) {
    try {
      await importDecksDok()
    } catch (error) {
      console.warn(`KFA: DoK: Error syncing: ${error}`)
      await storage.remove('syncingDok')
      browser.sendMessage({
        type: 'SYNC_ERROR',
        error: error.message,
      })
    }

    if ((await lib.unsyncedDecks('dok')).length === 0) {
      syncing = false
    }
  }

  // If MV sync is in progress, trigger Dok sync again
  if (!(await lib.timestampsStale(['syncingMv']))) {
    let waited = 0
    while (waited < conf.syncAgainMs) {
      await storage.set({ syncingDok: Date.now() })
      await new Promise(resolve => setTimeout(resolve, conf.timeoutMs))
      waited += conf.timeoutMs
      if (await lib.timestampsStale(['syncingMv'])) {
        break
      }
    }
    return await syncDok()
  }
}

/**
 * Get authentication token from Decks of KeyForge
 * @returns {Promise<string | null>} The auth token or null if not logged in
 */
export const getCredsDok = async (): Promise<credsDok> => {
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
 * Import decks from Master Vault to Decks of KeyForge
 */
const importDecksDok = async () => {
  const { token, username } = await getCredsDok()
  if (!token || !username) {
    console.debug(`KFA: DoK: Not logged in, skipping import`)
    return
  }

  await getDecksDok(token, username)
  const unsyncedDecks = await lib.unsyncedDecks('dok')
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
          throw new Error(
            `KFA: DoK: Failed to import deck ${deck[0]}: ${r.status}`,
          )
        }
        await storage.set({
          [`zdok.${deck[0]}`]: true,
          syncingDok: Date.now(),
        })
        console.debug(`KFA: DoK: Imported ${deck[0]}`)
      })
      .catch(error => {
        console.warn(`KFA: DoK: Error importing deck ${deck[0]}: ${error}`)
      })
  }
}

const requestInitDok = (
  token: string,
  method: string,
  body?: any,
): RequestInit => {
  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'accept-language': 'en-US',
      accept: 'application/json, text/plain, */*',
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

const getDecksDok = async (token: string, username: string) => {
  const { libraryDok } = await storage.get('libraryDok')
  if (!libraryDok) {
    let page = 0
    let morePages = true
    while (morePages) {
      console.debug(`KFA: DoK: Fetching library page ${page}`)
      const { decks } = await fetch(
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
      await decks.forEach(deck => {
        decks[deck.keyforgeId] = true
        storage.set({
          [`zdok.${deck.keyforgeId}`]: true,
          syncingDok: Date.now(),
        })
      })

      if (decks.length < conf.dokPageSize) {
        morePages = false
      }
      page++
    }
    await storage.set({ libraryDok: Date.now() })
  }
}
