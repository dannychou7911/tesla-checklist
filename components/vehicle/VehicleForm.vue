<script setup lang="ts">
import { computed } from 'vue'

import type { VehicleInfo, VehicleModel } from '../../stores/checklist'

interface Props {
  modelValue: VehicleInfo
  showErrors?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showErrors: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: VehicleInfo]
}>()

const VEHICLE_MODEL_OPTIONS: readonly VehicleModel[] = [
  'Model 3',
  'Model Y',
  'Model S',
  'Model X',
  'Cybertruck',
  'Other',
] as const

const modelError = computed<boolean>(
  () => props.showErrors && !props.modelValue.model,
)
const deliveryDateError = computed<boolean>(
  () => props.showErrors && !props.modelValue.deliveryDate,
)

function update<K extends keyof VehicleInfo>(key: K, value: VehicleInfo[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function onModelChange(e: Event): void {
  const value = (e.target as HTMLSelectElement).value
  update('model', value === '' ? null : (value as VehicleModel))
}

function onDeliveryDateChange(e: Event): void {
  const value = (e.target as HTMLInputElement).value
  update('deliveryDate', value === '' ? null : value)
}

function onVinChange(e: Event): void {
  const value = (e.target as HTMLInputElement).value
  update('vin', value === '' ? undefined : value)
}

function onPlateChange(e: Event): void {
  const value = (e.target as HTMLInputElement).value
  update('plate', value === '' ? undefined : value)
}

function onMileageChange(e: Event): void {
  const value = (e.target as HTMLInputElement).value
  if (value === '') {
    update('mileage', undefined)
    return
  }
  const num = Number(value)
  update('mileage', Number.isFinite(num) ? num : undefined)
}

const inputBaseClass
  = 'w-full min-h-[44px] px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 dark:focus:border-teal-400'
</script>

<template>
  <form class="flex flex-col gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
    <div class="flex flex-col gap-1">
      <label for="vehicle-model" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        車型 <span class="text-rose-600" aria-hidden="true">*</span>
      </label>
      <select
        id="vehicle-model"
        data-testid="vehicle-model"
        :value="modelValue.model ?? ''"
        :aria-invalid="modelError"
        :aria-describedby="modelError ? 'error-model' : undefined"
        :class="[inputBaseClass, modelError ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600']"
        @change="onModelChange"
      >
        <option value="" disabled>請選擇</option>
        <option v-for="opt in VEHICLE_MODEL_OPTIONS" :key="opt" :value="opt">
          {{ opt }}
        </option>
      </select>
      <p
        v-if="modelError"
        id="error-model"
        data-testid="error-model"
        class="text-sm text-rose-600"
      >
        請選擇車型
      </p>
    </div>

    <div class="flex flex-col gap-1">
      <label for="vehicle-delivery-date" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        交車日 <span class="text-rose-600" aria-hidden="true">*</span>
      </label>
      <input
        id="vehicle-delivery-date"
        data-testid="vehicle-delivery-date"
        type="date"
        :value="modelValue.deliveryDate ?? ''"
        :aria-invalid="deliveryDateError"
        :aria-describedby="deliveryDateError ? 'error-delivery-date' : undefined"
        :class="[inputBaseClass, deliveryDateError ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600']"
        @input="onDeliveryDateChange"
      >
      <p
        v-if="deliveryDateError"
        id="error-delivery-date"
        data-testid="error-delivery-date"
        class="text-sm text-rose-600"
      >
        請選擇交車日
      </p>
    </div>

    <div class="flex flex-col gap-1">
      <label for="vehicle-vin" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        VIN
      </label>
      <input
        id="vehicle-vin"
        data-testid="vehicle-vin"
        type="text"
        maxlength="17"
        :value="modelValue.vin ?? ''"
        :class="[inputBaseClass, 'border-slate-300 dark:border-slate-600']"
        @input="onVinChange"
      >
    </div>

    <div class="flex flex-col gap-1">
      <label for="vehicle-plate" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        車牌
      </label>
      <input
        id="vehicle-plate"
        data-testid="vehicle-plate"
        type="text"
        :value="modelValue.plate ?? ''"
        :class="[inputBaseClass, 'border-slate-300 dark:border-slate-600']"
        @input="onPlateChange"
      >
    </div>

    <div class="flex flex-col gap-1">
      <label for="vehicle-mileage" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        里程數（公里）
      </label>
      <input
        id="vehicle-mileage"
        data-testid="vehicle-mileage"
        type="number"
        min="0"
        :value="modelValue.mileage ?? ''"
        :class="[inputBaseClass, 'border-slate-300 dark:border-slate-600']"
        @input="onMileageChange"
      >
    </div>
  </form>
</template>
