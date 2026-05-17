import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('browser-image-compression', () => ({
  default: vi.fn(async (_file: File, opts: { fileType?: string }) => {
    // 模擬壓縮後輸出：100 byte 的 image/jpeg File
    return new File([new Uint8Array(100)], 'compressed.jpg', {
      type: opts.fileType ?? 'image/jpeg',
    })
  }),
}))

import imageCompression from 'browser-image-compression'
import {
  PHOTO_COMPRESSION_OPTIONS,
  usePhotoCompression,
} from '../../composables/usePhotoCompression'

beforeEach(() => {
  vi.mocked(imageCompression).mockClear()
})

describe('usePhotoCompression', () => {
  it('用 PHOTO_COMPRESSION_OPTIONS 呼叫 browser-image-compression', async () => {
    const { compress } = usePhotoCompression()
    const input = new File([new Uint8Array(2_000_000)], 'orig.png', { type: 'image/png' })
    await compress(input)
    expect(imageCompression).toHaveBeenCalledTimes(1)
    expect(imageCompression).toHaveBeenCalledWith(input, PHOTO_COMPRESSION_OPTIONS)
  })

  it('回傳的 File 為 image/jpeg', async () => {
    const { compress } = usePhotoCompression()
    const input = new File([new Uint8Array(2_000_000)], 'orig.png', { type: 'image/png' })
    const out = await compress(input)
    expect(out).toBeInstanceOf(File)
    expect(out.type).toBe('image/jpeg')
  })

  it('壓縮後 size 應在 maxSizeMB 內', async () => {
    const { compress } = usePhotoCompression()
    const input = new File([new Uint8Array(2_000_000)], 'orig.png', { type: 'image/png' })
    const out = await compress(input)
    expect(out.size).toBeLessThanOrEqual(PHOTO_COMPRESSION_OPTIONS.maxSizeMB * 1024 * 1024)
  })

  it('PHOTO_COMPRESSION_OPTIONS 鎖定關鍵參數', () => {
    expect(PHOTO_COMPRESSION_OPTIONS.maxSizeMB).toBe(0.5)
    expect(PHOTO_COMPRESSION_OPTIONS.maxWidthOrHeight).toBe(1600)
    expect(PHOTO_COMPRESSION_OPTIONS.preserveExif).toBe(false)
    expect(PHOTO_COMPRESSION_OPTIONS.fileType).toBe('image/jpeg')
  })

  it('壓縮失敗時錯誤往上拋（不靜默吞錯）', async () => {
    vi.mocked(imageCompression).mockRejectedValueOnce(new Error('canvas decode failed'))
    const { compress } = usePhotoCompression()
    const input = new File([new Uint8Array(100)], 'orig.png', { type: 'image/png' })
    await expect(compress(input)).rejects.toThrow('canvas decode failed')
  })
})
