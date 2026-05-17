import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import {
  __resetStorageForTests,
  type PhotoRecord,
  type StoredItemState,
  useChecklistStorage,
} from '../../composables/useChecklistStorage'

beforeEach(() => {
  // 每個 test 都用全新 IDBFactory，確保資料庫狀態乾淨
  globalThis.indexedDB = new IDBFactory()
  __resetStorageForTests()
})

function makeItem(overrides: Partial<StoredItemState> = {}): StoredItemState {
  return {
    id: 'sec-1-item-1',
    checked: false,
    statusTag: null,
    note: '',
    photoIds: [],
    updatedAt: 0,
    ...overrides,
  }
}

function makePhoto(overrides: Partial<PhotoRecord> = {}): PhotoRecord {
  return {
    id: 'ph-1',
    itemId: 'sec-1-item-1',
    blob: new Blob(['data'], { type: 'image/jpeg' }),
    createdAt: 0,
    ...overrides,
  }
}

describe('useChecklistStorage', () => {
  describe('items store', () => {
    it('put 與 get 可往返讀寫 ItemState', async () => {
      const s = useChecklistStorage()
      const state = makeItem({ checked: true, statusTag: 'pass', note: 'OK', updatedAt: 100 })
      await s.putItem(state)
      const got = await s.getItem('sec-1-item-1')
      expect(got).toEqual(state)
    })

    it('getItem 在沒寫過的 id 回 undefined', async () => {
      const s = useChecklistStorage()
      expect(await s.getItem('nonexistent')).toBeUndefined()
    })

    it('getAllItems 回傳以 id 為 key 的 Record', async () => {
      const s = useChecklistStorage()
      await s.putItem(makeItem({ id: 'a', checked: true }))
      await s.putItem(makeItem({ id: 'b', statusTag: 'minor' }))
      const all = await s.getAllItems()
      expect(Object.keys(all).sort()).toEqual(['a', 'b'])
      expect(all.a.checked).toBe(true)
      expect(all.b.statusTag).toBe('minor')
    })

    it('deleteItem 移除指定 id', async () => {
      const s = useChecklistStorage()
      await s.putItem(makeItem({ id: 'a' }))
      await s.deleteItem('a')
      expect(await s.getItem('a')).toBeUndefined()
    })
  })

  describe('photos store', () => {
    it('put 與 get 可往返讀寫 PhotoRecord', async () => {
      const s = useChecklistStorage()
      const photo = makePhoto({ id: 'ph-x', itemId: 'sec-1-item-1' })
      await s.putPhoto(photo)
      const got = await s.getPhoto('ph-x')
      expect(got?.id).toBe('ph-x')
      expect(got?.itemId).toBe('sec-1-item-1')
      // fake-indexeddb 的 structured clone 會把 Blob 還原成失去 prototype 的物件
      // （實際瀏覽器中為 Blob instance），所以這裡只驗證可辨識的 type 屬性
      expect(got?.blob?.type).toBe('image/jpeg')
    })

    it('getPhotosByItem 用 by-item index 取出該 item 的所有照片', async () => {
      const s = useChecklistStorage()
      await s.putPhoto(makePhoto({ id: 'p1', itemId: 'item-a' }))
      await s.putPhoto(makePhoto({ id: 'p2', itemId: 'item-a' }))
      await s.putPhoto(makePhoto({ id: 'p3', itemId: 'item-b' }))
      const byA = await s.getPhotosByItem('item-a')
      expect(byA.map((p) => p.id).sort()).toEqual(['p1', 'p2'])
      const byB = await s.getPhotosByItem('item-b')
      expect(byB.map((p) => p.id)).toEqual(['p3'])
    })

    it('deletePhoto 移除指定 photo', async () => {
      const s = useChecklistStorage()
      await s.putPhoto(makePhoto({ id: 'p1' }))
      await s.deletePhoto('p1')
      expect(await s.getPhoto('p1')).toBeUndefined()
    })
  })

  describe('meta store', () => {
    it('put/get 可以存任意 key/value（含 stateVersion）', async () => {
      const s = useChecklistStorage()
      await s.putMeta('stateVersion', 1)
      await s.putMeta('vehicle', { model: 'Model Y', plate: 'ABC-1234' })
      expect(await s.getMeta<number>('stateVersion')).toBe(1)
      expect(await s.getMeta<{ model: string }>('vehicle')).toEqual({
        model: 'Model Y',
        plate: 'ABC-1234',
      })
    })

    it('getMeta 在沒寫過的 key 回 undefined', async () => {
      const s = useChecklistStorage()
      expect(await s.getMeta('missing')).toBeUndefined()
    })
  })

  describe('clearAll', () => {
    it('一次清空 items / photos / meta 三個 stores', async () => {
      const s = useChecklistStorage()
      await s.putItem(makeItem({ id: 'i1' }))
      await s.putPhoto(makePhoto({ id: 'p1', itemId: 'i1' }))
      await s.putMeta('k', 'v')
      await s.clearAll()
      expect(Object.keys(await s.getAllItems())).toHaveLength(0)
      expect(await s.getPhotosByItem('i1')).toHaveLength(0)
      expect(await s.getMeta('k')).toBeUndefined()
    })
  })
})
