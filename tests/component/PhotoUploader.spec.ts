import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PhotoUploader, {
  type PhotoItem,
} from '../../components/checklist/PhotoUploader.vue'

function makePhotos(n: number): PhotoItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    url: `blob:fake/${i + 1}`,
  }))
}

function makeFile(name: string, type = 'image/jpeg'): File {
  return new File(['data'], name, { type })
}

function setInputFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  })
}

describe('PhotoUploader', () => {
  it('依 photos prop 渲染對應數量的縮圖', () => {
    const w = mount(PhotoUploader, { props: { photos: makePhotos(3) } })
    expect(w.findAll('[data-testid^="photo-thumb-"]').length).toBe(3)
  })

  it('縮圖 img 的 src 對應 photo.url', () => {
    const w = mount(PhotoUploader, { props: { photos: makePhotos(2) } })
    const imgs = w.findAll('[data-testid^="photo-thumb-"] img')
    expect(imgs[0].attributes('src')).toBe('blob:fake/1')
    expect(imgs[1].attributes('src')).toBe('blob:fake/2')
  })

  it('數量未達 maxCount 時顯示 + 上傳按鈕', () => {
    const w = mount(PhotoUploader, { props: { photos: makePhotos(3) } })
    expect(w.find('[data-testid="photo-add"]').exists()).toBe(true)
  })

  it('達 maxCount（預設 5）時 + 上傳按鈕不顯示或禁用', () => {
    const w = mount(PhotoUploader, { props: { photos: makePhotos(5) } })
    const addBtn = w.find('[data-testid="photo-add"]')
    if (addBtn.exists()) {
      expect(addBtn.attributes('disabled')).toBeDefined()
    }
    else {
      expect(addBtn.exists()).toBe(false)
    }
  })

  it('file input 選檔後 emit add 帶 File 陣列', async () => {
    const w = mount(PhotoUploader, { props: { photos: [] } })
    const input = w.get('input[type="file"]').element as HTMLInputElement
    const f1 = makeFile('a.jpg')
    const f2 = makeFile('b.jpg')
    setInputFiles(input, [f1, f2])
    await w.get('input[type="file"]').trigger('change')
    const emitted = w.emitted('add') as File[][][]
    expect(emitted).toBeTruthy()
    expect(emitted[0][0].length).toBe(2)
    expect(emitted[0][0][0].name).toBe('a.jpg')
  })

  it('file input 設 accept="image/*" 與 multiple', () => {
    const w = mount(PhotoUploader, { props: { photos: [] } })
    const input = w.get('input[type="file"]')
    expect(input.attributes('accept')).toBe('image/*')
    expect(input.attributes('multiple')).toBeDefined()
  })

  it('點縮圖 emit view 帶 id', async () => {
    const w = mount(PhotoUploader, { props: { photos: makePhotos(1) } })
    await w.get('[data-testid="photo-thumb-p1"]').trigger('click')
    expect(w.emitted('view')).toEqual([['p1']])
  })

  it('點刪除 emit remove 帶 id', async () => {
    const w = mount(PhotoUploader, { props: { photos: makePhotos(2) } })
    await w.get('[data-testid="photo-remove-p2"]').trigger('click')
    expect(w.emitted('remove')).toEqual([['p2']])
  })

  it('刪除按鈕的 click 不會冒泡觸發 view', async () => {
    const w = mount(PhotoUploader, { props: { photos: makePhotos(1) } })
    await w.get('[data-testid="photo-remove-p1"]').trigger('click')
    expect(w.emitted('view')).toBeUndefined()
  })

  it('自訂 maxCount=3 時，第 3 張後不出現 + 上傳按鈕', () => {
    const w = mount(PhotoUploader, { props: { photos: makePhotos(3), maxCount: 3 } })
    const addBtn = w.find('[data-testid="photo-add"]')
    if (addBtn.exists()) {
      expect(addBtn.attributes('disabled')).toBeDefined()
    }
    else {
      expect(addBtn.exists()).toBe(false)
    }
  })
})
