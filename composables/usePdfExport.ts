import type { jsPDF as JsPDF } from 'jspdf'
import type { StatusTag } from './useChecklistStorage'

export const FONT_NAME = 'NotoSansTC'
export const FONT_FILE = 'NotoSansTC-Regular.subset.ttf'
export const FONT_URL = `/fonts/${FONT_FILE}`

const PAGE_MARGIN = 14 // mm
const HEADER_HEIGHT = 38 // mm（含車輛資訊區）
const FOOTER_HEIGHT = 10 // mm（頁碼）
const ITEM_LINE_HEIGHT = 5 // mm
const PHOTO_SIZE = 28 // mm
const PHOTO_GAP = 2 // mm
const SIGNATURE_BLOCK_HEIGHT = 24 // mm

const STATUS_LABEL: Record<NonNullable<StatusTag>, string> = {
  pass: '✓ 通過',
  minor: '△ 小瑕疵',
  major: '× 嚴重瑕疵',
}

// Tesla 配色，與 plan.md §5.7 對齊
const STATUS_FILL: Record<NonNullable<StatusTag>, [number, number, number]> = {
  pass: [22, 163, 74],
  minor: [245, 158, 11],
  major: [220, 38, 38],
}

export interface PdfVehicleInfo {
  model: string | null
  vin?: string
  plate?: string
  deliveryDate: string | null
  mileage?: number
}

export interface PdfItemRow {
  sectionTitle: string
  label: string
  description: string
  checked: boolean
  statusTag: StatusTag
  note: string
  photoDataUrls: string[]
}

export interface PdfExportOptions {
  vehicle: PdfVehicleInfo
  items: PdfItemRow[]
  totalCount: number
  checkedCount: number
  showSignature?: boolean
  generatedAt?: Date
  fontUrl?: string
}

