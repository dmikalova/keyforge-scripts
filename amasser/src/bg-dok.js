import { getLocalDecks, setLocalDecks } from './lib.js'

// Decks of KeyForge configuration
const DOK_BASE_URL = 'https://decksofkeyforge.com'
const SYNC_MSGS = ['Syncing DoK..', 'Syncing DoK...', 'Syncing DoK.']

export const handleDokSync = async () => {
  console.log('DoK deck sync started')
  try {
    const localDecks = await getLocalDecks()
    const dokDecks = await importDecksToDok(localDecks)
    await setLocalDecks(dokDecks)
  } catch (error) {
    console.error('Error syncing DoK decks:', error)
    chrome.runtime
      .sendMessage({
        type: 'SYNC_ERROR',
        error: error.message,
      })
      .catch(() => {})
  }
}

/**
 * Get authentication cookie from Decks of KeyForge
 */
export const getDokToken = async () => {
  // Check for token in local storage
  let { dokAuth: token } = await chrome.storage.local.get(['dokAuth'])
  if (!token) {
    console.log('No DOK auth found in local storage, loading page...')

    const { id: tabId } = await chrome.tabs.create({
      url: DOK_BASE_URL,
    })

    console.log('tabid', tabId)

    const tokenPromise = new Promise(resolve => {
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (
          namespace === 'local' &&
          changes.dokAuth &&
          changes.dokAuth.newValue
        ) {
          resolve(changes.dokAuth.newValue)
        }
      })
    })

    token = await tokenPromise

    if (tabId !== undefined) {
      console.log(`Closing tab ${tabId}`)
      await chrome.tabs.remove(tabId)
    }
  }

  if (!token) {
    console.log('You must login to Decks of KeyForge first')
    return { token: null, userId: null }
  }

  return token
}

export const getDokUser = async token => {
  const response = await fetch(
    'https://decksofkeyforge.com/api/users/secured/your-user',
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
const createDokRequestConfig = token => ({
  credentials: 'include',
  headers: {
    accept: 'application/json',
    'accept-language': 'en-US',
    authorization: token,
    'x-authorization': token,
  },
  method: 'POST',
})

const importDecksToDok = async decks => {
  const token = await getDokToken()

  // Filter out decks that already have dok=true
  const decksToImport = Object.values(decks).filter(
    deck => deck.mv && !deck.dok,
  )

  for (const [i, deck] of decksToImport.entries()) {
    console.log(
      `Importing deck ${i + 1}/${decksToImport.length}: ${JSON.stringify(
        deck,
      )} to DoK...`,
    )
    const response = await fetch(
      `https://decksofkeyforge.com/api/decks/${deck.id}/import-and-add`,
      createDokRequestConfig(token),
    )

    if (response.ok) {
      console.log(`Imported ${deck.id}`)
      decks[deck.id].dok = true
    } else {
      console.error(`Failed to import ${deck.id}: ${response.status}`)
    }

    chrome.runtime
      .sendMessage({
        type: 'SYNC_STATUS',
        button: SYNC_MSGS[i % SYNC_MSGS.length],
      })
      .catch(() => {})
  }
  return decks
}

// TODO: load dok token in iframe
