// When the user's profile button appears on the page, send the refresh token to the background script
chrome.storage.sync.get(['sync-tco'], result => {
  if (result['sync-tco']) {
    const tcoObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          if (document.querySelector('a#nav-Profile')) {
            console.debug('KF Amasser: User is logged in to TCO')
            const tcoRefreshToken = window.localStorage.getItem('refreshToken')
            if (tcoRefreshToken !== null) {
              chrome.runtime.sendMessage(
                {
                  type: 'SAVE_TCO_REFRESH_TOKEN',
                  'token-tco': tcoRefreshToken,
                },
                response => {
                  if (response && response.success) {
                    console.debug(
                      'KF Amasser: Sent TCO refresh token to background script',
                    )
                  } else {
                    console.warn(
                      'KF Amasser: Failed to send TCO refresh token to background script',
                    )
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
