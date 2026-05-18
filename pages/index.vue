<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import checklistData from '~/assets/data/checklist.json'
import SectionList from '~/components/checklist/SectionList.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import BottomActionBar from '~/components/layout/BottomActionBar.vue'
import ScrollTopButton from '~/components/layout/ScrollTopButton.vue'
import ConfirmClearDialog from '~/components/ui/ConfirmClearDialog.vue'
import SettingsSlideover from '~/components/ui/SettingsSlideover.vue'
import VehicleForm from '~/components/vehicle/VehicleForm.vue'
import { useChecklistStorage } from '~/composables/useChecklistStorage'
import { useConfetti } from '~/composables/useConfetti'
import { type PdfItemRow, usePdfExport } from '~/composables/usePdfExport'
import { type AppSettings, useChecklistStore, type VehicleInfo } from '~/stores/checklist'
import type { Checklist } from '~/utils/checklist-types'

import { SITE_DESCRIPTION, SITE_LOCALE, SITE_LOCALE_OG, SITE_NAME } from '~/utils/site-meta'

useSeoMeta({
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  ogTitle: SITE_NAME,
  ogDescription: SITE_DESCRIPTION,
  ogType: 'website',
  ogImage: '/icons/icon-512.png',
  ogLocale: SITE_LOCALE_OG,
  twitterCard: 'summary',
  twitterTitle: SITE_NAME,
  twitterDescription: SITE_DESCRIPTION,
  twitterImage: '/icons/icon-512.png',
})

useSchemaOrg([
  defineSoftwareApp({
    '@type': 'WebApplication',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    inLanguage: SITE_LOCALE,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TWD',
    },
  }),
])

const store = useChecklistStore()
const storage = useChecklistStorage()

const confirmClearOpen = ref(false)
const settingsOpen = ref(false)
const showVehicleErrors = ref(false)
const exporting = ref(false)
const exportError = ref<string | null>(null)
let errorTimer: ReturnType<typeof setTimeout> | null = null

function showError(message: string): void {
  exportError.value = message
  if (errorTimer) clearTimeout(errorTimer)
  errorTimer = setTimeout(() => {
    exportError.value = null
    errorTimer = null
  }, 4000)
}

async function onSettingsChange(next: AppSettings): Promise<void> {
  const current = store.settings
  for (const key of Object.keys(next) as Array<keyof AppSettings>) {
    if (next[key] !== current[key]) {
      await store.setSetting(key, next[key])
    }
  }
}

const sections = computed(() => store.schema?.sections ?? [])

const vehicleModel = computed<VehicleInfo>({
  get: () => store.vehicle,
  set: (v) => {
    void store.setVehicle(v)
  },
})

onMounted(async () => {
  if (!store.hydrated) {
    await store.hydrate(checklistData as unknown as Checklist)
  }
})

watch(
  () => store.progressPercent,
  (next, prev) => {
    if (!store.hydrated) return
    if (next === 100 && (prev ?? 0) < 100) {
      void useConfetti().celebrate()
    }
  },
)

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'))
    reader.readAsDataURL(blob)
  })
}

async function buildPdfItems(): Promise<PdfItemRow[]> {
  const rows: PdfItemRow[] = []
  for (const section of sections.value) {
    for (const item of section.items) {
      const state = store.items[item.id]
      const photoIds = state?.photoIds ?? []
      const photoDataUrls: string[] = []
      for (const pid of photoIds) {
        const rec = await storage.getPhoto(pid)
        if (rec) {
          photoDataUrls.push(await blobToDataUrl(rec.blob))
        }
      }
      rows.push({
        sectionTitle: section.title,
        label: item.label,
        description: item.description,
        checked: state?.checked ?? false,
        statusTag: state?.statusTag ?? null,
        note: state?.note ?? '',
        photoDataUrls,
      })
    }
  }
  return rows
}

async function onExportPdf(): Promise<void> {
  if (!store.vehicle.model || !store.vehicle.deliveryDate) {
    showVehicleErrors.value = true
    showError('請先補上車型與交車日，再匯出 PDF')
    return
  }
  showVehicleErrors.value = false
  exporting.value = true
  try {
    const items = await buildPdfItems()
    const { export: exportPdf } = usePdfExport()
    const { filename, blob } = await exportPdf({
      vehicle: store.vehicle,
      items,
      totalCount: store.totalCount,
      checkedCount: store.checkedCount,
      showSignature: store.settings.showSignature,
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
  catch (err) {
    showError(err instanceof Error ? err.message : '匯出 PDF 失敗，請稍後再試')
  }
  finally {
    exporting.value = false
  }
}

function onRequestClear(): void {
  confirmClearOpen.value = true
}

async function onConfirmClear(): Promise<void> {
  await store.clearAll()
  confirmClearOpen.value = false
}
</script>

<template>
  <div :class="[
    'min-h-dvh flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100',
    store.settings.largeFont ? 'text-base md:text-lg' : '',
  ]">
    <AppHeader
      :checked="store.checkedCount"
      :total="store.totalCount"
      @open-settings="settingsOpen = true"
      @clear="onRequestClear"
    />
    <main class="flex-1 w-full max-w-3xl mx-auto px-4 py-6 pb-32 flex flex-col gap-6">
      <VehicleForm
        v-model="vehicleModel"
        :show-errors="showVehicleErrors"
      />
      <SectionList :sections="sections" />
    </main>
    <AppFooter />
    <ScrollTopButton />
    <BottomActionBar
      :checked="store.checkedCount"
      :total="store.totalCount"
      :exporting="exporting"
      @export-pdf="onExportPdf"
    />
    <SettingsSlideover
      v-model:open="settingsOpen"
      :settings="store.settings"
      @update:settings="onSettingsChange"
    />
    <ConfirmClearDialog
      v-model:open="confirmClearOpen"
      @confirm="onConfirmClear"
    />
    <Transition
      enter-active-class="motion-safe:animate-slide-up"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="exportError"
        data-testid="export-error-toast"
        role="alert"
        aria-live="polite"
        class="fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[calc(100%-2rem)] px-4 py-3 rounded-xl bg-rose-600 text-white shadow-soft-lg text-sm font-medium"
      >
        {{ exportError }}
      </div>
    </Transition>
  </div>
</template>
