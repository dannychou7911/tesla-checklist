<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const SHOW_THRESHOLD = 300

const visible = ref<boolean>(false)

function onScroll(): void {
  visible.value = window.scrollY > SHOW_THRESHOLD
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <button
    v-if="visible"
    type="button"
    data-testid="scroll-top"
    aria-label="回到頂部"
    class="fixed bottom-6 right-6 z-20 w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white cursor-pointer flex items-center justify-center"
    @click="scrollToTop"
  >
    <span aria-hidden="true" class="text-lg">↑</span>
  </button>
</template>
