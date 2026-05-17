# Tesla 交車檢查清單

特斯拉交車現場用的離線檢查清單 PWA。支援拍照、備註、PDF 匯出。所有資料只儲存在你的瀏覽器（IndexedDB），不上傳到任何伺服器。

> 上線位址：<https://tesla-checklist.dantoolkit.cc>

## 功能

- 6 大分項、40 項檢查清單，依交車現場流程排序
- 每項可勾選、加備註、附拍照（自動壓縮）
- 進度條 4 階段視覺回饋（接近完成有色彩漸層、100% 有 confetti）
- 一鍵匯出 PDF（含照片、簽名欄、車輛資訊、繁中字型內嵌）
- PWA：可加到主畫面、離線使用
- 暗色模式跟隨系統
- 大字體模式（無障礙）
- 所有資料儲存在本機 IndexedDB，**不會上傳到任何伺服器**

## 技術 Stack

- Nuxt 3（SSG，preset: `github_pages`）
- Vue 3 + TypeScript（strict）
- Tailwind CSS v4 + `@nuxt/ui`
- Pinia（state）
- `idb` IndexedDB wrapper
- `pdf-lib` + `fontkit`（PDF 匯出 + 繁中字型 subset）
- `@vite-pwa/nuxt`（Service Worker + manifest）
- `@nuxtjs/sitemap` + `nuxt-schema-org`（SEO）
- Vitest（203 spec 全綠）

## 開發

```bash
npm install
npm run dev          # http://localhost:3000
npm run test         # 跑 203 個 unit + component spec
npm run typecheck    # vue-tsc
npm run generate     # SSG 產出到 .output/public
```

第一次跑前可選：產字型 subset（PDF 用，已內附）

```bash
npm run prepare:fonts
npm run prepare:icons
```

## 部署

`main` push 後 GitHub Actions 自動 `npm ci → nuxt generate → upload-pages-artifact → deploy-pages`。產物部署到 GitHub Pages 並走自訂網域 `tesla-checklist.dantoolkit.cc`（DNS CNAME 指向 `dannychou7911.github.io`，由 GitHub 自動發 HTTPS 憑證）。

## 資料來源

清單內容彙整自 [MENG TESLA](https://meng-tesla.com/) 與社群分享，依個人經驗整理重組。**並非 Tesla 原廠官方清單**。

## 免責聲明

本工具僅供參考，實際交車驗收請以 Tesla 原廠規範為準。作者不對使用本工具造成的任何爭議或損失負責。

## 隱私

- 所有資料（勾選狀態、備註、照片、車輛資訊）只儲存於瀏覽器本機 IndexedDB
- 不上傳到任何伺服器，不使用第三方追蹤 / 分析 / 廣告
- 完整聲明見 [/privacy](https://tesla-checklist.dantoolkit.cc/privacy)

## License

MIT
