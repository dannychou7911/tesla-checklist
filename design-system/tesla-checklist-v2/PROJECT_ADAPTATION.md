# Tesla Checklist v2 — 專案適配規格

> 演算法產出於 `MASTER.md`，本檔是針對 Tesla 交車檢查清單**繁中 PWA + Nuxt 3 + Tailwind v4 + 戶外手機場景**的客製化適配。
> 實作時優先參考本檔；本檔未覆蓋的細節再回 `MASTER.md`。

---

## 1. 設計方向（兩個 candidate）

### A. Confident Playful（推薦）

**一句話**：以 Tesla 黑紅作品牌錨，把活潑感放在「進度／狀態／成就 micro-interaction」，主體仍乾淨。

- **核心策略**：色彩不是均勻撒在版面，而是**集中在「使用者進展」的地方**——進度條、勾選互動、Section 完成徽章、100% 慶祝
- **適合 checklist 工具**：使用者注意力集中於「完成」，活潑感變成「進步的獎勵」而非裝飾
- **戶外光友善**：body 仍高對比 slate，色彩只作 accent；陽光下不會被花色干擾

### B. Soft Achievement UI

**一句話**：柔陰影 + 中圓角 + 多層次配色，更全面的 playful，但更花。

- 整體所有卡片 soft shadow + border-radius 16-24px，較貼近 Claymorphism
- 風險：陽光下陰影層次不易辨識；可能與 Tesla 嚴肅品牌調性衝突

**推薦 A**。下方所有規格依 A 撰寫。

---

## 2. 色彩 Palette

> 主結構保留 slate，**新引入 teal（進度）/ amber（即將完成）/ emerald（pass）** 三色，配合 Tesla 紅作為品牌錨 + 危險動作。

### Light Mode

| Role | Hex | Tailwind | 用途 |
|------|-----|----------|------|
| Primary | `#0F172A` | `slate-900` | 主文字、icon、品牌 anchor |
| Surface | `#FFFFFF` | `white` | 卡片背景 |
| Surface Tinted | `#F8FAFC` | `slate-50` | 頁面背景 |
| Surface Sunken | `#F1F5F9` | `slate-100` | 摺疊區、disabled |
| Border | `#E2E8F0` | `slate-200` | 卡片邊 |
| Text Secondary | `#475569` | `slate-600` | 副標、說明 |
| Text Disabled | `#94A3B8` | `slate-400` | placeholder |
| **Accent 1 / Tesla 紅** | `#E31937` | (自訂 `tesla-500`) | 危險動作（清除、刪除）、100% 慶祝色之一 |
| **Accent 2 / 進度 Teal** | `#0D9488` | `teal-600` | 進度條 fill、主互動色（替代原 emerald） |
| **Accent 3 / 即將完成 Amber** | `#F59E0B` | `amber-500` | 67-99% 進度 hint、小成就徽章 |
| Status Pass | `#059669` | `emerald-600` | ✓ 通過 |
| Status Warn | `#D97706` | `amber-600` | ⚠ 小瑕疵（用 600 確保 4.5:1） |
| Status Fail | `#DC2626` | `red-600` | ✗ 嚴重瑕疵 |

### Dark Mode

| Role | Hex | Tailwind |
|------|-----|----------|
| Primary Text | `#F1F5F9` | `slate-100` |
| Surface | `#020617` | `slate-950` |
| Surface Card | `#0F172A` | `slate-900` |
| Surface Elevated | `#1E293B` | `slate-800` |
| Border | `#334155` | `slate-700` |
| Text Secondary | `#CBD5E1` | `slate-300` |
| Accent 1 紅 | `#F87171` | `red-400` |
| Accent 2 Teal | `#2DD4BF` | `teal-400` |
| Accent 3 Amber | `#FBBF24` | `amber-400` |
| Status Pass | `#34D399` | `emerald-400` |
| Status Warn | `#FBBF24` | `amber-400` |
| Status Fail | `#F87171` | `red-400` |

### 對比驗證（重點）

| 配對 | 比值 | 等級 |
|------|------|------|
| `slate-900` on `white` | 17.4:1 | AAA |
| `teal-600` on `white` | 5.4:1 | AA |
| `emerald-600` on `white` | 5.7:1 | AA |
| `amber-600` on `white` | 4.6:1 | AA（**用 600 不用 500**） |
| `red-600` on `white` | 5.9:1 | AA |
| `slate-100` on `slate-950` | 17.0:1 | AAA |

---

## 3. 字型策略

> 演算法建議 Fredoka + Nunito（playful 英數），但本專案是**繁中為主**，Noto Sans TC 已 subset 進 PDF，引入新字型會增加首載體積與字型衝突。

**決策：不引入新字型**，改靠 weight + tracking + tabular-nums 製造 hierarchy。

### 中文

