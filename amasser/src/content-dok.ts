/**
 * Decks of KeyForge Content Script
 * Monitors for user login state and extracts authentication token
 * Sends auth token to background script when user is logged in
 */

/**
 * Check if DoK sync is enabled and monitor for login state
 */
chrome.storage.sync.get('syncDok', (result: { syncDok?: boolean }) => {
  console.log(`KFA: CDoK: Monitoring for user login state`)
  if (result.syncDok) {
    /**
     * Observer for detecting user login state
     * Looks for the "MY DOK" profile link to confirm login
     */
    const dokObserver = new MutationObserver((mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          if (document.querySelector('a[href="/my-dok/my-profile"]')) {
            console.debug(`KFA: CDoK: User is logged in`)
            const auth = window.localStorage.getItem('AUTH')
            if (auth !== null) {
              chrome.runtime
                .sendMessage({
                  type: 'AUTH',
                  auth: { authDok: auth },
                })
                .catch((error: Error) => {
                  console.warn(`KFA: CDoK: Error sending message: ${error}`)
                })
              dokObserver.disconnect()
              break
            }
          }
        }
      }
    })

    dokObserver.observe(document.body, { childList: true, subtree: true })
  }
})

/**
 * Add DoK links to decks in the MV
 */
// https://www.keyforgegame.com/
// https://www.keyforgegame.com/my-decks
// https://www.keyforgegame.com/my-decks-legacy
// https://www.keyforgegame.com/deck-details/30937865-f079-4bee-915d-203e131c9747

chrome.storage.sync.get('linkDok', (result: { linkDok?: boolean }) => {
  if (result.linkDok) {
    const link = document.createElement('a')
    link.href = 'https://decksofkeyforge.com'
    link.textContent = 'Decks of KeyForge'
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
  }
})
