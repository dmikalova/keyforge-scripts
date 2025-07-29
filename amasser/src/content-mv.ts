// TODO: run sync on deck scan

console.debug('KFA: MV: content script loaded')
chrome.runtime.sendMessage({
  type: 'SYNC_START',
})

// When a deck is scanned trigger a sync
const mvObserver = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      if (
        document.querySelector<HTMLDivElement>(
          '.add-deck-modal__header-image.add-deck-modal__header-image--already-exists',
          // '.ReactModal__Content.add-deck-modal__header-image--success',
        )
      ) {
        console.debug('KFA: MV: Deck scanned')
        chrome.runtime
          .sendMessage({ type: 'SYNC_START' })
          .then(() => {
            console.debug('KFA: MV: Sync started')
          })
          .catch(error => {
            console.error('KFA: MV: Error starting sync:', error)
          })
      }
    }
  }
})
mvObserver.observe(document.body, { childList: true, subtree: true })

// success
// <div class="ReactModal__Content ReactModal__Content--after-open modal add-deck-modal modal--hide-on-loading modal--with-header-image" tabindex="-1" role="dialog"><div class="modal__header-image" role="presentation"><div class="add-deck-modal__header-image add-deck-modal__header-image--success"></div></div><div class="modal__content"><h2 class="add-deck-modal__status">You discovered Lottothyst, Spawn of Aurmatic!</h2><p class="add-deck-modal__status-description">This deck has been successfully added to your collection!</p><div class="add-deck-modal__aembershards"><strong>+1<span class="add-deck-modal__aembershards-icon"></span>Æmbershard</strong> acquired.</div><div class="add-deck-modal__buttons"><a class="add-deck-modal__btn add-deck-modal__go-to-deck btn" href="/deck-details/2a12788a-1f42-4e5b-8f12-86bd9b449ee0">Go to Deck</a><button class="add-deck-modal__btn add-deck-modal__go-to-deck btn-secondary">Dismiss</button></div></div></div>

// already claimed
// <div class="ReactModal__Content ReactModal__Content--after-open modal add-deck-modal modal--hide-on-loading modal--with-header-image" tabindex="-1" role="dialog"><div class="modal__header-image" role="presentation"><div class="add-deck-modal__header-image add-deck-modal__header-image--already-exists"></div></div><div class="modal__content"><h2 class="add-deck-modal__status">This deck is already in your collection and you can find it on the My Decks page.</h2><p class="add-deck-modal__status-description">Deck already claimed</p><div class="add-deck-modal__buttons-claim"><button class="add-deck-modal__btn btn btn-secondary">Dismiss</button></div></div></div>
