const reload = () => {
  chrome.storage.local
    .remove(['syncingMv', 'syncingDok', 'syncingTco'])
    .then(() => {
      console.debug(`KFA: BG: Sync cancelled and buttons reset`)
      chrome.runtime.reload()
    })
}

const sendMessage = (message: any) => {
  return chrome.runtime.sendMessage(message).catch(() => {})
}

export const browser = {
  reload,
  sendMessage,
}