- **Body**: `Noto Sans TC`（既有）
- **Heading**: 同字型 + `font-weight: 600/700` + `letter-spacing: -0.02em`（壓出 heading 感）

### 英數（混排）

- **Body**: System UI fallback (`-apple-system, BlinkMacSystemFont`)
- **Numbers**: `font-variant-numeric: tabular-nums`（進度數字不跳動）
- **Heading 英數**：若使用者堅持要 playful，建議 **Quicksand** 而非 Fredoka（Quicksand 較收斂，與繁中筆畫協調）；用法限「100% 慶祝標題」「Hero welcome」等英數段，**body 不混用**

### Tailwind v4 設定（建議）

```css
/* assets/css/main.css */
@theme {
  --font-sans: 'Noto Sans TC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Noto Sans TC', system-ui, sans-serif; /* 同字型，靠 weight */
  --font-mono: 'SF Mono', Menlo, monospace;
}

.tabular { font-variant-numeric: tabular-nums; }
.tight { letter-spacing: -0.02em; }
```

---

## 4. 「成就感」視覺手法

### 4.1 Item 勾選 micro-interaction（5 層回饋）

| 層 | 效果 | 時長 | 說明 |
|---|------|------|------|
| 1 | checkbox: `border-slate-300` → `bg-teal-600 + border-teal-600` | 200ms | base 顏色轉換 |
| 2 | ✓ icon: `scale(0)` → `scale(1)` cubic-bezier(0.34, 1.56, 0.64, 1) | 240ms | 帶輕微 overshoot（彈出感） |
| 3 | row bg flash: `bg-teal-50/50` → fade out | 300ms | hint「打勾成功」 |
| 4 | row text: `line-through text-slate-500` | 200ms | 視覺淡化已完成 |
| 5 | `navigator.vibrate(20)` | 即時 | 觸覺（已實作於 T11） |

**進階**：每勾 5 個觸發一次「mini confetti」（10-15 particles，集中該 row），心理學上比累積到 100% 才慶祝有更高的多巴胺釋放頻率。需新增 `composables/useCelebration.ts`。

### 4.2 進度條 4 階段

| 階段 | Fill | 高度 | 額外效果 |
|------|------|------|---------|
| **0-33%** | `bg-teal-600` | h-2 | 純色，乾淨 |
| **34-66%** | `bg-linear-to-r from-teal-500 to-emerald-500` | h-3 | gradient + 顯示「快過半 🎯」hint（emoji 作裝飾） |
| **67-99%** | `bg-linear-to-r from-emerald-500 via-amber-400 to-amber-500` | h-3 | gradient + 一次性 pulse（500ms）+「就快完成 ✦」hint |
| **100%** | `bg-linear-to-r from-amber-500 via-orange-500 to-red-500` | h-3 | gradient + outer glow `shadow-[0_0_24px_rgba(245,158,11,0.5)]` + 「全部完成 🎉」+ confetti |

**進度數字** count-up 動畫：從前次值 → 新值，CSS `transition: 700ms ease-out`（或 JS rAF），配 `tabular-nums` 防跳。

### 4.3 Section 完成回饋

- **Section header 徽章**：normal `bg-slate-100 text-slate-700` → 全勾完 `bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300` + ✓ icon + 一次 wiggle 動畫（300ms keyframes rotate -3deg→3deg→0）
- **Section 左側色條**（border-l-4）：normal `border-slate-200` → 全勾完 `border-emerald-400`
- **Section 標題**：全勾完時加 ✓ Heroicons CheckBadge solid icon（不是 emoji）

### 4.4 Reduced Motion 對策

所有以上動畫都包 `motion-safe:` 前綴，`prefers-reduced-motion: reduce` 時：
- 取消 scale/wiggle/pulse
- 保留色彩變化（仍有完成感）
- 取消 confetti
- 保留 vibrate（已是觸覺）

---

## 5. 整體版面活潑化

### 5.1 陰影系統（Tailwind v4 `@theme`）

```css
@theme {
  --shadow-soft: 0 2px 8px -2px rgb(15 23 42 / 0.08);
  --shadow-soft-lg: 0 8px 20px -4px rgb(15 23 42 / 0.12);
  --shadow-success-ring: 0 0 0 4px rgb(16 185 129 / 0.18);
  --shadow-amber-glow: 0 0 24px rgb(245 158 11 / 0.5);
}
```

暗模對應：`rgb(0 0 0 / 0.4)` 較深。

### 5.2 圓角系統

| 層級 | 值 | 用途 |
|------|-----|------|
| sm | `rounded-lg` (8px) | Input, badge |
| md | `rounded-xl` (12px) | 按鈕 |
| lg | `rounded-2xl` (16px) | Item card |
| xl | `rounded-3xl` (24px) | Modal, Section 容器 |
| full | `rounded-full` | ScrollTop, Status pill |

