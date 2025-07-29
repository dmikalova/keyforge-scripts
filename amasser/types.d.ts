// Type definitions for KeyForge Amasser Extension

// Deck interface
interface Deck {
  id: string
  name?: string
  mv?: boolean
  dok?: boolean | string
  tco?: boolean | string
  houses?: string[]
  expansion?: string
  [key: string]: any
}

// Settings interface
interface Settings {
  'sync-auto'?: boolean
  'sync-dok'?: boolean
  'sync-tco'?: boolean
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

// Chrome storage
interface StorageData {
  decks?: { [id: string]: Deck }
  settings?: Settings
  'token-mv'?: string
  'token-dok'?: string
  'token-tco'?: string
  [key: string]: any
}

// Message types
interface SyncMessage {
  type: 'SYNC_START' | 'SYNC_COMPLETE' | 'SYNC_ERROR' | 'SYNC_STATUS'
  button?: string
  decks?: number
  totalDecks?: number
  error?: string
}
