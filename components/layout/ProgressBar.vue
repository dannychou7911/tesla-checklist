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
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex justify-between items-baseline text-sm">
      <span class="text-slate-700 dark:text-slate-300 tabular-nums">
        {{ checked }} / {{ total }}
      </span>
      <span class="text-slate-900 dark:text-slate-100 font-semibold tabular-nums">
        {{ percent }}%
      </span>
    </div>
    <div
      data-testid="progressbar"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`已完成 ${percent}%`"
      class="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
    >
      <div
        data-testid="progressbar-fill"
        class="h-full rounded-full bg-emerald-500 transition-[width] duration-300 ease-out"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
