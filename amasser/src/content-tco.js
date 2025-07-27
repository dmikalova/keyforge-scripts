chrome.storage.local.set(
  { tcoRefreshToken: window.localStorage.getItem('refreshToken') },
  () => {
    console.log('KF Amasser: Saved TCO refresh token to extension local storage')
  },
)



// TODO: button for prophecy assignments

