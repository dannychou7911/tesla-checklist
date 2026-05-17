<script setup lang="ts">
useSeoMeta({
  title: '隱私權聲明 — Tesla 交車檢查清單',
  description: '本工具的隱私權聲明。所有資料只儲存在你的瀏覽器內，不會上傳到任何伺服器。',
})
</script>

<template>
  <main class="min-h-dvh px-4 py-8 max-w-2xl mx-auto text-slate-900 dark:text-slate-100">
    <h1 class="text-2xl font-semibold mb-6">隱私權聲明</h1>
    <div class="flex flex-col gap-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
      <p>
        本工具是純前端應用，所有資料（勾選狀態、備註、照片、車輛資訊）只儲存在你的瀏覽器本機（IndexedDB），不會上傳到任何伺服器，亦不會與作者或任何第三方共享。
      </p>
      <p>
        本工具不使用任何第三方追蹤、分析或廣告服務。
      </p>
      <p>
        清除：你可以隨時透過頁面右上的「清除」按鈕一鍵刪除所有本機資料；或從瀏覽器設定刪除網站資料。
      </p>
      <p>
        不跨裝置同步：因為資料只存在本機，不同瀏覽器、不同裝置或無痕模式不會自動同步。匯出 PDF 是離線本機操作，PDF 檔案也不上傳。
      </p>
      <p>
        本工具開源，原始碼可於 GitHub 檢視。如有疑慮歡迎開 issue。
      </p>
      <p class="mt-4">
        <a
          href="/"
          class="underline hover:text-slate-900 dark:hover:text-slate-100"
        >← 回首頁</a>
      </p>
    </div>
  </main>
</template>
