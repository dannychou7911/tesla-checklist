import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Item from '../../components/checklist/Item.vue'
import Section from '../../components/checklist/Section.vue'
import SectionList from '../../components/checklist/SectionList.vue'
import { __resetStorageForTests } from '../../composables/useChecklistStorage'
import { useChecklistStore } from '../../stores/checklist'
import type { ChecklistSection } from '../../utils/checklist-types'

vi.mock('../../composables/usePhotoCompression', () => ({
  usePhotoCompression: () => ({
    compress: async (file: File) => file,
  }),
}))

const mockSection: ChecklistSection = {
  id: 'sec-a',
  title: '外觀',
  items: [
    { id: 'i1', label: '前保桿', description: '檢查刮痕' },
    { id: 'i2', label: '後保桿', description: '檢查刮痕' },
    { id: 'i3', label: '車門', description: '檢查色差' },
  ],
}

const mockSections: ChecklistSection[] = [
  mockSection,
  {
    id: 'sec-b',
    title: '內裝',
    items: [{ id: 'i4', label: '方向盤', description: '檢查' }],
  },
]

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  __resetStorageForTests()
  setActivePinia(createPinia())

  Object.defineProperty(navigator, 'vibrate', {
    value: vi.fn(),
    writable: true,
    configurable: true,
  })
})

describe('Section', () => {
  it('顯示 section title', () => {
    const w = mount(Section, { props: { section: mockSection, expanded: false } })
    expect(w.text()).toContain('外觀')
  })

  it('顯示 sectionProgress 0 / 3 起點', () => {
    const w = mount(Section, { props: { section: mockSection, expanded: false } })
    expect(w.text()).toContain('0 / 3')
  })

  it('expanded=false 不渲染 Item', () => {
    const w = mount(Section, { props: { section: mockSection, expanded: false } })
    expect(w.findAllComponents(Item)).toHaveLength(0)
  })

  it('expanded=true 渲染所有 Item', () => {
    const w = mount(Section, { props: { section: mockSection, expanded: true } })
    expect(w.findAllComponents(Item)).toHaveLength(3)
  })

  it('expanded=false 時點 header emit update:expanded=true', async () => {
    const w = mount(Section, { props: { section: mockSection, expanded: false } })
    await w.get('[data-testid="section-header"]').trigger('click')
    expect(w.emitted('update:expanded')).toEqual([[true]])
  })

  it('expanded=true 時點 header emit update:expanded=false', async () => {
    const w = mount(Section, { props: { section: mockSection, expanded: true } })
    await w.get('[data-testid="section-header"]').trigger('click')
    expect(w.emitted('update:expanded')).toEqual([[false]])
  })

  it('header 帶 aria-expanded 與 aria-controls', () => {
    const w = mount(Section, { props: { section: mockSection, expanded: true } })
    const header = w.get('[data-testid="section-header"]')
    expect(header.attributes('aria-expanded')).toBe('true')
    expect(header.attributes('aria-controls')).toBe('section-body-sec-a')
  })

  it('sectionProgress 隨 store 變化', async () => {
    const store = useChecklistStore()
    await store.toggleChecked('i1')
    const w = mount(Section, { props: { section: mockSection, expanded: false } })
    expect(w.text()).toContain('1 / 3')
  })
})

describe('SectionList', () => {
  it('渲染所有 Section', () => {
    const w = mount(SectionList, { props: { sections: mockSections } })
    expect(w.findAllComponents(Section)).toHaveLength(2)
  })

  it('預設全部收合，不渲染任何 Item', () => {
    const w = mount(SectionList, { props: { sections: mockSections } })
    expect(w.findAllComponents(Item)).toHaveLength(0)
  })

  it('點「全部展開」展開所有 Section（4 個 Item 渲染）', async () => {
    const w = mount(SectionList, { props: { sections: mockSections } })
    await w.get('[data-testid="expand-all"]').trigger('click')
    expect(w.findAllComponents(Item)).toHaveLength(4)
  })

  it('全展開後按鈕文字切為「全部收合」', async () => {
    const w = mount(SectionList, { props: { sections: mockSections } })
    await w.get('[data-testid="expand-all"]').trigger('click')
    expect(w.get('[data-testid="expand-all"]').text()).toContain('收合')
  })

  it('再點按鈕收合所有 Section', async () => {
    const w = mount(SectionList, { props: { sections: mockSections } })
    await w.get('[data-testid="expand-all"]').trigger('click')
    await w.get('[data-testid="expand-all"]').trigger('click')
    expect(w.findAllComponents(Item)).toHaveLength(0)
  })

  it('個別 Section emit update:expanded 不影響其他 Section', async () => {
    const w = mount(SectionList, { props: { sections: mockSections } })
    const sections = w.findAllComponents(Section)
    sections[0].vm.$emit('update:expanded', true)
    await flushPromises()
    expect(w.findAllComponents(Item)).toHaveLength(3)
  })

  it('部分展開時按鈕仍顯示「全部展開」', async () => {
    const w = mount(SectionList, { props: { sections: mockSections } })
    const sections = w.findAllComponents(Section)
    sections[0].vm.$emit('update:expanded', true)
    await flushPromises()
    expect(w.get('[data-testid="expand-all"]').text()).toContain('展開')
  })
})
