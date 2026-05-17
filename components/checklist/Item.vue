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

onBeforeUnmount(() => {
  for (const url of photoUrls.values()) {
    URL.revokeObjectURL(url)
  }
  photoUrls.clear()
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
  <div class="border-b border-slate-200 dark:border-slate-700">
    <div
      data-testid="item-row"
      role="button"
      :aria-pressed="checked"
      :aria-label="item.label"
      :tabindex="0"
      class="flex items-center gap-3 px-3 py-3 min-h-[60px] cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800"
      @click="onRowToggle"
      @keydown.enter.prevent="onRowToggle"
      @keydown.space.prevent="onRowToggle"
    >
      <input
        type="checkbox"
        data-testid="item-checkbox"
        :checked="checked"
        tabindex="-1"
        aria-hidden="true"
        class="w-5 h-5 pointer-events-none accent-slate-900 dark:accent-slate-100"
      >
      <div class="flex-1 min-w-0">
        <div
          class="font-medium text-slate-900 dark:text-slate-100 break-words"
          :class="{ 'line-through text-slate-500 dark:text-slate-500': checked }"
        >
          {{ item.label }}
        </div>
        <div class="text-sm text-slate-500 dark:text-slate-400 break-words">
          {{ item.description }}
        </div>
      </div>
      <button
        type="button"
        data-testid="item-chevron"
        :aria-expanded="expanded"
        :aria-controls="drawerId"
        aria-label="展開或收合"
        class="w-11 h-11 flex items-center justify-center rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
        @click.stop="onToggleExpand"
        @keydown.enter.stop
        @keydown.space.stop
      >
        <span
          aria-hidden="true"
          class="inline-block transition-transform duration-200"
          :class="{ 'rotate-180': expanded }"
        >▾</span>
      </button>
    </div>

    <div
      v-if="expanded"
      :id="drawerId"
      data-testid="item-drawer"
      class="px-3 py-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-4"
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
