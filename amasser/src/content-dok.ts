/**
 * Decks of KeyForge Content Script
 * Monitors for user login state and extracts authentication token
 * Sends auth token to background script when user is logged in
 */

/**
 * Check if DoK sync is enabled and monitor for login state
 */
chrome.storage.sync.get('syncDok', result => {
  if (result.syncDok) {
    /**
     * Observer for detecting user login state
     * Looks for the "MY DOK" profile link to confirm login
     */
    const dokObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          if (document.querySelector('a[href="/my-dok/my-profile"]')) {
            console.debug(`KFA: CDoK: User is logged in`)
            const dokAuth = window.localStorage.getItem('AUTH')
            if (dokAuth !== null) {
              try {
                chrome.runtime.sendMessage(
                  { type: 'SAVE_DOK_AUTH', tokenDok: dokAuth },
                  response => {
                    if (chrome.runtime.lastError) {
                      console.warn(
                        `KFA: CDoK: Runtime error: ${chrome.runtime.lastError.message}`,
                      )
                      return
                    }
                    if (response && response.success) {
                      console.debug(`KFA: CDoK: Auth token message succeeded`)
                    } else {
                      console.warn(`KFA: CDoK: Auth token message failed`)
                    }
                  },
                )
              } catch (error) {
                console.warn(`KFA: CDoK: Error sending message: ${error}`)
              }
            }
            dokObserver.disconnect()
            break
          }
        }
      }
    })

    dokObserver.observe(document.body, { childList: true, subtree: true })
  }
})
