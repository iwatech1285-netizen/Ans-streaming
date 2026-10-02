// ==========================================================================
// IndexedDB Media Storage for Direct Video Uploads (.mp4, .webm, .mkv)
// Supports multi-hundred megabyte uploads with persistent ObjectURLs
// ==========================================================================

const DB_NAME = 'AnsAnimeMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_videos';

// In-memory active object URLs cache to avoid repeated creation
const activeObjectUrls: Map<string, string> = new Map();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredVideoRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  blob: Blob;
  createdAt: number;
}

export async function storeVideoFile(id: string, file: File): Promise<{ storageKey: string; objectUrl: string; sizeFormatted: string }> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredVideoRecord = {
      id,
      name: file.name,
      size: file.size,
      type: file.type || 'video/mp4',
      blob: file,
      createdAt: Date.now(),
    };

    const req = store.put(record);
    req.onsuccess = () => {
      const objectUrl = URL.createObjectURL(file);
      activeObjectUrls.set(id, objectUrl);

      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const sizeFormatted = file.size > 1024 * 1024 * 1024
        ? `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
        : `${sizeMB} MB`;

      resolve({
        storageKey: `local-video://${id}`,
        objectUrl,
        sizeFormatted,
      });
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getVideoObjectUrl(idOrStorageKey: string): Promise<string | null> {
  const cleanId = idOrStorageKey.replace('local-video://', '');
  if (activeObjectUrls.has(cleanId)) {
    return activeObjectUrls.get(cleanId)!;
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cleanId);
      req.onsuccess = () => {
        const record = req.result as StoredVideoRecord | undefined;
        if (record && record.blob) {
          const url = URL.createObjectURL(record.blob);
          activeObjectUrls.set(cleanId, url);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error('Failed to retrieve video from IndexedDB:', err);
    return null;
  }
}

export async function deleteStoredVideo(idOrStorageKey: string): Promise<boolean> {
  const cleanId = idOrStorageKey.replace('local-video://', '');
  if (activeObjectUrls.has(cleanId)) {
    URL.revokeObjectURL(activeObjectUrls.get(cleanId)!);
    activeObjectUrls.delete(cleanId);
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(cleanId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
