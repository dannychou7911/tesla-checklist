import { type DBSchema, type IDBPDatabase, openDB } from 'idb'

export const DB_NAME = 'tesla-checklist'
export const DB_VERSION = 1

export const STORE_NAMES = {
  ITEMS: 'items',
  PHOTOS: 'photos',
  META: 'meta',
} as const

export const PHOTO_BY_ITEM_INDEX = 'by-item'

export type StatusTag = 'pass' | 'minor' | 'major' | null

export interface StoredItemState {
  id: string
  checked: boolean
  statusTag: StatusTag
  note: string
  photoIds: string[]
  updatedAt: number
}

export interface PhotoRecord {
  id: string
  itemId: string
  blob: Blob
  createdAt: number
}

export interface MetaRecord {
  key: string
  value: unknown
}

interface ChecklistDB extends DBSchema {
  items: {
    key: string
    value: StoredItemState
  }
  photos: {
    key: string
    value: PhotoRecord
    indexes: { 'by-item': string }
  }
  meta: {
    key: string
    value: MetaRecord
  }
}

let dbPromise: Promise<IDBPDatabase<ChecklistDB>> | null = null

function getDB(): Promise<IDBPDatabase<ChecklistDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ChecklistDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAMES.ITEMS)) {
          db.createObjectStore(STORE_NAMES.ITEMS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORE_NAMES.PHOTOS)) {
          const photoStore = db.createObjectStore(STORE_NAMES.PHOTOS, { keyPath: 'id' })
          photoStore.createIndex(PHOTO_BY_ITEM_INDEX, 'itemId')
        }
        if (!db.objectStoreNames.contains(STORE_NAMES.META)) {
          db.createObjectStore(STORE_NAMES.META, { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

export function useChecklistStorage() {
  return {
    async putItem(state: StoredItemState): Promise<void> {
      const db = await getDB()
      await db.put(STORE_NAMES.ITEMS, state)
    },

    async getItem(id: string): Promise<StoredItemState | undefined> {
      const db = await getDB()
      return db.get(STORE_NAMES.ITEMS, id)
    },

    async getAllItems(): Promise<Record<string, StoredItemState>> {
      const db = await getDB()
      const all = await db.getAll(STORE_NAMES.ITEMS)
      return Object.fromEntries(all.map((item) => [item.id, item]))
    },

    async deleteItem(id: string): Promise<void> {
      const db = await getDB()
      await db.delete(STORE_NAMES.ITEMS, id)
    },

    async putPhoto(photo: PhotoRecord): Promise<void> {
      const db = await getDB()
      await db.put(STORE_NAMES.PHOTOS, photo)
    },

    async getPhoto(id: string): Promise<PhotoRecord | undefined> {
      const db = await getDB()
      return db.get(STORE_NAMES.PHOTOS, id)
    },

    async getPhotosByItem(itemId: string): Promise<PhotoRecord[]> {
      const db = await getDB()
      return db.getAllFromIndex(STORE_NAMES.PHOTOS, PHOTO_BY_ITEM_INDEX, itemId)
    },

    async deletePhoto(id: string): Promise<void> {
      const db = await getDB()
      await db.delete(STORE_NAMES.PHOTOS, id)
    },

    async putMeta(key: string, value: unknown): Promise<void> {
      const db = await getDB()
      await db.put(STORE_NAMES.META, { key, value })
    },

    async getMeta<T = unknown>(key: string): Promise<T | undefined> {
      const db = await getDB()
      const rec = await db.get(STORE_NAMES.META, key)
      return rec?.value as T | undefined
    },

    async clearAll(): Promise<void> {
      const db = await getDB()
      const tx = db.transaction(
        [STORE_NAMES.ITEMS, STORE_NAMES.PHOTOS, STORE_NAMES.META],
        'readwrite',
      )
      await Promise.all([
        tx.objectStore(STORE_NAMES.ITEMS).clear(),
        tx.objectStore(STORE_NAMES.PHOTOS).clear(),
        tx.objectStore(STORE_NAMES.META).clear(),
      ])
      await tx.done
    },
  }
}

// 僅供測試使用：在每個 test beforeEach 重設 globalThis.indexedDB 後，需丟掉舊的 db cache
export function __resetStorageForTests(): void {
  dbPromise = null
}
