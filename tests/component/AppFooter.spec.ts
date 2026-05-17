import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppFooter from '../../components/layout/AppFooter.vue'

describe('AppFooter', () => {
  it('渲染資料來源出處', () => {
    const w = mount(AppFooter)
    expect(w.text()).toContain('MENG TESLA')
  })

  it('渲染免責聲明關鍵字', () => {
    const w = mount(AppFooter)
    expect(w.text()).toContain('免責')
  })

  it('渲染隱私頁連結 /privacy', () => {
    const w = mount(AppFooter)
    const link = w.find('a[href="/privacy"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('隱私')
  })
})
