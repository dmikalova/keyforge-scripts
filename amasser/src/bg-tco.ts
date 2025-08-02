import {
  getDecksFromStorage,
  staleSyncSeconds,
  syncAgainSeconds,
} from './lib.js'

// The Crucible Online API configuration
const TCO_BASE_URL = 'https://thecrucible.online'

export const handleTcoSync = async () => {
  const syncingTco = await chrome.storage.local
    .get(['syncing-tco'])
    .then(r => r['syncing-tco'])
  if (syncingTco && Date.now() - syncingTco < staleSyncSeconds) {
    console.debug(`KFA: TCO: sync already in progress`)
    return
  }
  chrome.storage.local.set({ 'syncing-tco': Date.now() })
  console.debug('KFA: TCO: deck sync started')

  try {
    const { mv, tco } = await getDecksFromStorage()
    await importDecksToTco(mv, tco)
  } catch (error) {
    console.error('KFA: TCO: Error syncing decks:', error)
    chrome.storage.local.remove(['syncing-tco'])
    chrome.runtime
      .sendMessage({
        type: 'SYNC_ERROR',
        error: error.message,
      })
      .catch(() => {})
  }

  chrome.storage.local.remove(['syncing-tco'])

  // If MV sync is in progress, trigger TCO sync again
  const syncingMv = await chrome.storage.local
    .get(['syncing-mv'])
    .then(r => r['syncing-mv'])
  if (syncingMv && Date.now() - syncingMv < staleSyncSeconds) {
    await new Promise(resolve => setTimeout(resolve, syncAgainSeconds))
    handleTcoSync()
  }
}

export const getTcoRefreshToken = async (): Promise<string | null> => {
  // Check for token in local storage
  let { 'token-tco': refreshToken } = await chrome.storage.local.get([
    'token-tco',
  ])

  if (!refreshToken) {
    console.debug('You must login to The Crucible Online first')
    return null
  }

  return JSON.parse(refreshToken)
}

export const getTcoUser = async (token: string): Promise<TcoUserResponse> => {
  if (!token) {
    throw new Error('No TCO token provided')
  }

  const t = {
    token: token,
  }

  const body = JSON.stringify(t)

  console.debug('KFA: TCO: Fetching user info...')
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
    throw new Error(`Failed to fetch user: ${response.status}`)
  }

  const respJson = await response.json()
  if (!respJson.success) {
    await chrome.storage.local.remove('tcoRefreshToken')
    throw new Error(`Failed to fetch user: ${respJson.error}`)
  }

  return {
    username: respJson.user.username,
    token: respJson.token,
    userId: respJson.user.id,
  }
}

const importDecksToTco = async (mv: Decks, tco: Decks) => {
  // Filter out decks that already have dok=true
  let decksToImport = Object.entries(mv).filter(
    ([id, deck]) => deck === true && !tco[id],
  )

  if (decksToImport.length === 0) {
    console.debug('No new decks to import')
    return
  }

  // Refresh token before fetching TCO decks
  chrome.storage.local.set({ 'syncing-tco': Date.now() + 4 * staleSyncSeconds })
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
      throw new Error(`Failed to fetch TCO decks: ${error.message}`)
    })
  tcoDecks.forEach(tcoDeck => {
    if (mv[tcoDeck.uuid]) {
      tco[tcoDeck.uuid] = true
      chrome.storage.local.set({
        [`ztco.${tcoDeck.uuid}`]: true,
        'syncing-tco': Date.now(),
      })
    }
  })

  decksToImport = Object.entries(mv).filter(
    ([id, deck]) => deck === true && !tco[id],
  )
  console.debug(`KFA: TCO: Decks to import: ${decksToImport.length}`)

  for (const [i, deck] of decksToImport.entries()) {
    // Refresh token before each import to avoid unauthorized errors
    console.debug(
      `Importing deck to ${i + 1}/${decksToImport.length}: ${
        deck[0]
      } to TCO...`,
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
      console.debug(`Imported ${deck[0]}`)
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
      console.debug(`Deck already imported to TCO ${deck[0]}`)
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
      console.debug(`Failed to import to TCO with known error ${deck[0]}`)
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
      console.debug(`Rate limiting hit, pausing`)
      for (let timeout = 0; timeout < 60; timeout++) {
        chrome.storage.local.set({ 'syncing-tco': Date.now() })
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } else {
      console.error(
        `Failed to import to TCO with unknown error ${deck[0]}: ${
          response.status
        } ${JSON.stringify(respJson)}`,
      )
      chrome.storage.local.set({ 'syncing-tco': Date.now() })
    }

    console.debug(`Waiting before next import due to rate limits...`)
    for (let timeout = 0; timeout < 10; timeout++) {
      chrome.storage.local.set({ 'syncing-tco': Date.now() })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
