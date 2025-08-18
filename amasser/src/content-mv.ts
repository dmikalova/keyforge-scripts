/**
 * Master Vault Content Script
 * Monitors for deck scanning activities and triggers automatic sync when enabled
 * Observes DOM changes to detect successful deck imports
 */

/**
 * Check if automatic sync is enabled and set up deck scan monitoring
 */
chrome.storage.sync.get('syncAuto', (result: { syncAuto?: boolean }) => {
  if (result.syncAuto) {
    console.debug(`KFA: CMV: Automatic sync enabled`)
    chrome.runtime
      .sendMessage({
        type: 'SYNC_START',
      })
      .catch((error: Error) => {
        console.warn(`KFA: CMV: Error sending initial sync message: ${error}`)
      })

    // Track the last processed scan to prevent duplicates
    let lastProcessedScan: string | null = null
    let scanTimeout: NodeJS.Timeout | null = null

    /**
     * Observer for detecting deck scan completions
     * Monitors DOM changes for successful deck import modals
     */
    const mvObserver = new MutationObserver((mutations: MutationRecord[]) => {
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
                    console.warn(`KFA: CMV: Error starting sync: ${error}`)
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

// TODO
/**
 * Add DoK links to decks in the MV
 */
// https://www.keyforgegame.com/
// https://www.keyforgegame.com/my-decks
// https://www.keyforgegame.com/my-decks-legacy
// https://www.keyforgegame.com/deck-details/30937865-f079-4bee-915d-203e131c9747

chrome.storage.sync.get('linkDok', (result: { linkDok?: boolean }) => {
  if (result.linkDok) {
    const pathname = window.location.pathname
    switch (true) {
      case /\/deck-details\/[a-zA-Z0-9-]+$/.test(pathname):
        handleDeckDetails()
        break

      case /\/my-decks\/[a-zA-Z0-9-]+$/.test(pathname):
        // handleMyDeckDetails()
        break

      case /\/my-decks(-legacy)?$/.test(pathname):
        // handleMyDecks()
        break

      default:
        return
    }
  }
})

const handleDeckDetails = () => {
  let deckDetails: Element | null = null
  const deckDetailsObserver = new MutationObserver(() => {
    deckDetails = document.querySelector('.deck-details__action-btns')
    if (deckDetails) {
      deckDetailsObserver.disconnect()
      console.log('found deckDetails')

      const deckId = window.location.pathname.match(
        /\/deck-details\/([a-zA-Z0-9-]+)$/,
      )
      if (!deckId) {
        return
      }
      const dokLink = document.createElement('a')
      dokLink.href = `https://decksofkeyforge.com/decks/${deckId[1]}`
      dokLink.target = '_blank'
      dokLink.rel = 'noopener noreferrer'
      dokLink.className = 'deck-details__toggle-btn'
      dokLink.style.display = 'flex'
      dokLink.style.flexDirection = 'row'
      dokLink.style.justifyContent = 'center'
      deckDetails.appendChild(dokLink)

      const dokImg = document.createElement('img')
      dokImg.src = chrome.runtime.getURL('../icons/dok.png')
      dokImg.alt = 'Open in Decks of KeyForge'
      dokImg.style.height = '100%'
      dokImg.style.verticalAlign = 'middle'
      dokImg.className = 'icon-checkbox__icon'
      dokLink.appendChild(dokImg)

      const dokText = document.createElement('span')
      dokText.textContent = 'Decks of Keyforge'
      dokText.className = 'icon-checkbox__label'
      dokText.style.verticalAlign = 'middle'
      dokLink.appendChild(dokText)
    }
  })

  deckDetailsObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })
}
