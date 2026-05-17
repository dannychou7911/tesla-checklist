<script setup lang="ts">
import { computed, ref } from 'vue'

import type { ChecklistSection } from '../../utils/checklist-types'

import Section from './Section.vue'

interface Props {
  sections: ChecklistSection[]
}

const props = defineProps<Props>()

const expandedMap = ref<Record<string, boolean>>({})

const allExpanded = computed<boolean>(
  () =>
    props.sections.length > 0
    && props.sections.every((s) => expandedMap.value[s.id]),
)

function setExpanded(id: string, value: boolean): void {
  expandedMap.value = { ...expandedMap.value, [id]: value }
}

function onToggleAll(): void {
  const next = !allExpanded.value
  expandedMap.value = Object.fromEntries(
    props.sections.map((s) => [s.id, next]),
  )
}
</script>

<template>
  <div class="flex flex-col">
    <div class="flex justify-end px-2 py-2">
      <button
        type="button"
        data-testid="expand-all"
        class="px-3 py-1.5 text-sm rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
        @click="onToggleAll"
      >
        {{ allExpanded ? '全部收合' : '全部展開' }}
      </button>
    </div>
    <Section
      v-for="section in sections"
      :key="section.id"
      :section="section"
      :expanded="expandedMap[section.id] ?? false"
      @update:expanded="(v: boolean) => setExpanded(section.id, v)"
    />
  </div>
</template>
