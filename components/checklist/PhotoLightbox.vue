<script setup lang="ts">
import { TrashIcon, XMarkIcon } from '@heroicons/vue/24/solid'

import type { PhotoItem } from './PhotoUploader.vue'

interface Props {
  open: boolean
  photo: PhotoItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  delete: [id: string]
}>()

function close(): void {
  emit('update:open', false)
}

function onDelete(): void {
  if (props.photo) {
    emit('delete', props.photo.id)
  }
}
</script>

<template>
  <div
    v-if="open"
    data-testid="lightbox"
    role="dialog"
    aria-modal="true"
    aria-label="照片預覽"
    class="fixed inset-0 z-50 flex items-center justify-center"
  >
    <div
      data-testid="lightbox-backdrop"
      class="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
      @click="close"
    />
    <div class="relative max-w-[95vw] max-h-[90vh]">
      <img
        v-if="photo"
        :src="photo.url"
        :alt="`照片 ${photo.id}`"
        data-testid="lightbox-img"
        class="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-soft-lg"
        @click.stop
      >
      <button
        type="button"
        data-testid="lightbox-close"
        aria-label="關閉"
        class="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/15 text-white cursor-pointer hover:bg-white/25 backdrop-blur transition-colors active:scale-95 flex items-center justify-center"
        @click="close"
      >
        <XMarkIcon class="w-5 h-5" aria-hidden="true" />
      </button>
      <button
        v-if="photo"
        type="button"
        data-testid="lightbox-delete"
        aria-label="刪除照片"
        class="absolute -bottom-14 right-0 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium cursor-pointer hover:bg-rose-700 shadow-soft transition-all active:scale-[0.98] flex items-center gap-1.5"
        @click="onDelete"
      >
        <TrashIcon class="w-4 h-4" aria-hidden="true" />
        <span>刪除照片</span>
      </button>
    </div>
  </div>
</template>
