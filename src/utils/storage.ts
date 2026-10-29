/**
 * High-capacity IndexedDB storage engine and real-time sync broadcaster
 * Resolves localStorage 5MB quota limitations by storing rich photo records in IndexedDB
 * while supporting real-time multi-tab synchronization between SMT and Manager portals.
 */

const DB_NAME = 'ReadyToSellInformaAlsutDB';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

// Initialize and get the IndexedDB database instance
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Get item from IndexedDB
export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve((request.result as T) ?? null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Error reading key "${key}":`, err);
    return null;
  }
}

// Set item in IndexedDB
export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Error writing key "${key}":`, err);
  }
}

// Delete item from IndexedDB
export async function idbDelete(key: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Error deleting key "${key}":`, err);
  }
}

// Reclaim space by cleaning legacy localStorage keys
export function purgeLegacyStorageKeys(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith('ready_to_sell_informa_alsut_v1') ||
          k.startsWith('ready_to_sell_informa_alsut_v2') ||
          k.startsWith('ready_to_sell_informa_alsut_v3') ||
          k.startsWith('ready_to_sell_informa_alsut_v4') ||
          k.startsWith('ready_to_sell_informa_alsut_v5') ||
          k.startsWith('ready_to_sell_history_v1') ||
          k.startsWith('ready_to_sell_history_v2') ||
          k.startsWith('ready_to_sell_history_v3') ||
          k.startsWith('ready_to_sell_history_v4') ||
          k.startsWith('ready_to_sell_history_v5'))
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

// Safe localStorage setItem that catches QuotaExceededError and prevents crashes
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      // Quota exceeded: clean up old versions first
      purgeLegacyStorageKeys();
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        // If still overflowing, suppress the throw to protect user experience.
        // IndexedDB holds the authoritative data.
        return false;
      }
    }
    return false;
  }
}

// Real-Time Cross-Tab / Cross-Window Broadcaster
type RealtimeMessage =
  | { type: 'STAFF_SYNC'; allStaff: any; dateKey: string }
  | { type: 'FINDING_SYNC'; storeFindings: any }
  | { type: 'FORCE_REFRESH' };

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('ready_to_sell_realtime_alsut');
  }
} catch {
  broadcastChannel = null;
}

export function broadcastRealtimeEvent(msg: RealtimeMessage): void {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage(msg);
    }
  } catch (e) {
    console.warn('Broadcast failed:', e);
  }
}

export function subscribeRealtimeEvents(callback: (msg: RealtimeMessage) => void): () => void {
  if (!broadcastChannel) {
    return () => {};
  }
  const handler = (event: MessageEvent) => {
    callback(event.data);
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}
