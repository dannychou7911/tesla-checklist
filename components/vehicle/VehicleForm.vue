<script setup lang="ts">
import { ChevronDownIcon, ExclamationCircleIcon, IdentificationIcon } from '@heroicons/vue/24/outline'
import { computed, ref, watch } from 'vue'

import type { VehicleInfo, VehicleModel } from '../../stores/checklist'

interface Props {
  modelValue: VehicleInfo
  showErrors?: boolean
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showErrors: false,
  defaultOpen: false,
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

const expanded = ref<boolean>(props.defaultOpen || props.showErrors)

watch(
  () => props.showErrors,
  (next) => {
    if (next) expanded.value = true
  },
)

const modelError = computed<boolean>(
  () => props.showErrors && !props.modelValue.model,
)
const deliveryDateError = computed<boolean>(
  () => props.showErrors && !props.modelValue.deliveryDate,
)

const summary = computed<string>(() => {
  const parts: string[] = []
  if (props.modelValue.model) parts.push(props.modelValue.model)
  if (props.modelValue.plate) parts.push(props.modelValue.plate)
  if (props.modelValue.deliveryDate) parts.push(props.modelValue.deliveryDate)
  return parts.length > 0 ? parts.join('・') : '尚未填寫'
})

const hasError = computed<boolean>(() => modelError.value || deliveryDateError.value)

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

function toggle(): void {
  expanded.value = !expanded.value
}

const inputBaseClass
  = 'w-full min-h-[44px] px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 dark:focus:border-teal-400'
</script>

<template>
  <section
    data-testid="vehicle-form"
    :class="[
      'rounded-2xl bg-white dark:bg-slate-900 border shadow-soft overflow-hidden transition-colors',
      hasError ? 'border-rose-300 dark:border-rose-700' : 'border-slate-200/80 dark:border-slate-800',
    ]"
  >
    <button
      type="button"
      data-testid="vehicle-form-toggle"
      :aria-expanded="expanded"
      aria-controls="vehicle-form-body"
      class="w-full flex items-center gap-3 px-4 py-3 min-h-[56px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
      @click="toggle"
    >
      <span
        :class="[
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
          hasError
            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
            : 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300',
        ]"
      >
        <ExclamationCircleIcon v-if="hasError" class="w-5 h-5" aria-hidden="true" />
        <IdentificationIcon v-else class="w-5 h-5" aria-hidden="true" />
      </span>
      <span class="flex-1 min-w-0">
        <span class="block font-semibold text-slate-900 dark:text-slate-100 tracking-tight-display">
          車輛資訊
          <span class="text-xs font-normal text-slate-500 dark:text-slate-400">（匯出 PDF 前必填車型與交車日）</span>
        </span>
        <span
          data-testid="vehicle-form-summary"
          :class="[
            'block text-sm truncate mt-0.5',
            hasError ? 'text-rose-600 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400',
          ]"
        >
          {{ hasError ? '請完成必填欄位' : summary }}
        </span>
      </span>
      <ChevronDownIcon
        :class="['w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0', expanded ? 'rotate-180' : '']"
        aria-hidden="true"
      />
    </button>

    <form
      v-if="expanded"
      id="vehicle-form-body"
      class="flex flex-col gap-4 px-4 pb-5 pt-2 motion-safe:animate-slide-down"
    >
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
  </section>
</template>
