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
