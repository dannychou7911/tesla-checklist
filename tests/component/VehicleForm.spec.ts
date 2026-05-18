import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import VehicleForm from '../../components/vehicle/VehicleForm.vue'
import type { VehicleInfo } from '../../stores/checklist'

const emptyVehicle: VehicleInfo = {
  model: null,
  deliveryDate: null,
}

function mountForm(props: Partial<{
  modelValue: VehicleInfo
  showErrors: boolean
  defaultOpen: boolean
}> = {}): ReturnType<typeof mount> {
  return mount(VehicleForm, {
    props: {
      modelValue: emptyVehicle,
      defaultOpen: true,
      ...props,
    },
  })
}

describe('VehicleForm — 渲染', () => {
  it('渲染 5 個欄位', () => {
    const w = mountForm()
    expect(w.find('[data-testid="vehicle-model"]').exists()).toBe(true)
    expect(w.find('[data-testid="vehicle-delivery-date"]').exists()).toBe(true)
    expect(w.find('[data-testid="vehicle-vin"]').exists()).toBe(true)
    expect(w.find('[data-testid="vehicle-plate"]').exists()).toBe(true)
    expect(w.find('[data-testid="vehicle-mileage"]').exists()).toBe(true)
  })

  it('車型下拉 6 個選項', () => {
    const w = mountForm()
    const select = w.get('[data-testid="vehicle-model"]')
    const values = select
      .findAll('option')
      .map((o) => o.attributes('value'))
      .filter((v): v is string => Boolean(v))
    expect(values).toEqual(['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Other'])
  })

  it('車型從 modelValue 反映', () => {
    const w = mountForm({ modelValue: { ...emptyVehicle, model: 'Model Y' } })
    const select = w.get('[data-testid="vehicle-model"]').element as HTMLSelectElement
    expect(select.value).toBe('Model Y')
  })

  it('VIN maxlength=17', () => {
    const w = mountForm()
    expect(w.get('[data-testid="vehicle-vin"]').attributes('maxlength')).toBe('17')
  })

  it('交車日是 date input', () => {
    const w = mountForm()
    expect(w.get('[data-testid="vehicle-delivery-date"]').attributes('type')).toBe('date')
  })

  it('mileage 是 number input', () => {
    const w = mountForm()
    expect(w.get('[data-testid="vehicle-mileage"]').attributes('type')).toBe('number')
  })
})

describe('VehicleForm — 更新事件', () => {
  it('改變車型 emit update:modelValue 帶 model', async () => {
    const w = mountForm()
    await w.get('[data-testid="vehicle-model"]').setValue('Model Y')
    const emitted = w.emitted('update:modelValue')?.[0]?.[0] as VehicleInfo
    expect(emitted).toMatchObject({ model: 'Model Y' })
  })

  it('改變交車日 emit', async () => {
    const w = mountForm()
    await w.get('[data-testid="vehicle-delivery-date"]').setValue('2026-05-17')
    const emitted = w.emitted('update:modelValue')?.[0]?.[0] as VehicleInfo
    expect(emitted).toMatchObject({ deliveryDate: '2026-05-17' })
  })

  it('改變 VIN emit', async () => {
    const w = mountForm()
    await w.get('[data-testid="vehicle-vin"]').setValue('5YJSA1E26HF000000')
    const emitted = w.emitted('update:modelValue')?.[0]?.[0] as VehicleInfo
    expect(emitted).toMatchObject({ vin: '5YJSA1E26HF000000' })
  })

  it('改變車牌 emit', async () => {
    const w = mountForm()
    await w.get('[data-testid="vehicle-plate"]').setValue('ABC-1234')
    const emitted = w.emitted('update:modelValue')?.[0]?.[0] as VehicleInfo
    expect(emitted).toMatchObject({ plate: 'ABC-1234' })
  })

  it('改變 mileage 為數字', async () => {
    const w = mountForm()
    await w.get('[data-testid="vehicle-mileage"]').setValue('12')
    const emitted = w.emitted('update:modelValue')?.[0]?.[0] as VehicleInfo
    expect(emitted.mileage).toBe(12)
  })

  it('清空 mileage emit undefined', async () => {
    const w = mountForm({ modelValue: { ...emptyVehicle, mileage: 100 } })
    await w.get('[data-testid="vehicle-mileage"]').setValue('')
    const emitted = w.emitted('update:modelValue')?.[0]?.[0] as VehicleInfo
    expect(emitted.mileage).toBeUndefined()
  })
})

