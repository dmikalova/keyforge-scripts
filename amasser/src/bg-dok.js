import { getLocalDecks, setLoadingState, setLocalDecks } from './lib.js'

// Decks of KeyForge API configuration
const DOK_BASE_URL = 'https://decksofkeyforge.com'

export const handleDokSync = async () => {
  setLoadingState(true)
  let localDecks = await getLocalDecks()

  // Get all the DoK decks
  // Compare with MV decks
  // Import missing decks

  const dokDecks = await importDecksToDok(localDecks)
  await setLocalDecks(dokDecks)
}

/**
 * Get authentication cookie from Decks of KeyForge
 */
const getDokToken = async () => {
  // Check for token in local storage
  let { dokAuth: token } = await chrome.storage.local.get(['dokAuth'])
  if (!token) {
    console.log('No DOK auth found in local storage, loading page...')

    const { id: tabId } = await chrome.tabs.create({
      url: DOK_BASE_URL,
    })

    console.log('tabid', tabId)

    const tokenPromise = new Promise(resolve => {
      chrome.storage.onChanged.addListener(function (changes, namespace) {
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
    setLoadingState(false)
    return { token: null, userId: null }
  }

  // const username = await getDokUser(token)

  return token
  // return { token: token, username: username }
}

const getDokUser = async token => {
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
const createDokRequestConfigFilter = (token, username, page) => ({
  credentials: 'include',
  headers: {
    // accept: 'application/json, text/plain, */*',
    accept: 'application/json',
    // 'accept-language': 'en-US,en;q=0.9,da;q=0.8',
    'accept-language': 'en-US',
    authorization: token,
    'x-authorization': token,
    // 'cache-control': 'no-cache',
    // 'content-type': 'application/json;charset=UTF-8',
    // pragma: 'no-cache',
    // timezone: '-240',
  },
  body: JSON.stringify({
    // cards: [],
    // completedAuctions: false,
    // constraints: [],
    // expansions: [],
    // forAuction: false,
    // forSale: false,
    // forTrade: false,
    // houses: [],
    // includeUnregistered: true,
    // myFavorites: false,
    // notForSale: false,
    owner: username,
    page: page,
    pageSize: 100,
    sort: 'SAS_RATING',
    sortDirection: 'DESC',
    // title: '',
    // withOwners: false,
  }),
  method: 'POST',
})

// const getDokDecks = async (token, username) => {
//   let page = 0
//   let dokDecks = []

//  fetch('https://decksofkeyforge.com/api/decks/filter-count', {
//   //         credentials: 'include',
//   //         headers: {
//   //           accept: 'application/json, text/plain, */*',
//   //           'accept-language': 'en-US,en;q=0.9,da;q=0.8',
//   //           authorization: token,
//   //           'cache-control': 'no-cache',
//   //           'content-type': 'application/json;charset=UTF-8',
//   //           pragma: 'no-cache',
//   //           timezone: '-240',
//   //         },
//   //         body: body,
//   //         method: 'POST',
//   //         mode: 'cors',
//   //       })
//   //         .then(response => response.json())
//   //         .then(response => {
//   //           if (library.length != response.count) {
//   //             page = page + 1
//   //             getDokDecks(token, user, page, library)
//   //               .then(resolve)
//   //               .catch(reject)
//   //           } else {

//   const response = await fetch(
//     `${DOK_BASE_URL}/api/decks/filter`,
//     createDokRequestConfigFilter(token, username, page),
//   )

//   if (!response.ok) {
//     throw new Error(
//       `Failed to fetch DoK decks on page ${page}: ${response.status}`,
//     )
//   }

//   dokDecks.concat(
//     await response.json().then(data => {
//       return data.decks.forEach(deck => deck.keyforgeId)
//     }),
//   )

//   //     .then(response => response.json())
//   //     .then(response => {
//   //       library = library.concat(response.decks)

//   //       fetch('https://decksofkeyforge.com/api/decks/filter-count', {
//   //         credentials: 'include',
//   //         headers: {
//   //           accept: 'application/json, text/plain, */*',
//   //           'accept-language': 'en-US,en;q=0.9,da;q=0.8',
//   //           authorization: token,
//   //           'cache-control': 'no-cache',
//   //           'content-type': 'application/json;charset=UTF-8',
//   //           pragma: 'no-cache',
//   //           timezone: '-240',
//   //         },
//   //         body: body,
//   //         method: 'POST',
//   //         mode: 'cors',
//   //       })
//   //         .then(response => response.json())
//   //         .then(response => {
//   //           if (library.length != response.count) {
//   //             page = page + 1
//   //             getDokDecks(token, user, page, library)
//   //               .then(resolve)
//   //               .catch(reject)
//   //           } else {
//   //             resolve(library)
//   //           }
//   //         })
//   //     })
//   // })
// }

const importDecksToDok = async decks => {
  const token = await getDokToken()

  // Filter out decks that already have dok=true
  const decksToImport = Object.values(decks).filter(deck => !deck.dok)

  for (const deck of decksToImport) {
    console.log(`Importing deck ${JSON.stringify(deck)} to DoK...`)
    const response = await fetch(
      `https://decksofkeyforge.com/api/decks/${deck.id}/import-and-add`,
      {
        credentials: 'include',
        headers: {
          accept: 'application/json',
          'accept-language': 'en-US',
          authorization: token,
          'x-authorization': token,
        },
        method: 'POST',
      },
    )

    if (response.ok) {
      console.log(`Imported ${deck.id}`)
      decks[deck.id].dok = true
    } else {
      console.error(`Failed to import ${deck.id}: ${response.status}`)
    }
  }
  return decks
}
