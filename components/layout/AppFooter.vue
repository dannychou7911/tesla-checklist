<script setup lang="ts">
import { ArrowTopRightOnSquareIcon, InformationCircleIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <footer class="mt-8 px-4 py-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60">
    <div class="flex flex-col gap-3 max-w-3xl mx-auto text-sm leading-6 text-slate-600 dark:text-slate-400">
      <p class="flex items-start gap-2">
        <InformationCircleIcon class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
        <span>
          清單內容彙整自
          <a
            href="https://meng-tesla.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-0.5 font-medium text-teal-700 dark:text-teal-300 underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-200 transition-colors"
          >
            MENG TESLA
            <ArrowTopRightOnSquareIcon class="w-3 h-3" aria-hidden="true" />
          </a>
          及社群整理，依個人經驗整理重組。
        </span>
      </p>
      <p class="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-500">
        <ShieldCheckIcon class="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
        <span>本工具僅供參考。實際交車驗收請以 Tesla 原廠規範為準。免責聲明：作者不對本清單造成的任何爭議或損失負責。</span>
      </p>
      <p>
        <a
          href="/privacy"
          class="text-xs text-slate-500 dark:text-slate-500 underline underline-offset-2 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
        >
          隱私權聲明
        </a>
      </p>
    </div>
  </footer>
</template>
