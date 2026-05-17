<script setup lang="ts">
import { computed } from 'vue'

import { useChecklistStore } from '../../stores/checklist'
import type { ChecklistSection } from '../../utils/checklist-types'

import Item from './Item.vue'

interface Props {
  section: ChecklistSection
  expanded: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:expanded': [value: boolean]
}>()

const store = useChecklistStore()

const progress = computed(() => {
  const total = props.section.items.length
  const checked = props.section.items.filter(
    (it) => store.items[it.id]?.checked,
  ).length
  return { checked, total }
})

const bodyId = computed<string>(() => `section-body-${props.section.id}`)

function onToggle(): void {
  emit('update:expanded', !props.expanded)
}
</script>

<template>
  <section class="border-b border-slate-200 dark:border-slate-700">
    <button
      type="button"
      data-testid="section-header"
      :aria-expanded="expanded"
      :aria-controls="bodyId"
      class="w-full flex items-center justify-between px-4 py-3 min-h-[56px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
      @click="onToggle"
    >
      <span class="font-semibold text-slate-900 dark:text-slate-100 text-left">
        {{ section.title }}
      </span>
      <span class="flex items-center gap-3">
        <span
          class="text-sm text-slate-500 dark:text-slate-400 tabular-nums"
          :aria-label="`已勾選 ${progress.checked} 項，共 ${progress.total} 項`"
        >
          {{ progress.checked }} / {{ progress.total }}
        </span>
        <span
          aria-hidden="true"
          class="inline-block transition-transform duration-200 text-slate-400"
          :class="{ 'rotate-180': expanded }"
        >▾</span>
      </span>
    </button>
    <div
      v-if="expanded"
      :id="bodyId"
      data-testid="section-body"
    >
      <Item
        v-for="item in section.items"
        :key="item.id"
        :item="item"
        :section-id="section.id"
      />
    </div>
  </section>
</template>
