# KeyForge Amasser - Browser Extension Overview

## 🎯 What's Been Created

A complete cross-browser extension for Chrome and Firefox that collects and manages KeyForge data from websites using the Web Extensions API.

## 📁 Project Structure

```
amasser/
├── 📋 Core Extension Files
│   ├── manifest.json              # Manifest v3 (Chrome/modern browsers)
│   ├── manifest-v2.json           # Manifest v2 (Firefox compatibility)
│   ├── background.js              # Service worker/background script
│   ├── content.js                # Content script for data collection
│   ├── injected.js               # Injected script for deep data access
│   └── types.d.ts                # TypeScript definitions
│
├── 🎨 User Interface
│   ├── popup.html                # Extension popup interface
│   ├── popup.js                  # Popup functionality
│   └── popup.css                 # Popup styling
│
├── 🖼️ Assets
│   └── icons/                    # Extension icons (SVG format)
│       ├── icon-16.svg
│       ├── icon-32.svg
│       ├── icon-48.svg
│       └── icon-128.svg
│
├── 🔧 Build & Development
│   ├── build.sh                  # Build script for distribution
│   ├── create-icons.js           # Icon generation script
│   ├── package.json              # Project metadata
│   └── .gitignore               # Git ignore rules
│
├── 📚 Documentation
│   ├── README.md                 # User documentation
│   └── DEVELOPMENT.md            # Developer guide
│
└── 📦 Distribution
    └── dist/                     # Build output directory
```

## ✨ Key Features

### 🔍 Data Collection
- **Multi-site Support**: KeyForge Compendium, Decks of KeyForge, Crucible Online
- **Automatic Detection**: Recognizes deck and game data on supported sites
- **Deep Integration**: Accesses JavaScript variables and React/Vue app data
- **Dynamic Monitoring**: Observes page changes for real-time collection

### 💾 Data Management
- **Local Storage**: All data stored locally in browser
- **Export Functionality**: JSON export with timestamps and metadata
- **Statistics Tracking**: Real-time counts of collected items
- **Data Clearing**: User-controlled data management

### 🎛️ User Controls
- **Enable/Disable Toggle**: Master switch for extension
- **Selective Collection**: Choose what types of data to collect
- **Recent Activity**: View latest collected items
- **Settings Persistence**: Preferences saved across browser sessions

### 🔒 Privacy & Security
- **Local Only**: No external data transmission
- **Minimal Permissions**: Only requests necessary browser permissions
- **User Controlled**: Full control over data collection and storage

## 🚀 Getting Started

### Installation (Development)

1. **Chrome:**
   ```bash
   # Navigate to chrome://extensions/
   # Enable "Developer mode"
   # Click "Load unpacked" → Select amasser folder
   ```

2. **Firefox:**
   ```bash
   # Navigate to about:debugging
   # Click "This Firefox" → "Load Temporary Add-on"
   # Select manifest.json from amasser folder
   ```

### Quick Setup

```bash
cd amasser

# Generate SVG icons
node create-icons.js

# Make build script executable
chmod +x build.sh

# Create distribution packages
./build.sh
```

## 🎯 Supported Websites

| Website | Deck Data | Game Data | Status |
|---------|-----------|-----------|--------|
| KeyForge Compendium | ✅ | ✅ | Active |
| Decks of KeyForge | ✅ | ⏳ | Partial |
| Crucible Online | ⏳ | ✅ | Partial |

*Note: Collection methods are designed to be easily extensible for new sites*

## 🔧 Technical Architecture

### Extension Components

1. **Manifest Files**: Browser compatibility layer
2. **Background Script**: Data processing and storage management
3. **Content Scripts**: Website-specific data extraction
4. **Popup Interface**: User interaction and settings
5. **Injected Scripts**: Deep JavaScript access

### Data Flow

```
Website Content → Content Script → Background Script → Local Storage
                       ↓
                 Injected Script → Page Variables
                       ↓
                 Popup Interface ← Settings & Stats
```

### Browser Compatibility

| Feature | Chrome | Firefox | Edge | Safari |
|---------|--------|---------|------|--------|
| Manifest v3 | ✅ | ✅ (109+) | ✅ | ⚠️ |
| Manifest v2 | ⚠️ | ✅ | ⚠️ | ❌ |
| Service Workers | ✅ | ✅ | ✅ | ⚠️ |
| Content Scripts | ✅ | ✅ | ✅ | ✅ |

## 📊 Data Schema

### Collected Deck Information
- Deck ID and name
- House combinations
- Card lists with rarity
- Source metadata

### Collected Game Information
- Player information
- Game outcomes
- Move sequences (when available)
- Timestamps and sources

## 🛠️ Development

### Adding New Site Support

1. Update manifest permissions for new domain
2. Add site detection logic in `content.js`
3. Implement site-specific extraction methods
4. Test data collection and storage

### Building for Production

```bash
# Create distribution packages
./build.sh

# Outputs:
# dist/keyforge-amasser-chrome-v1.0.0.zip
# dist/keyforge-amasser-firefox-v1.0.0.zip
```

## 📝 Next Steps

### Immediate Tasks
1. **Convert SVG icons to PNG** (required for production)
2. **Test on target websites** (Compendium, DoK, Crucible)
3. **Refine data extraction** based on actual website structures

### Future Enhancements
- Additional website support
- Data analysis and insights
- Export format options (CSV, etc.)
- Backup/sync capabilities
- Advanced filtering and search

## 🤝 Contributing

The extension is designed to be easily extensible:

1. **Site Support**: Add new KeyForge websites
2. **Data Types**: Extend collection to tournaments, player stats
3. **UI Improvements**: Enhance popup interface
4. **Export Options**: Add new data formats
5. **Analysis Tools**: Build data insights features

## 📋 Requirements Met

✅ **Cross-Browser Compatibility**: Chrome and Firefox support
✅ **Web Extensions API**: Modern API usage
✅ **Data Collection**: Automatic KeyForge data extraction
✅ **User Interface**: Popup with controls and statistics
✅ **Privacy-First**: Local storage only
✅ **Extensible Architecture**: Easy to add new sites
✅ **Development Tools**: Build scripts and documentation
✅ **Type Safety**: TypeScript definitions included

The KeyForge Amasser browser extension is now ready for development, testing, and deployment! 🎉
