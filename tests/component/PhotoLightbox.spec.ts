import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PhotoLightbox from '../../components/checklist/PhotoLightbox.vue'

const photo = { id: 'p1', url: 'blob:fake/1' }

describe('PhotoLightbox', () => {
  it('open=false 時不渲染內容', () => {
    const w = mount(PhotoLightbox, { props: { open: false, photo } })
    expect(w.find('[data-testid="lightbox"]').exists()).toBe(false)
  })

  it('open=true 時渲染大圖', () => {
    const w = mount(PhotoLightbox, { props: { open: true, photo } })
    expect(w.find('[data-testid="lightbox"]').exists()).toBe(true)
    const img = w.get('[data-testid="lightbox-img"]')
    expect(img.attributes('src')).toBe('blob:fake/1')
  })

  it('photo=null 時即使 open=true 也不渲染圖片', () => {
    const w = mount(PhotoLightbox, { props: { open: true, photo: null } })
    expect(w.find('[data-testid="lightbox-img"]').exists()).toBe(false)
  })

  it('點關閉鈕 emit update:open false', async () => {
    const w = mount(PhotoLightbox, { props: { open: true, photo } })
    await w.get('[data-testid="lightbox-close"]').trigger('click')
    expect(w.emitted('update:open')).toEqual([[false]])
  })

  it('點刪除鈕 emit delete 帶 id', async () => {
    const w = mount(PhotoLightbox, { props: { open: true, photo } })
    await w.get('[data-testid="lightbox-delete"]').trigger('click')
    expect(w.emitted('delete')).toEqual([['p1']])
  })

  it('點 backdrop emit update:open false', async () => {
    const w = mount(PhotoLightbox, { props: { open: true, photo } })
    await w.get('[data-testid="lightbox-backdrop"]').trigger('click')
    expect(w.emitted('update:open')).toEqual([[false]])
  })

  it('點圖片本身不會關閉（避免誤觸）', async () => {
    const w = mount(PhotoLightbox, { props: { open: true, photo } })
    await w.get('[data-testid="lightbox-img"]').trigger('click')
    expect(w.emitted('update:open')).toBeUndefined()
  })

  it('容器有 role="dialog" 與 aria-modal', () => {
    const w = mount(PhotoLightbox, { props: { open: true, photo } })
    const dialog = w.get('[data-testid="lightbox"]')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
  })
})
