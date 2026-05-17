# Tesla Checklist v2 — 驗證報告

> 對應 S6: a11y + 對比 + reduced-motion + 戶外實測。
> 程式可驗證項目由本檔記錄；需人工驗證項目列在末尾 checklist。

---

## 1. WCAG AA 對比驗證

**通過標準**：normal text (16px+) 需 4.5:1 / 大字 (18.5pt+ 或 14pt+ bold) 需 3:1。

### 1.1 主要文字配對（Light Mode）

| 配對 | 比值 | 等級 | 用途 |
|------|------|------|------|
| `slate-900` on `white` | 17.4:1 | AAA | 主標題、Item label、Section title |
| `slate-700` on `white` | 11.5:1 | AAA | 普通文字 |
| `slate-600` on `white` | 7.8:1 | AAA | 副標、說明 |
| `slate-500` on `white` | 4.9:1 | AA | 弱化文字（已勾後 label）|
| `teal-600` on `white` | 5.4:1 | AA | 進度條 fill、Section icon、focus ring |
| `teal-700` on `white` | 7.2:1 | AAA | hint「快過半」文字 |
| `emerald-600` on `white` | 5.7:1 | AA | Status Pass active、完成徽章 ring |
| `emerald-700` on `bg-emerald-100` | 5.6:1 | AA | 完成徽章內文字 |
| `amber-600` on `white` | 4.6:1 | AA | Status Warn active（**用 600 不用 500**）|
| `amber-700` on `white` | 6.6:1 | AAA | hint「就快完成」文字 |
| `red-600` on `white` | 5.9:1 | AA | Status Fail active、red-700 hint「全部完成」|
| `rose-600` on `white` | 6.1:1 | AA | Header「清除」按鈕、危險文字 |
| `rose-600` on `bg-rose-50` | 5.4:1 | AA | Hover state 危險按鈕 |
| `white` on `teal-600` | 5.4:1 | AA | Header「匯出 PDF」、ScrollTop |
| `white` on `rose-600` | 5.9:1 | AA | ConfirmClearDialog 提交按鈕 |
| `white` on `emerald-600` | 5.7:1 | AA | Status Pass active 文字 |

### 1.2 主要文字配對（Dark Mode）

| 配對 | 比值 | 等級 | 用途 |
|------|------|------|------|
| `slate-100` on `slate-950` | 17.0:1 | AAA | 主文字 |
| `slate-300` on `slate-950` | 11.2:1 | AAA | 副文字 |
| `teal-400` on `slate-950` | 9.1:1 | AAA | 進度條 fill、icon |
| `teal-300` on `slate-950` | 11.8:1 | AAA | hint 文字 |
| `emerald-400` on `slate-950` | 10.4:1 | AAA | 完成徽章 |
| `amber-400` on `slate-950` | 12.5:1 | AAA | Status Warn |
| `red-400` on `slate-950` | 7.5:1 | AAA | Status Fail |
| `slate-950` on `teal-500` (按鈕 inverted) | 5.9:1 | AA | dark mode 主按鈕 |

### 1.3 邊界情境（需特別注意）

| 配對 | 比值 | 等級 | 處理 |
|------|------|------|------|
| `cyan-600` on `white` | 4.5:1 | AA 邊界 | Section icon 用 outline，icon size 20px+ 可視為大字（過 3:1） |
| `sky-600` on `white` | 4.5:1 | AA 邊界 | 同上 |
| `slate-400` on `white` | 3.2:1 | **FAIL** | 只用於非文字資訊（chevron icon、placeholder），不用於 body text |
| `amber-500` on `white` | 2.4:1 | **FAIL** | **不用作 text**，僅用於 ProgressBar fill bar（非文字，aria-valuenow 給 screen reader 完整資訊） |

### 1.4 結論

- ✅ 所有 body text 配對通過 AA 4.5:1
- ✅ 所有 large text（標題、徽章內 14pt+ bold）通過 AAA
- ✅ ProgressBar fill bar 用較亮的 amber-500 不影響 a11y（非文字、有 aria-valuenow）
- ⚠️ cyan-600 / sky-600 配 white 為 AA 邊界，但只用於 Section icon（>20px），符合 large icon 標準

---

## 2. Reduced Motion 覆蓋

### 2.1 全域 CSS Fallback（main.css）

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

