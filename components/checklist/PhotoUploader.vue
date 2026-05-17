<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'

export interface PhotoItem {
  id: string
  url: string
}

interface Props {
  photos: PhotoItem[]
  maxCount?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 5,
  disabled: false,
})

const emit = defineEmits<{
  add: [files: File[]]
  remove: [id: string]
  view: [id: string]
}>()

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

const reachedMax = computed<boolean>(() => props.photos.length >= props.maxCount)

function openPicker(): void {
  fileInput.value?.click()
}

function onFileChange(e: Event): void {
  const target = e.target as HTMLInputElement
  const files = target.files ? Array.from(target.files) : []
  if (files.length > 0) {
    emit('add', files)
  }
  target.value = ''
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="photo in photos"
      :key="photo.id"
      type="button"
      :data-testid="`photo-thumb-${photo.id}`"
      class="relative w-20 h-20 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-teal-400 cursor-pointer transition-all shadow-soft"
      :aria-label="`檢視照片 ${photo.id}`"
      @click="emit('view', photo.id)"
    >
      <img
        :src="photo.url"
        :alt="`照片 ${photo.id}`"
        class="w-full h-full object-cover"
      >
      <span
        :data-testid="`photo-remove-${photo.id}`"
        role="button"
        tabindex="0"
        :aria-label="`刪除照片 ${photo.id}`"
        class="absolute top-0.5 right-0.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/70 text-white text-xs cursor-pointer"
        @click.stop="emit('remove', photo.id)"
        @keydown.enter.stop.prevent="emit('remove', photo.id)"
        @keydown.space.stop.prevent="emit('remove', photo.id)"
      >
        ✕
      </span>
    </button>

    <button
      v-if="!reachedMax"
      type="button"
      data-testid="photo-add"
      :disabled="disabled"
      aria-label="新增照片"
      class="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-2xl text-slate-400 hover:border-teal-400 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 dark:hover:border-teal-500 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      @click="openPicker"
    >
      ＋
    </button>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      capture="environment"
      class="hidden"
      @change="onFileChange"
    >
  </div>
</template>
