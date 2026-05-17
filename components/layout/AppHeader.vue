<script setup lang="ts">
import ProgressBar from './ProgressBar.vue'

interface Props {
  checked: number
  total: number
}

defineProps<Props>()

const emit = defineEmits<{
  'export-pdf': []
  clear: []
}>()
</script>

<template>
  <header
    data-testid="app-header"
    class="sticky top-0 z-10 bg-linear-to-r from-white/95 to-teal-50/60 dark:from-slate-950/95 dark:to-teal-950/40 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80 shadow-soft"
  >
    <div class="px-4 py-3 flex flex-col gap-3 max-w-3xl mx-auto">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight-display">
          交車檢查清單
        </h1>
        <div class="flex items-center gap-2">
          <button
            type="button"
            data-testid="header-export"
            class="min-h-[44px] px-4 py-1.5 text-sm font-medium rounded-xl bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 cursor-pointer transition-colors shadow-soft active:scale-[0.98]"
            @click="emit('export-pdf')"
          >
            匯出 PDF
          </button>
          <button
            type="button"
            data-testid="header-clear"
            class="min-h-[44px] px-4 py-1.5 text-sm font-medium rounded-xl border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors active:scale-[0.98]"
            @click="emit('clear')"
          >
            清除
          </button>
        </div>
      </div>
      <ProgressBar :checked="checked" :total="total" />
    </div>
  </header>
</template>
