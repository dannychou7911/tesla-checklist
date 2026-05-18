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
    class="fixed bottom-24 right-6 z-20 w-12 h-12 rounded-full bg-teal-600 text-white shadow-soft-lg ring-1 ring-teal-700/20 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 cursor-pointer flex items-center justify-center transition-all duration-200 active:scale-95 motion-safe:animate-slide-up pb-[env(safe-area-inset-bottom)]"
    @click="scrollToTop"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      class="w-5 h-5"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M10 17a.75.75 0 01-.75-.75V5.56L4.78 10.03a.75.75 0 01-1.06-1.06l5.75-5.75a.75.75 0 011.06 0l5.75 5.75a.75.75 0 11-1.06 1.06l-4.47-4.47v10.69A.75.75 0 0110 17z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</template>
