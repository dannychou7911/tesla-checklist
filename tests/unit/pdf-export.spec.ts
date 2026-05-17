import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockInstance = {
  addFileToVFS: vi.fn(),
  addFont: vi.fn(),
  setFont: vi.fn(),
  setFontSize: vi.fn(),
  setTextColor: vi.fn(),
  setFillColor: vi.fn(),
  setDrawColor: vi.fn(),
  setLineWidth: vi.fn(),
  rect: vi.fn(),
  line: vi.fn(),
  text: vi.fn(),
  addImage: vi.fn(),
  addPage: vi.fn(),
  setPage: vi.fn(),
  getNumberOfPages: vi.fn(() => 1),
  splitTextToSize: vi.fn((text: string) => [text]),
  output: vi.fn(() => new Blob(['%PDF-1.4 mock'], { type: 'application/pdf' })),
  internal: {
    pageSize: { getWidth: () => 210, getHeight: () => 297 },
  },
}

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => mockInstance),
  default: vi.fn(() => mockInstance),
}))

import {
  buildPdfFilename,
  usePdfExport,
  type PdfExportOptions,
  type PdfItemRow,
} from '../../composables/usePdfExport'

beforeEach(() => {
  Object.values(mockInstance).forEach((v) => {
    if (typeof v === 'function' && 'mockClear' in v) v.mockClear()
  })
  mockInstance.getNumberOfPages.mockReturnValue(1)
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(128),
    })),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function makeItem(overrides: Partial<PdfItemRow> = {}): PdfItemRow {
  return {
    sectionTitle: '交車前準備',
    label: '確認保險生效時間',
    description: '請提前通知保險公司交車日期',
    checked: true,
    statusTag: 'pass',
    note: '',
    photoDataUrls: [],
    ...overrides,
  }
}

function makeOptions(overrides: Partial<PdfExportOptions> = {}): PdfExportOptions {
  return {
    vehicle: {
      model: 'Model Y',
      vin: '5YJ3E1EA',
      plate: 'ABC-1234',
      deliveryDate: '2026-05-17',
      mileage: 15,
    },
    items: [makeItem()],
    totalCount: 40,
    checkedCount: 1,
    showSignature: false,
    generatedAt: new Date('2026-05-17T14:30:00+08:00'),
    ...overrides,
  }
}

describe('buildPdfFilename', () => {
  it('產生 tesla-checklist-YYYYMMDD-HHmm.pdf 格式', () => {
    const name = buildPdfFilename(new Date('2026-05-17T14:30:00+08:00'))
    expect(name).toMatch(/^tesla-checklist-\d{8}-\d{4}\.pdf$/)
  })

  it('日期/時間零位補齊', () => {
    const name = buildPdfFilename(new Date('2026-01-09T03:05:00+08:00'))
    expect(name).toBe('tesla-checklist-20260109-0305.pdf')
  })
})

describe('usePdfExport().export', () => {
  it('回傳 application/pdf Blob 與正確檔名', async () => {
    const { export: exportPdf } = usePdfExport()
    const result = await exportPdf(makeOptions())
    expect(result.filename).toBe('tesla-checklist-20260517-1430.pdf')
    expect(result.blob).toBeInstanceOf(Blob)
    expect(result.blob.type).toBe('application/pdf')
  })

  it('載入 Noto Sans TC subset 字型（addFileToVFS + addFont + setFont）', async () => {
    const { export: exportPdf } = usePdfExport()
    await exportPdf(makeOptions())
    expect(mockInstance.addFileToVFS).toHaveBeenCalledTimes(1)
    expect(mockInstance.addFont).toHaveBeenCalledTimes(1)
    const setFontFontNames = mockInstance.setFont.mock.calls.map((c) => c[0])
    expect(setFontFontNames).toContain('NotoSansTC')
  })

  it('透過 fetch 取得字型檔', async () => {
    const { export: exportPdf } = usePdfExport()
    await exportPdf(makeOptions())
    expect(fetch).toHaveBeenCalled()
    const urlArg = vi.mocked(fetch).mock.calls[0][0] as string
    expect(urlArg).toContain('NotoSansTC-Regular.subset.ttf')
  })

  it('在頁首畫車輛資訊與進度', async () => {
    const { export: exportPdf } = usePdfExport()
    await exportPdf(makeOptions())
    const allText = mockInstance.text.mock.calls.map((c) => String(c[0])).join('\n')
    expect(allText).toContain('Model Y')
    expect(allText).toContain('1 / 40')
  })

  it('showSignature=true 時繪製簽名欄', async () => {
    const { export: exportPdf } = usePdfExport()
    await exportPdf(makeOptions({ showSignature: true }))
    const allText = mockInstance.text.mock.calls.map((c) => String(c[0])).join('\n')
    expect(allText).toContain('簽名')
  })

  it('showSignature=false 時不繪製簽名欄', async () => {
    const { export: exportPdf } = usePdfExport()
    await exportPdf(makeOptions({ showSignature: false }))
    const allText = mockInstance.text.mock.calls.map((c) => String(c[0])).join('\n')
    expect(allText).not.toContain('簽名')
  })

  it('item 多時會 addPage', async () => {
    // 模擬 50 個 item，遠超一頁可容納
    const items = Array.from({ length: 50 }, (_, i) =>
      makeItem({ label: `項目 ${i + 1}`, description: '說明文字' }),
    )
    const { export: exportPdf } = usePdfExport()
    await exportPdf(makeOptions({ items, totalCount: 50, checkedCount: 50 }))
    expect(mockInstance.addPage).toHaveBeenCalled()
  })

  it('每頁畫頁碼（X / Y 格式）', async () => {
    mockInstance.getNumberOfPages.mockReturnValue(2)
    const { export: exportPdf } = usePdfExport()
    await exportPdf(makeOptions())
    const allText = mockInstance.text.mock.calls.map((c) => String(c[0])).join('\n')
    expect(allText).toMatch(/第\s*\d+\s*\/\s*\d+\s*頁/)
  })

  it('item 含照片時呼叫 addImage', async () => {
    const items = [
      makeItem({ photoDataUrls: ['data:image/jpeg;base64,AAAA', 'data:image/jpeg;base64,BBBB'] }),
    ]
    const { export: exportPdf } = usePdfExport()
    await exportPdf(makeOptions({ items }))
    expect(mockInstance.addImage).toHaveBeenCalledTimes(2)
  })

  it('字型 fetch 失敗時往上拋（不靜默吞錯）', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        arrayBuffer: async () => {
          throw new Error('network error')
        },
      })),
    )
    const { export: exportPdf } = usePdfExport()
    await expect(exportPdf(makeOptions())).rejects.toThrow()
  })
})
