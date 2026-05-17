<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const CONFIRM_PHRASE = '清除'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()

const input = ref<string>('')

const canSubmit = computed<boolean>(() => input.value === CONFIRM_PHRASE)

watch(
  () => props.open,
  (next) => {
    if (!next) {
      input.value = ''
    }
  },
)

function close(): void {
  emit('update:open', false)
}

function onSubmit(): void {
  if (canSubmit.value) {
    emit('confirm')
  }
}
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
      class="absolute inset-0 bg-black/60"
      @click="close"
    />
    <div class="relative w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 shadow-xl p-5 flex flex-col gap-4">
      <h2
        id="confirm-clear-title"
        class="text-lg font-semibold text-slate-900 dark:text-slate-100"
      >
        清除所有資料？
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-300 leading-6">
        此操作會永久刪除所有勾選狀態、備註與照片，且無法復原。<br>
        如果你確定要繼續，請在下方輸入「<span class="font-semibold">{{ CONFIRM_PHRASE }}</span>」二字。
      </p>
      <input
        v-model="input"
        type="text"
        data-testid="confirm-clear-input"
        :placeholder="`請輸入「${CONFIRM_PHRASE}」`"
        class="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
      >
      <div class="flex justify-end gap-2">
        <button
          type="button"
          data-testid="confirm-clear-cancel"
          class="min-h-[40px] px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          @click="close"
        >
          取消
        </button>
        <button
          type="button"
          data-testid="confirm-clear-submit"
          :disabled="!canSubmit"
          class="min-h-[40px] px-3 py-1.5 text-sm rounded-md bg-rose-600 text-white hover:bg-rose-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          @click="onSubmit"
        >
          清除
        </button>
      </div>
    </div>
  </div>
</template>
