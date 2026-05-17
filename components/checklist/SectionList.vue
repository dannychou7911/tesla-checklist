<script setup lang="ts">
import {
  ArchiveBoxIcon,
  BoltIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  HomeModernIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'
import { computed, type Component, ref } from 'vue'

import type { ChecklistSection } from '../../utils/checklist-types'

import Section from './Section.vue'

type Accent = 'teal' | 'cyan' | 'sky' | 'indigo' | 'violet' | 'rose' | 'slate'

interface Props {
  sections: ChecklistSection[]
}

const props = defineProps<Props>()

const ACCENT_CYCLE: readonly Accent[] = ['teal', 'cyan', 'sky', 'indigo', 'violet', 'rose'] as const

const SECTION_ICON_MAP: Record<string, Component> = {
  'sec-1': ClipboardDocumentCheckIcon,
  'sec-2': ArchiveBoxIcon,
  'sec-3': SparklesIcon,
  'sec-4': HomeModernIcon,
  'sec-5': Cog6ToothIcon,
  'sec-6': BoltIcon,
}

function accentFor(index: number): Accent {
  return ACCENT_CYCLE[index % ACCENT_CYCLE.length]
}

function iconFor(sectionId: string): Component | null {
  return SECTION_ICON_MAP[sectionId] ?? null
}

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
        class="px-3 py-1.5 text-sm rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer transition-colors"
        @click="onToggleAll"
      >
        {{ allExpanded ? '全部收合' : '全部展開' }}
      </button>
    </div>
    <Section
      v-for="(section, index) in sections"
      :key="section.id"
      :section="section"
      :accent="accentFor(index)"
      :icon="iconFor(section.id)"
      :expanded="expandedMap[section.id] ?? false"
      @update:expanded="(v: boolean) => setExpanded(section.id, v)"
    />
  </div>
</template>
