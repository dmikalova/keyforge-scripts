/**
 * Master Vault Content Script
 * Monitors for deck scanning activities and triggers automatic sync when enabled
 * Observes DOM changes to detect successful deck imports
 *
 * If enabled, adds DoK links to deck details and deck list rows
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

/**
 * Add DoK links to decks in the MV
 */
chrome.storage.sync.get('linkDok', (result: { linkDok?: boolean }) => {
  if (result.linkDok) {
    handleDeckDetails()
    handleDeckTable()
  }
})

/**
 * Handle deck details view updates
 */
const handleDeckDetails = () => {
  const deckDetailsObserver = new MutationObserver(() => {
    const dokBadge = document.querySelector('.dok-badge-link')
    if (dokBadge) {
      return
    }

    const deckDetails = document.querySelector('.deck-details__action-btns')
    if (deckDetails) {
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
      dokLink.className = 'deck-details__toggle-btn dok-badge-link'
      dokLink.style.display = 'flex'
      dokLink.style.flexDirection = 'row'
      dokLink.style.justifyContent = 'center'

      const dokImg = document.createElement('img')
      dokImg.src = chrome.runtime.getURL('../icons/dok.png')
      dokImg.alt = 'Open in Decks of KeyForge'
      dokImg.style.height = '100%'
      dokImg.className = 'icon-checkbox__icon'

      const dokText = document.createElement('span')
      dokText.textContent = 'Decks of Keyforge'
      dokText.className = 'icon-checkbox__label'

      dokLink.appendChild(dokImg)
      dokLink.appendChild(dokText)
      deckDetails.appendChild(dokLink)
    }
  })

  deckDetailsObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

/**
 * Handle deck table updates
 */
const handleDeckTable = () => {
  const observer = new MutationObserver(() => {
    const rows = document.querySelectorAll('.deck-list__data-row')
    rows.forEach(row => {
      const nameCell = row.querySelector('.deck-list__deck-name a')
      if (!nameCell) return

      const href = nameCell.getAttribute('href')
      const match = href?.match(/\/deck-details\/([a-zA-Z0-9-]+)/)
      if (!match) return
      const deckId = match[1]

      // Update existing badge
      const dokBadge = row.querySelector('.dok-badge-link')
      if (dokBadge instanceof HTMLAnchorElement) {
        const href = `https://decksofkeyforge.com/decks/${deckId}`
        if (dokBadge.href === href) {
          return
        }
        dokBadge.remove()
      }

      // Create badge for row
      const dokLink = document.createElement('a')
      dokLink.className = 'dok-badge-link deck-list__house'
      dokLink.href = `https://decksofkeyforge.com/decks/${deckId}`
      dokLink.rel = 'noopener noreferrer'
      dokLink.style.justifyContent = 'center'
      dokLink.style.verticalAlign = 'middle'
      dokLink.target = '_blank'
      dokLink.title = 'Open in Decks of KeyForge'

      const dokImg = document.createElement('img')
      dokImg.alt = 'DoK'
      dokImg.className = 'icon-checkbox__icon'
      dokImg.src = chrome.runtime.getURL('../icons/dok.png')
      dokImg.style.aspectRatio = '386 / 512'
      dokImg.style.height = '100%'
      dokImg.style.verticalAlign = 'middle'
      dokLink.appendChild(dokImg)

      const housesCell = row.querySelector('.deck-list__houses-list')
      if (housesCell) {
        housesCell.appendChild(dokLink)
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href'],
  })
}
