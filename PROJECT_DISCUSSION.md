# Tesla 交車檢查清單 Web App — 專案功能討論

> 參考來源：[electrify.tw — Tesla Delivery Checklist](https://electrify.tw/app/tesla-delivery-checklist/)
> 文件日期：2026-05-17
> 文件目的：在動工前，先把功能範圍、技術選型、資料結構、PDF 匯出方式、未決點談清楚，避免後面返工。

---

## 1. 專案目標

打造一個「特斯拉交車時可直接拿手機/平板使用」的檢查清單 Web App，能讓使用者：

1. 依分類逐項勾選交車檢查項目（與原網站相同）。
2. 針對「每個」項目附上**照片**與**文字備註**（原網站沒有的擴充）。
3. 一鍵把當下狀態（含勾選、備註、照片、進度、產生時間）**匯出為 PDF**，作為交車紀錄或日後申訴憑證。

目標使用情境：交車現場、手機握在手上、可能網路訊號差 → **離線可用、純前端、無需登入**。

---

## 2. 功能範圍

### 2.1 必要功能（MVP）

| # | 功能 | 說明 |
|---|------|------|
| F1 | 載入檢查清單資料 | 6 個分類、共 40 個項目（資料結構詳見第 4 節）。 |
| F2 | 分類手風琴 | Section 可展開/收合；全部展開/全部收合按鈕。 |
| F3 | 項目勾選 | 點擊 → 切換「已檢查」狀態。 |
| F4 | 進度條 | 顯示「已勾選 / 總項目數」與百分比；100% 顯示恭喜訊息。 |
| F5 | 自動儲存 | 狀態變動即時寫入 IndexedDB（含勾選、備註、照片）。 |
| F6 | 重新整理復原 | 重新進站自動載入上次狀態。 |
| F7 | 清空紀錄 | 二次確認後清掉全部勾選、備註、照片。 |
| F8 | **每項備註** | 每個 item 可展開輸入文字備註（多行、限長 500 字）。 |
| F9 | **每項照片** | 每個 item 可上傳多張照片（手機可直接呼叫相機）。 |
| F10 | **匯出 PDF** | 產生包含當下日期時間、進度、所有 item 狀態 + 備註 + 照片的 PDF。 |

### 2.2 加分功能（視時間決定）

| # | 功能 | 說明 |
|---|------|------|
| N1 | 複製未完成項目 | 比照原網站，把未勾選的項目複製成純文字到剪貼簿。 |
| N2 | 車輛資訊欄 | 在頁首填入車型、VIN、交車日 → 會印在 PDF。 |
| N3 | 簽名欄 | PDF 末尾兩格簽名（車主 / 交車人員）—可用 canvas 簽名後嵌入。 |
| N4 | 匯入/匯出 JSON | 把整份檢查（含照片 base64）匯出成 JSON 備份／轉移到別台裝置。 |
| N5 | PWA | 加 manifest + service worker，可加入主畫面、離線使用。 |
| N6 | 暗色模式 | 跟隨系統 `prefers-color-scheme`。 |
| N7 | 自訂項目 | 使用者可新增自己的檢查項目（例如：選配的腳踏墊、車膜）。 |

### 2.3 明確「不做」

- ❌ 後端、帳號、雲端同步：MVP 純 client-side。
- ❌ 多語系：先做繁體中文。
- ❌ 多車型差異化清單：先用原網站的通用清單，使用者自行依車款判斷。

---

## 3. 技術選型

| 類別 | 選擇 | 理由 |
|------|------|------|
| 框架 | **Vue 3 + Vite + TypeScript** | 使用者熟悉；純前端不需 SSR，所以選 Vite 而非 Nuxt（更輕、build 更快）。 |
| CSS | **Tailwind CSS** | 全域偏好；交車現場手機優先，utility-first 寫 RWD 快。 |
| UI 元件 | **shadcn-vue**（或 Element Plus） | 預設用 shadcn-vue，因清單 UI 偏自訂、不需要重型表單元件。若需要 dialog/toast 等成熟元件再考慮 Element Plus。 |
| 狀態管理 | **Pinia** | 標準選擇；只需一個 store 管 checklist 狀態。 |
| 本地儲存 | **IndexedDB（via `idb` 套件）** | localStorage 容量太小（~5MB），裝不下多張照片。 |
| 圖片壓縮 | **`browser-image-compression`** | 上傳前壓到長邊 1600px、JPEG 80% 品質，避免單張 5MB+ 把 IndexedDB 塞爆。 |
| PDF 產生 | **`jspdf` + `jspdf-autotable`**（主方案） | 文字 native、檔案小、可選取；用 `addImage` 嵌入壓縮後的 JPEG。<br/>備案：`html2canvas` 整頁截圖再嵌入（缺點：PDF 變圖片、檔案大、不可選取）。 |
| 測試 | **Vitest** + Vue Test Utils | Vue 3 標配。 |
| Linter | ESLint + Prettier（Airbnb 風格） | 個人習慣。 |
| 部署 | GitHub Pages / Vercel / Cloudflare Pages | 純靜態，三選一皆可。 |

### 為什麼不選 Nuxt？
這個 app 是 single-page 工具，沒有 SEO 需求、沒有 SSR 需求、沒有 API routes 需求。Nuxt 帶來的能力都用不到，反而拖慢 build。**結論：選 Vite。**

### 為什麼不直接用原網站的 vanilla JS？
原網站 ~300 行 JS 直接操作 DOM。加入照片、PDF、IndexedDB 後複雜度上升，元件化、響應式狀態管理會大幅降低後續維護成本。

---

## 4. 資料結構

### 4.1 Checklist Schema（靜態，build-time 內建）

直接沿用原網站 `checklist.json` 結構（已抓取，共 6 sections / 40 items）：

```ts
type ChecklistSchema = {
  sections: Section[];
};

type Section = {
  id: string;        // 由 title slug 化，例：'pre-delivery-prep'
  title: string;
  items: ChecklistItem[];
};

type ChecklistItem = {
  id: string;        // 全域唯一，例：'sec1-item3'
  label: string;
  description: string;
  link?: string;     // 延伸閱讀（原網站有）
};
```

### 4.2 使用者狀態（IndexedDB）

```ts
type ItemState = {
  checked: boolean;
  note: string;             // 多行備註
  photos: PhotoRef[];       // 照片陣列
  updatedAt: number;        // timestamp
};

type PhotoRef = {
  id: string;               // uuid
  blob: Blob;               // 壓縮後的 JPEG
  thumbnailBlob?: Blob;     // 縮圖（可選，加速列表渲染）
  takenAt: number;
};

// 整體狀態
type ChecklistState = {
  items: Record<string /* item id */, ItemState>;
  meta: {
    vehicle?: { model: string; vin: string; deliveryDate: string }; // N2
    lastUpdated: number;
  };
};
```

### 4.3 IndexedDB Object Stores

| Store | Key | 內容 |
|-------|-----|------|
| `items` | item id | `ItemState`（不含 photos）|
| `photos` | photo id | `PhotoRef`（Blob 獨立存，避免 hydrate 全部 item 時把照片也載入） |
| `meta` | 'singleton' | `meta` |

---

## 5. UI 結構（手機優先）

```
┌─────────────────────────────────────┐
│  Tesla 交車檢查清單                  │  ← Header（sticky top）
│  [進度條 ███░░░░ 12/40 30%]         │
│  [📋 匯出 PDF] [🗑 清空] [⬇ 全部展開] │
├─────────────────────────────────────┤
│                                     │
│  ▼ 交車前準備 (2/6)                 │  ← Accordion section
│    ☑ 確認保險生效時間                │
│      └─ 說明文字...                  │
│      └─ [📝 備註] [📷 照片 2]        │  ← 點開後展開
│    ☐ 攜帶 LED 手電筒                 │
│    ...                              │
│                                     │
│  ▶ 隨車物品檢查 (0/3)               │
│  ▶ 車輛外觀檢查 (3/6)               │
│  ...                                │
└─────────────────────────────────────┘
                            [⬆ 回頂端]
```

### 互動細節

- **勾選**：整列 tap 切換（不只是 checkbox 區）。
- **備註/照片**：點 item 右側 chevron 展開抽屜，避免清單變肥。
- **照片上傳**：`<input type="file" accept="image/*" capture="environment" multiple>` → 手機會跳「拍照 / 從相簿」選單。
- **照片預覽**：縮圖點擊放大成全螢幕 lightbox，支援刪除。

---

## 6. PDF 匯出設計

### 6.1 PDF 內容版面

```
┌──────────────────────────────────────┐
│ Tesla 交車檢查清單                    │
│ 產生時間：2026-05-17 14:32           │  ← 用戶明確要求
│ 完成進度：38 / 40 (95%)              │
│ 車型：Model Y / VIN: XXX（若填寫）   │
├──────────────────────────────────────┤
│ ▼ 交車前準備                          │
│   ✅ 確認保險生效時間                 │
│      備註：已聯絡和泰，5/16 生效      │
│      [照片縮圖 1] [照片縮圖 2]        │
│   ❌ 攜帶 LED 手電筒                  │
│      備註：（無）                     │
│ ...                                  │
├──────────────────────────────────────┤
│ 簽名：______ / ______（可選）         │
└──────────────────────────────────────┘
```

### 6.2 技術細節

- **字型**：jsPDF 預設不支援中文，需嵌入 Noto Sans TC（subset 後 ~1-2MB；build 時用 `jsPDF.addFileToVFS`）。
- **照片**：每張 resize 到 PDF 內最寬 4cm，JPEG 80%，避免 PDF 變太肥。
- **分頁**：自動計算高度，超過 A4 自動換頁。
- **檔名**：`tesla-checklist-YYYYMMDD-HHmm.pdf`。

### 6.3 風險評估

- **大量照片可能拖慢產生**：40 個 item × 平均 3 張照片 = 120 張。需要在 UI 上顯示「PDF 產生中...」並考慮 Web Worker（看實測決定）。
- **iOS Safari 下載限制**：用 `<a download>` + blob URL，iOS 會在新分頁開啟，可接受。

---

## 7. 開發階段拆解

每個階段都有可驗證的成果，符合 CLAUDE.md 的 goal-driven execution：

| Phase | 內容 | 驗收 |
|-------|------|------|
| **P0 — 專案骨架** | Vite + Vue 3 + TS + Tailwind + 基本路由（單頁） | `npm run dev` 跑得起來、首頁顯示 hello |
| **P1 — 清單渲染** | 內建 checklist data、accordion、進度條 | 6 sections 正確顯示、可勾選、進度條更新 |
| **P2 — IndexedDB 持久化** | 勾選狀態自動存取、重整不消失 | 勾選 → 重整 → 狀態還在 |
| **P3 — 備註功能** | 每個 item 可展開輸入備註 | 寫備註、重整、備註還在 |
| **P4 — 照片功能** | 拍照上傳、壓縮、縮圖、刪除、lightbox | 拍 3 張照片 → 重整 → 還在；空間佔用合理 |
| **P5 — PDF 匯出** | 中文字型、版面、照片嵌入、檔名含時間 | 匯出後 PDF 內容完整、可在 Mac 預覽開啟 |
| **P6 — 加分功能** | 視時間挑 N1~N7 | 個別驗收 |
| **P7 — 部署** | 選 Vercel / GH Pages，binding 網域（如需要） | 線上可存取 |

---

## 8. 決策結果（2026-05-17 確認）

| # | 決策 | 結果 |
|---|------|------|
| 1 | 框架 | **Nuxt 3**（SSG 模式 + SEO） |
| 2 | UI 元件庫 | **Nuxt UI**（官方，跟 Tailwind 整合最佳） |
| 3 | PDF 方案 | **jsPDF + 中文字型** |
| 4 | 照片儲存上限 | **每項 5 張、長邊 1600px、JPEG 80%** |
| 5 | PWA | **要做**（離線可用是核心需求） |
| 6 | 車輛資訊欄 | **MVP 就做**（會印在 PDF） |
| 7 | 部署 | **GitHub Pages**（GitHub Pro / private repo / public Pages） |
| 8 | 資料來源 | **註明出處於 footer + README** |
| 9 | Checklist 資料 | **獨立 JSON 檔（`assets/data/checklist.json`）**，build-time import，附 JSON Schema |

> 技術棧調整：因改用 Nuxt 3，第 3 節技術選型表的「框架/UI/狀態管理」改為：
> - 框架：Nuxt 3（SSG via `nuxt generate`）
> - UI 元件庫：Nuxt UI
> - 狀態管理：仍用 Pinia（`@pinia/nuxt`）
> - PWA：`@vite-pwa/nuxt`
> - 部署：GitHub Actions → `actions/deploy-pages@v4`

---

## 9. Checklist JSON 結構規範

### 9.1 檔案位置
- 主資料：`assets/data/checklist.json`
- Schema：`assets/data/checklist.schema.json`（VS Code 編輯時自動補完 + 驗錯）

### 9.2 範本

```json
{
  "$schema": "./checklist.schema.json",
  "version": "1.0.0",
  "updatedAt": "2026-05-17",
  "source": {
    "name": "electrify.tw — Tesla Delivery Checklist",
    "url": "https://electrify.tw/app/tesla-delivery-checklist/",
    "license": "fair-use / 通用知識"
  },
  "sections": [
    {
      "id": "pre-delivery-prep",
      "order": 1,
      "title": "交車前準備",
      "icon": "i-heroicons-clipboard-document-list",
      "description": "出發前就該帶齊的東西。",
      "items": [
        {
          "id": "pre-01-insurance",
          "label": "確認保險生效時間",
          "description": "請提前通知保險公司交車日期，並建議保險提前 1 天生效，以避免保險空窗期。",
          "tips": ["建議保險提前 1 天生效", "避免保險空窗期"],
          "link": {
            "text": "特斯拉保險懶人包",
            "url": "https://electrify.tw/insurance/"
          },
          "photoSuggestion": "保單照片或 email 截圖"
        }
      ]
    }
  ]
}
```

### 9.3 欄位規範

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `version` | string (semver) | ✅ | 結構破壞性變動才升 major |
| `updatedAt` | string (YYYY-MM-DD) | ✅ | 顯示於 footer 與 PDF |
| `source.name` | string | ✅ | footer 引用文字 |
| `source.url` | string (url) | ✅ | footer 連結 |
| `source.license` | string | ⛔️ | 出處性質說明 |
| `sections[].id` | string (kebab-case) | ✅ | **永遠別改**（state key） |
| `sections[].order` | number | ✅ | 排序用，可不連續方便插入 |
| `sections[].title` | string | ✅ | 分類標題 |
| `sections[].icon` | string | ⛔️ | Heroicons 名稱（`i-heroicons-*`） |
| `sections[].description` | string | ⛔️ | 分類副標 |
| `items[].id` | string | ✅ | 規則：`{section前綴}-{兩位序號}-{slug}`，**永遠別改** |
| `items[].label` | string | ✅ | 項目主標題 |
| `items[].description` | string | ✅ | 項目說明 |
| `items[].tips` | string[] | ⛔️ | bullet 補充重點 |
| `items[].link.text` | string | ⛔️ | 延伸閱讀文字 |
| `items[].link.url` | string (url) | ⛔️ | 延伸閱讀連結 |
| `items[].photoSuggestion` | string | ⛔️ | 上傳區的 placeholder 提示 |

### 9.4 維護注意事項
- **id 一旦上線就不可變更**（會弄丟使用者已存的勾選/備註/照片）。要 deprecate 用新 id 取代。
- 新增/刪除 item 時，舊版 state 中對應的資料會孤兒化；migration 邏輯：load 時忽略 schema 沒有的 id（保留在 IndexedDB 但不顯示，避免誤刪）。
- 修改 `description` / `tips` 等文字不影響 state，可隨時編輯。

---

## 10. SEO / PWA / 部署計畫

### 10.1 SEO
- **Nuxt SSG**：`npm run generate` 預渲染所有 HTML，爬蟲讀得到全部項目文字。
- **`useSeoMeta`** 設定：title、description、Open Graph、Twitter Card。
- **Structured Data**：用 `useSchemaOrg`（搭配 `nuxt-schema-org` 模組）標記為 `HowTo` 類型，Google 可能顯示步驟摘要。
- **sitemap.xml + robots.txt**：用 `@nuxtjs/sitemap` 自動產生。
- **目標關鍵字**（待你確認）：`Tesla 交車檢查清單`、`特斯拉交車`、`Model Y 交車`、`交車檢查 PDF`。

### 10.2 PWA
- 模組：`@vite-pwa/nuxt`
- 策略：`autoUpdate`（背景自動更新）+ precache 全部靜態資源 + checklist.json
- manifest：app name `特斯拉交車檢查清單`、icon、theme color、`display: standalone`
- 圖片：使用者上傳的照片**不** precache（會撐爆瀏覽器配額），IndexedDB 自己處理離線

### 10.3 部署
- GitHub Actions workflow（`.github/workflows/deploy.yml`）：
  1. push 到 `main` 時觸發
  2. `npm ci` → `npm run generate`
  3. `actions/upload-pages-artifact@v3` 上傳 `.output/public`
  4. `actions/deploy-pages@v4`
- `nuxt.config.ts` 設定：
  - `app.baseURL`：依網域決定（`/tesla-checklist/` or `/`）
  - `nitro.preset: 'github_pages'`（會自動加 `.nojekyll` 檔）

---

## 11. 第二輪決策（2026-05-17 確認）

| # | 決策 | 結果 |
|---|------|------|
| 10 | Repo 名稱 | **`tesla-checklist`** |
| 11 | 部署網址 | **自訂網域 `tesla-checklist.dantoolkit.cc`**（DNS 待設定） |
| 12 | PDF 字型 | **Noto Sans TC**（subset 後嵌入） |
| 13 | PWA 圖示 | **MVP 暫用佔位 SVG + emoji**，正式 logo 之後再換 |

### 11.1 自訂網域 / GitHub Pages 設定 checklist

> ⚠️ 待開工後我會在 README 寫成 step-by-step；這裡先列關鍵點，方便你預先處理 DNS。

1. **DNS 設定**（在 dantoolkit.cc DNS 管理介面）：
   - 新增一筆 CNAME：`tesla-checklist` → `{你的 GitHub username}.github.io`
   - TTL 用預設即可
2. **Repo 設定**：
   - `public/CNAME` 檔內容：`tesla-checklist.dantoolkit.cc`
   - Settings → Pages：source 選 `GitHub Actions`，custom domain 填 `tesla-checklist.dantoolkit.cc`，勾 `Enforce HTTPS`
3. **Nuxt 設定**：
   - `app.baseURL: '/'`（自訂網域走根目錄）
   - `nitro.preset: 'github_pages'`
4. **HTTPS**：GitHub 會自動用 Let's Encrypt 發憑證，DNS 生效後約 24h 內可用
5. **Private repo + GitHub Pro 注意**：
   - Pages 可見性僅支援 `public`（要做 SEO 本來就需要公開可索引，所以沒衝突）
   - 程式碼是 private、上線網站是 public，這是正常組態

### 11.2 仍未確認：SEO 文案

下面是我擬的草案，你看哪段要改：

| 項目 | 草案 |
|------|------|
| 頁面 title | `Tesla 交車檢查清單｜上傳照片、產出 PDF 紀錄` |
| Site name | `Tesla 交車檢查清單` |
| meta description（~110 字） | 「特斯拉交車現場專用的檢查清單工具。涵蓋外觀、內裝、功能、行駛測試共 40 項，每個項目可拍照、寫備註，最後一鍵匯出 PDF 作為交車紀錄，離線也能用。」 |
| 主關鍵字 | `Tesla 交車檢查`、`特斯拉交車`、`交車檢查清單`、`Tesla Model Y 交車`、`交車 PDF 紀錄` |
| Open Graph 圖（1200×630） | MVP 用文字 + emoji 自動生成的 SVG，正式 logo 出來再換 |

---

## 12. 第三輪確認資訊（2026-05-17）

- ✅ GitHub username：**`dannychou7911`**（gh cli 查得）
- ⏳ 網域 typo 確認中：應為 `tesla-checklist.dantoolkit.cc`
- ⏳ SEO 文案：見 §11.2 草案

---

## 13. 尚未充分討論的功能細節

> 你說要把所有功能項目討論完才開工。我把目前文件還沒談到、但會在實作時需要決策的點全部列出，每點都附我建議的預設值。可以一次回覆全部、或挑幾個討論。

### 13.1 備註功能擴充

| 議題 | 我的建議 | 替代方案 |
|------|----------|----------|
| 字數上限 | **500 字 / 項** | 不設限 / 1000 字 |
| 是否加「狀態標籤」 | **加** — 在備註區提供 3 顆按鈕：`✅ 通過` / `⚠️ 小瑕疵` / `❌ 嚴重瑕疵`。PDF 上會用不同顏色顯眼標出。 | 不加，只用備註文字 |
| Markdown 語法 | **不支援**（保持單純） | 支援 bold / list |
| 預設快速備註 | **不做** | 提供「無問題」「已反映現場人員」「待原廠處理」常用片語一鍵插入 |

### 13.2 照片功能擴充

| 議題 | 我的建議 | 備註 |
|------|----------|------|
| 拍照時間戳浮水印 | **預設關，可在設定打開** | 法律情境用得到，但會破壞照片本身 |
| EXIF 旋轉處理 | **必做**（用 `browser-image-compression` 內建） | 否則 iPhone 橫拍變直的會躺著 |
| EXIF GPS 移除 | **必做** | 隱私，PDF 流出時不洩漏交車地點座標 |
| 照片標註（畫圈圈） | **MVP 不做** | 加分功能 P6 評估，需引入 `fabric.js` 等 |
| 連拍 | **支援**（`<input multiple>` 一次選多張） | 系統原生支援 |
| 縮圖 lightbox | **必做** | 點縮圖放大、左右滑切換、刪除 |

### 13.3 車輛資訊欄欄位

打勾的會印在 PDF 頁首：

| 欄位 | 我的建議 | 用途 |
|------|----------|------|
| 車型 | ✅ 必填，下拉選單（Model 3 / Y / S / X / Cybertruck / 其他） | PDF 識別 |
| VIN 車架號碼 | ✅ 選填，17 碼 | PDF 識別、申訴依據 |
| 車牌號碼 | ✅ 選填 | PDF 識別 |
| 車身顏色 | ⛔️ 不加（避免欄位太多） | 可寫在備註 |
| 交車日期 | ✅ 必填，date picker | PDF + 法律時效計算 |
| 交車地點 | ⛔️ 不加 | 太冗 |
| 銷售顧問 | ⛔️ 不加 | 太冗 |
| 里程數 | ✅ 選填 | 交車里程數對申訴重要 |

### 13.4 PDF 匯出細節

| 議題 | 我的建議 | 替代方案 |
|------|----------|----------|
| 紙張 | **A4 直向** | A4 橫向 / Letter |
| 匯出範圍預設 | **全部 40 項** | 只匯出有勾選 / 只匯出有備註或照片 |
| 匯出前彈窗 | **顯示「未完成 X 項，仍要匯出？」** | 直接匯出 |
| 頁碼 | **加**，右下角 `第 X / Y 頁` | 不加 |
| 浮水印 | **不加** | 加「使用者上傳」字樣防偽用 |
| 封面頁 | **不加**，直接頁首即標題 | 獨立封面頁 |
| 簽名欄 | **加，預設未啟用** — 設定中可開，開了會在最後一頁有兩格 canvas 簽名區 | 永遠加 / 永遠不加 |
| 顏色策略 | **彩色但克制**（標題深灰、狀態 icon 用色） | 全黑白省墨 |

### 13.5 狀態管理與資料 migration

| 議題 | 我的建議 |
|------|----------|
| state schema version | **加 `stateVersion` 欄位**。日後結構變更時可 migrate |
| checklist.json 版本升級 | **load 時 diff schema vs state**：schema 多的新 item 加入未勾選；schema 沒有的 state 保留但不顯示（不誤刪） |
| 清除確認 | **二次確認 dialog**，輸入「清除」二字才執行（避免誤觸） |
| 自動備份 | **不做**（IndexedDB 已是 persistent storage） |
| 匯出 / 匯入 JSON 備份 | **MVP 不做，P6 加分**。若做：含照片 base64 的 `.tesla-checklist.json` 檔，可在另一台裝置匯入 |

### 13.6 UI / UX 細節

| 議題 | 我的建議 |
|------|----------|
| 暗色模式 | **MVP 做**（Nuxt UI 內建幾乎零成本）。預設跟隨系統。 |
| 字體大小 | **預設手機適中、可在設定切換大字版** | 預設手機現場戴手套也好按 |
| 進度條型態 | **頂部 sticky 細條 + 文字 `X / 40 (XX%)`** | 環形 / 各 section 顯示自己進度 |
| 全部展開 / 收合 | **保留**（同原網站） | 移除 |
| 「回頂端」按鈕 | **保留** | 移除 |
| 達 100% 行為 | **彈出 confetti 動畫 + 提示「可以匯出 PDF 了！」按鈕** | 只顯示文字 |
| 第一次進站引導 | **不做**（UI 直觀）；改在 README + 頁尾常見問題說明 | 做 tour |
| 鎖屏防誤觸（PWA 全螢幕） | **不做** | 加「鎖定」按鈕避免袖口誤碰 |

### 13.7 隱私 / 資料安全

| 議題 | 我的建議 |
|------|----------|
| PIN 保護 | **不做**（裝置已有解鎖；交車場景使用者全程握手機） |
| Analytics / Tracking | **不做**（純工具站、無商業需求；如需流量看可加 Cloudflare Web Analytics，無 cookie） |
| Cookie banner | **不需要**（無 tracking 就無需揭露） |
| 隱私權政策頁 | **加一個簡短頁** — 「所有資料只存在你的瀏覽器，不上傳任何伺服器」 |
| 法律 disclaimer | **footer 加一行** — 「本工具僅供參考，不取代正式交車單與原廠服務」 |

### 13.8 無障礙 (a11y)

| 議題 | 我的建議 |
|------|----------|
| 鍵盤操作 | **必做**（tab、enter、space），Nuxt UI 內建 |
| ARIA 標籤 | **必做**（checkbox、accordion、dialog） |
| 顏色對比 | **必做** AA 等級，Tailwind 預設色階通常達標 |
| Screen reader 友善 | **基本支援**，不深度測試 |

### 13.9 錯誤處理

| 情境 | 處理方式 |
|------|----------|
| IndexedDB 配額用完 | toast 提示「儲存空間不足，請刪除部分照片或匯出 PDF 後清空紀錄」 |
| 照片壓縮失敗 | toast 提示 + 不寫入 state |
| `checklist.json` 載入失敗 | 顯示重試按鈕 + 連絡作者連結（自訂網域所以 build-time import 不會失敗，但留 safety net） |
| Service Worker 註冊失敗 | 靜默 fallback 成一般網頁 |
| PDF 產生失敗（記憶體不足） | toast 提示「請減少照片數或分批匯出」 |

### 13.10 範圍限制（明確不做，避免後續再爭辯）

- ❌ 不同車款差異化清單（Model 3/Y/S/X/CT/二手車）
- ❌ 多語系（i18n）
- ❌ 帳號 / 雲端同步 / 多裝置
- ❌ 即時協作（多人同時填）
- ❌ 留言 / 社群分享
- ❌ 比價 / 經銷商評分
- ❌ 內建翻譯特斯拉英文錯誤碼

---

## 14. §13 確認結果（2026-05-17）

關鍵 4 題已確認，其餘小節依 §13 的「我的建議」欄位作為定案。

| # | 細節 | 結果 |
|---|------|------|
| 14.1 | 備註狀態標籤 (✅⚠️❌) | **加** — 三顆狀態按鈕，PDF 以顏色區分 |
| 14.2 | PDF 匯出範圍 | **全部 40 項** |
| 14.3 | PDF 簽名欄 | **設定中可開關、預設關** |
| 14.4 | 車輛資訊欄「車型」 | **下拉選單**（Model 3 / Y / S / X / Cybertruck / 其他） |
| 14.5 | 備註字數上限 | 500 字 |
| 14.6 | 備註 Markdown | 不支援 |
| 14.7 | 預設快速備註片語 | 不做 |
| 14.8 | 照片時間戳浮水印 | 設定中可開、預設關 |
| 14.9 | 照片 EXIF 旋轉處理 | 必做 |
| 14.10 | 照片 EXIF GPS 移除 | 必做 |
| 14.11 | 照片標註（畫圈圈） | MVP 不做 |
| 14.12 | 照片連拍 / 多選 | 支援 |
| 14.13 | Lightbox 放大 | 必做 |
| 14.14 | 車輛資訊欄欄位 | 車型 ✅ 必、VIN 選、車牌 選、交車日 ✅ 必、里程數 選；不收顏色/地點/銷售顧問 |
| 14.15 | PDF 紙張 | A4 直向 |
| 14.16 | PDF 匯出前提示 | 顯示「未完成 X 項，仍要匯出？」 |
| 14.17 | PDF 頁碼 | 加 |
| 14.18 | PDF 浮水印 | 不加 |
| 14.19 | PDF 封面頁 | 不加 |
| 14.20 | PDF 顏色 | 彩色但克制 |
| 14.21 | state schema version | 加 `stateVersion` 欄位 |
| 14.22 | checklist.json 升級 migration | schema 多的補入；state 多的保留不顯示 |
| 14.23 | 清除二次確認 | 須輸入「清除」二字 |
| 14.24 | 自動備份 | 不做 |
| 14.25 | 匯入 / 匯出 JSON 備份 | MVP 不做（列入 P6） |
| 14.26 | 暗色模式 | **MVP 做**（跟隨系統） |
| 14.27 | 字體大小切換 | 設定中可切換大字版 |
| 14.28 | 進度條 | 頂部 sticky 細條 + `X / 40 (XX%)` |
| 14.29 | 全部展開 / 收合按鈕 | 保留 |
| 14.30 | 回頂端按鈕 | 保留 |
| 14.31 | 100% 慶祝 | confetti 動畫 + 「可以匯出 PDF」按鈕 |
| 14.32 | 首訪引導 | 不做，靠 README + 頁尾 FAQ |
| 14.33 | PIN 保護 | 不做 |
| 14.34 | Analytics | 不做（之後若需，加 Cloudflare Web Analytics，無 cookie） |
| 14.35 | Cookie banner | 不需要 |
| 14.36 | 隱私權頁 | 加一頁簡短說明 |
| 14.37 | Footer 法律 disclaimer | 加 |
| 14.38 | a11y | 鍵盤、ARIA、AA 對比必做；Screen reader 基本支援 |
| 14.39 | 錯誤處理 | toast + safety net 依 §13.9 |

---

## 15. 最終確認（2026-05-17）✅

- ✅ SEO 文案：照 §11.2 草案
- ✅ 自訂網域：`tesla-checklist.dantoolkit.cc`

---

## 16. 規劃凍結 (Frozen Spec)

> 本文件至此 freeze。後續實作以下面這份 spec 為唯一依據；新需求請開新章節 / 新文件，不改既有條目（避免上線後 schema migration 失控）。

### 16.1 一頁式 Spec 摘要

| 維度 | 結論 |
|------|------|
| **專案目標** | 特斯拉交車檢查清單 Web App，純前端、離線可用、可拍照寫備註、可匯出 PDF |
| **技術棧** | Nuxt 3 (SSG) + TypeScript + Tailwind + Nuxt UI + Pinia + IndexedDB (`idb`) + jsPDF + Noto Sans TC + `browser-image-compression` + `@vite-pwa/nuxt` |
| **資料來源** | `assets/data/checklist.json`（build-time import）+ JSON Schema 驗證；6 sections / 40 items，初版沿用 electrify.tw |
| **儲存** | IndexedDB：3 stores — items / photos / meta |
| **PDF** | A4 直向、jsPDF + Noto Sans TC subset、全部 40 項、含進度與當下時間、頁碼、簽名欄可選 |
| **照片** | 每項上限 5 張、長邊 1600px、JPEG 80%、移除 EXIF GPS、保留旋轉 |
| **備註** | 500 字內、含狀態標籤 (✅⚠️❌)、PDF 顯眼上色 |
| **車輛資訊欄** | 車型（下拉，必填）/ VIN / 車牌 / 交車日（必填）/ 里程數 |
| **UI/UX** | 手機優先、暗色模式跟系統、sticky 進度條、accordion、100% confetti |
| **SEO** | Nuxt SSG 預渲染、`useSeoMeta` + `nuxt-schema-org`、`@nuxtjs/sitemap` |
| **PWA** | `@vite-pwa/nuxt`、autoUpdate、precache 全部靜態資源 |
| **隱私** | 全本地、無 analytics、加隱私頁、footer disclaimer |
| **部署** | GitHub Actions → GitHub Pages，private repo + public Pages |
| **網域** | `tesla-checklist.dantoolkit.cc` (CNAME → `dannychou7911.github.io`) |
| **Repo** | `dannychou7911/tesla-checklist` |

### 16.2 開發階段（P0–P7）

照 §7 表執行；每階段都有可驗證的「綠燈」。

### 16.3 SEO 文案凍結值

- title: `Tesla 交車檢查清單｜上傳照片、產出 PDF 紀錄`
- site name: `Tesla 交車檢查清單`
- description: 「特斯拉交車現場專用的檢查清單工具。涵蓋外觀、內裝、功能、行駛測試共 40 項，每個項目可拍照、寫備註，最後一鍵匯出 PDF 作為交車紀錄，離線也能用。」
- 主關鍵字: `Tesla 交車檢查` / `特斯拉交車` / `交車檢查清單` / `Tesla Model Y 交車` / `交車 PDF 紀錄`

### 16.4 出處引用凍結值

footer 與 README 顯示：

> 檢查項目參考自 [electrify.tw — Tesla Delivery Checklist](https://electrify.tw/app/tesla-delivery-checklist/)，本工具僅供參考，不取代正式交車單與原廠服務。

---

## 17. 開工 Checklist（等你說 GO）

確認下面這些後，回「開工」我就跑 P0：

- [x] 所有功能細節已 freeze（§14）
- [x] SEO 文案已 freeze（§16.3）
- [x] 網域已 freeze（`tesla-checklist.dantoolkit.cc`）
- [x] Repo 名稱已 freeze（`tesla-checklist`）
- [x] GitHub username 已確認（`dannychou7911`）
- [ ] **DNS CNAME 設定**（你的責任）：
  - 在 `dantoolkit.cc` DNS 加 CNAME
  - host: `tesla-checklist`
  - target: `dannychou7911.github.io`
  - 可以晚一點設定，但建議跟 P0 並行先弄好，等 P7 部署時就立刻可以用
- [ ] **建立 GitHub repo**（你的責任 or 授權我用 gh cli 建）：
  - `dannychou7911/tesla-checklist`
  - private（GitHub Pro 支援）
  - 不需要先建任何檔案
- [ ] **授權方式**：開工後我會做以下動作，請先告知是否同意：
  - 在 `/Users/dannychou/Project/tesla-checklist` 建立所有檔案
  - `git init` + 第一個 commit
  - （可選）用 gh cli 建 remote repo + push

說「開工」即啟動 P0。
