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
    class="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700"
  >
    <div class="px-4 py-3 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          交車檢查清單
        </h1>
        <div class="flex items-center gap-2">
          <button
            type="button"
            data-testid="header-export"
            class="min-h-[40px] px-3 py-1.5 text-sm rounded-md bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white cursor-pointer"
            @click="emit('export-pdf')"
          >
            匯出 PDF
          </button>
          <button
            type="button"
            data-testid="header-clear"
            class="min-h-[40px] px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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
