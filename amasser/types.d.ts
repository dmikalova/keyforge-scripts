// Auth interfaces
interface DokCreds {
  token: string | null
  username: string | null
}

interface DokDeck {
  keyforgeId: string
  name?: string
}

interface MvCreds {
  token: string | null
  userId: string | null
  username: string | null
}

interface MvDeck {
  id: string
  name?: string
}

interface TcoCreds {
  token: string | null
  username: string | null
  userId: string | null
}

interface TcoDeck {
  uuid: string
  name?: string
}

// Settings interface
interface Settings {
  linkDok?: boolean
  syncAuto?: boolean
  syncDok?: boolean
  syncTco?: boolean
}

// Chrome storage
type StorageData = any

// StorageDecks interface
interface StorageDecks {
  [key: `${'zdok.' | 'zmv.' | 'ztco.'}${string}`]: boolean | string
}

type Deck = boolean | string

interface Decks {
  dok?: Record<string, Deck>
  mv?: Record<string, Deck>
  tco?: Record<string, Deck>
}

// Timestamps interface
interface Timestamps {
  libraryDok?: number
  libraryTco?: number
  syncingDok?: number
  syncingMv?: number
  syncingTco?: number
}

// Auth data interface
interface AuthData {
  authDok?: string
  authTco?: { id: number; username: string; token: string }
}

// Message types
interface SyncMessage {
  type:
    | 'AUTH'
    | 'DECK_COUNT'
    | 'RELOAD_USERS'
    | 'SYNC_COMPLETE'
    | 'SYNC_ERROR'
    | 'SYNC_START'
    | 'SYNC_STATUS'
  auth?: AuthData
  button?: string
  decks?: number
  totalDecks?: number
  error?: string
}
