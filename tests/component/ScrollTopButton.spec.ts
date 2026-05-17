import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ScrollTopButton from '../../components/layout/ScrollTopButton.vue'

function setScrollY(y: number): void {
  Object.defineProperty(window, 'scrollY', {
    value: y,
    writable: true,
    configurable: true,
  })
}

let scrollToSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  setScrollY(0)
  scrollToSpy = vi.fn()
  window.scrollTo = scrollToSpy as unknown as typeof window.scrollTo
})

afterEach(() => {
  setScrollY(0)
})

describe('ScrollTopButton', () => {
  it('scrollY=0 預設不顯示', () => {
    const w = mount(ScrollTopButton)
    expect(w.find('[data-testid="scroll-top"]').exists()).toBe(false)
  })

  it('scrollY > 300 顯示按鈕', async () => {
    const w = mount(ScrollTopButton)
    setScrollY(400)
    window.dispatchEvent(new Event('scroll'))
    await w.vm.$nextTick()
    expect(w.find('[data-testid="scroll-top"]').exists()).toBe(true)
  })

  it('scrollY 從 > 300 回到 ≤ 300 隱藏按鈕', async () => {
    const w = mount(ScrollTopButton)
    setScrollY(400)
    window.dispatchEvent(new Event('scroll'))
    await w.vm.$nextTick()
    expect(w.find('[data-testid="scroll-top"]').exists()).toBe(true)
    setScrollY(100)
    window.dispatchEvent(new Event('scroll'))
    await w.vm.$nextTick()
    expect(w.find('[data-testid="scroll-top"]').exists()).toBe(false)
  })

  it('點擊呼叫 window.scrollTo({ top: 0, behavior: smooth })', async () => {
    const w = mount(ScrollTopButton)
    setScrollY(400)
    window.dispatchEvent(new Event('scroll'))
    await w.vm.$nextTick()
    await w.get('[data-testid="scroll-top"]').trigger('click')
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('unmount 後 scroll 事件不再更新狀態', async () => {
    const w = mount(ScrollTopButton)
    w.unmount()
    setScrollY(400)
    window.dispatchEvent(new Event('scroll'))
    // 不應 throw、不應有殘留 listener 觸發狀態（這項主要是煙霧測試）
  })
})
