import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  type StatusTag,
  type StoredItemState,
  useChecklistStorage,
} from '../composables/useChecklistStorage'
import type { Checklist } from '../utils/checklist-types'

export const CURRENT_STATE_VERSION = 1
export const NOTE_MAX_LENGTH = 500
export const MAX_PHOTOS_PER_ITEM = 5

export type VehicleModel =
  | 'Model 3'
  | 'Model Y'
  | 'Model S'
  | 'Model X'
  | 'Cybertruck'
  | 'Other'

export interface ItemState {
  checked: boolean
  statusTag: StatusTag
  note: string
  photoIds: string[]
  updatedAt: number
}

export interface VehicleInfo {
  model: VehicleModel | null
  vin?: string
  plate?: string
  deliveryDate: string | null
  mileage?: number
}

export interface AppSettings {
  showSignature: boolean
  photoTimestamp: boolean
  largeFont: boolean
}

const META_KEY_VERSION = 'stateVersion'
const META_KEY_VEHICLE = 'vehicle'
const META_KEY_SETTINGS = 'settings'

function defaultVehicle(): VehicleInfo {
  return { model: null, deliveryDate: null }
}

function defaultSettings(): AppSettings {
  return { showSignature: false, photoTimestamp: false, largeFont: false }
}

function defaultItemState(): ItemState {
  return {
    checked: false,
    statusTag: null,
    note: '',
    photoIds: [],
    updatedAt: 0,
  }
}

function generatePhotoId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `ph-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const useChecklistStore = defineStore('checklist', () => {
  const storage = useChecklistStorage()

  const stateVersion = ref<number>(CURRENT_STATE_VERSION)
  const schema = ref<Checklist | null>(null)
  const items = ref<Record<string, ItemState>>({})
  const vehicle = ref<VehicleInfo>(defaultVehicle())
  const settings = ref<AppSettings>(defaultSettings())
  const hydrated = ref(false)

  const totalCount = computed<number>(() =>
    schema.value?.sections.reduce((sum, sec) => sum + sec.items.length, 0) ?? 0,
  )

  const checkedCount = computed<number>(
    () => Object.values(items.value).filter((i) => i.checked).length,
  )

  const progressPercent = computed<number>(() =>
    totalCount.value === 0
      ? 0
      : Math.round((checkedCount.value / totalCount.value) * 100),
  )

  function sectionProgress(sectionId: string): { checked: number, total: number } {
    const sec = schema.value?.sections.find((s) => s.id === sectionId)
    if (!sec) return { checked: 0, total: 0 }
    const checked = sec.items.filter((it) => items.value[it.id]?.checked).length
    return { checked, total: sec.items.length }
  }

  function ensureItem(itemId: string): ItemState {
    if (!items.value[itemId]) {
      items.value[itemId] = defaultItemState()
    }
    return items.value[itemId]
  }

  async function persistItem(itemId: string): Promise<void> {
    const state = items.value[itemId]
    const stored: StoredItemState = {
      id: itemId,
      checked: state.checked,
      statusTag: state.statusTag,
      note: state.note,
      photoIds: [...state.photoIds],
      updatedAt: state.updatedAt,
    }
    await storage.putItem(stored)
  }

  async function hydrate(initialSchema: Checklist): Promise<void> {
    schema.value = initialSchema

    const persistedVersion = await storage.getMeta<number>(META_KEY_VERSION)
    if (persistedVersion === undefined) {
      await storage.putMeta(META_KEY_VERSION, CURRENT_STATE_VERSION)
    }
    else if (persistedVersion !== CURRENT_STATE_VERSION) {
      throw new Error(
        `Unsupported stateVersion: ${persistedVersion}. Expected ${CURRENT_STATE_VERSION}.`,
      )
    }

    const allItems = await storage.getAllItems()
    const restored: Record<string, ItemState> = {}
    for (const [id, stored] of Object.entries(allItems)) {
      restored[id] = {
        checked: stored.checked,
        statusTag: stored.statusTag,
        note: stored.note,
        photoIds: [...stored.photoIds],
        updatedAt: stored.updatedAt,
      }
    }
    items.value = restored

    const persistedVehicle = await storage.getMeta<VehicleInfo>(META_KEY_VEHICLE)
    if (persistedVehicle) {
      vehicle.value = { ...defaultVehicle(), ...persistedVehicle }
    }

    const persistedSettings = await storage.getMeta<AppSettings>(META_KEY_SETTINGS)
    if (persistedSettings) {
      settings.value = { ...defaultSettings(), ...persistedSettings }
    }

    hydrated.value = true
  }

  async function toggleChecked(itemId: string): Promise<void> {
    const item = ensureItem(itemId)
    item.checked = !item.checked
    item.updatedAt = Date.now()
    await persistItem(itemId)
  }

  async function setStatusTag(itemId: string, tag: StatusTag): Promise<void> {
    const item = ensureItem(itemId)
    item.statusTag = tag
    item.updatedAt = Date.now()
    await persistItem(itemId)
  }

  async function setNote(itemId: string, note: string): Promise<void> {
    const item = ensureItem(itemId)
    item.note = note.slice(0, NOTE_MAX_LENGTH)
    item.updatedAt = Date.now()
    await persistItem(itemId)
  }

  async function addPhoto(itemId: string, blob: Blob): Promise<string> {
    const item = ensureItem(itemId)
    if (item.photoIds.length >= MAX_PHOTOS_PER_ITEM) {
      throw new Error(`已達單一項目最多 ${MAX_PHOTOS_PER_ITEM} 張照片上限`)
    }
    const photoId = generatePhotoId()
    await storage.putPhoto({
      id: photoId,
      itemId,
      blob,
      createdAt: Date.now(),
    })
    item.photoIds = [...item.photoIds, photoId]
    item.updatedAt = Date.now()
    await persistItem(itemId)
    return photoId
  }

  async function removePhoto(itemId: string, photoId: string): Promise<void> {
    const item = ensureItem(itemId)
    item.photoIds = item.photoIds.filter((id) => id !== photoId)
    item.updatedAt = Date.now()
    await storage.deletePhoto(photoId)
    await persistItem(itemId)
  }

  async function setVehicle(info: Partial<VehicleInfo>): Promise<void> {
    vehicle.value = { ...vehicle.value, ...info }
    await storage.putMeta(META_KEY_VEHICLE, { ...vehicle.value })
  }

  async function setSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<void> {
    settings.value = { ...settings.value, [key]: value }
    await storage.putMeta(META_KEY_SETTINGS, { ...settings.value })
  }

  async function clearAll(): Promise<void> {
    await storage.clearAll()
    items.value = {}
    vehicle.value = defaultVehicle()
    settings.value = defaultSettings()
    await storage.putMeta(META_KEY_VERSION, CURRENT_STATE_VERSION)
  }

  return {
    stateVersion,
    schema,
    items,
    vehicle,
    settings,
    hydrated,
    totalCount,
    checkedCount,
    progressPercent,
    sectionProgress,
    hydrate,
    toggleChecked,
    setStatusTag,
    setNote,
    addPhoto,
    removePhoto,
    setVehicle,
    setSetting,
    clearAll,
  }
})
