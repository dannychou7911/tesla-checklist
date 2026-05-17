import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppHeader from '../../components/layout/AppHeader.vue'
import ProgressBar from '../../components/layout/ProgressBar.vue'

describe('ProgressBar — 內容', () => {
  it('顯示 X / Y 計數', () => {
    const w = mount(ProgressBar, { props: { checked: 3, total: 10 } })
    expect(w.text()).toContain('3 / 10')
  })

  it('顯示百分比（四捨五入）', () => {
    const w = mount(ProgressBar, { props: { checked: 3, total: 10 } })
    expect(w.text()).toContain('30%')
  })

  it('total=0 顯示 0%', () => {
    const w = mount(ProgressBar, { props: { checked: 0, total: 0 } })
    expect(w.text()).toContain('0%')
  })

  it('100% 完成', () => {
    const w = mount(ProgressBar, { props: { checked: 10, total: 10 } })
    expect(w.text()).toContain('100%')
  })

  it('百分比四捨五入（1/3=33%）', () => {
    const w = mount(ProgressBar, { props: { checked: 1, total: 3 } })
    expect(w.text()).toContain('33%')
  })
})

describe('ProgressBar — a11y / 視覺', () => {
  it('container 有 role=progressbar', () => {
    const w = mount(ProgressBar, { props: { checked: 3, total: 10 } })
    expect(w.get('[data-testid="progressbar"]').attributes('role')).toBe('progressbar')
  })

  it('aria-valuenow / valuemin / valuemax 正確', () => {
    const w = mount(ProgressBar, { props: { checked: 3, total: 10 } })
    const bar = w.get('[data-testid="progressbar"]')
    expect(bar.attributes('aria-valuenow')).toBe('30')
    expect(bar.attributes('aria-valuemin')).toBe('0')
    expect(bar.attributes('aria-valuemax')).toBe('100')
  })

  it('fill bar width 反映百分比', () => {
    const w = mount(ProgressBar, { props: { checked: 3, total: 10 } })
    const fill = w.get('[data-testid="progressbar-fill"]')
    expect(fill.attributes('style')).toContain('width: 30%')
  })

  it('total=0 時 fill width 為 0%', () => {
    const w = mount(ProgressBar, { props: { checked: 0, total: 0 } })
    const fill = w.get('[data-testid="progressbar-fill"]')
    expect(fill.attributes('style')).toContain('width: 0%')
  })
})

describe('AppHeader', () => {
  it('渲染標題「交車檢查清單」', () => {
    const w = mount(AppHeader, { props: { checked: 0, total: 10 } })
    expect(w.text()).toContain('交車檢查清單')
  })

  it('渲染 ProgressBar 並傳入 checked / total', () => {
    const w = mount(AppHeader, { props: { checked: 3, total: 10 } })
    const bar = w.findComponent(ProgressBar)
    expect(bar.exists()).toBe(true)
    expect(bar.props('checked')).toBe(3)
    expect(bar.props('total')).toBe(10)
  })

  it('點「匯出 PDF」按鈕 emit export-pdf', async () => {
    const w = mount(AppHeader, { props: { checked: 0, total: 10 } })
    await w.get('[data-testid="header-export"]').trigger('click')
    expect(w.emitted('export-pdf')).toBeTruthy()
  })

  it('點「清除」按鈕 emit clear', async () => {
    const w = mount(AppHeader, { props: { checked: 0, total: 10 } })
    await w.get('[data-testid="header-clear"]').trigger('click')
    expect(w.emitted('clear')).toBeTruthy()
  })

  it('container 有 sticky 與 top-0 class', () => {
    const w = mount(AppHeader, { props: { checked: 0, total: 10 } })
    const header = w.get('[data-testid="app-header"]')
    expect(header.classes()).toContain('sticky')
    expect(header.classes()).toContain('top-0')
  })
})
