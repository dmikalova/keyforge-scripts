/**
 * Get decks from extension local storage
 */
export const getLocalDecks = async () => {
  const { decks: response } = await chrome.storage.local.get(['decks'])
  const decks =
    typeof response === 'object' && response !== null ? response : {}
  console.log(`Loaded ${Object.keys(decks).length} decks from local storage`)
  return decks
}

/**
 * Save decks to extension local storage
 */
export const setLocalDecks = async decks => {
  console.log(`Saving ${Object.keys(decks).length} decks to local storage`)
  chrome.storage.local.set({ decks: decks }).then(() => {
    console.log('Decks saved successfully')
  })
}

/**
 * Update extension loading state
 */
export const setLoadingState = isLoading => {
  console.log('loading:', isLoading)
  // TODO: Update UI loading state
  // if (isLoading) {
  //   libraryText.innerHTML = 'Loading'
  //   libraryText.classList.add('loading')
  // } else {
  //   libraryText.innerHTML = 'Done'
  //   libraryText.classList.remove('loading')
  // }
}

// export const kfSetIds = [
//   {
//     id: 341,
//     name: 'Call of the Archons',
//   },
//   {
//     id: 435,
//     name: 'Age of Ascension',
//   },
//   {
//     id: 452,
//     name: 'Worlds Collide',
//   },
//   {
//     id: 479,
//     name: 'Mass Mutation',
//   },
//   {
//     id: 496,
//     name: 'Dark Tidings',
//   },
//   {
//     id: 600,
//     name: 'Winds of Exchange',
//   },
//   {
//     id: 601,
//     name: 'Unchained 2023',
//   },
//   {
//     id: 609,
//     name: 'Vault Masters 2023',
//   },
//   {
//     id: 700,
//     name: 'Grim Reminders',
//   },
//   {
//     id: 722,
//     name: 'Menagerie 2024',
//   },
//   {
//     id: 737,
//     name: 'Vault Masters 2024',
//   },
//   {
//     id: 800,
//     name: 'Æmber Skies',
//   },
//   {
//     id: 855,
//     name: 'Tokens of Change',
//   },
//   {
//     id: 874,
//     name: 'More Mutation',
//   },
//   {
//     id: 886,
//     name: 'Prophetic Visions',
//   },
//   {
//     id: 892,
//     name: 'Martian Civil War',
//   },
//   {
//     id: 907,
//     name: 'Discovery',
//   },
//   {
//     id: 918,
//     name: 'Crucible Clash',
//   },
//   {
//     id: 928,
//     name: 'Draconian Measures',
//   },
//   {
//     id: 939,
//     name: 'Vault Masters 2025',
//   },
// ]
