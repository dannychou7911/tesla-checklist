import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ConfirmClearDialog from '../../components/ui/ConfirmClearDialog.vue'

describe('ConfirmClearDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    const start = Date.now()
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now() - start)
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('open=false 不渲染 dialog', () => {
    const w = mount(ConfirmClearDialog, { props: { open: false } })
    expect(w.find('[data-testid="confirm-clear"]').exists()).toBe(false)
  })

  it('open=true 渲染 dialog 且帶 role=dialog + aria-modal', () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    const dialog = w.get('[data-testid="confirm-clear"]')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
  })

  it('預設按鈕顯示「長按以清除」', () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    expect(w.get('[data-testid="confirm-clear-submit"]').text()).toContain('長按以清除')
  })

  it('短時間放開不 emit confirm', async () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    const btn = w.get('[data-testid="confirm-clear-submit"]')
    await btn.trigger('pointerdown')
    await vi.advanceTimersByTimeAsync(200)
    await btn.trigger('pointerup')
    await vi.advanceTimersByTimeAsync(1700)
    expect(w.emitted('confirm')).toBeFalsy()
  })

  it('按住 1.5 秒以上 emit confirm', async () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    const btn = w.get('[data-testid="confirm-clear-submit"]')
    await btn.trigger('pointerdown')
    await vi.advanceTimersByTimeAsync(1700)
    expect(w.emitted('confirm')).toBeTruthy()
  })

  it('點「取消」emit update:open=false', async () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    await w.get('[data-testid="confirm-clear-cancel"]').trigger('click')
    expect(w.emitted('update:open')).toEqual([[false]])
  })

  it('點 backdrop emit update:open=false', async () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    await w.get('[data-testid="confirm-clear-backdrop"]').trigger('click')
    expect(w.emitted('update:open')).toEqual([[false]])
  })

  it('close 後重新打開進度重置', async () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    const btn = w.get('[data-testid="confirm-clear-submit"]')
    await btn.trigger('pointerdown')
    await vi.advanceTimersByTimeAsync(500)
    await w.setProps({ open: false })
    await w.setProps({ open: true })
    expect(w.get('[data-testid="confirm-clear-submit"]').text()).toContain('長按以清除')
  })
})
