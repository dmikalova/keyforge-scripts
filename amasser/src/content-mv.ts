console.debug(`KFA: MV: content script loaded`)
chrome.storage.sync.get(['sync-auto'], result => {
  if (result['sync-auto']) {
    console.debug(`KFA: MV: Automatic sync enabled`)
    chrome.runtime.sendMessage({
      type: 'SYNC_START',
    })

    // Track the last processed scan to prevent duplicates
    let lastProcessedScan: string | null = null
    let scanTimeout: NodeJS.Timeout | null = null

    // When a deck is scanned trigger a sync
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
                `KFA: MV: last scan: ${lastProcessedScan}, current scan: ${currentScan}`,
              )
              if (lastProcessedScan !== currentScan) {
                console.debug(`KFA: MV: Deck scanned`)
                lastProcessedScan = currentScan

                chrome.runtime
                  .sendMessage({ type: 'SYNC_START' })
                  .then(() => {
                    console.debug(`KFA: MV: Sync started`)
                  })
                  .catch(error => {
                    console.error(`KFA: MV: Error starting sync: ${error}`)
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
