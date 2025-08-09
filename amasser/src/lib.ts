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

export const quotes: string[] = [
  '“Always clear your search history.” -Dr. Escotera',
  "“As far as oblivions go, it's in my bottom three.” -Dr. Escotera",
  '“Do you want imps? This is how you get imps.”',
  '“Enjoy your survival bonus of an extra quarter portion.”',
  '“History repeats itself.” -Human Proverb',
  '“I told you to stay off the furniture!”',
  "“I've explored thousands of possible futures. Somehow they all end up here.” -Qincan, Alliance outcast",
  "“If you had seen what I have seen, you'd be mad too.” -the Mad Prophet Gizelhart",
  "“Ingram, put that down! We're surrounded!” -Lieutenant Khrkhar",
  '“Was that you, or the cave?” -Captain Val Jericho',
  '“We can learn so much from our animal friends.”',
  "“You! Æmber lover. You're next.”",
  'Abolish ICE, defund police',
  'Abortion access is a community responsibility',
  'ACAB',
  'Black lives matter',
  'Chinga la migra',
  'Free Palestine',
  'Hot rat summer',
  'Trans rights are human rights',
]

export const staleSyncSeconds = 5 * 1000
export const syncAgainSeconds = 5 * 1000
export const rotateAgainSeconds = 500
