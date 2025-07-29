// When the "MY DOK" button appears on the page, send the auth token to the background script
const dokObserver = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      if (document.querySelector('a[href="/my-dok/my-profile"]')) {
        console.log('KF Amasser: User is logged in to DoK')
        const dokAuth = window.localStorage.getItem('AUTH')
        if (dokAuth !== null) {
          chrome.runtime.sendMessage(
            { type: 'SAVE_DOK_AUTH', 'dok-auth': dokAuth },
            response => {
              if (response && response.success) {
                console.log(
                  'KF Amasser: Sent DoK auth token to background script',
                )
              } else {
                console.warn(
                  'KF Amasser: Failed to send DoK auth token to background script',
                )
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
