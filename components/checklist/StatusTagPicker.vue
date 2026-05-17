<script setup lang="ts">
import type { StatusTag } from '../../composables/useChecklistStorage'

interface Props {
  modelValue: StatusTag
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: StatusTag]
}>()

interface Option {
  value: NonNullable<StatusTag>
  label: string
  icon: string
  activeClass: string
}

const STATUS_OPTIONS: readonly Option[] = [
  {
    value: 'pass',
    label: '通過',
    icon: '✓',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-soft ring-2 ring-emerald-300 dark:ring-emerald-700',
  },
  {
    value: 'minor',
    label: '小瑕疵',
    icon: '△',
    activeClass: 'bg-amber-600 text-white border-amber-600 shadow-soft ring-2 ring-amber-300 dark:ring-amber-700',
  },
  {
    value: 'major',
    label: '嚴重瑕疵',
    icon: '✕',
    activeClass: 'bg-rose-600 text-white border-rose-600 shadow-soft ring-2 ring-rose-300 dark:ring-rose-700',
  },
] as const

function onPick(value: NonNullable<StatusTag>): void {
  emit('update:modelValue', props.modelValue === value ? null : value)
}
</script>

<template>
  <div
    role="group"
    aria-label="狀態標籤"
    class="flex gap-2"
  >
    <button
      v-for="opt in STATUS_OPTIONS"
      :key="opt.value"
      type="button"
      :aria-pressed="modelValue === opt.value"
      :aria-label="opt.label"
      :data-testid="`status-${opt.value}`"
      class="flex-1 min-h-[44px] px-3 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer active:scale-[0.98]"
      :class="modelValue === opt.value
        ? opt.activeClass
        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:border-slate-500'"
      @click="onPick(opt.value)"
    >
      <span aria-hidden="true" class="text-base">{{ opt.icon }}</span>
      <span class="ml-1.5">{{ opt.label }}</span>
    </button>
  </div>
</template>
