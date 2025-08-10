import { conf } from './conf.js'
import { getDecksFromStorage } from './lib.js'

/**
 * Main entry point for The Crucible Online synchronization
 * Imports decks from Master Vault to The Crucible Online
 */
export const handleSyncTco = async () => {
  const syncingTco = await chrome.storage.local
    .get('syncingTco')
    .then(r => r.syncingTco)
  if (syncingTco && Date.now() - syncingTco < conf.staleSyncSeconds) {
    console.debug(
      `KFA: TCO: sync already in progress: ${Date.now() - syncingTco}ms`,
    )
    return
  }
  await chrome.storage.local.set({ syncingTco: Date.now() })
  await new Promise(r => setTimeout(r, conf.timeoutMs * 2))
  console.debug(`KFA: TCO: Sync starting`)
  await syncTco()
  await chrome.storage.local.remove('syncingTco')
}

const syncTco = async () => {
  let keepSyncing = true
  while (keepSyncing) {
    try {
      const { mv, tco } = await getDecksFromStorage()
      await importDecksToTco(mv, tco)
    } catch (error) {
      console.warn(`KFA: TCO: Error syncing decks: ${error}`)
      chrome.storage.local.remove('syncingTco')
      chrome.runtime
        .sendMessage({
          type: 'SYNC_ERROR',
          error: error.message,
        })
        .catch(() => {})
    }

    // Filter out decks that already have tco=true
    const { mv, tco }: { mv: Decks; tco: Decks } = await getDecksFromStorage()
    let decksToImport = Object.entries(mv).filter(
      ([id, deck]) => deck == true && !tco[id],
    )
    if (decksToImport.length === 0) {
      keepSyncing = false
    }
  }

  // If MV sync is in progress, trigger TCO sync again
  const syncingMv = await chrome.storage.local
    .get('syncingMv')
    .then(r => r.syncingMv)
  if (syncingMv && Date.now() - syncingMv < conf.staleSyncSeconds) {
    let waited = 0
    while (waited < conf.syncAgainSeconds) {
      await new Promise(r => setTimeout(r, conf.timeoutMs))
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
    await syncTco()
  }
}

/**
 * Get The Crucible Online refresh token from storage
 * @returns {Promise<string | null>} The refresh token or null if not logged in
 */
export const getTcoAuth = async (): Promise<string | null> => {
  // Check for token in local storage
  let { authTco: authTco } = await chrome.storage.local.get('authTco')

  if (!authTco) {
    console.debug(`KFA: TCO: Not logged in`)
    return null
  }

  return JSON.parse(authTco)
}

/**
 * Get user information from The Crucible Online
 * @param {string} token - Refresh token for authentication
 * @returns {Promise<TcoUserResponse>} User data including username, token, and userId
 */
export const getTcoUser = async (token: string): Promise<TcoUserResponse> => {
  if (!token) {
    throw new Error('KFA: TCO: Token missing')
  }

  const t = {
    token: token,
  }

  const body = JSON.stringify(t)

  console.debug(`KFA: TCO: Fetching user`)
  const response = await fetch(`${conf.tcoBaseUrl}/api/account/token`, {
    credentials: 'include',
    headers: {
      accept: 'application/json',
      'accept-language': 'en-us',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      'x-requested-with': 'XMLHttpRequest',
    },
    referrer: `${conf.tcoBaseUrl}/decks`,
    referrerPolicy: 'no-referrer-when-downgrade',
    mode: 'cors',
    method: 'POST',
    body: body,
  })

  if (!response.ok) {
    throw new Error(`KFA: TCO: Failed to fetch user: ${response.status}`)
  }

  const respJson = await response.json()
  if (!respJson.success) {
    await chrome.storage.local.remove('tcoRefreshToken')
    throw new Error(`KFA: TCO: Failed to fetch user: ${respJson.error}`)
  }

  return {
    username: respJson.user.username,
    token: respJson.token,
    userId: respJson.user.id,
  }
}

/**
 * Import decks from Master Vault to The Crucible Online
 * @param {Decks} mv - Master Vault deck collection
 * @param {Decks} tco - The Crucible Online deck collection
 */
const importDecksToTco = async (mv: Decks, tco: Decks) => {
  let decksToImport = Object.entries(mv).filter(
    ([id, deck]) => deck === true && !tco[id],
  )

  if (decksToImport.length === 0) {
    console.debug(`KFA: TCO: No new decks to import`)
    return
  }

  const { libraryTco } = await chrome.storage.local.get('libraryTco')
  if (!libraryTco) {
    console.debug(`KFA: TCO: Fetching TCO library`)
    chrome.storage.local.set({
      syncingTco: Date.now() + 4 * conf.staleSyncSeconds,
    })

    const auth = await getTcoAuth()
    if (!auth) {
      console.debug(`KFA: TCO: Not logged in, skipping import`)
      return
    }

    const { token } = await getTcoUser(auth)
    const { decks: tcoDecks } = await fetch(
      `${conf.tcoBaseUrl}/api/decks?pageSize=100000&page=1`,
      {
        credentials: 'include',
        headers: {
          accept: '*/*',
          'accept-language': 'en-US',
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          pragma: 'no-cache',
          'x-requested-with': 'XMLHttpRequest',
        },
        method: 'GET',
      },
    )
      .then(response => response.json())
      .catch(error => {
        throw new Error(`KFA: TCO: Error fetching library: ${error.message}`)
      })
    tcoDecks.forEach(tcoDeck => {
      tco[tcoDeck.uuid] = true
      chrome.storage.local.set({
        [`ztco.${tcoDeck.uuid}`]: true,
        syncingTco: Date.now(),
      })
    })
    chrome.storage.local.set({ libraryTco: Date.now() })

    decksToImport = Object.entries(mv).filter(
      ([id, deck]) => deck === true && !tco[id],
    )

    if (decksToImport.length === 0) {
      console.debug(`KFA: TCO: No new decks to import`)
      return
    }
  }
  console.debug(`KFA: TCO: Importing ${decksToImport.length} decks`)

  for (const [i, deck] of decksToImport.entries()) {
    // Refresh token before each import to avoid unauthorized errors
    console.debug(
      `KFA: TCO: Importing deck ${i + 1}/${decksToImport.length}: ${deck}`,
    )
    const auth = await getTcoAuth()
    if (!auth) {
      console.debug(`KFA: TCO: Not logged in, skipping import`)
      return
    }

    const { token } = await getTcoUser(auth)
    const response = await fetch(`${conf.tcoBaseUrl}/api/decks/`, {
      credentials: 'include',
      headers: {
        accept: '*/*',
        'accept-language': 'en-US',
        authorization: `Bearer ${token}`,
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        pragma: 'no-cache',
        'x-requested-with': 'XMLHttpRequest',
      },
      referrer: `${conf.tcoBaseUrl}/decks/import`,
      referrerPolicy: 'no-referrer-when-downgrade',
      body: JSON.stringify({
        uuid: deck[0],
      }),
      method: 'POST',
    })

    const respJson = await response.json()

    const tcoImportErrorMessages = [
      "Cannot read properties of undefined (reading 'house')",
      'This deck is from a future expansion and not currently supported',
    ]

    if (response.ok && respJson.success) {
      console.debug(`KFA: TCO: Imported deck: ${deck[0]}`)
      tco[deck[0]] = true
      chrome.storage.local.set({
        [`ztco.${deck[0]}`]: true,
        syncingTco: Date.now(),
      })
    } else if (
      response.ok &&
      !respJson.success &&
      respJson.message === 'Deck already exists.'
    ) {
      console.debug(`KFA: TCO: Already imported deck: ${deck[0]}`)
      tco[deck[0]] = true
      chrome.storage.local.set({
        [`ztco.${deck[0]}`]: true,
        syncingTco: Date.now(),
      })
    } else if (
      response.ok &&
      !respJson.success &&
      tcoImportErrorMessages.some(msg => respJson.message.includes(msg))
    ) {
      console.debug(
        `KFA: TCO: Import failed with known error for deck: ${deck[0]}`,
      )
      tco[deck[0]] = 'import error'
      chrome.storage.local.set({
        [`ztco.${deck[0]}`]: 'import error',
        syncingTco: Date.now(),
      })
    } else if (
      response.ok &&
      !respJson.success &&
      respJson.message === 'Invalid response from Api. Please try again later.'
    ) {
      console.debug(`KFA: TCO: Rate limit hit, pausing`)
      for (let timeout = 0; timeout < 60; timeout++) {
        chrome.storage.local.set({ syncingTco: Date.now() })
        await new Promise(resolve => setTimeout(resolve, conf.timeoutMs))
      }
    } else {
      console.debug(
        `KFA: TCO: Import failed with unknown error for deck: ${deck[0]}: ${
          response.status
        } ${JSON.stringify(respJson)}`,
      )
      chrome.storage.local.set({ syncingTco: Date.now() })
    }

    // console.debug(`KFA: TCO: Wait before next import`)
    let wait = 0
    while (wait < conf.tcoThrottleMs) {
      chrome.storage.local.set({ syncingTco: Date.now() })
      await new Promise(resolve => setTimeout(resolve, conf.timeoutMs))
      wait += conf.timeoutMs
    }
  }
}
