// Type definitions for Chrome Extension APIs
// This file provides basic type definitions to resolve TypeScript errors

declare namespace chrome {
  namespace runtime {
    interface InstalledDetails {
      reason: string
      previousVersion?: string
    }

    interface MessageSender {
      tab?: chrome.tabs.Tab
      frameId?: number
      id?: string
      url?: string
      nativeApplication?: string
    }

    interface onInstalledEvent {
      addListener(callback: (details: InstalledDetails) => void): void
    }

    interface onMessageEvent {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void,
        ) => void | boolean,
      ): void
    }

    const onInstalled: onInstalledEvent
    const onMessage: onMessageEvent

    function sendMessage(
      message: any,
      responseCallback?: (response: any) => void,
    ): void
  }

  namespace storage {
    interface StorageArea {
      get(
        keys?: string | string[] | object | null,
        callback?: (items: { [key: string]: any }) => void,
      ): Promise<{ [key: string]: any }>
      set(items: { [key: string]: any }, callback?: () => void): Promise<void>
      clear(callback?: () => void): Promise<void>
    }

    const sync: StorageArea
    const local: StorageArea
  }

  namespace action {
    function setBadgeText(details: { text: string; tabId?: number }): void
    function setBadgeBackgroundColor(details: {
      color: string
      tabId?: number
    }): void
  }

  namespace tabs {
    interface Tab {
      id?: number
      index: number
      windowId: number
      highlighted: boolean
      active: boolean
      pinned: boolean
      url?: string
      title?: string
      favIconUrl?: string
      status?: string
      incognito: boolean
      width?: number
      height?: number
      sessionId?: string
    }
  }
}

// Global window extensions for injected scripts
interface Window {
  gameState?: any
  matchData?: any
  gameLog?: any
  deckList?: any
  currentDeck?: any
  deckInfo?: any
  currentPlayer?: any
  players?: any
  userProfile?: any
}

// React internal instance (for accessing React component data)
interface Element {
  _reactInternalInstance?: any
}
