import { getLocalDecks, setLocalDecks } from './lib.js'

// The Crucible Online API configuration
const TCO_BASE_URL = 'https://thecrucible.online'
const SYNC_MSGS = ['Syncing TCO..', 'Syncing TCO...', 'Syncing TCO.']

export const handleTcoSync = async () => {
  console.log('TCO deck sync started')
  try {
    const localDecks = await getLocalDecks()
    const tcoDecks = await importDecksToTco(localDecks)
    await setLocalDecks(tcoDecks)
  } catch (error) {
    console.error('Error syncing TCO decks:', error)
    chrome.runtime
      .sendMessage({
        type: 'SYNC_ERROR',
        error: error.message,
      })
      .catch(() => {})
  }
}

export const getTcoRefreshToken = async () => {
  // Check for token in local storage
  let { tcoRefreshToken: refreshToken } = await chrome.storage.local.get([
    'tcoRefreshToken',
  ])
  if (!refreshToken) {
    console.log('No TCO auth found in local storage, loading page...')

    const { id: tabId } = await chrome.tabs.create({
      url: TCO_BASE_URL,
    })

    console.log('Open TCO tabid:', tabId)

    const tokenPromise = new Promise(resolve => {
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (
          namespace === 'local' &&
          changes.tcoRefreshToken &&
          changes.tcoRefreshToken.newValue
        ) {
          resolve(changes.tcoRefreshToken.newValue)
        }
      })
    })

    refreshToken = await tokenPromise

    if (tabId !== undefined) {
      console.log(`Closing TCO tab ${tabId}`)
      await chrome.tabs.remove(tabId)
    }
  }

  if (!refreshToken) {
    console.log('You must login to The Crucible Online first')
    return null
  }

  return JSON.parse(refreshToken)
}

export const getTcoUser = async token => {
  if (!token) {
    throw new Error('No TCO token provided')
  }

  const t = {
    token: token,
  }

  const body = JSON.stringify(t)

  console.log('Fetching TCO user info...')
  const response = await fetch(`${TCO_BASE_URL}/api/account/token`, {
    credentials: 'include',
    headers: {
      accept: 'application/json',
      'accept-language': 'en-us',
      // authorization: `Bearer ${token}`,
      // 'content-type': 'application/json',
      // 'x-authorization': `Bearer ${token}`,
      // 'x-requested-with': 'XMLHttpRequest',
      // referrer: 'https://www.thecrucible.online/',
      // accept: '*/*',
      // 'accept-language': 'en-US,en;q=0.9,da;q=0.8',
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

  console.log('TCO user info fetched:', respJson)

  return {
    username: respJson.user.username,
    token: respJson.token,
    userId: respJson.user.id,
  }
}

const importDecksToTco = async decks => {
  const { token } = await getTcoUser(await getTcoRefreshToken())

  // Filter out decks that already have tco=true
  let decksToImport = Object.values(decks).filter(deck => deck.mv && !deck.tco)

  if (decksToImport.length === 0) {
    console.log('No new decks to import')
    return decks
  }

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
      throw new Error(`Failed to fetch TCO decks: ${tcoDecks.error}`)
    })

  console.log('Fetched TCO decks:', tcoDecks.length)
  tcoDecks.forEach(tcoDeck => {
    if (decks[tcoDeck.uuid]) {
      console.log(`Deck ${tcoDeck.uuid} already exists in local decks`)
      decks[tcoDeck.uuid].tco = true
    }
  })

  decksToImport = Object.values(decks).filter(deck => deck.mv && !deck.tco)

  console.log('Decks to import to TCO: ', decksToImport.length)

  for (const [i, deck] of decksToImport.entries()) {
    console.log(
      `Importing deck to ${i + 1}/${decksToImport.length}: ${JSON.stringify(
        deck,
      )} to TCO...`,
    )
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
        uuid: deck.id,
      }),
      method: 'POST',
    })

    const respJson = await response.json()

    const tcoImportErrorMessages = [
      "Cannot read properties of undefined (reading 'house')",
      'This deck is from a future expansion and not currently supported',
    ]

    if (response.ok && respJson.success) {
      console.log(`Imported ${deck.id}`)
      decks[deck.id].tco = true
    } else if (
      response.ok &&
      !respJson.success &&
      respJson.message === 'Deck already exists.'
    ) {
      console.log(`Deck already imported to TCO ${deck.id}`)
      decks[deck.id].tco = true
    } else if (
      response.ok &&
      !respJson.success &&
      tcoImportErrorMessages.some(msg => respJson.message.includes(msg))
    ) {
      console.log(
        `Failed to import to TCO with known error ${deck.id}`,
      )
      decks[deck.id].tco = 'import error'
    } else {
      console.error(
        `Failed to import to TCO with unknown error ${deck.id}: ${
          response.status
        } ${JSON.stringify(respJson)}`,
      )
      return
    }

    chrome.runtime
      .sendMessage({
        type: 'SYNC_STATUS',
        button: SYNC_MSGS[i % SYNC_MSGS.length],
      })
      .catch(() => {})

    console.log(`Waiting 5 seconds before next import due to rate limits...`)
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  return decks
}
