<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { type StatusTag, useChecklistStorage } from '../../composables/useChecklistStorage'
import { usePhotoCompression } from '../../composables/usePhotoCompression'
import { useChecklistStore } from '../../stores/checklist'
import type { ChecklistItem } from '../../utils/checklist-types'

import NoteEditor from './NoteEditor.vue'
import PhotoLightbox from './PhotoLightbox.vue'
import PhotoUploader, { type PhotoItem } from './PhotoUploader.vue'
import StatusTagPicker from './StatusTagPicker.vue'

interface Props {
  item: ChecklistItem
  sectionId: string
}

const props = defineProps<Props>()

const store = useChecklistStore()
const storage = useChecklistStorage()
const compression = usePhotoCompression()

const expanded = ref(false)
const lightboxOpen = ref(false)
const lightboxPhotoId = ref<string | null>(null)
const flashing = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | null = null

const photoUrls = new Map<string, string>()
const photos = ref<PhotoItem[]>([])

const itemState = computed(() => store.items[props.item.id])
const checked = computed<boolean>(() => itemState.value?.checked ?? false)
const statusTag = computed<StatusTag>(() => itemState.value?.statusTag ?? null)
const note = computed<string>(() => itemState.value?.note ?? '')
const photoIds = computed<readonly string[]>(() => itemState.value?.photoIds ?? [])

const drawerId = computed<string>(() => `drawer-${props.item.id}`)

const lightboxPhoto = computed<PhotoItem | null>(() => {
  if (!lightboxPhotoId.value) return null
  return photos.value.find((p) => p.id === lightboxPhotoId.value) ?? null
})

async function syncPhotos(ids: readonly string[]): Promise<void> {
  for (const [id, url] of photoUrls) {
    if (!ids.includes(id)) {
      URL.revokeObjectURL(url)
      photoUrls.delete(id)
    }
  }
  for (const id of ids) {
    if (!photoUrls.has(id)) {
      const record = await storage.getPhoto(id)
      if (record) {
        photoUrls.set(id, URL.createObjectURL(record.blob))
      }
    }
  }
  photos.value = ids
    .map((id) => {
      const url = photoUrls.get(id)
      return url ? { id, url } : null
    })
    .filter((p): p is PhotoItem => p !== null)
}

watch(
  photoIds,
  (ids) => {
    void syncPhotos(ids)
  },
  { immediate: true },
)

watch(checked, (next, prev) => {
  if (next && !prev) {
    flashing.value = true
    if (flashTimer) clearTimeout(flashTimer)
    flashTimer = setTimeout(() => {
      flashing.value = false
      flashTimer = null
    }, 600)
  }
})

onBeforeUnmount(() => {
  for (const url of photoUrls.values()) {
    URL.revokeObjectURL(url)
  }
  photoUrls.clear()
  if (flashTimer) clearTimeout(flashTimer)
})

async function onRowToggle(): Promise<void> {
  navigator.vibrate?.(20)
  await store.toggleChecked(props.item.id)
}

function onToggleExpand(): void {
  expanded.value = !expanded.value
}

async function onStatus(tag: StatusTag): Promise<void> {
  await store.setStatusTag(props.item.id, tag)
}

async function onNote(value: string): Promise<void> {
  await store.setNote(props.item.id, value)
}

async function onAdd(files: File[]): Promise<void> {
  for (const file of files) {
    const compressed = await compression.compress(file)
    await store.addPhoto(props.item.id, compressed)
  }
}

async function onRemove(id: string): Promise<void> {
  await store.removePhoto(props.item.id, id)
}

function onView(id: string): void {
  lightboxPhotoId.value = id
  lightboxOpen.value = true
}

async function onLightboxDelete(id: string): Promise<void> {
  lightboxOpen.value = false
  lightboxPhotoId.value = null
  await store.removePhoto(props.item.id, id)
}
</script>

<template>
  <div class="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
    <div
      data-testid="item-row"
      role="button"
      :aria-pressed="checked"
      :aria-label="item.label"
      :tabindex="0"
      :class="[
        'flex items-center gap-3 px-3 py-3 min-h-[60px] cursor-pointer select-none transition-colors duration-200',
        checked
          ? 'bg-teal-50/40 dark:bg-teal-950/30 hover:bg-teal-50/60 dark:hover:bg-teal-950/40'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800',
        flashing && 'motion-safe:animate-flash',
      ]"
      @click="onRowToggle"
      @keydown.enter.prevent="onRowToggle"
      @keydown.space.prevent="onRowToggle"
    >
      <span class="relative inline-flex w-6 h-6 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          data-testid="item-checkbox"
          :checked="checked"
          tabindex="-1"
          aria-hidden="true"
          class="sr-only"
        >
        <span
          data-testid="item-checkbox-visual"
          aria-hidden="true"
          :class="[
            'absolute inset-0 rounded-md border-2 transition-colors duration-200 flex items-center justify-center',
            checked
              ? 'bg-teal-600 border-teal-600 dark:bg-teal-500 dark:border-teal-500'
              : 'bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-500',
          ]"
        >
          <svg
            v-if="checked"
            data-testid="item-checkbox-check"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="white"
            class="w-4 h-4 motion-safe:animate-check-pop"
          >
            <path
              fill-rule="evenodd"
              d="M16.704 5.29a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.97 2.97 6.97-6.97a.75.75 0 011.06 0z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </span>
      <div class="flex-1 min-w-0">
        <div
          class="font-medium text-slate-900 dark:text-slate-100 break-words transition-colors duration-200"
          :class="{ 'line-through text-slate-500 dark:text-slate-500': checked }"
        >
          {{ item.label }}
        </div>
        <div class="text-sm text-slate-500 dark:text-slate-400 break-words">
          {{ item.description }}
        </div>
      </div>
      <span aria-hidden="true" class="h-8 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
      <button
        type="button"
        data-testid="item-chevron"
        :aria-expanded="expanded"
        :aria-controls="drawerId"
        aria-label="展開或收合"
        class="w-11 h-11 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
        @click.stop="onToggleExpand"
        @keydown.enter.stop
        @keydown.space.stop
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-180': expanded }"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <div
      v-if="expanded"
      :id="drawerId"
      data-testid="item-drawer"
      class="px-3 py-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-4 motion-safe:animate-slide-down"
    >
      <StatusTagPicker
        :model-value="statusTag"
        @update:model-value="onStatus"
      />
      <NoteEditor
        :model-value="note"
        @update:model-value="onNote"
      />
      <PhotoUploader
        :photos="photos"
        @add="onAdd"
        @remove="onRemove"
        @view="onView"
      />
    </div>

    <PhotoLightbox
      v-model:open="lightboxOpen"
      :photo="lightboxPhoto"
      @delete="onLightboxDelete"
    />
  </div>
</template>
