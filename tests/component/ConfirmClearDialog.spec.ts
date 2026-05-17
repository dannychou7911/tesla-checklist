import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ConfirmClearDialog from '../../components/ui/ConfirmClearDialog.vue'

describe('ConfirmClearDialog', () => {
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

  it('預設「清除」按鈕禁用', () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    const btn = w.get('[data-testid="confirm-clear-submit"]').element as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('輸入「清除」二字後按鈕啟用', async () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    await w.get('[data-testid="confirm-clear-input"]').setValue('清除')
    const btn = w.get('[data-testid="confirm-clear-submit"]').element as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('輸入其他字按鈕保持禁用', async () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    await w.get('[data-testid="confirm-clear-input"]').setValue('刪除')
    const btn = w.get('[data-testid="confirm-clear-submit"]').element as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('點啟用後的「清除」按鈕 emit confirm', async () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    await w.get('[data-testid="confirm-clear-input"]').setValue('清除')
    await w.get('[data-testid="confirm-clear-submit"]').trigger('click')
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

  it('close 後重新打開 input 已清空', async () => {
    const w = mount(ConfirmClearDialog, { props: { open: true } })
    await w.get('[data-testid="confirm-clear-input"]').setValue('清除')
    await w.setProps({ open: false })
    await w.setProps({ open: true })
    const input = w.get('[data-testid="confirm-clear-input"]').element as HTMLInputElement
    expect(input.value).toBe('')
  })
})
