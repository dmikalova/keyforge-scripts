# KeyForge Amasser Browser Extension

An unofficial browser extension for [Chrome](https://chromewebstore.google.com/detail/nmlpikoganplgciecgaboddhndemaohl) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/keyforge-amasser/) that collects KeyForge decks from your [Master Vault](https://www.keyforgegame.com/) account and syncs them to your [Decks of KeyForge](https://decksofkeyforge.com/) or [The Crucible Online](https://thecrucible.online/) accounts.

<!-- markdownlint-disable-next-line MD033 -->
<img src="assets/screenshot.png" alt="KeyForge Amasser Extension Screenshot" height="400">

## Features

- The deck list is stored in the extension - after an initial sync only newly scanned decks are synced.
- An initial sync of 1000 decks to DoK can take less than 5 minutes.
- An initial sync of 1000 decks to TCO can take a week due to rate limiting.
- Syncs run in the background - once started the extension popup can be closed without interrupting the sync.
- Syncs are atomic - if an error occurs the next sync will pick up where it left off.
- Syncs can automatically run daily while the browser is open and on each visit or deck scan in MV as long as you are logged in to each site.
- Option to add DoK links to MV.
- Includes fun, inspiring, and thought-provoking quotes to ponder while waiting for the sync to complete.
- Brilliant graphic design that is bright enough to be seen across the Crucible all the way from Hub City to the Macis Swamp.

## Known issues

- Switching between accounts is not supported. After switching accounts clear data in the extension and run another sync.

MV has the following issues:

- Legacy decks are not synced - scan your legacy decks to claim ownership!
- Decks that are traded away won't be removed from stored data. Clear data in the extension to remove them.
- Very rarely MV decks have invalid data and DoK or TCO will not accept them. Decks that return errors will be marked as such and skipped in future syncs. If the error is resolved then clear data in the extension and run a new sync.

TCO has the following issues:

- Decks that require extra information such as Prophetic Visions will have default values set - delete and manually import the deck in TCO to set prophecies.
- Decks from unsupported sets such as Crucible Clash will be skipped. Once the set is supported, clear data in the extension and run a new sync.

## Installation

Download the extension from the [Chrome Web Store](https://chromewebstore.google.com/detail/nmlpikoganplgciecgaboddhndemaohl) or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/keyforge-amasser/).

## Privacy and Permissions

- Authentication for each site uses the existing browser sessions for each site.
- Deck and authentication data is gathered from Master Vault, Decks of KeyForge, and The Crucible Online and stored locally in the extension.
- Deck data is sent to Decks of KeyForge or The Crucible Online based on sync settings.
- Data can be cleared by the user at any time or by uninstalling the extension.
- Extension settings are synced across browsers by Google or Mozilla. This does not include deck or authentication data.

## Code structure

- `manifest.json`: Metadata about the extension, including permissions and script entrypoints.
- `bg*.ts`: Core logic that runs sync operations on a background service worker. Receives messages from content and popup scripts to trigger syncs or save auth tokens.
- `content*.ts`: Scripts that run within each page. These send auth tokens from DoK and TOC and trigger syncs when loading MV or scanning decks.
- `popup.ts`: Manages the popup UI, including triggering syncs and clearing data.

## Contributing

- Open an issue in GitHub to discuss your feature or bug fix.
- Fork the repository, create a feature branch, and make your changes.
  - Run `npm install` and `npm run watch` to build the extension.
- Test with both Chrome and Firefox.
  - Load the unpacked extension in Chrome by navigating to `chrome://extensions`, enabling "Developer mode", clicking "Load unpacked", and loading the `amasser` directory.
  - Load the unpacked extension in Firefox by navigating to `about:debugging#/runtime/this-firefox`, clicking "Load Temporary Add-on", and loading the `amasser` directory.
- Submit a pull request.
