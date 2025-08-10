// When the user's profile button appears on the page, send the refresh token to the background script
chrome.storage.sync.get('syncTco', result => {
  if (result.syncTco) {
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
