chrome.storage.local.set(
  { dokAuth: window.localStorage.getItem('AUTH') },
  () => {
    console.log('KF Amasser: Saved DoK auth token to extension local storage')
  },
)
