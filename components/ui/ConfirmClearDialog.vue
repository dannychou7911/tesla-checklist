<script setup lang="ts">
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/vue/24/solid'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const HOLD_DURATION_MS = 1500

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()

const progress = ref<number>(0)
const holding = ref<boolean>(false)
let rafId: number | null = null
let startedAt: number | null = null
let fired = false

function reset(): void {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
  startedAt = null
  progress.value = 0
  holding.value = false
  fired = false
}

watch(
  () => props.open,
  (next) => {
    if (!next) reset()
  },
)

onBeforeUnmount(() => reset())

function step(): void {
  if (startedAt === null) return
  const elapsed = performance.now() - startedAt
  progress.value = Math.min(1, elapsed / HOLD_DURATION_MS)
  if (progress.value >= 1) {
    if (!fired) {
      fired = true
      emit('confirm')
    }
    return
  }
  rafId = requestAnimationFrame(step)
}

function onHoldStart(e: Event): void {
  e.preventDefault()
  if (fired) return
  holding.value = true
  startedAt = performance.now()
  rafId = requestAnimationFrame(step)
}

function onHoldEnd(): void {
  if (fired) return
  holding.value = false
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
  startedAt = null
  progress.value = 0
}

function close(): void {
  emit('update:open', false)
}

const progressPercent = computed<number>(() => Math.round(progress.value * 100))
</script>

<template>
  <div
    v-if="open"
    data-testid="confirm-clear"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-clear-title"
    class="fixed inset-0 z-50 flex items-center justify-center px-4"
  >
    <div
      data-testid="confirm-clear-backdrop"
      class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      @click="close"
    />
    <div class="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-soft-lg p-6 flex flex-col gap-4 motion-safe:animate-slide-up">
      <div class="flex items-center gap-3">
        <span class="w-10 h-10 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 flex items-center justify-center shrink-0">
          <ExclamationTriangleIcon class="w-5 h-5" aria-hidden="true" />
        </span>
        <h2
          id="confirm-clear-title"
          class="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight-display"
        >
          清除所有資料？
        </h2>
      </div>
      <p class="text-sm text-slate-600 dark:text-slate-300 leading-6">
        此操作會永久刪除所有勾選狀態、備註與照片，且無法復原。<br>
        如果你確定要繼續，請<span class="font-semibold text-rose-600 dark:text-rose-400">長按下方按鈕</span>不放 1.5 秒。
      </p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          data-testid="confirm-clear-cancel"
          class="min-h-[44px] px-4 py-1.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors active:scale-[0.98]"
          @click="close"
        >
          取消
        </button>
        <button
          type="button"
          data-testid="confirm-clear-submit"
          :aria-label="`長按 1.5 秒確認清除（進度 ${progressPercent}%）`"
          class="relative min-h-[44px] px-5 py-1.5 text-sm font-semibold rounded-xl text-white shadow-soft cursor-pointer transition-colors overflow-hidden bg-rose-600 hover:bg-rose-700 select-none touch-none"
          @pointerdown="onHoldStart"
          @pointerup="onHoldEnd"
          @pointercancel="onHoldEnd"
          @pointerleave="onHoldEnd"
        >
          <span
            aria-hidden="true"
            class="absolute inset-y-0 left-0 bg-rose-800/80 transition-[width] ease-linear"
            :style="{ width: `${progressPercent}%`, transitionDuration: holding ? '0ms' : '180ms' }"
          />
          <span class="relative flex items-center gap-1.5">
            <TrashIcon class="w-4 h-4" aria-hidden="true" />
            {{ holding ? `按住中… ${progressPercent}%` : '長按以清除' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
