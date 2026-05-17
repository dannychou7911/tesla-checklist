import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StatusTagPicker from '../../components/checklist/StatusTagPicker.vue'

describe('StatusTagPicker', () => {
  it('渲染 pass / minor / major 三個按鈕', () => {
    const w = mount(StatusTagPicker, { props: { modelValue: null } })
    expect(w.find('[data-testid="status-pass"]').exists()).toBe(true)
    expect(w.find('[data-testid="status-minor"]').exists()).toBe(true)
    expect(w.find('[data-testid="status-major"]').exists()).toBe(true)
  })

  it('點 pass 按鈕 emit update:modelValue 為 "pass"', async () => {
    const w = mount(StatusTagPicker, { props: { modelValue: null } })
    await w.get('[data-testid="status-pass"]').trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([['pass']])
  })

  it('點不同按鈕觸發互斥切換（單選）', async () => {
    const w = mount(StatusTagPicker, { props: { modelValue: 'pass' } })
    await w.get('[data-testid="status-minor"]').trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([['minor']])
  })

  it('再次點擊已選的按鈕 emit null（取消）', async () => {
    const w = mount(StatusTagPicker, { props: { modelValue: 'pass' } })
    await w.get('[data-testid="status-pass"]').trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([[null]])
  })

  it('aria-pressed 反映 modelValue', () => {
    const w = mount(StatusTagPicker, { props: { modelValue: 'minor' } })
    expect(w.get('[data-testid="status-pass"]').attributes('aria-pressed')).toBe('false')
    expect(w.get('[data-testid="status-minor"]').attributes('aria-pressed')).toBe('true')
    expect(w.get('[data-testid="status-major"]').attributes('aria-pressed')).toBe('false')
  })

  it('每個按鈕都有 aria-label', () => {
    const w = mount(StatusTagPicker, { props: { modelValue: null } })
    expect(w.get('[data-testid="status-pass"]').attributes('aria-label')).toBeTruthy()
    expect(w.get('[data-testid="status-minor"]').attributes('aria-label')).toBeTruthy()
    expect(w.get('[data-testid="status-major"]').attributes('aria-label')).toBeTruthy()
  })

  it('container 有 role="group" + aria-label', () => {
    const w = mount(StatusTagPicker, { props: { modelValue: null } })
    const group = w.get('[role="group"]')
    expect(group.attributes('aria-label')).toBeTruthy()
  })

  it('按鈕為 type="button"（避免 form submit 副作用）', () => {
    const w = mount(StatusTagPicker, { props: { modelValue: null } })
    expect(w.get('[data-testid="status-pass"]').attributes('type')).toBe('button')
    expect(w.get('[data-testid="status-minor"]').attributes('type')).toBe('button')
    expect(w.get('[data-testid="status-major"]').attributes('type')).toBe('button')
  })
})