describe('VehicleForm — 必填驗證', () => {
  it('showErrors=false 不顯示錯誤', () => {
    const w = mountForm()
    expect(w.find('[data-testid="error-model"]').exists()).toBe(false)
    expect(w.find('[data-testid="error-delivery-date"]').exists()).toBe(false)
  })

  it('showErrors=true 自動展開並顯示車型錯誤', async () => {
    const w = mount(VehicleForm, {
      props: { modelValue: emptyVehicle, showErrors: true },
    })
    await w.vm.$nextTick()
    expect(w.find('[data-testid="error-model"]').exists()).toBe(true)
  })

  it('showErrors=true 自動展開並顯示交車日錯誤', async () => {
    const w = mount(VehicleForm, {
      props: { modelValue: emptyVehicle, showErrors: true },
    })
    await w.vm.$nextTick()
    expect(w.find('[data-testid="error-delivery-date"]').exists()).toBe(true)
  })

  it('必填都填了即使 showErrors=true 也不顯示錯誤', () => {
    const w = mountForm({
      modelValue: { model: 'Model Y', deliveryDate: '2026-05-17' },
      showErrors: true,
    })
    expect(w.find('[data-testid="error-model"]').exists()).toBe(false)
    expect(w.find('[data-testid="error-delivery-date"]').exists()).toBe(false)
  })

  it('model select aria-invalid 隨錯誤變動', async () => {
    const w = mountForm({ modelValue: emptyVehicle, showErrors: true })
    expect(w.get('[data-testid="vehicle-model"]').attributes('aria-invalid')).toBe('true')
    await w.setProps({
      modelValue: { ...emptyVehicle, model: 'Model Y' },
      showErrors: true,
    })
    expect(w.get('[data-testid="vehicle-model"]').attributes('aria-invalid')).toBe('false')
  })

  it('VIN / 車牌 / mileage 非必填，showErrors=true 不顯示錯誤', () => {
    const w = mountForm({
      modelValue: { model: 'Model Y', deliveryDate: '2026-05-17' },
      showErrors: true,
    })
    expect(w.find('[data-testid="error-vin"]').exists()).toBe(false)
    expect(w.find('[data-testid="error-plate"]').exists()).toBe(false)
    expect(w.find('[data-testid="error-mileage"]').exists()).toBe(false)
  })
})

describe('VehicleForm — 收合', () => {
  it('預設收合，不顯示欄位', () => {
    const w = mount(VehicleForm, { props: { modelValue: emptyVehicle } })
    expect(w.find('[data-testid="vehicle-model"]').exists()).toBe(false)
  })

  it('點 toggle 後展開', async () => {
    const w = mount(VehicleForm, { props: { modelValue: emptyVehicle } })
    await w.get('[data-testid="vehicle-form-toggle"]').trigger('click')
    expect(w.find('[data-testid="vehicle-model"]').exists()).toBe(true)
  })

  it('已填欄位時 summary 顯示車型 + 車牌', () => {
    const w = mount(VehicleForm, {
      props: {
        modelValue: { model: 'Model Y', deliveryDate: '2026-05-17', plate: 'ABC-1234' },
      },
    })
    expect(w.get('[data-testid="vehicle-form-summary"]').text()).toContain('Model Y')
    expect(w.get('[data-testid="vehicle-form-summary"]').text()).toContain('ABC-1234')
  })
})
