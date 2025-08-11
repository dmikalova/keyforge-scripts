const reload = () => {
  chrome.storage.local
    .remove(['syncingMv', 'syncingDok', 'syncingTco'])
    .then(() => {
      chrome.runtime.reload()
    })
}

const sendMessage = (message: any) => {
  return chrome.runtime.sendMessage(message).catch(() => {})
}

const setIcon = async (path: string) => {
  await chrome.action.setIcon({ path: path })
}

export const browser = {
  reload,
  sendMessage,
  setIcon,
}
