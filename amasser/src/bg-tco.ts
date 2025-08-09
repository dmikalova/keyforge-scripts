import { conf } from './conf.js'
import { getDecksFromStorage } from './lib.js'

// The Crucible Online API configuration
const TCO_BASE_URL = 'https://thecrucible.online'

export const handleTcoSync = async () => {
  const syncingTco = await chrome.storage.local
    .get(['syncing-tco'])
    .then(r => r['syncing-tco'])
  if (syncingTco && Date.now() - syncingTco < conf.staleSyncSeconds) {
    console.debug(
      `KFA: TCO: sync already in progress: ${Date.now() - syncingTco}ms`,
    )
    return
  }
  await chrome.storage.local.set({ 'syncing-tco': Date.now() })
  console.debug(`KFA: TCO: Sync starting`)
  // TODO: sync in separate fn and set syncing status only here, try catch
  let keepSyncing = true
  while (keepSyncing) {
    try {
      const { mv, tco } = await getDecksFromStorage()
      await importDecksToTco(mv, tco)
    } catch (error) {
      console.error(`KFA: TCO: Error syncing decks: ${error}`)
      chrome.storage.local.remove(['syncing-tco'])
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
      console.debug(`KFA: TCO: No new decks to import`)
      keepSyncing = false
    }
  }

  // If MV sync is in progress, trigger TCO sync again
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
    await chrome.storage.local.remove(['syncing-tco'])
    await handleTcoSync()
  }
  await chrome.storage.local.remove(['syncing-tco'])
}

export const getTcoRefreshToken = async (): Promise<string | null> => {
  // Check for token in local storage
  let { 'token-tco': refreshToken } = await chrome.storage.local.get([
    'token-tco',
  ])

  if (!refreshToken) {
    console.debug(`KFA: TCO: Not logged in`)
    return null
  }

  return JSON.parse(refreshToken)
}

export const getTcoUser = async (token: string): Promise<TcoUserResponse> => {
  if (!token) {
    throw new Error('KFA: TCO: Token missing')
  }

  const t = {
    token: token,
  }

  const body = JSON.stringify(t)

  console.debug(`KFA: TCO: Fetching user`)
  const response = await fetch(`${TCO_BASE_URL}/api/account/token`, {
    credentials: 'include',
    headers: {
      accept: 'application/json',
      'accept-language': 'en-us',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      'x-requested-with': 'XMLHttpRequest',
    },
    referrer: 'https://www.thecrucible.online/decks',
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

const importDecksToTco = async (mv: Decks, tco: Decks) => {
  let decksToImport = Object.entries(mv).filter(
    ([id, deck]) => deck === true && !tco[id],
  )

  if (decksToImport.length === 0) {
    console.debug(`KFA: TCO: No new decks to import`)
    return
  }

  const { 'library-tco': libraryTco } = await chrome.storage.local.get([
    'library-tco',
  ])
  if (!libraryTco) {
    console.debug(`KFA: TCO: Fetching TCO library`)
    chrome.storage.local.set({
      'syncing-tco': Date.now() + 4 * conf.staleSyncSeconds,
    })
    const { token } = await getTcoUser(await getTcoRefreshToken())
    const { decks: tcoDecks } = await fetch(
      `${TCO_BASE_URL}/api/decks?pageSize=100000&page=1`,
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
        'syncing-tco': Date.now(),
      })
    })
    chrome.storage.local.set({ 'library-tco': Date.now() })

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
    const { token } = await getTcoUser(await getTcoRefreshToken())
    const response = await fetch(`${TCO_BASE_URL}/api/decks/`, {
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
      referrer: 'https://www.thecrucible.online/decks/import',
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
        'syncing-tco': Date.now(),
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
        'syncing-tco': Date.now(),
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
        'syncing-tco': Date.now(),
      })
    } else if (
      response.ok &&
      !respJson.success &&
      respJson.message === 'Invalid response from Api. Please try again later.'
    ) {
      console.debug(`KFA: TCO: Rate limit hit, pausing`)
      for (let timeout = 0; timeout < 60; timeout++) {
        chrome.storage.local.set({ 'syncing-tco': Date.now() })
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } else {
      console.error(
        `KFA: TCO: Import failed with unknown error for deck: ${deck[0]}: ${
          response.status
        } ${JSON.stringify(respJson)}`,
      )
      chrome.storage.local.set({ 'syncing-tco': Date.now() })
    }

    // console.debug(`KFA: TCO: Wait before next import`)
    // TODO: get the timeout from lib and use the additive wait method
    for (let timeout = 0; timeout < 10; timeout++) {
      chrome.storage.local.set({ 'syncing-tco': Date.now() })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
