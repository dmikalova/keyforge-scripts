// When the "MY DOK" button appears on the page, send the auth token to the background script
chrome.storage.sync.get(['sync-dok'], result => {
  if (result['sync-dok']) {
    const dokObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          if (document.querySelector('a[href="/my-dok/my-profile"]')) {
            console.debug(`KFA: CDoK: User is logged in`)
            const dokAuth = window.localStorage.getItem('AUTH')
            if (dokAuth !== null) {
              chrome.runtime.sendMessage(
                { type: 'SAVE_DOK_AUTH', 'token-dok': dokAuth },
                response => {
                  if (response && response.success) {
                    console.debug(`KFA: CDoK: Auth token message succeeded`)
                  } else {
                    console.warn(`KFA: CDoK: Auth token message failed`)
                  }
                },
              )
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
