/** Persistencia en IndexedDB (más estable que localStorage) */
const DB_NAME = 'giovanni-db';
const STORE = 'zustand';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      // Close the connection if another tab requests a schema upgrade.
      db.onversionchange = () => db.close();
      resolve(db);
    };
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
  });
}

export const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    let db: IDBDatabase | undefined;
    try {
      db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db!.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(name);
        req.onsuccess = () => resolve((req.result as string) ?? null);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db?.close();
        tx.onerror = () => db?.close();
        tx.onabort = () => db?.close();
      });
    } catch {
      db?.close();
      return localStorage.getItem(name);
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    let db: IDBDatabase | undefined;
    try {
      db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db!.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(value, name);
        tx.oncomplete = () => {
          db?.close();
          resolve();
        };
        tx.onerror = () => {
          db?.close();
          reject(tx.error);
        };
        tx.onabort = () => db?.close();
      });
      // Backup localStorage remains best-effort.
      try { localStorage.setItem(name, value); } catch { /* Storage may be unavailable. */ }
    } catch {
      db?.close();
      try { localStorage.setItem(name, value); } catch { /* Storage may be unavailable. */ }
    }
  },
  removeItem: async (name: string): Promise<void> => {
    let db: IDBDatabase | undefined;
    try {
      db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db!.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(name);
        tx.oncomplete = () => {
          db?.close();
          resolve();
        };
        tx.onerror = () => {
          db?.close();
          reject(tx.error);
        };
        tx.onabort = () => db?.close();
      });
    } catch {
      db?.close();
    }
    try { localStorage.removeItem(name); } catch { /* Storage may be unavailable. */ }
  },
};
