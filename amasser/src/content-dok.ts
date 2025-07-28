const dokAuth = window.localStorage.getItem('AUTH')
if (dokAuth !== null) {
  chrome.runtime.sendMessage({ type: 'SAVE_DOK_AUTH', dokAuth }, response => {
    if (response && response.success) {
      console.log('KF Amasser: Sent DoK auth token to background script')
    } else {
      console.warn(
        'KF Amasser: Failed to send DoK auth token to background script',
      )
    }
  })
}
