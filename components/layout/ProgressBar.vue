<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  checked: number
  total: number
}

const props = defineProps<Props>()

const percent = computed<number>(() =>
  props.total === 0 ? 0 : Math.round((props.checked / props.total) * 100),
)

const tier = computed<1 | 2 | 3 | 4>(() => {
  if (percent.value === 100) return 4
  if (percent.value >= 67) return 3
  if (percent.value >= 34) return 2
  return 1
})

const fillClass = computed(() => {
  switch (tier.value) {
    case 1: return 'bg-teal-600'
    case 2: return 'bg-linear-to-r from-teal-500 to-emerald-500'
    case 3: return 'bg-linear-to-r from-emerald-500 via-amber-400 to-amber-500'
    case 4: return 'bg-linear-to-r from-amber-500 via-orange-500 to-red-500 shadow-amber-glow'
  }
})

const heightClass = computed(() => (tier.value === 1 ? 'h-2' : 'h-3'))

const hintText = computed(() => {
  switch (tier.value) {
    case 1: return ''
    case 2: return '快過半 🎯'
    case 3: return '就快完成 ✦'
    case 4: return '全部完成 🎉'
  }
})

const hintColorClass = computed(() => {
  switch (tier.value) {
    case 1: return ''
    case 2: return 'text-teal-700 dark:text-teal-300'
    case 3: return 'text-amber-700 dark:text-amber-300'
    case 4: return 'text-red-700 dark:text-red-300 font-semibold'
  }
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex justify-between items-baseline text-sm">
      <span class="text-slate-700 dark:text-slate-300 tabular">
        {{ checked }} / {{ total }}
      </span>
      <span class="text-slate-900 dark:text-slate-100 font-semibold tabular tracking-tight-display">
        {{ percent }}%
      </span>
    </div>
    <div
      data-testid="progressbar"
      role="progressbar"
      :data-tier="tier"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`已完成 ${percent}%`"
      :class="[heightClass, 'w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden']"
    >
      <div
        data-testid="progressbar-fill"
        :class="[fillClass, 'h-full rounded-full transition-[width] duration-500 ease-out']"
        :style="{ width: `${percent}%` }"
      />
    </div>
    <p
      v-if="hintText"
      :class="['text-xs', hintColorClass]"
      data-testid="progressbar-hint"
    >
      {{ hintText }}
    </p>
  </div>
</template>
