<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/solid'

import type { AppSettings } from '../../stores/checklist'

interface Props {
  open: boolean
  settings: AppSettings
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:settings': [value: AppSettings]
}>()

interface SettingItem {
  key: keyof AppSettings
  label: string
  description: string
}

const SETTING_ITEMS: readonly SettingItem[] = [
  {
    key: 'showSignature',
    label: 'PDF 顯示簽名欄',
    description: '在匯出 PDF 時加入交車人 / 驗收人簽名欄位',
  },
  {
    key: 'photoTimestamp',
    label: '照片浮水印時戳',
    description: '為新上傳的照片印上拍攝時間',
  },
  {
    key: 'largeFont',
    label: '大字體模式',
    description: '提升畫面字級，方便長者或視力較弱者使用',
  },
] as const

function close(): void {
  emit('update:open', false)
}

function onChange<K extends keyof AppSettings>(key: K, e: Event): void {
  const value = (e.target as HTMLInputElement).checked as AppSettings[K]
  emit('update:settings', { ...props.settings, [key]: value })
}
</script>

<template>
  <div
    v-if="open"
    data-testid="settings-slideover"
    role="dialog"
    aria-modal="true"
    aria-label="設定"
    class="fixed inset-0 z-40 flex justify-end"
  >
    <div
      data-testid="settings-backdrop"
      class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      @click="close"
    />
    <aside class="relative w-full max-w-sm h-full bg-white dark:bg-slate-900 shadow-soft-lg flex flex-col motion-safe:animate-slide-from-right">
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight-display">
          設定
        </h2>
        <button
          type="button"
          data-testid="settings-close"
          aria-label="關閉設定"
          class="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer transition-colors active:scale-95"
          @click="close"
        >
          <XMarkIcon class="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
      <div class="flex flex-col gap-4 px-4 py-4 overflow-y-auto">
        <label
          v-for="item in SETTING_ITEMS"
          :key="item.key"
          class="flex items-start gap-3 cursor-pointer p-2 -m-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
        >
          <input
            type="checkbox"
            :data-testid="`setting-${item.key}`"
            :checked="settings[item.key]"
            class="mt-1 w-5 h-5 accent-teal-600 dark:accent-teal-400 cursor-pointer"
            @change="(e) => onChange(item.key, e)"
          >
          <div class="flex flex-col gap-0.5">
            <span class="font-medium text-slate-900 dark:text-slate-100">{{ item.label }}</span>
            <span class="text-sm text-slate-500 dark:text-slate-400 leading-5">{{ item.description }}</span>
          </div>
        </label>
      </div>
    </aside>
  </div>
</template>