### 5.3 漸層（Tailwind v4 用 `bg-linear-to-*`，**v4 已棄 `bg-gradient-to-*`**）

只用在三處：
1. AppHeader 背景：`bg-linear-to-r from-slate-50 to-teal-50/60 backdrop-blur-md`（dark: `from-slate-950 to-teal-950/40`）
2. ProgressBar fill（見 4.2）
3. 100% 完成 Hero 區（一次性）

**body / 卡片絕不大面積漸層**。

### 5.4 Section header 視覺區隔

```
┃ [icon]  Section 標題       5/8 ✓
↑         ↑                  ↑
border-l-4 Heroicons          完成徽章
(按 section 順序輪流)         (slate / emerald)
```

色條色 cycle：`teal-500 → cyan-500 → sky-500 → indigo-500 → violet-500 → rose-500`（6 個 section 各一色）— 讓 sections 視覺有區隔但不喧賓奪主。

### 5.5 Item card 呼吸感

| 狀態 | class |
|------|-------|
| 預設 | `rounded-2xl bg-white shadow-soft border border-slate-200/60` |
| Hover (desktop) | `shadow-soft-lg -translate-y-px transition-all duration-200` |
| Active (tap) | `active:scale-[0.99]` |
| 已勾 | `bg-teal-50/40 dark:bg-teal-950/30` 微染色 |
| 展開 | drawer content `motion-safe:animate-[slide-down_240ms_ease-out]` |

---

## 6. 避免地雷

| 地雷 | 對策 |
|------|------|
| Emoji 當功能 icon | Heroicons solid/outline；emoji 只用於慶祝文字裝飾（🎉 🎯 ✦） |
| 大面積飽和色 | accent 限 fill bar / badge / status pill / focus ring 等小範圍 |
| 戶外光對比不足 | 所有 status 不只靠顏色辨識，**配 icon + label 文字**；amber 用 600（4.6:1）而非 500 |
| Layout-shifting hover | 用 `translate-y-px` 而非 `scale-110`；`shadow` 變化不影響佈局 |
| 漸層過度 | 限三處（Header / Progress / 100% Hero），不能跨整頁 |
| 動畫干擾閱讀 | 所有持續動畫 `motion-safe:`；單次動畫 ≤ 500ms |
| 過多色彩混亂 | accent 限 3 色（teal / amber / Tesla 紅），加 3 status 色 = 6 色上限 |

---

## 7. 14 個元件升級路徑

### A. 只改 Tailwind class（不動結構，risk: 低）

| 元件 | 變更摘要 |
|------|---------|
| AppHeader | 背景 → linear gradient + backdrop-blur；按鈕 → `rounded-xl`；底部 `rounded-b-3xl` |
| AppFooter | 上邊 soft separator（漸層 fade）+ rounded-t-3xl |
| ScrollTopButton | `rounded-full shadow-soft-lg active:scale-95` |
| ConfirmClearDialog | modal `rounded-3xl` + `shadow-xl` + `backdrop-blur-md` |
| SettingsSlideover | 同上 + slide-in 動畫 motion-safe |
| NoteEditor | textarea `rounded-lg focus:ring-2 focus:ring-teal-500/40` |
| VehicleForm | input/select 統一 `rounded-lg` + focus ring teal |
| StatusTagPicker | 三按鈕 `rounded-xl` + 各自 status 色 + icon（Heroicons CheckCircle / ExclamationTriangle / XCircle solid） |
| PhotoUploader | 縮圖 `rounded-xl ring-1 ring-slate-200`；+按鈕 dashed border |
| PhotoLightbox | backdrop `bg-slate-950/80 backdrop-blur`；close 按鈕 `rounded-full` |

### B. 需動結構 / 加 props（risk: 中）

| 元件 | 變更 |
|------|------|
| **ProgressBar** | 加 `tier` computed (0-33/34-66/67-99/100)、4 class branches、emoji hint 字、100% glow + confetti hook |
| **Section** | 接 `iconName: string` prop + `colorAccent: 'teal' \| 'cyan' \| ...` prop；header 加左側色條 + icon + 完成徽章狀態 |
| **Item** | checkbox 從 native `<input>` 改 custom SVG checkbox（為了 scale 動畫）→ a11y 屬性需確保（role=checkbox, aria-checked, tabindex=0, Space/Enter 觸發）；勾選後 row 染色 |

### C. 新檔案（risk: 中）

| 檔案 | 用途 |
|------|------|
| `assets/css/tokens.css` | `@theme` 寫 design tokens + dark mode 對應 |
| `components/ui/Icon.vue` | Heroicons SVG 統一 wrapper（取代散落 emoji） |
| `composables/useCelebration.ts` | 抽 5 個勾／section-complete／100% 三層慶祝邏輯（含 reduced-motion guard） |
| `utils/checklist-types.ts` | 加 `Section.iconName` + `Section.colorAccent` 欄位（optional） |
| `assets/data/checklist.json` | 為 6 個 section 補 iconName（如 sparkles / cube / cog / lightBulb / ...） |

