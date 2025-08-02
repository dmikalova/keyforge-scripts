/**
 * Get decks from extension local storage
 */
export const getDecksFromStorage = async () => {
  type Decks = {
    dok: Record<string, string>
    mv: Record<string, string>
    tco: Record<string, string>
  }
  const decks: Decks = { dok: {}, tco: {}, mv: {} }
  await chrome.storage.local.get().then(data => {
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('zdok.')) {
        decks.dok[key.replace('zdok.', '')] = value
      } else if (key.startsWith('zmv.')) {
        decks.mv[key.replace('zmv.', '')] = value
      } else if (key.startsWith('ztco.')) {
        decks.tco[key.replace('ztco.', '')] = value
      }
    }
  })
  return decks
}

export const staleSyncSeconds = 60 * 1000
export const syncAgainSeconds = 2 * 1000
