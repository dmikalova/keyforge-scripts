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

// Chrome storage
type StorageData = AuthData & Decks & Timestamps

// Decks interface
interface Decks {
  [key?: `${'zdok.' | 'zmv.' | 'ztco.'}${string}`]: boolean | string
}

// Timestamps interface
interface Timestamps {
  syncingDok?: number
  syncingMv?: number
  syncingTco?: number
  libraryDok?: number
  libraryTco?: number
}

// Auth data interface
interface AuthData {
  authDok?: string
  authTco?: { id: number; username: string; token: string }
}

// Message types
interface SyncMessage {
  type: 'SYNC_START' | 'SYNC_COMPLETE' | 'SYNC_ERROR' | 'SYNC_STATUS' | 'AUTH'
  auth?: AuthData
  button?: string
  decks?: number
  totalDecks?: number
  error?: string
}
