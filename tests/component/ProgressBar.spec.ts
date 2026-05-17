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

describe('ProgressBar — v2 tier', () => {
  it('percent=0 → tier=1，無 hint 文字', () => {
    const w = mount(ProgressBar, { props: { checked: 0, total: 10 } })
    const bar = w.get('[data-testid="progressbar"]')
    expect(bar.attributes('data-tier')).toBe('1')
    expect(w.text()).not.toContain('快過半')
    expect(w.text()).not.toContain('快完成')
    expect(w.text()).not.toContain('全部完成')
  })

  it('percent=33 邊界 → tier=1', () => {
    const w = mount(ProgressBar, { props: { checked: 1, total: 3 } })
    expect(w.get('[data-testid="progressbar"]').attributes('data-tier')).toBe('1')
  })

  it('percent=34~66 → tier=2，hint「快過半」', () => {
    const w = mount(ProgressBar, { props: { checked: 5, total: 10 } })
    expect(w.get('[data-testid="progressbar"]').attributes('data-tier')).toBe('2')
    expect(w.text()).toContain('快過半')
  })

  it('percent=67~99 → tier=3，hint「就快完成」', () => {
    const w = mount(ProgressBar, { props: { checked: 8, total: 10 } })
    expect(w.get('[data-testid="progressbar"]').attributes('data-tier')).toBe('3')
    expect(w.text()).toContain('就快完成')
  })

  it('percent=100 → tier=4，hint「全部完成」', () => {
    const w = mount(ProgressBar, { props: { checked: 10, total: 10 } })
    expect(w.get('[data-testid="progressbar"]').attributes('data-tier')).toBe('4')
    expect(w.text()).toContain('全部完成')
  })

  it('tier=4 fill 帶 amber glow class', () => {
    const w = mount(ProgressBar, { props: { checked: 10, total: 10 } })
    const fill = w.get('[data-testid="progressbar-fill"]')
    expect(fill.classes().some((c) => c.includes('shadow-amber-glow'))).toBe(true)
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
