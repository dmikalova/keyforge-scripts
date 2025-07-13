# KeyForge Amasser Browser Extension

A cross-browser extension for Chrome and Firefox that collects and manages KeyForge data from various websites using the Web Extensions API.

## Features

- **Cross-Browser Compatibility**: Works with both Chrome and Firefox using the Web Extensions API
- **Data Collection**: Automatically collects deck and game data from popular KeyForge websites:
  - KeyForge Compendium
  - Decks of KeyForge
  - Crucible Online
- **Data Management**: Store, export, and manage collected data
- **Privacy-Focused**: All data is stored locally in your browser
- **Customizable**: Toggle different collection features on/off

## Installation

### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `amasser` folder
4. The extension icon should appear in your toolbar

### Firefox

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file in the `amasser` folder
5. The extension will be loaded temporarily

## Development

### Project Structure

``` txt
amasser/
├── manifest.json          # Extension manifest (v3 for Chrome/Firefox compatibility)
├── background.js          # Service worker for background tasks
├── content.js            # Content script for data collection
├── popup.html            # Extension popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── injected.js           # Injected script for advanced data access
├── icons/                # Extension icons (16x16, 32x32, 48x48, 128x128)
└── README.md            # This file
```

### Key Components

#### Background Script (`background.js`)

- Handles extension lifecycle events
- Manages data storage and retrieval
- Processes messages from content scripts
- Updates extension badge with data count

#### Content Script (`content.js`)

- Runs on target KeyForge websites
- Detects and extracts deck/game data
- Communicates with background script
- Observes DOM changes for dynamic content

#### Popup Interface (`popup.html/js/css`)

- Provides user interface for settings
- Displays collection statistics
- Allows data export and management
- Shows recent collections

#### Injected Script (`injected.js`)

- Accesses page-level JavaScript variables
- Extracts data from React/Vue applications
- Provides deeper data collection capabilities

### Data Collection

The extension collects data from:

- **Decks**: Name, ID, houses, cards, metadata
- **Games**: Players, winners, moves, timestamps
- **Metadata**: Source URLs, collection timestamps

### Settings

- **Extension Enabled**: Master on/off switch
- **Auto Collect**: Automatically collect data when detected
- **Collect Decks**: Enable/disable deck data collection
- **Collect Games**: Enable/disable game data collection

### Data Storage

All data is stored locally using the Chrome Storage API:

- Settings: Stored in `chrome.storage.sync`
- Collected data: Stored in `chrome.storage.local`

### Export Format

Data can be exported as JSON with the following structure:

```json
{
  "exportDate": "2025-07-08T12:00:00.000Z",
  "version": "1.0.0",
  "data": {
    "deck_12345": { /* deck data */ },
    "game_67890": { /* game data */ }
  }
}
```

## Permissions

The extension requests the following permissions:

- `storage`: For saving collected data and settings
- `activeTab`: For accessing the current tab's content
- `scripting`: For injecting content scripts
- Host permissions for target KeyForge websites

## Privacy

- All data is stored locally in your browser
- No data is transmitted to external servers
- Data collection can be disabled at any time
- Data can be exported or cleared by the user

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both Chrome and Firefox
5. Submit a pull request

## License

[Your chosen license]

## Changelog

### v1.0.0

- Initial release
- Cross-browser compatibility (Chrome/Firefox)
- Basic data collection from KeyForge websites
- Popup interface with settings and statistics
- Data export functionality
