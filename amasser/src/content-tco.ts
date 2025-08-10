/**
 * The Crucible Online Content Script
 * Monitors for user login state and extracts refresh token
 * Sends refresh token to background script when user is logged in
 */

/**
 * Check if TCO sync is enabled and monitor for login state
 */
chrome.storage.sync.get('syncTco', result => {
  if (result.syncTco) {
    /**
     * Observer for detecting user login state
     * Looks for the profile navigation button to confirm login
     */
    const tcoObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          if (document.querySelector('a#nav-Profile')) {
            console.debug(`KFA: CTCO: User is logged in`)
            const tcoRefreshToken = window.localStorage.getItem('refreshToken')
            if (tcoRefreshToken !== null) {
              chrome.runtime.sendMessage(
                {
                  type: 'SAVE_TCO_REFRESH_TOKEN',
                  tokenTco: tcoRefreshToken,
                },
                response => {
                  if (response && response.success) {
                    console.debug(`KFA: CTCO: Refresh token message succeeded`)
                  } else {
                    console.warn(`KFA: CTCO: Refresh token message failed`)
                  }
                },
              )
            }
            tcoObserver.disconnect()
            break
          }
        }
      }
    })

    tcoObserver.observe(document.body, { childList: true, subtree: true })
  }
})
