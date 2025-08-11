/**
 * Reload the extension after clearing sync status
 * Removes syncing flags from storage before reloading to prevent stale state
 */
const reload = () => {
  chrome.storage.local
    .remove(['syncingMv', 'syncingDok', 'syncingTco'])
    .then(() => {
      chrome.runtime.reload()
    })
}

/**
 * Send a message to other extension components
 * @param {any} message - Message object to send
 * @returns {Promise<any>} Promise that resolves with response or catches errors
 */
const sendMessage = (message: any) => {
  return chrome.runtime.sendMessage(message).catch(() => {})
}

/**
 * Set the extension icon
 * @param {string} path - Path to the icon file
 * @returns {Promise<void>}
 */
const setIcon = async (path: string) => {
  await chrome.action.setIcon({ path: path })
}

export const browser = {
  reload,
  sendMessage,
  setIcon,
}