export interface PdfExportResult {
  filename: string
  blob: Blob
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

export function buildPdfFilename(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = pad2(date.getMonth() + 1)
  const d = pad2(date.getDate())
  const hh = pad2(date.getHours())
  const mm = pad2(date.getMinutes())
  return `tesla-checklist-${y}${m}${d}-${hh}${mm}.pdf`
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buf)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

async function loadFontBase64(fontUrl: string): Promise<string> {
  const res = await fetch(fontUrl)
  if (!('ok' in res) || !res.ok) {
    throw new Error(`Failed to fetch font: ${fontUrl}`)
  }
  const buf = await res.arrayBuffer()
  return arrayBufferToBase64(buf)
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}/${pad2(date.getMonth() + 1)}/${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

export function usePdfExport() {
  return {
    async export(opts: PdfExportOptions): Promise<PdfExportResult> {
      const generatedAt = opts.generatedAt ?? new Date()
      const fontUrl = opts.fontUrl ?? FONT_URL

      // 動態載入 jsPDF（避免初次頁面 bundle 增重）
      const jspdfModule = await import('jspdf')
      const JsPDFCtor = (jspdfModule as { jsPDF?: typeof JsPDF }).jsPDF
        ?? (jspdfModule as { default: typeof JsPDF }).default
      const doc: JsPDF = new JsPDFCtor({ unit: 'mm', format: 'a4', orientation: 'portrait' })

      const fontBase64 = await loadFontBase64(fontUrl)
      doc.addFileToVFS(FONT_FILE, fontBase64)
      doc.addFont(FONT_FILE, FONT_NAME, 'normal')
      doc.setFont(FONT_NAME, 'normal')

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const contentLeft = PAGE_MARGIN
      const contentRight = pageWidth - PAGE_MARGIN
      const contentWidth = contentRight - contentLeft

      drawHeader(doc, opts, generatedAt, contentLeft, contentWidth)

      let cursorY = HEADER_HEIGHT + PAGE_MARGIN
      let lastSectionTitle: string | null = null

      for (const item of opts.items) {
        const lines = doc.splitTextToSize(item.description, contentWidth - 6) as string[]
        const photoRowHeight = item.photoDataUrls.length > 0 ? PHOTO_SIZE + PHOTO_GAP : 0
        const noteLines = item.note
          ? (doc.splitTextToSize(`備註：${item.note}`, contentWidth - 6) as string[])
          : []
        const itemHeight =
          ITEM_LINE_HEIGHT * 2 // label + spacing
          + ITEM_LINE_HEIGHT * lines.length
          + ITEM_LINE_HEIGHT * noteLines.length
          + photoRowHeight
          + 4 // bottom padding

        if (cursorY + itemHeight > pageHeight - FOOTER_HEIGHT - PAGE_MARGIN) {
          doc.addPage()
          drawHeader(doc, opts, generatedAt, contentLeft, contentWidth)
          cursorY = HEADER_HEIGHT + PAGE_MARGIN
          lastSectionTitle = null
        }

        if (item.sectionTitle !== lastSectionTitle) {
          doc.setFont(FONT_NAME, 'normal')
          doc.setFontSize(13)
          doc.setTextColor(30, 41, 59)
          doc.text(item.sectionTitle, contentLeft, cursorY)
          cursorY += ITEM_LINE_HEIGHT + 1
          lastSectionTitle = item.sectionTitle
        }

        drawItem(doc, item, contentLeft, cursorY, contentWidth, lines, noteLines)
        cursorY += itemHeight
      }

      if (opts.showSignature) {
        if (cursorY + SIGNATURE_BLOCK_HEIGHT > pageHeight - FOOTER_HEIGHT - PAGE_MARGIN) {
          doc.addPage()
          drawHeader(doc, opts, generatedAt, contentLeft, contentWidth)
          cursorY = HEADER_HEIGHT + PAGE_MARGIN
        }
        drawSignature(doc, contentLeft, cursorY, contentWidth)
      }

      drawPageNumbers(doc, pageWidth, pageHeight)

      const blob = doc.output('blob') as Blob
      return {
        filename: buildPdfFilename(generatedAt),
        blob,
      }
    },
  }
}

function drawHeader(
  doc: JsPDF,
  opts: PdfExportOptions,
  generatedAt: Date,
  left: number,
  width: number,
): void {
  doc.setFont(FONT_NAME, 'normal')
  doc.setFontSize(16)
  doc.setTextColor(15, 23, 42)
  doc.text('特斯拉交車檢查清單', left, 16)

  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text(`產生時間：${formatDate(generatedAt)}`, left, 22)
  doc.text(`進度：${opts.checkedCount} / ${opts.totalCount}`, left + width / 2, 22)

  const v = opts.vehicle
  const vehicleLines: string[] = [
    `車型：${v.model ?? '—'}`,
    `交車日：${v.deliveryDate ?? '—'}`,
    `車牌：${v.plate ?? '—'}`,
    `VIN：${v.vin ?? '—'}`,
    v.mileage != null ? `里程：${v.mileage} km` : '里程：—',
  ]
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  vehicleLines.forEach((line, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    doc.text(line, left + col * (width / 2), 30 + row * 5)
  })
}

function drawItem(
  doc: JsPDF,
  item: PdfItemRow,
  left: number,
  topY: number,
  width: number,
  descLines: string[],
  noteLines: string[],
): void {
  const checkbox = item.checked ? '☑' : '☐'
  doc.setFont(FONT_NAME, 'normal')
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text(`${checkbox} ${item.label}`, left, topY)

  if (item.statusTag) {
    const [r, g, b] = STATUS_FILL[item.statusTag]
    doc.setFillColor(r, g, b)
    doc.rect(left + width - 32, topY - 3, 30, 4, 'F')
    doc.setTextColor(r, g, b)
    doc.setFontSize(9)
    doc.text(STATUS_LABEL[item.statusTag], left + width - 30, topY)
  }

  let y = topY + ITEM_LINE_HEIGHT
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  descLines.forEach((line) => {
    doc.text(line, left + 3, y)
    y += ITEM_LINE_HEIGHT
  })

  if (noteLines.length) {
    doc.setTextColor(15, 23, 42)
    noteLines.forEach((line) => {
      doc.text(line, left + 3, y)
      y += ITEM_LINE_HEIGHT
    })
  }

  if (item.photoDataUrls.length) {
    item.photoDataUrls.forEach((dataUrl, i) => {
      doc.addImage(dataUrl, 'JPEG', left + i * (PHOTO_SIZE + PHOTO_GAP), y, PHOTO_SIZE, PHOTO_SIZE)
    })
  }
}

function drawSignature(
  doc: JsPDF,
  left: number,
  topY: number,
  width: number,
): void {
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text('簽名：', left, topY + 4)
  doc.line(left + 18, topY + 6, left + width / 2 - 4, topY + 6)
  doc.text('日期：', left + width / 2, topY + 4)
  doc.line(left + width / 2 + 18, topY + 6, left + width, topY + 6)
}

function drawPageNumbers(
  doc: JsPDF,
  pageWidth: number,
  pageHeight: number,
): void {
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i)
    doc.setFont(FONT_NAME, 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(`第 ${i} / ${total} 頁`, pageWidth - PAGE_MARGIN, pageHeight - 6, { align: 'right' })
  }
}

