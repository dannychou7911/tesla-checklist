import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SettingsSlideover from '../../components/ui/SettingsSlideover.vue'
import type { AppSettings } from '../../stores/checklist'

const defaultSettings: AppSettings = {
  showSignature: false,
  photoTimestamp: false,
  largeFont: false,
}

describe('SettingsSlideover', () => {
  it('open=false 不渲染', () => {
    const w = mount(SettingsSlideover, {
      props: { open: false, settings: defaultSettings },
    })
    expect(w.find('[data-testid="settings-slideover"]').exists()).toBe(false)
  })

  it('open=true 渲染並帶 role=dialog', () => {
    const w = mount(SettingsSlideover, {
      props: { open: true, settings: defaultSettings },
    })
    const panel = w.get('[data-testid="settings-slideover"]')
    expect(panel.attributes('role')).toBe('dialog')
  })

  it('渲染三個開關 showSignature / photoTimestamp / largeFont', () => {
    const w = mount(SettingsSlideover, {
      props: { open: true, settings: defaultSettings },
    })
    expect(w.find('[data-testid="setting-showSignature"]').exists()).toBe(true)
    expect(w.find('[data-testid="setting-photoTimestamp"]').exists()).toBe(true)
    expect(w.find('[data-testid="setting-largeFont"]').exists()).toBe(true)
  })

  it('checkbox 反映 settings 值', () => {
    const w = mount(SettingsSlideover, {
      props: {
        open: true,
        settings: { ...defaultSettings, showSignature: true, largeFont: true },
      },
    })
    const sig = w.get('[data-testid="setting-showSignature"]').element as HTMLInputElement
    const ts = w.get('[data-testid="setting-photoTimestamp"]').element as HTMLInputElement
    const lf = w.get('[data-testid="setting-largeFont"]').element as HTMLInputElement
    expect(sig.checked).toBe(true)
    expect(ts.checked).toBe(false)
    expect(lf.checked).toBe(true)
  })

  it('切換 showSignature emit update:settings 新狀態', async () => {
    const w = mount(SettingsSlideover, {
      props: { open: true, settings: defaultSettings },
    })
    await w.get('[data-testid="setting-showSignature"]').setValue(true)
    const emitted = w.emitted('update:settings')?.[0]?.[0] as AppSettings
    expect(emitted).toEqual({
      showSignature: true,
      photoTimestamp: false,
      largeFont: false,
    })
  })

  it('點關閉鈕 emit update:open=false', async () => {
    const w = mount(SettingsSlideover, {
      props: { open: true, settings: defaultSettings },
    })
    await w.get('[data-testid="settings-close"]').trigger('click')
    expect(w.emitted('update:open')).toEqual([[false]])
  })

  it('點 backdrop emit update:open=false', async () => {
    const w = mount(SettingsSlideover, {
      props: { open: true, settings: defaultSettings },
    })
    await w.get('[data-testid="settings-backdrop"]').trigger('click')
    expect(w.emitted('update:open')).toEqual([[false]])
  })
})
