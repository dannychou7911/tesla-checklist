#!/usr/bin/env node
// 把 Noto Sans TC（chinese-traditional subset，來自 @fontsource/noto-sans-tc）
// 進一步 subset 成 jsPDF 可用的 ttf，只保留實際會出現在 PDF 的字元
// 並輸出到 public/fonts/NotoSansTC-Regular.subset.ttf

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import subsetFont from 'subset-font'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')

const SOURCE_FONT = path.join(
  PROJECT_ROOT,
  'node_modules/@fontsource/noto-sans-tc/files/noto-sans-tc-chinese-traditional-400-normal.woff2',
)
const OUTPUT_FONT = path.join(PROJECT_ROOT, 'public/fonts/NotoSansTC-Regular.subset.ttf')

// 一定要保留的 UI 字串（PDF 標題、欄位 label、status、footer、設定面板等）
const UI_TEXT = [
  // 標題與品牌
  '特斯拉交車檢查清單',
  '匯出 PDF',
  '全部展開',
  '全部收合',
  '清除',
  '設定',
  // 車輛資訊
  '車輛資訊',
  '車型',
  '車牌',
  '交車日',
  '里程',
  '里程數',
  '備註',
  '照片',
  '尚未填寫',
  // status tag
  '通過',
  '小瑕疵',
  '嚴重瑕疵',
  '未檢查',
  // 進度
  '完成',
  '進度',
  // footer & 隱私
  '資料來源',
  '本工具僅供參考，不取代正式交車單',
  '隱私權說明',
  '所有資料皆儲存於您的裝置',
  // 設定面板
  '簽名欄',
  '時間戳浮水印',
  '大字版',
  // 對話
  '確認',
  '取消',
  '同意',
  '拒絕',
  '請輸入「清除」以確認',
  // 數字單位與日期
  '年', '月', '日', '時', '分', '秒',
  '公里', '公尺',
  // model 名稱
  'Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', '其他',
  // 副標
  '可選填', '必填',
  // 常用標點與符號（中文）
  '，。！？：；「」『』（）、…—·／—',
  // ASCII printable (0x20–0x7E)
  Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCharCode(0x20 + i)).join(''),
].join('')

async function collectChecklistChars() {
  const data = await readFile(path.join(PROJECT_ROOT, 'assets/data/checklist.json'), 'utf8')
  // 直接把整個 JSON 字串扔進 subset text；subset-font 會依 unique code point 抽 glyphs
  return data
}

async function main() {
  const [sourceBuf, checklistChars] = await Promise.all([
    readFile(SOURCE_FONT),
    collectChecklistChars(),
  ])
  const subsetText = UI_TEXT + checklistChars
  const uniqueChars = new Set([...subsetText])
  console.log(`Subset text: ${uniqueChars.size} unique code points`)

  const subsetted = await subsetFont(sourceBuf, subsetText, { targetFormat: 'sfnt' })

  await mkdir(path.dirname(OUTPUT_FONT), { recursive: true })
  await writeFile(OUTPUT_FONT, subsetted)

  const sizeKB = (subsetted.byteLength / 1024).toFixed(1)
  console.log(`Wrote ${path.relative(PROJECT_ROOT, OUTPUT_FONT)} (${sizeKB} KB)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
