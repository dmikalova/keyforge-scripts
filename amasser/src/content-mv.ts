/**
 * Master Vault Content Script
 * Monitors for deck scanning activities and triggers automatic sync when enabled
 * Observes DOM changes to detect successful deck imports
 */

// TODO: don't run sync if not logged in

/**
 * Check if automatic sync is enabled and set up deck scan monitoring
 */
chrome.storage.sync.get('syncAuto', result => {
  if (result.syncAuto) {
    console.debug(`KFA: CMV: Automatic sync enabled`)
    chrome.runtime.sendMessage({
      type: 'SYNC_START',
    })

    // Track the last processed scan to prevent duplicates
    let lastProcessedScan: string | null = null
    let scanTimeout: NodeJS.Timeout | null = null

    /**
     * Observer for detecting deck scan completions
     * Monitors DOM changes for successful deck import modals
     */
    const mvObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const modalElement = document.querySelector<HTMLDivElement>(
            '.add-deck-modal__header-image.add-deck-modal__header-image--success',
          )

          if (modalElement) {
            // Get a unique identifier for this scan (deck name or timestamp)
            const deckNameElement = document.querySelector(
              '.add-deck-modal__status',
            )
            const currentScan =
              deckNameElement?.textContent || Date.now().toString()

            // Clear any existing timeout
            if (scanTimeout) {
              clearTimeout(scanTimeout)
            }

            // Debounce: only process if we haven't seen this scan recently
            scanTimeout = setTimeout(() => {
              console.debug(
                `KFA: CMV: last scan: ${lastProcessedScan}, current scan: ${currentScan}`,
              )
              if (lastProcessedScan !== currentScan) {
                console.debug(`KFA: CMV: Deck scanned`)
                lastProcessedScan = currentScan

                chrome.runtime
                  .sendMessage({ type: 'SYNC_START' })
                  .then(() => {
                    console.debug(`KFA: CMV: Sync started`)
                  })
                  .catch(error => {
                    console.error(`KFA: CMV: Error starting sync: ${error}`)
                  })
              }
            }, 500) // Wait 500ms for DOM to stabilize
          }
        }
      }
    })
    mvObserver.observe(document.body, { childList: true, subtree: true })
  }
})
