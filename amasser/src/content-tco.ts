/**
 * The Crucible Online Content Script
 * Monitors for user login state and extracts refresh token
 * Sends refresh token to background script when user is logged in
 */

/**
 * Check if TCO sync is enabled and monitor for login state
 */
chrome.storage.sync.get('syncTco', (result: { syncTco?: boolean }) => {
  if (result.syncTco) {
    /**
     * Observer for detecting user login state
     * Looks for the profile navigation button to confirm login
     */
    const tcoObserver = new MutationObserver((mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          if (document.querySelector('a#nav-Profile')) {
            console.debug(`KFA: CTCO: User is logged in`)
            const auth = window.localStorage.getItem('refreshToken')
            if (auth !== null) {
              chrome.runtime
                .sendMessage({
                  type: 'AUTH',
                  auth: { authTco: auth },
                })
                .catch((error: Error) => {
                  console.warn(`KFA: CDoK: Error sending message: ${error}`)
                })
              tcoObserver.disconnect()
              break
            }
          }
        }
      }
    })

    tcoObserver.observe(document.body, { childList: true, subtree: true })
  }
})
