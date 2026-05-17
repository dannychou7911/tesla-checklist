import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Item from '../../components/checklist/Item.vue'
import NoteEditor from '../../components/checklist/NoteEditor.vue'
import PhotoLightbox from '../../components/checklist/PhotoLightbox.vue'
import PhotoUploader from '../../components/checklist/PhotoUploader.vue'
import StatusTagPicker from '../../components/checklist/StatusTagPicker.vue'
import { __resetStorageForTests } from '../../composables/useChecklistStorage'
import { useChecklistStore } from '../../stores/checklist'
import type { ChecklistItem } from '../../utils/checklist-types'

vi.mock('../../composables/usePhotoCompression', () => ({
  usePhotoCompression: () => ({
    compress: async (file: File) => file,
  }),
}))

const mockItem: ChecklistItem = {
  id: 'i1',
  label: '前保桿',
  description: '檢查刮痕與色差',
}

let createObjectURLSpy: ReturnType<typeof vi.fn>
let revokeObjectURLSpy: ReturnType<typeof vi.fn>
let vibrateSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  __resetStorageForTests()
  setActivePinia(createPinia())

  let counter = 0
  createObjectURLSpy = vi.fn(() => `blob:mock/${++counter}`)
  revokeObjectURLSpy = vi.fn()
  globalThis.URL.createObjectURL = createObjectURLSpy as unknown as typeof URL.createObjectURL
  globalThis.URL.revokeObjectURL = revokeObjectURLSpy as unknown as typeof URL.revokeObjectURL

  vibrateSpy = vi.fn()
  Object.defineProperty(navigator, 'vibrate', {
    value: vibrateSpy,
    writable: true,
    configurable: true,
  })
})

function mountItem() {
  return mount(Item, { props: { item: mockItem, sectionId: 'sec-a' } })
}

