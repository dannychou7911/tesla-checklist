<script setup lang="ts">
import { Cog6ToothIcon, TrashIcon } from '@heroicons/vue/24/outline'

import ProgressBar from './ProgressBar.vue'

interface Props {
  checked: number
  total: number
}

defineProps<Props>()

const emit = defineEmits<{
  'open-settings': []
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
        <div class="flex items-center gap-1">
          <button
            type="button"
            data-testid="header-settings"
            aria-label="設定"
            class="w-11 h-11 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition-colors active:scale-95"
            @click="emit('open-settings')"
          >
            <Cog6ToothIcon class="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-testid="header-clear"
            aria-label="清除所有資料"
            class="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer transition-colors active:scale-95"
            @click="emit('clear')"
          >
            <TrashIcon class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <ProgressBar :checked="checked" :total="total" />
    </div>
  </header>
</template>
