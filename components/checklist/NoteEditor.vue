<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 500,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const currentLength = computed<number>(() => props.modelValue.length)

function onInput(e: Event): void {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value.slice(0, props.maxLength))
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <textarea
      :value="modelValue"
      :maxlength="maxLength"
      data-testid="note-textarea"
      rows="3"
      placeholder="可記錄狀況、瑕疵位置、與業務的對話內容…"
      class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:placeholder-slate-500 dark:focus:border-teal-400"
      @input="onInput"
    />
    <div
      data-testid="note-counter"
      class="text-xs text-slate-500 dark:text-slate-400 text-right tabular-nums"
      :aria-label="`已輸入 ${currentLength} 字，上限 ${maxLength} 字`"
    >
      {{ currentLength }} / {{ maxLength }}
    </div>
  </div>
</template>
