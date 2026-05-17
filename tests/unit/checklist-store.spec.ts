import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  __resetStorageForTests,
  useChecklistStorage,
} from '../../composables/useChecklistStorage'
import {
  CURRENT_STATE_VERSION,
  MAX_PHOTOS_PER_ITEM,
  NOTE_MAX_LENGTH,
  useChecklistStore,
} from '../../stores/checklist'
import type { Checklist } from '../../utils/checklist-types'

const mockSchema: Checklist = {
  version: 1,
  sections: [
    {
      id: 'sec-a',
      title: 'Section A',
      items: [
        { id: 'i1', label: 'item 1', description: 'd1' },
        { id: 'i2', label: 'item 2', description: 'd2' },
      ],
    },
    {
      id: 'sec-b',
      title: 'Section B',
      items: [
        { id: 'i3', label: 'item 3', description: 'd3' },
      ],
    },
  ],
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  __resetStorageForTests()
  setActivePinia(createPinia())
})

describe('useChecklistStore', () => {
  describe('initial state', () => {
    it('預設值符合 plan.md §7', () => {
      const s = useChecklistStore()
      expect(s.stateVersion).toBe(CURRENT_STATE_VERSION)
      expect(s.schema).toBeNull()
      expect(s.items).toEqual({})
      expect(s.vehicle).toEqual({ model: null, deliveryDate: null })
      expect(s.settings).toEqual({
        showSignature: false,
        photoTimestamp: false,
        largeFont: false,
      })
      expect(s.hydrated).toBe(false)
    })
  })

  describe('getters', () => {
    it('schema 為 null 時 totalCount/checkedCount/progressPercent 都是 0', () => {
      const s = useChecklistStore()
      expect(s.totalCount).toBe(0)
      expect(s.checkedCount).toBe(0)
      expect(s.progressPercent).toBe(0)
    })

    it('注入 schema 後 totalCount 反映所有 items 總數', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      expect(s.totalCount).toBe(3)
    })

    it('checkedCount 與 progressPercent 隨勾選變化', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      expect(s.progressPercent).toBe(0)
      await s.toggleChecked('i1')
      expect(s.checkedCount).toBe(1)
      expect(s.progressPercent).toBe(33)
      await s.toggleChecked('i2')
      await s.toggleChecked('i3')
      expect(s.progressPercent).toBe(100)
    })

    it('sectionProgress 計算單一 section 內已勾選/總數', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      expect(s.sectionProgress('sec-a')).toEqual({ checked: 0, total: 2 })
      await s.toggleChecked('i1')
      expect(s.sectionProgress('sec-a')).toEqual({ checked: 1, total: 2 })
      expect(s.sectionProgress('sec-b')).toEqual({ checked: 0, total: 1 })
    })

    it('sectionProgress 對不存在的 section 回 {checked:0,total:0}', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      expect(s.sectionProgress('not-exist')).toEqual({ checked: 0, total: 0 })
    })
  })

  describe('hydrate', () => {
    it('第一次 hydrate 寫入 stateVersion=1 到 meta', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      const storage = useChecklistStorage()
      expect(await storage.getMeta<number>('stateVersion')).toBe(1)
      expect(s.hydrated).toBe(true)
    })

    it('已存在 stateVersion=1 時不覆寫 meta', async () => {
      const storage = useChecklistStorage()
      await storage.putMeta('stateVersion', 1)
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      expect(await storage.getMeta<number>('stateVersion')).toBe(1)
    })

    it('遇到不支援的 stateVersion 拋錯', async () => {
      const storage = useChecklistStorage()
      await storage.putMeta('stateVersion', 999)
      const s = useChecklistStore()
      await expect(s.hydrate(mockSchema)).rejects.toThrow(/stateVersion/)
    })

    it('從 storage 還原 items / vehicle / settings', async () => {
      const storage = useChecklistStorage()
      await storage.putItem({
        id: 'i1',
        checked: true,
        statusTag: 'pass',
        note: 'hi',
        photoIds: [],
        updatedAt: 1,
      })
      await storage.putMeta('vehicle', { model: 'Model Y', deliveryDate: '2026-01-01' })
      await storage.putMeta('settings', {
        showSignature: true,
        photoTimestamp: false,
        largeFont: false,
      })

      const s = useChecklistStore()
      await s.hydrate(mockSchema)

      expect(s.items.i1.checked).toBe(true)
      expect(s.items.i1.statusTag).toBe('pass')
      expect(s.items.i1.note).toBe('hi')
      expect(s.vehicle.model).toBe('Model Y')
      expect(s.vehicle.deliveryDate).toBe('2026-01-01')
      expect(s.settings.showSignature).toBe(true)
    })

    it('hydrate 後 schema 已設定', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      expect(s.schema).toEqual(mockSchema)
    })
  })

  describe('toggleChecked', () => {
    it('從未勾選變為已勾選並同步寫入 storage', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      await s.toggleChecked('i1')
      expect(s.items.i1.checked).toBe(true)
      expect(s.items.i1.updatedAt).toBeGreaterThan(0)

      const storage = useChecklistStorage()
      const persisted = await storage.getItem('i1')
      expect(persisted?.checked).toBe(true)
    })

    it('再次呼叫翻回未勾選', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      await s.toggleChecked('i1')
      await s.toggleChecked('i1')
      expect(s.items.i1.checked).toBe(false)
    })
  })

  describe('setStatusTag', () => {
    it('設定 pass / minor / major / null', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      await s.setStatusTag('i1', 'pass')
      expect(s.items.i1.statusTag).toBe('pass')
      await s.setStatusTag('i1', 'major')
      expect(s.items.i1.statusTag).toBe('major')
      await s.setStatusTag('i1', null)
      expect(s.items.i1.statusTag).toBeNull()
    })

    it('同步寫入 storage', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      await s.setStatusTag('i1', 'minor')
      const storage = useChecklistStorage()
      expect((await storage.getItem('i1'))?.statusTag).toBe('minor')
    })
  })

  describe('setNote', () => {
    it('一般長度的備註直接寫入', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      await s.setNote('i1', '車門有刮痕')
      expect(s.items.i1.note).toBe('車門有刮痕')
    })

    it('超過 NOTE_MAX_LENGTH 字會被截斷', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      const tooLong = 'a'.repeat(NOTE_MAX_LENGTH + 100)
      await s.setNote('i1', tooLong)
      expect(s.items.i1.note.length).toBe(NOTE_MAX_LENGTH)
    })
  })

  describe('addPhoto / removePhoto', () => {
    it('addPhoto 寫入 storage 並把 photoId 加進 state', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      const blob = new Blob(['data'], { type: 'image/jpeg' })
      const photoId = await s.addPhoto('i1', blob)
      expect(s.items.i1.photoIds).toContain(photoId)

      const storage = useChecklistStorage()
      const photos = await storage.getPhotosByItem('i1')
      expect(photos.map((p) => p.id)).toContain(photoId)
    })

    it('已達 MAX_PHOTOS_PER_ITEM 張時 addPhoto 拋錯', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      const blob = new Blob(['x'], { type: 'image/jpeg' })
      for (let i = 0; i < MAX_PHOTOS_PER_ITEM; i += 1) {
        await s.addPhoto('i1', blob)
      }
      await expect(s.addPhoto('i1', blob)).rejects.toThrow()
      expect(s.items.i1.photoIds.length).toBe(MAX_PHOTOS_PER_ITEM)
    })

    it('removePhoto 同步從 state 與 storage 移除', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      const blob = new Blob(['x'], { type: 'image/jpeg' })
      const photoId = await s.addPhoto('i1', blob)
      await s.removePhoto('i1', photoId)
      expect(s.items.i1.photoIds).not.toContain(photoId)
      const storage = useChecklistStorage()
      expect(await storage.getPhoto(photoId)).toBeUndefined()
    })
  })

  describe('setVehicle', () => {
    it('partial update 不覆蓋既有欄位', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      await s.setVehicle({ model: 'Model 3' })
      await s.setVehicle({ plate: 'ABC-1234' })
      expect(s.vehicle.model).toBe('Model 3')
      expect(s.vehicle.plate).toBe('ABC-1234')
    })

    it('同步寫入 meta.vehicle', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      await s.setVehicle({ model: 'Model Y', deliveryDate: '2026-06-01' })
      const storage = useChecklistStorage()
      const stored = await storage.getMeta<{ model: string }>('vehicle')
      expect(stored?.model).toBe('Model Y')
    })
  })

  describe('setSetting', () => {
    it('typed key/value 更新對應 setting', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      await s.setSetting('showSignature', true)
      expect(s.settings.showSignature).toBe(true)
      await s.setSetting('largeFont', true)
      expect(s.settings.largeFont).toBe(true)
    })

    it('同步寫入 meta.settings', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      await s.setSetting('photoTimestamp', true)
      const storage = useChecklistStorage()
      const stored = await storage.getMeta<{ photoTimestamp: boolean }>('settings')
      expect(stored?.photoTimestamp).toBe(true)
    })
  })

  describe('clearAll', () => {
    it('重設 state 並清空 storage', async () => {
      const s = useChecklistStore()
      await s.hydrate(mockSchema)
      await s.toggleChecked('i1')
      await s.setVehicle({ model: 'Model 3' })
      await s.setSetting('showSignature', true)
      await s.addPhoto('i1', new Blob(['x'], { type: 'image/jpeg' }))

      await s.clearAll()

      expect(s.items).toEqual({})
      expect(s.vehicle).toEqual({ model: null, deliveryDate: null })
      expect(s.settings).toEqual({
        showSignature: false,
        photoTimestamp: false,
        largeFont: false,
      })

      const storage = useChecklistStorage()
      expect(Object.keys(await storage.getAllItems())).toHaveLength(0)
      expect(await storage.getPhotosByItem('i1')).toHaveLength(0)
      expect(await storage.getMeta('vehicle')).toBeUndefined()
    })
  })
})