describe('Item — 基本渲染', () => {
  it('顯示 label 與 description', () => {
    const w = mountItem()
    expect(w.text()).toContain('前保桿')
    expect(w.text()).toContain('檢查刮痕與色差')
  })

  it('row 有 role=button、min-h-[60px]、aria-pressed=false', () => {
    const w = mountItem()
    const row = w.get('[data-testid="item-row"]')
    expect(row.attributes('role')).toBe('button')
    expect(row.classes()).toContain('min-h-[60px]')
    expect(row.attributes('aria-pressed')).toBe('false')
  })

  it('chevron 帶 aria-expanded=false 與 aria-controls=drawer-i1', () => {
    const w = mountItem()
    const chevron = w.get('[data-testid="item-chevron"]')
    expect(chevron.attributes('aria-expanded')).toBe('false')
    expect(chevron.attributes('aria-controls')).toBe('drawer-i1')
  })

  it('checkbox 反映未勾選狀態', () => {
    const w = mountItem()
    const checkbox = w.get('[data-testid="item-checkbox"]').element as HTMLInputElement
    expect(checkbox.checked).toBe(false)
  })

  it('checkbox 反映 store 已勾選狀態', async () => {
    const store = useChecklistStore()
    await store.toggleChecked('i1')
    const w = mountItem()
    const checkbox = w.get('[data-testid="item-checkbox"]').element as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('預設未展開，不渲染抽屜', () => {
    const w = mountItem()
    expect(w.find('[data-testid="item-drawer"]').exists()).toBe(false)
  })
})

describe('Item — 整列 tap 切換勾選', () => {
  it('點 row 呼叫 store.toggleChecked 並 vibrate(20)', async () => {
    const store = useChecklistStore()
    const w = mountItem()
    await w.get('[data-testid="item-row"]').trigger('click')
    await flushPromises()
    expect(store.items.i1?.checked).toBe(true)
    expect(vibrateSpy).toHaveBeenCalledWith(20)
  })

  it('再次點 row 取消勾選', async () => {
    const store = useChecklistStore()
    const w = mountItem()
    await w.get('[data-testid="item-row"]').trigger('click')
    await flushPromises()
    await w.get('[data-testid="item-row"]').trigger('click')
    await flushPromises()
    expect(store.items.i1?.checked).toBe(false)
  })

  it('row aria-pressed 隨 checked 變動', async () => {
    const store = useChecklistStore()
    const w = mountItem()
    await store.toggleChecked('i1')
    await w.vm.$nextTick()
    expect(w.get('[data-testid="item-row"]').attributes('aria-pressed')).toBe('true')
  })
})

describe('Item — chevron 切換展開', () => {
  it('點 chevron 展開抽屜，不呼叫 toggleChecked', async () => {
    const store = useChecklistStore()
    const w = mountItem()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    expect(w.find('[data-testid="item-drawer"]').exists()).toBe(true)
    expect(store.items.i1?.checked).not.toBe(true)
  })

  it('chevron click 不會冒泡觸發 row toggle', async () => {
    const store = useChecklistStore()
    const w = mountItem()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    await flushPromises()
    expect(store.items.i1?.checked).not.toBe(true)
    expect(vibrateSpy).not.toHaveBeenCalled()
  })

  it('再點 chevron 收合', async () => {
    const w = mountItem()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    await w.get('[data-testid="item-chevron"]').trigger('click')
    expect(w.find('[data-testid="item-drawer"]').exists()).toBe(false)
  })

  it('展開後 chevron aria-expanded 變 true', async () => {
    const w = mountItem()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    expect(w.get('[data-testid="item-chevron"]').attributes('aria-expanded')).toBe('true')
  })
})

describe('Item — 展開後組合子元件', () => {
  it('渲染 StatusTagPicker / NoteEditor / PhotoUploader', async () => {
    const w = mountItem()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    expect(w.findComponent(StatusTagPicker).exists()).toBe(true)
    expect(w.findComponent(NoteEditor).exists()).toBe(true)
    expect(w.findComponent(PhotoUploader).exists()).toBe(true)
  })

  it('StatusTagPicker 互動觸發 store.setStatusTag', async () => {
    const store = useChecklistStore()
    const w = mountItem()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    await w.get('[data-testid="status-pass"]').trigger('click')
    await flushPromises()
    expect(store.items.i1?.statusTag).toBe('pass')
  })

  it('NoteEditor 輸入觸發 store.setNote', async () => {
    const store = useChecklistStore()
    const w = mountItem()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    await w.get('[data-testid="note-textarea"]').setValue('看到刮痕')
    await flushPromises()
    expect(store.items.i1?.note).toBe('看到刮痕')
  })
})

describe('Item — 照片 lifecycle', () => {
  it('PhotoUploader emit add → 呼叫 store.addPhoto 並寫入 state', async () => {
    const store = useChecklistStore()
    const w = mountItem()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    const file = new File([new Blob(['x'])], 'a.jpg', { type: 'image/jpeg' })
    w.findComponent(PhotoUploader).vm.$emit('add', [file])
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(store.items.i1?.photoIds.length).toBe(1)
  })

  it('photoIds 增加後產生 Object URL 並傳給 PhotoUploader', async () => {
    const store = useChecklistStore()
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    await store.addPhoto('i1', blob)
    const w = mountItem()
    await flushPromises()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    await flushPromises()
    const photos = w.findComponent(PhotoUploader).props('photos') as Array<{ id: string, url: string }>
    expect(photos.length).toBe(1)
    expect(photos[0].url).toMatch(/^blob:mock\//)
    expect(createObjectURLSpy).toHaveBeenCalled()
  })

  it('PhotoUploader emit remove → 呼叫 store.removePhoto 並 revoke URL', async () => {
    const store = useChecklistStore()
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    const photoId = await store.addPhoto('i1', blob)
    const w = mountItem()
    await flushPromises()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    await flushPromises()
    w.findComponent(PhotoUploader).vm.$emit('remove', photoId)
    await flushPromises()
    expect(store.items.i1?.photoIds).toEqual([])
    expect(revokeObjectURLSpy).toHaveBeenCalled()
  })

  it('PhotoUploader emit view → 開啟 Lightbox', async () => {
    const store = useChecklistStore()
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    const photoId = await store.addPhoto('i1', blob)
    const w = mountItem()
    await flushPromises()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    await flushPromises()
    w.findComponent(PhotoUploader).vm.$emit('view', photoId)
    await flushPromises()
    const lightbox = w.findComponent(PhotoLightbox)
    expect(lightbox.props('open')).toBe(true)
    expect((lightbox.props('photo') as { id: string }).id).toBe(photoId)
  })

  it('Lightbox emit delete → 呼叫 store.removePhoto 並關閉', async () => {
    const store = useChecklistStore()
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    const photoId = await store.addPhoto('i1', blob)
    const w = mountItem()
    await flushPromises()
    await w.get('[data-testid="item-chevron"]').trigger('click')
    await flushPromises()
    w.findComponent(PhotoUploader).vm.$emit('view', photoId)
    await flushPromises()
    w.findComponent(PhotoLightbox).vm.$emit('delete', photoId)
    await flushPromises()
    expect(store.items.i1?.photoIds).toEqual([])
    expect(w.findComponent(PhotoLightbox).props('open')).toBe(false)
  })

  it('unmount 後 revoke 所有 Object URL', async () => {
    const store = useChecklistStore()
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    await store.addPhoto('i1', blob)
    const w = mountItem()
    await flushPromises()
    const createdBeforeUnmount = createObjectURLSpy.mock.calls.length
    expect(createdBeforeUnmount).toBeGreaterThan(0)
    w.unmount()
    expect(revokeObjectURLSpy.mock.calls.length).toBeGreaterThanOrEqual(createdBeforeUnmount)
  })
})
