/**
 * Get decks from extension local storage
 */
export const getDecksFromStorage = async () => {
  const decks = { dok: {}, tco: {}, mv: {} }
  await chrome.storage.local.get().then(data => {
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('zdok.')) {
        decks.dok[key.replace('zdok.', '')] = value
      } else if (key.startsWith('ztco.')) {
        decks.tco[key.replace('ztco.', '')] = value
      } else if (key.startsWith('zmv.')) {
        decks.mv[key.replace('zmv.', '')] = value
      }
    }
  })
  return decks
}