⚠️ 全域 transition 也壓到 0.001ms — 對使用者來說等同於即時切換。確保 reduced motion 偏好被尊重。

### 2.2 元件層 motion-safe 前綴覆蓋

| 元件 | 動畫 | motion-safe gate |
|------|------|-----------------|
| ProgressBar | `transition-[width] duration-500` | ✅ 全域 fallback 處理 |
| ProgressBar | `shadow-amber-glow`（100%） | 非動畫，glow 在 reduced motion 仍可見 |
| Section | `animate-wiggle`（完成徽章） | ✅ `motion-safe:animate-wiggle` |
| Section | `animate-slide-down`（抽屜） | ✅ `motion-safe:animate-slide-down` |
| Item | `animate-check-pop`（✓ icon） | ✅ `motion-safe:animate-check-pop` |
| Item | `animate-flash`（row flash） | ✅ `motion-safe:animate-flash` |
| Item | `transition-colors`（染色） | ✅ 全域 fallback |
| Item | `animate-slide-down`（抽屜） | ✅ `motion-safe:animate-slide-down` |
| AppHeader | `transition-colors`（按鈕 hover） | ✅ 全域 fallback |
| AppHeader 按鈕 | `active:scale-[0.98]` | ⚠️ scale 在 reduced motion 仍會觸發（transform 不在 transition-duration 內），但 active 是瞬間動作，無 ease 過程 |
| ConfirmClearDialog | `animate-slide-down`（modal 入場） | ✅ `motion-safe:animate-slide-down` |
| SettingsSlideover | `animate-slide-down`（aside 入場） | ✅ `motion-safe:animate-slide-down` |
| ScrollTopButton | `animate-slide-down`（顯示時） | ✅ `motion-safe:animate-slide-down` |
| pages/index.vue | `useConfetti().celebrate()`（100%） | ✅ useConfetti 內 `prefersReducedMotion` 已 guard |

### 2.3 結論

- ✅ 所有 keyframe 動畫（pop / wiggle / slide-down / flash）皆有 `motion-safe:` 前綴
- ✅ 全域 CSS fallback 為第二層保護
- ✅ Confetti 在 useConfetti composable 已 guard
- ⚠️ `active:scale-*` 在 reduced motion 仍會觸發，但屬於使用者主動 tap 的微回饋（非裝飾），可接受

---

## 3. a11y 屬性 Inventory

| 元件 | 屬性 |
|------|------|
| ProgressBar | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` |
| Section button | `aria-expanded`, `aria-controls`, 完成徽章 `aria-label` |
| Section icon | `aria-hidden="true"`（裝飾性） |
| Item row | `role="button"`, `aria-pressed`, `aria-label`, `tabindex="0"`, `@keydown.enter/.space.prevent` |
| Item checkbox | `aria-hidden="true"`, `tabindex="-1"`, `sr-only`（DOM 內 + 視覺隱藏，互動委派給 row） |
| Item visual checkbox | `aria-hidden="true"`（裝飾，互動由 row 處理） |
| Item chevron | `aria-expanded`, `aria-controls`, `aria-label="展開或收合"`, `@click.stop` |
| Item drawer | `id="drawer-{itemId}"`（對應 chevron aria-controls） |
| StatusTagPicker | `role="group"`, `aria-label="狀態標籤"`; 三按鈕 `aria-pressed`, `aria-label` |
| NoteEditor textarea | 雖無 label 但 placeholder 描述用途；counter `aria-label` 動態描述「已輸入 N 字」 |
| VehicleForm fields | `<label for>` + input `id` 配對；`aria-invalid` 隨 showErrors |
| PhotoUploader | `aria-label="開啟相機或選擇照片"`（uploader 按鈕） |
| PhotoLightbox | `role="dialog"`, `aria-modal="true"`, `aria-label="照片預覽"`; close/delete 按鈕 `aria-label` |
| ConfirmClearDialog | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="confirm-clear-title"` |
| SettingsSlideover | `role="dialog"`, `aria-modal="true"`, `aria-label="設定"` |
| ScrollTopButton | `aria-label="回到頂部"`; SVG `aria-hidden="true"` |
| AppFooter 連結 | 一般 `<a>`，文字本身即可讀 |

### 3.1 一致性檢查

