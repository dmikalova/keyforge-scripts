// Type definitions for KeyForge Amasser Extension

// Settings interface
interface Settings {
  syncAuto?: boolean
  syncDok?: boolean
  syncTco?: boolean
}

// Auth interfaces
interface MvAuth {
  token: string
  userId: string
  username: string
}

interface TcoAuth {
  refreshToken: string
  username: string
}

interface TcoUserResponse {
  username: string
  token: string
  userId: string
}

// User interfaces
interface MvUser {
  id: string
  username: string
}

interface DokUser {
  username: string
}

interface TcoUser {
  username: string
}

interface Decks {
  [id: string]: boolean | string
}

// Chrome storage
interface StorageData {
  decks?: {
    mv?: Decks
    dok?: Decks
    tco?: Decks
  }
  settings?: Settings
  tokenMv?: string
  tokenDok?: string
  tokenTco?: string
}

// Message types
interface SyncMessage {
  type: 'SYNC_START' | 'SYNC_COMPLETE' | 'SYNC_ERROR' | 'SYNC_STATUS'
  button?: string
  decks?: number
  totalDecks?: number
  error?: string
}