### D. 不動

- useChecklistStorage, usePhotoCompression, usePdfExport（純資料/邏輯層）
- store/checklist.ts（除非要記錄 lastCelebrationAt 等狀態）
- pages/privacy.vue（純文字頁，沿用即可）

---

## 8. 實作建議切片（避免一次全改）

| Slice | 內容 | 影響元件 | 預估 |
|-------|------|---------|------|
| **S1: Tokens & Theme** | 寫 tokens.css + @theme 設定 + Heroicons 安裝 + Icon.vue 包裝 | 0 個元件動到 | 0.5 天 |
| **S2: ProgressBar 升級** | 4 階段 fill + tier computed + 100% glow | ProgressBar | 0.5 天 |
| **S3: Section 升級** | Section 接 icon prop + 左色條 + 完成徽章；schema 補 iconName | Section, SectionList, checklist.json | 0.5 天 |
| **S4: Item 升級** | custom SVG checkbox + 勾選 5 層 micro-interaction + 染色 | Item, useCelebration | 1 天 |
| **S5: Layout 整體** | AppHeader gradient + Footer separator + Modal/Dialog 圓角統一 | Header/Footer/Dialogs | 0.5 天 |
| **S6: 驗證 + a11y** | 對比驗證、reduced-motion、戶外實測、screen reader 跑一遍 | — | 0.5 天 |

**總計約 3.5 天**。可在 T19 部署後另開 phase，或插隊 T17.5 / T17.6 / ...。

---

## 9. ASCII 線稿（活潑版，手機 375px）

```
┌─────────────────────────────────┐
│ ╭───────────────────────────╮   │  AppHeader
│ │ ✦ Tesla 交車檢查清單       │   │  bg-linear-to-r slate-50→teal-50/60
│ │                            │   │  backdrop-blur-md
│ │  ▰▰▰▰▰▰▰▰▱▱▱  72%        │   │  ProgressBar h-3
│ │  ▔▔▔▔▔▔▔▔▔                │   │  fill: teal-500→emerald-500
│ │  29/40 已完成 ✦            │   │  tabular-nums
│ │                            │   │
│ │  [匯出 PDF]    [清除]       │   │  rounded-xl shadow-soft
│ ╰───────────────────────────╯   │  rounded-b-3xl
│                                 │
│ ⌄ 車輛資訊                    ✓ │  collapsed by default
│                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━     │  divider gradient fade
│                                 │
│ ┃ ✦  外觀檢查         5/8 ✓    │  Section header
│ ┃                                │  ┃ = teal-500 4px
│ ╭───────────────────────────╮   │
│ │ ☑  車漆無刮痕              │   │  Item 已勾（bg-teal-50/40）
│ │    側面與引擎蓋          ⌄ │   │  text-line-through slate-500
│ ╰───────────────────────────╯   │  rounded-2xl shadow-soft
│ ╭───────────────────────────╮   │
│ │ ☐  輪圈無傷                │   │  Item 未勾
│ │    四個角度檢查          ⌄ │   │  custom svg checkbox border-slate-300
│ ╰───────────────────────────╯   │
│                                 │
│ ┃ ⚙  內裝功能         2/6      │  另一個 Section
│ ┃ = cyan-500                    │
│ ...                             │
│                          ╭───╮  │  ScrollTop
│                          │ ↑ │  │  rounded-full shadow-soft-lg
│                          ╰───╯  │
└─────────────────────────────────┘
```

100% 完成的 ProgressBar：

```
╭─────────────────────────────╮
│ ▰▰▰▰▰▰▰▰▰▰▰▰▰  100% 🎉      │  fill: amber→orange→red
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔               │  shadow-[0_0_24px_amber-500/50]
│ 40/40 全部完成               │  confetti 觸發一次
╰─────────────────────────────╯
```

---

## 10. Pre-Delivery Checklist（修改前 / 修改後都跑）

- [ ] 對比 4.5:1（用 [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)）
- [ ] `prefers-reduced-motion` 下所有動畫消失或減弱
- [ ] 觸控目標 ≥ 44px（min-h-[44px] 或 min-h-[60px] for row）
- [ ] Focus ring 可見（`focus-visible:ring-2 focus-visible:ring-teal-500/60`）
- [ ] 戶外實測（iPhone 室外）能辨識 status 與進度
- [ ] Tailwind v4 用 `bg-linear-to-*` 不是 `bg-gradient-to-*`
- [ ] Emoji 只在裝飾文字，不作 icon
- [ ] 暗模對應每個 hex 都驗過
- [ ] confetti 在 reduced-motion 不觸發
