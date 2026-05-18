<script setup lang="ts">
import {
  ArrowDownTrayIcon,
  CheckBadgeIcon,
} from '@heroicons/vue/24/solid'
import { computed } from 'vue'

interface Props {
  checked: number
  total: number
  exporting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  exporting: false,
})

const emit = defineEmits<{
  'export-pdf': []
}>()

const isComplete = computed<boolean>(
  () => props.total > 0 && props.checked === props.total,
)

const remaining = computed<number>(() => Math.max(0, props.total - props.checked))
</script>

<template>
  <div
    data-testid="bottom-action-bar"
    class="fixed bottom-0 inset-x-0 z-30 pb-[env(safe-area-inset-bottom)] pointer-events-none"
  >
    <div class="mx-auto max-w-3xl px-4 pb-3 pt-3 pointer-events-auto">
      <div
        class="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-soft-lg ring-1 ring-slate-200/80 dark:ring-slate-700/80 px-4 py-3 flex items-center gap-3"
      >
        <div class="flex-1 min-w-0 flex items-center gap-2">
          <CheckBadgeIcon
            v-if="isComplete"
            class="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <p
            v-if="isComplete"
            data-testid="bottom-status-complete"
            class="text-sm font-medium text-emerald-700 dark:text-emerald-300 truncate"
          >
            全部檢查完成，立即留底
          </p>
          <p
            v-else
            data-testid="bottom-status-remaining"
            class="text-sm text-slate-600 dark:text-slate-300 truncate"
          >
            還有 <span class="font-semibold text-slate-900 dark:text-slate-100 tabular">{{ remaining }}</span> 項未檢查
          </p>
        </div>
        <button
          type="button"
          data-testid="bottom-export-pdf"
          :disabled="exporting"
          :aria-label="exporting ? '匯出中' : '匯出 PDF'"
          :class="[
            'min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-xl text-white cursor-pointer transition-all active:scale-[0.98] shadow-soft flex items-center gap-2 shrink-0',
            'bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-400',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100',
            isComplete && !exporting ? 'motion-safe:animate-pulse-cta' : '',
          ]"
          @click="emit('export-pdf')"
        >
          <svg
            v-if="exporting"
            class="w-4 h-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="4" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
          </svg>
          <ArrowDownTrayIcon v-else class="w-4 h-4" aria-hidden="true" />
          <span>{{ exporting ? '匯出中' : '匯出 PDF' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
