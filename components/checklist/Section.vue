<script setup lang="ts">
import { computed, type Component } from 'vue'

import { useChecklistStore } from '../../stores/checklist'
import type { ChecklistSection } from '../../utils/checklist-types'

import Item from './Item.vue'

type Accent =
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'indigo'
  | 'violet'
  | 'rose'
  | 'slate'

interface Props {
  section: ChecklistSection
  expanded: boolean
  accent?: Accent
  icon?: Component | null
}

const props = withDefaults(defineProps<Props>(), {
  accent: 'slate',
  icon: null,
})

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

const isComplete = computed<boolean>(
  () => progress.value.total > 0 && progress.value.checked === progress.value.total,
)

const bodyId = computed<string>(() => `section-body-${props.section.id}`)

const ACCENT_BORDER: Record<Accent, string> = {
  teal: 'border-l-teal-500',
  cyan: 'border-l-cyan-500',
  sky: 'border-l-sky-500',
  indigo: 'border-l-indigo-500',
  violet: 'border-l-violet-500',
  rose: 'border-l-rose-500',
  slate: 'border-l-slate-300 dark:border-l-slate-700',
}

const ACCENT_ICON_TEXT: Record<Accent, string> = {
  teal: 'text-teal-600 dark:text-teal-400',
  cyan: 'text-cyan-600 dark:text-cyan-400',
  sky: 'text-sky-600 dark:text-sky-400',
  indigo: 'text-indigo-600 dark:text-indigo-400',
  violet: 'text-violet-600 dark:text-violet-400',
  rose: 'text-rose-600 dark:text-rose-400',
  slate: 'text-slate-500 dark:text-slate-400',
}

const borderClass = computed(() => ACCENT_BORDER[props.accent])
const iconColorClass = computed(() => ACCENT_ICON_TEXT[props.accent])

function onToggle(): void {
  emit('update:expanded', !props.expanded)
}
</script>

<template>
  <section
    data-testid="section-root"
    :data-accent="accent"
    :class="[
      borderClass,
      'border-l-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
    ]"
  >
    <button
      type="button"
      data-testid="section-header"
      :aria-expanded="expanded"
      :aria-controls="bodyId"
      class="w-full flex items-center justify-between px-4 py-3 min-h-[56px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
      @click="onToggle"
    >
      <span class="flex items-center gap-2.5 min-w-0">
        <component
          :is="icon"
          v-if="icon"
          aria-hidden="true"
          :class="['w-5 h-5 shrink-0', iconColorClass]"
        />
        <span class="font-semibold text-slate-900 dark:text-slate-100 text-left tracking-tight-display truncate">
          {{ section.title }}
        </span>
      </span>
      <span class="flex items-center gap-2 shrink-0">
        <span
          v-if="isComplete"
          data-testid="section-complete-badge"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-700 text-xs font-medium tabular motion-safe:animate-wiggle"
          :aria-label="`已完成 ${progress.total} 項，共 ${progress.total} 項`"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M16.704 5.29a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.97 2.97 6.97-6.97a.75.75 0 011.06 0z"
              clip-rule="evenodd"
            />
          </svg>
          {{ progress.total }} / {{ progress.total }}
        </span>
        <span
          v-else
          class="text-sm text-slate-500 dark:text-slate-400 tabular"
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
      class="motion-safe:animate-slide-down"
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