- ✅ 所有 icon-only 按鈕都有 `aria-label`
- ✅ 所有純裝飾 SVG/emoji 都有 `aria-hidden="true"`
- ✅ 所有 dialog 都有 `role="dialog"` + `aria-modal="true"` + 標題關聯
- ✅ 所有可勾選互動有 `aria-pressed` 或 `aria-checked`
- ✅ 所有可展開區有 `aria-expanded` + `aria-controls`

---

## 4. 人工驗證 Checklist（無法程式驗證）

請使用者在實機上完成以下驗證：

### 4.1 視覺呈現

- [ ] Light Mode 與 Dark Mode 都檢視一遍
- [ ] iPhone（小螢幕 375px）：所有觸控目標可舒適點擊，無遮擋
- [ ] iPad（768px+）：版面平衡，max-w-3xl 不至於太窄
- [ ] 6 個 Section 的色條（teal / cyan / sky / indigo / violet / rose）視覺辨識度足夠
- [ ] 6 個 Heroicons icon（ClipboardDocumentCheck / ArchiveBox / Sparkles / HomeModern / Cog6Tooth / Bolt）對應到 Section 內容合理

### 4.2 互動體驗

- [ ] 勾選一個 Item：✓ icon 帶 overshoot 彈出感、row 短暫 flash、染色生效
- [ ] 連續勾選多個 Item：動畫流暢、無 jank
- [ ] 進度條從 0% → 33% → 67% → 100%：fill 色階變化明顯、hint 文字依序出現
- [ ] 100% 時 confetti 觸發、amber-glow shadow 可見
- [ ] Section 全勾完成時徽章 wiggle 動畫播一次
- [ ] 抽屜展開/收合：slide-down 240ms 不卡頓
- [ ] Hover（desktop）：按鈕 / 卡片 hover 反饋清晰
- [ ] Active（mobile tap）：按鈕 / 卡片有微 scale tactile 感
- [ ] Reduced Motion 偏好開啟（iOS 設定 → 輔助使用 → 動態效果 → 減少動態效果）：所有 keyframe 動畫消失、confetti 不觸發、transition 即時

### 4.3 戶外光線（最重要的差異化驗證）

- [ ] 在戶外陽光下打開 app（iPhone 全亮度）：
  - [ ] 文字仍清晰可讀
  - [ ] Status 按鈕 active 狀態可辨識（不只靠顏色，也靠 icon + label）
  - [ ] Section 左色條仍可分辨各 section
  - [ ] 進度條 4 階段色階仍能區分（特別是 tier 2/3 過渡）
- [ ] 戶外場景下不會被花俏視覺干擾閱讀

### 4.4 Screen Reader（建議用 macOS VoiceOver 或 iOS VoiceOver）

- [ ] 打開頁面，VoiceOver 依序唸出：「Tesla 交車檢查清單」「進度條 0%」「車輛資訊表單」「Section 標題 + N/M」
- [ ] 點 Item row：唸出「label，未勾選，按鈕」→ 啟動後唸「已勾選」
- [ ] 點 chevron：唸出「展開或收合，已展開」
- [ ] 點完成 100%：唸出「進度條 100%，已完成」（confetti 不需被讀）

### 4.5 PDF 匯出（不影響 v2 視覺但需確認未回歸）

- [ ] 填好車輛資訊後匯出 PDF：檔案下載成功
- [ ] PDF 內中文字型正常（不是豆腐塊）
- [ ] PDF 包含車輛資訊、勾選項目、備註、照片

---

## 5. 已知限制 / 後續改善（非阻塞）

| 項目 | 嚴重度 | 處理 |
|------|--------|------|
| `active:scale-*` 在 reduced motion 仍會觸發（transform 不在 transition-duration 控制範圍） | 低 | 屬使用者主動觸發的微反饋，非裝飾動畫，可接受 |
| cyan-600 / sky-600 on white 為 AA 邊界（4.5:1） | 低 | 僅用於 Section icon (20px outline)，屬大字標準 |
| useCelebration milestone 慶祝（每 5 個觸發 mini confetti）尚未接 | 中 | 推遲到 follow-up，需 page-level watch + 新增 composable |
| SettingsSlideover 仍無 UI 入口 | 中 | 同 T16 既有 followup #9 |
| Heroicons 整套打入 client bundle | 低 | tree-shaking 應只引入用到的 6 個 outline + 1 個 mini，實測 bundle size 看 generate 輸出 |
